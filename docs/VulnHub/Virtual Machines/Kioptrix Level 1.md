### 端口扫描

```bash
┌──(root㉿kali)-[~]
└─# nmap -sT -T4 -p- 192.168.217.136
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-10-31 05:22 EDT
Nmap scan report for 192.168.217.136
Host is up (0.0014s latency).
Not shown: 65529 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
111/tcp  open  rpcbind
139/tcp  open  netbios-ssn
443/tcp  open  https
1024/tcp open  kdm
MAC Address: 00:0C:29:F6:F0:14 (VMware)
```

```bash
nmap -sT -sC -sV -O -p22,80,111,139,443,1024 192.168.217.136
```

```
PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 2.9p2 (protocol 1.99)
|_sshv1: Server supports SSHv1
| ssh-hostkey: 
|   1024 b8:74:6c:db:fd:8b:e6:66:e9:2a:2b:df:5e:6f:64:86 (RSA1)
|   1024 8f:8e:5b:81:ed:21:ab:c1:80:e1:57:a3:3c:85:c4:71 (DSA)
|_  1024 ed:4e:a9:4a:06:14:ff:15:14:ce:da:3a:80:db:e2:81 (RSA)
80/tcp   open  http        Apache httpd 1.3.20 ((Unix)  (Red-Hat/Linux) mod_ssl/2.8.4 OpenSSL/0.9.6b)
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: Test Page for the Apache Web Server on Red Hat Linux
|_http-server-header: Apache/1.3.20 (Unix)  (Red-Hat/Linux) mod_ssl/2.8.4 OpenSSL/0.9.6b
111/tcp  open  rpcbind     2 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2            111/tcp   rpcbind
|   100000  2            111/udp   rpcbind
|   100024  1           1024/tcp   status
|_  100024  1           1024/udp   status
139/tcp  open  netbios-ssn Samba smbd (workgroup: MYGROUP)
443/tcp  open  ssl/https   Apache/1.3.20 (Unix)  (Red-Hat/Linux) mod_ssl/2.8.4 OpenSSL/0.9.6b
|_ssl-date: 2024-10-31T10:25:05+00:00; +1h01m50s from scanner time.
|_http-server-header: Apache/1.3.20 (Unix)  (Red-Hat/Linux) mod_ssl/2.8.4 OpenSSL/0.9.6b
| sslv2: 
|   SSLv2 supported
|   ciphers: 
|     SSL2_DES_192_EDE3_CBC_WITH_MD5
|     SSL2_RC4_128_WITH_MD5
|     SSL2_RC2_128_CBC_WITH_MD5
|     SSL2_RC4_64_WITH_MD5
|     SSL2_RC4_128_EXPORT40_WITH_MD5
|     SSL2_RC2_128_CBC_EXPORT40_WITH_MD5
|_    SSL2_DES_64_CBC_WITH_MD5
|_http-title: 400 Bad Request
| ssl-cert: Subject: commonName=localhost.localdomain/organizationName=SomeOrganization/stateOrProvinceName=SomeState/countryName=--
| Not valid before: 2009-09-26T09:32:06
|_Not valid after:  2010-09-26T09:32:06
1024/tcp open  status      1 (RPC #100024)
MAC Address: 00:0C:29:F6:F0:14 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 2.4.X
OS CPE: cpe:/o:linux:linux_kernel:2.4
OS details: Linux 2.4.9 - 2.4.18 (likely embedded)
Network Distance: 1 hop

Host script results:
|_smb2-time: Protocol negotiation failed (SMB2)
|_nbstat: NetBIOS name: KIOPTRIX, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
|_clock-skew: 1h01m49s
```

### apache漏洞

```
searchsploit apache 1.3
```

优先找RCE

![](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241104201209072.png)

```
searchsploit -m 67
```

编译一下

```
gcc 67.c -o 67.out
```

![image-20241104201712112](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241104201712112.png)

有点离谱，这个漏洞，偶尔成功

### smb服务漏洞

nmap漏洞扫描

```bash
nmap -p 139 --script=*smb* 192.168.217.136
```

![image-20241104202253358](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241104202253358.png)

直接扫到一个CVE：`CVE-2009-3103`，大概版本是smb2

```
searchsploit samba 2
```

![image-20241104202457659](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241104202457659.png)

![image-20241104202906938](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241104202906938.png)

### SSH登录

```bash
ssh root@192.168.217.136
```

ssh登录报错，将下面内容写入`~/.ssh/config`

```
Host 192.168.217.136
KexAlgorithms diffie-hellman-group1-sha1,diffie-hellman-group14-sha1,diffie-hellman-group-exchange-sha1,diffie-hellman-group-exchange-sha256,ecdh-sha2-nistp384,ecdh-sha2-nistp521,diffie-hellman-group1-sha1,curve25519-sha256@libssh.org
HostKeyAlgorithms +ssh-dss
Ciphers +aes128-cbc
```

