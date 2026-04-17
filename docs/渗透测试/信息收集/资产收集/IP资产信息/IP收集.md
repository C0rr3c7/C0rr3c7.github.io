---
sidebar_position: 1
---

## 绕过CDN常见方法

### 判断有没有CDN

#### 多地ping

如果没有CDN只会显示一个IP地址

![PixPin_2026-04-01_21-18-23](./img/PixPin_2026-04-01_21-18-23.png)



网站：

https://boce.aliyun.com/detect/ping

http://ping.chinaz.com/

https://ping.aizhan.com/

http://www.webkaka.com/Ping.aspx

https://www.host-tracker.com/v3/check/

#### DNS 历史记录

网站刚开始搭建起来的时候，可能不使用CDN

查历史域名解析记录：https://www.ip138.com/

https://x.threatbook.cn

https://webiplookup.com

https://viewdns.info/iphistory

https://securitytrails.com/#search

https://toolbar.netcraft.com/site_report

#### nslookup

用国外的dns服务器，如果返回域名解析对应多个 IP 地址多半是使用了 CDN（一个IP也可能有CDN）

```
nslookup -qt=A baidu.com 8.8.8.8
```

![PixPin_2026-04-01_21-22-55](./img/PixPin_2026-04-01_21-22-55.png)

#### IP 反查域名

查看是否存在大量不相关的域名

- https://securitytrails.com/
- https://dns.aizhan.com/
- https://x.threatbook.cn

![PixPin_2026-04-01_21-26-38](./img/PixPin_2026-04-01_21-26-38.png)

解析到大量域名

![PixPin_2026-04-01_21-24-48](./img/PixPin_2026-04-01_21-24-48.png)

#### 在线检测工具

- https://www.cdnplanet.com/tools/cdnfinder/
- https://tools.ipip.net/cdn.php

![PixPin_2026-04-01_21-29-48](./img/PixPin_2026-04-01_21-29-48.png)

## IP 段收集

目标比较大的时候查看分配的 IP 段

通过 IP138 可以找到对应IP段

![PixPin_2026-04-01_21-08-13](./img/PixPin_2026-04-01_21-08-13.png)

https://ipwhois.cnnic.net.cn

![PixPin_2026-04-01_21-09-27](./img/PixPin_2026-04-01_21-09-27.png)