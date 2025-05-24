## 什么是preg_match

![image-20230531203342124](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230531203342124.png)

![image-20230531203403865](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230531203403865.png)

## 绕过方法

### 1、数组绕过

preg_match只能处理字符串，当传入的subject是数组时会返回false

### 2、PCRE回溯次数限制

[戳我](https://www.leavesongs.com/PENETRATION/use-pcre-backtrack-limit-to-bypass-restrict.html)

## 神奇的Unicode编码

这个符号竟然可以从右往左打印字符串

[看我看我](https://xiinnn.com/article/22d50835.html)

在网页中复制下来，方框中的

![image-20230531204146074](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230531204146074.png)



放进编译器中，使用urlencode进行输出即可
