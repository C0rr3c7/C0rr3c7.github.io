文件上传漏洞被利用需要**两个前提条件**：

1、文件能上传成功

2、攻击者能知道文件路径

凡是上传图片并显示的关卡，都有**三种方式可以知道文件路径**

1、最简单直接的，在没显示出来的图片上右键选择“复制图像链接”，可以得到文件的绝对路径

![123c53e523fa4a86aa967a84de16ba67](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/123c53e523fa4a86aa967a84de16ba67.png)

2、网页上右键选择“查看页面源代码”，源代码中显示文件的相对路径

![image-20230407135835211](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230407135835211.png)

3、如果是用burpsuite上传的文件，response报文中也会显示文件的相对路径。

## Pass-01(前端验证)

### 方法1：

`浏览器disable JS`

firefox可以安装一个叫Script Switch的插件，安装成功之后，就是下图右上角小红框里那个图标，使其处在JS disabled状态，上传x.php。出现下图这样没加载成功的图片表示webshell已经上传成功。

![92b2e5477ba24b1eabbe94cf11f0b4a0](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/92b2e5477ba24b1eabbe94cf11f0b4a0.png)



到服务器上看看，上传成功的webshell在 **upload-labs目录\upload** 文件夹下

### 方法2：

 bp抓包修改后缀

![b6b05f1cc2d749eea3164807c384fe7f](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/b6b05f1cc2d749eea3164807c384fe7f.png)

蚁剑连接即可看到文件已经上传

## Pass-02(ContentType)
```php
if (($_FILES['upload_file']['type'] == 'image/jpeg') || ($_FILES['upload_file']['type'] == 'image/png') || ($_FILES['upload_file']['type'] == 'image/gif'))
```

第二关主要是对MIME进行检查（ContentType），直接修改为上面的三种类型就可以

## Pass-03(修改httpd.ini)

姿势一：

```
$file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA
```

可以进行双写绕过`::$DA::$DATATA`

首先上传个1.php，发现页面提示是”不允许上传……后缀文件“，并且burpsuite有抓到包，初步判断，这关可能是后端文件后缀黑名单过滤。

![image-20230407140010914](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230407140010914.png)

payload写一些有可能被解析为php的文件后缀的字符，大小写绕过，双写绕过，一些利用操作系统特性（比如服务器是windows系统的话，结尾加点，加空格，加::$DATA，后缀某几个字母大写）

![](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230407141147135.png)

![image-20230407141107881](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230407141107881.png)

上图的文件后缀是正常的，是有用的，用webshell管理工具连接的时候，文件名写202304071406293829.php就行

姿势二：

修改httpd.ini配置文件，将`.php3,,php5,,phtml`作为php文件

![image-20231121222945950](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231121222945950.png)

## Pass-04(.htaccess)

姿势一：

把后缀改成png之后，可以上传成功。可以初步判断，本关不检查文件内容，检查点应该在**Content-Type**或者**文件后缀**，或者两者都有。

![image-20230407145704699](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230407145704699.png)

先看看Content-Type有无影响。把Content-Type从image/png改成application/octet-stream，发送之后，发现文件依然能上传成功，说明本关Content-Type无影响。

![image-20230407145850092](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230407145850092.png)

接下来判断一下文件后缀是黑名单过滤还是白名单过滤：

文件后缀改成.xxx，发送后发现文件上传成功，说明本关还是文件后缀黑名单过滤

![image-20230407145939292](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230407145939292.png)

HTTP EXP：将文件后缀名改为“**点+空格+点**”的格式，这样**file_ext会变为空**，成功绕过黑名单上传。**Windows会自动删除文件名最后的点**，最后变为2.php。

![image-20230407151322154](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230407151322154.png)

```
Content-Disposition: form-data; name="upload_file"; filename="2.php. ."
```

姿势二：

上传`.htaccess`文件(分布式配置文件)，优先等级高于http.ini，它的作用范围是本目录和其子目录

