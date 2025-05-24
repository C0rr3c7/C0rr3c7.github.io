:::info

挑战内容

前景需要：小王急匆匆地找到小张，小王说"李哥，我dev服务器被黑了",快救救我！！



挑战内容：

黑客的IP地址

遗留下的三个flag



相关账户密码：

defend/defend

root/defend

:::

### 检查SSH登录日志

```bash
cd /var/log
cat secure | grep "Acc"
```

![image-20241023112440474](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241023112440474.png)

发现`192.168.75.129`这个IP使用密钥登录了root用户，可能为黑客

检查`.SSH`目录

```bash
 cat authorized_keys
```

![image-20241023112748003](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241023112748003.png)

发现是`redis`写进来的公钥,说明存在`redis`未授权漏洞

### 查看`redis`日志和配置文件

```bash
[root@localhost redis]# cd /var/log/redis
[root@localhost redis]# ls
redis.log
[root@localhost redis]# cat redis.log | grep "Acc"
11111:M 18 Mar 19:27:54.895 - Accepted 127.0.0.1:41590
11595:M 18 Mar 19:27:57.321 - Accepted 192.168.75.129:54766
11595:M 18 Mar 19:39:31.996 - Accepted 192.168.75.129:53104
11595:M 18 Mar 19:39:34.052 - Accepted 192.168.75.129:57672
11595:M 18 Mar 19:44:53.399 - Accepted 127.0.0.1:41594
12234:M 18 Mar 19:47:02.153 - Accepted 192.168.75.129:45240
12234:M 18 Mar 19:47:03.612 - Accepted 192.168.75.129:53124
12234:M 18 Mar 19:53:40.994 - Accepted 127.0.0.1:41596
12559:M 18 Mar 19:53:45.397 - Accepted 192.168.75.129:44572
12559:M 18 Mar 19:53:46.807 - Accepted 192.168.75.129:44582
12559:M 18 Mar 20:20:57.221 - Accepted 127.0.0.1:41598
13274:M 18 Mar 20:21:56.411 - Accepted 192.168.75.129:54826
13274:M 18 Mar 20:21:58.333 - Accepted 192.168.75.129:54836
```

这里也能查看`192.168.75.129`登录了redis

```bash
[root@localhost redis]# head /etc/redis.conf
# flag{P@ssW0rd_redis}
# Redis configuration file example.
#
# Note that in order to read the configuration file, Redis must be
# started with the file path as first argument:
#
# ./redis-server /path/to/redis.conf

# Note on units: when memory size is needed, it is possible to specify
# it in the usual form of 1k 5GB 4M and so forth:
```

发现flag：`flag{P@ssW0rd_redis}`

### 查看bash历史命令

![image-20241023113635192](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241023113635192.png)

flag：`flag{thisismybaby}`

发现`/etc/rc.d/rc.local`可能被修改了

```bash
[root@localhost redis]# cat /etc/rc.d/rc.local
#!/bin/bash
# THIS FILE IS ADDED FOR COMPATIBILITY PURPOSES
#
# It is highly advisable to create own systemd services or udev rules
# to run scripts during boot instead of using this file.
#
# In contrast to previous versions due to parallel execution during boot
# this script will NOT be run after all other services.
#
# Please note that you must run 'chmod +x /etc/rc.d/rc.local' to ensure
# that this script will be executed during boot.


# flag{kfcvme50}


touch /var/lock/subsys/local
```

flag：`flag{kfcvme50}`

### 总结

`/etc/rc.d/rc.local`是配置系统启动时执行本地脚本或命令的脚本文件