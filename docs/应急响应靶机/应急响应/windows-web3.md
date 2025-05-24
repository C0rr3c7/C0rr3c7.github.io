:::info

挑战内容

前景需要：小苕在省护值守中，在灵机一动情况下把设备停掉了，甲方问：为什么要停设备？小苕说：我第六感告诉我，这机器可能被黑了。

这是他的服务器，请你找出以下内容作为通关条件：

1. 攻击者的两个IP地址
2. 隐藏用户名称
3. 黑客遗留下的flag【3个】

本虚拟机的考点不在隐藏用户以及ip地址，仔细找找把。

相关账户密码： 

Windows:administrator/xj@123456

:::

### 查看`apache`的日志

![image-20241024153342015](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241024153342015.png)

发现`IP` 192.168.75.130,192.168.75.129

### 查看用户和组

![image-20241024153603663](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241024153603663.png)

`hack6618$`

### 查看`hack6618$`用户目录

![image-20241024153842342](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241024153842342.png)

![image-20241024153857388](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241024153857388.png)

`flag{888666abc}`

### 登录`hack6618`账号

修改密码

```cmd
net user hack6618$ Admin123
```

查看开机任务

![image-20241024154101092](C:\Users\86188\AppData\Roaming\Typora\typora-user-images\image-20241024154101092.png)

![image-20241024154209206](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241024154209206.png)

`flag{zgsfsys@sec}`

### 登录web后台

[Z-BlogPHP密码找回工具](https://bbs.zblogcn.com/thread-83419.html)

利用密码重置工具，将admin的密码重置

访问：http://127.0.0.1/nologin.php

![image-20241024154512872](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241024154512872.png)

`flag{H@Ck@sec}`