修改配置文件http.ini,将none改为All，允许.htaccess文件生效

![image-20231121224302274](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231121224302274.png)

·htaccess文件内容

```
AddType application/x-httpd-php .png //.png文件当作php文件执行
```

访问.png文件即可

## Pass-05(.user.ini)

### 主要源码

```php
$is_upload = false;
$msg = null;
if (isset($_POST['submit'])) {
    if (file_exists(UPLOAD_PATH)) {
        $deny_ext = array("省略了"); //后缀数组，如.php,.phtml等
        $file_name = trim($_FILES['upload_file']['name']); //去除文件名首尾空格
        $file_name = deldot($file_name);//删除文件名末尾的点
        $file_ext = strrchr($file_name, '.'); //返回.在文件名中最后一次出现的位置，并返回从该位置到字符串结尾的所有字符
        $file_ext = strtolower($file_ext); //转换为小写
        $file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA
        $file_ext = trim($file_ext); //首尾去空
        if (!in_array($file_ext, $deny_ext)) {
            $temp_file = $_FILES['upload_file']['tmp_name'];  //临时目录文件名
            $img_path = UPLOAD_PATH.'/'.$file_name;  //保存目录
            if (move_uploaded_file($temp_file, $img_path)) { //移动临时文件到保存目录，移动成功返回True
                $is_upload = true;
            } else {
                $msg = '上传出错！';
            }
        } else {
            $msg = '此文件类型不允许上传！';
        }
    } else {
        $msg = UPLOAD_PATH . '文件夹不存在,请手工创建！';
    }
}
```

姿势一：

和Pass-04一样，代码中只过滤了一次点，删除了空格和::$DATA，将文件后缀改为小写，黑名单等，使用Pass-04的方法绕过即可。但黑名单中屏蔽了.htaccess文件。

HTTP EXP：文件名改为“2.php. . ”。

姿势二：

利用`.user.ini`文件，优先级高于php.ini

生效条件：上传目录里必须有php文件，serverAPI要是CGI/FastCGI （phpinfo可以进行查看）

| Server API | CGI/FastCGI |
| ---------- | ----------- |

内容

```
auto_prepend_file=info.png       //php文件包含info.png
```

## Pass-6(大小写绕过windows下)

与上一关比较，少了一个将后缀转小写的操作

```
$file_ext = strtolower($file_ext); //转换为小写
```

因为windows系统对将`.Php`转变成`.php`，导致代码执行成功

## Pass-7(空格绕过windows下)

少了一个首尾去空的函数

```
$file_ext = trim($file_ext); //首尾去空
```

直接在后缀后面加一个空格就行，因为windows系统特性会将文件后面空格删掉

抓包加空格

![image-20231122200101759](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231122200101759.png)

## Pass-8(点绕过windows下)

少了一个deldot函数

```
$file_name = deldot($file_name);//删除文件名末尾的点
```

那我们可以在后缀加上点，就能绕过，操作同上

## Pass-9(::$DATAwindows下)

在window的时候如果文件名+`"::$DATA"`会把`::$DATA`之后的数据当成文件流处理,不会检测后缀名，且保持`::$DATA`之前的文件名，他的目的就是不检查后缀名

目录里有一个1.txt文件

```
echo 456>1.txt:2.txt
notepad 1.txt:2.txt  //查看额外数据流
```

![image-20231122203818851](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231122203818851.png)

原1.txt的内容是不受影响的

我们在文件名加上`::$DATA`，上传就行

## Pass-10(点空格点绕过windows下)

看了源码，发现这些函数只验证一次，例如删除文件末尾的点

点空格点为什么能绕过？

有一个文件`1.php. .`

首先deldot函数会去掉末尾的一个点，变成`1.php. `

strrchr函数取的后缀是`. `,然后去掉后面的`.`，后缀就剩一个.了（不在黑名单中）

最后上传文件名是`1.php. `

## Pass-11(双写绕过)

源码变了，但依旧是黑名单

