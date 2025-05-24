## 第二章日志分析-apache日志分析

### 简介

```
账号密码 root apacherizhi
ssh root@IP
1、提交当天访问次数最多的IP，即黑客IP：
2、黑客使用的浏览器指纹是什么，提交指纹的md5：
3、查看index.php页面被访问的次数，提交次数：
4、查看黑客IP访问了多少次，提交次数：
5、查看2023年8月03日8时这一个小时内有多少IP访问，提交次数:
```

### 1、提交当天访问次数最多的IP，即黑客IP

```bash
cat access.log.1 | awk '{print $1}' | sort | uniq -c
```

```
	29 ::1
     10 117.158.127.5
   6555 192.168.200.2
      1 192.168.200.211
      5 192.168.200.38
      1 192.168.200.48
```

`flag{192.168.200.2}`

### 2、黑客使用的浏览器指纹是什么，提交指纹的md5

```bash
cat access.log.1 | grep -a "192.168.200.2" | tail -n 10 
```

```bash
echo "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36" | md5sum
```

`flag{2d6330f380f44ac20f3a02eed0958f66}`

### 3、查看index.php页面被访问的次数

```bash
cat access.log.1 | grep -a "/index.php" | wc -l 
```

`flag{27}`

### 4、查看黑客IP访问了多少次

```bash
cat access.log.1 | grep -a "192.168.200.2 - -" | wc -l 
```

`flag{6555}`

### 5、查看2023年8月03日8时这一个小时内有多少IP访问

```bash
cat access.log.1 | grep -a "03/Aug/2023:08" | awk '{print $1}' | sort |uniq -c
```

```
29 ::1
6555 192.168.200.2                          
1 192.168.200.211
5 192.168.200.38
1 192.168.200.48 
```

`flag{5}`