```
$file_name = str_ireplace($deny_ext,"", $file_name); //文件名里有黑名单的后缀就会被替换成空
```

构造一个文件名`1.pphphp`，它是从左到右序列替换的，替换后变成1.php

![image-20231122210501403](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231122210501403.png)

## Pass-12(%00截断)

源码变了

```php
$is_upload = false;
$msg = null;
if(isset($_POST['submit'])){
    $ext_arr = array('jpg','png','gif'); //白名单，允许上传的文件类型
    $file_ext = substr($_FILES['upload_file']['name'],strrpos($_FILES['upload_file']['name'],".")+1);
    if(in_array($file_ext,$ext_arr)){
        $temp_file = $_FILES['upload_file']['tmp_name'];
        $img_path = $_GET['save_path']."/".rand(10, 99).date("YmdHis").".".$file_ext;
        if(move_uploaded_file($temp_file,$img_path)){
            $is_upload = true;
        } else {
            $msg = '上传出错！';
        }
    } else{
        $msg = "只允许上传.jpg|.png|.gif类型文件！";
    }
}
```

save_path是一个可控变量，用%00进行截断，使用条件：

```
php版本小于5.3.4
php的magic_quotes_gpc为OFF状态
```

上传.png图片

![image-20231123112643645](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231123112643645.png)

上传后url地址是这样的

![image-20231123113120815](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231123113120815.png)

我们访问1.php就行了

## Pass-13(0x00绕过)

同样save_path是可控的，这个是post请求

在文件名后面随便加个字符，将它的hex编码改成00

![image-20231123113614521](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231123113614521.png)

访问同上

## Pass-14(图片🐎)

准备php文件(里面是一句话木马)，和一张普通图片

```
copy 13.jpg /b + 13.php webshell.jpg
```

上传图片后，利用文件包含漏洞进行执行

![image-20231123115055264](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231123115055264.png)

## Pass-15(图片🐎)

```
$info = getimagesize($filename);
```

getimagesize()是PHP中用于获取图像的大小和格式的函数。它可以返回一个包含图像的宽度、高度、类型和MIME类型的数组

getimagesize()的基本语法如下：

$size = getimagesize($filename);

其中，$filename是要获取信息的图像文件的路径。该函数返回一个数组$size，数组元素如下：

$size[0]: 图像的宽度
$size[1]: 图像的高度
$size[2]: 图像的类型
$size[3]: 图像的MIME类型
$size[bits]: 图像的位深度
$size[channels]: 图像的通道数
$size[mime]: 图像的MIME类型

```
Array
(
    [0] => 592
    [1] => 387
    [2] => 3 //一个代表图像类型的整数值，常量
    [3] => width="592" height="387"
    [bits] => 8
    [mime] => image/png
)
```

该值有如下常量：

IMAGETYPE_GIF: GIF格式
IMAGETYPE_JPEG: JPEG格式
IMAGETYPE_PNG: PNG格式

上面的3就代表是png格式的图片

同样图片马绕过

## Pass-16(exif_imagetype)

```
//需要开启php_exif模块
$image_type = exif_imagetype($filename);
//exif_imagetype()仅检查文件的前几个字节，图片码可以绕过
```

上传包含一句话木马的图片，然后利用文件包含漏洞执行代码

## Pass-17(二次渲染)

有二次渲染函数

```php
imagecreatefromjpeg
imagecreatefrompng
imagecreatefromgif
```

上传图片马之后，会将文件最后的php代码删掉

我们可以先上传图片马，然后用010和被渲染的图片进行对比，找到一样的部分（未被渲染的部分）

![image-20231211201726976](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231211201726976.png)

再上传就可以了

## Pass-18(条件竞争)

```
unlink($upload_file); //文件类型不合规直接会被删除
```

我们可以多开几个线程，在还没删除之前就执行代码

抓包上传php文件，开两个爆破页面，一个写，一个读

![image-20231211221940410](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231211221940410.png)

![image-20231211221951213](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231211221951213.png)
