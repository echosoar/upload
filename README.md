# CmdUp
超方便的命令行上传工具

## 介绍
CmdUp的目标是简单、高效的通过命令行一键将**符合规则**的文件/夹按照某种指定的**命名规则**上传到阿里云OSS、七牛等**云存储**。

## 如何使用？

### 安装

通过npm安装：
```shell
npm i cmdup -g
```

### 使用
cmdup会安装 up 和 upload 两个命令，使用方法是相同的：
```
up -f test.txt -u
// 将test.txt文件上传
```

## 命令行参数
| 参数 | 释义 |
| --- | --- |
| -c / --config | 指定配置文件路径 |
| -f / --file | 指定上传的文件匹配规则或路径 |
| -t / --type <type> | 使用type类型上传，type包含 qiniu、aliyun 等 |
| -u / --upload | 立即上传 |


## 配置文件
cmdup的云存储配置和上传规则都依赖于 `upload.conf.json`配置文件 ，在执行命令时会依次遍历 `执行命令的文件夹`、`用户根目录` 搜索此文件，距离最近的优先级最高。

### 配置项
```js
{
  "defaultType": "qiniu",       // 默认上传类型（等同于 -t 参数），会根据此类型从cloud中获取配置
  "files": ["dist/main.js"],    // 上传文件列表（等同于 -f 参数）
  "cloud": {                    // 云存储配置
    "qiniu": {                    // 云存储类型
      "accessKey": "**********",  // 对应平台accessKey
      "secretKey": "**********",  // 对应平台secretKey
      "bucket": "test"            // 对应平台空间 bucket
    }
  },
  "fileAutoName": "$date(yyyyMMddhhmmss)_$random_$index.$ext" // 上传文件自动命名规则，其中 魔法变量规则 详见下方
}
```
### 自动命名魔法变量

#### 时间 $date(format)

format 代表时间格式化参数，可以由下列参数拼接：

| 参数 | 释义 |
| :---: | --- |
| yyyy | 四位年份，如2019 |
| yy | 两位年份，如 19 |
| MM | 补零的月份，如 01、11|
| M |  不补零的月份，如 1、11|
| dd |  补零的日期，如 02、22|
| d |  不补零的日期，如 2、22|
| hh |  补零的小时，如 03、23|
| h |  不补零的小时，如 3、23|
| mm |  补零的分钟，如 04、44|
| m |  不补零的分钟，如 4、44|
| ss |  补零的秒，如 05、55|
| s |  不补零的秒，如 5、55|
| S |  毫秒|

```
$date(yyyy-MM-dd-hh-mm-ss) 
// 2019-09-19-29-39-49
```

#### 扩展名 $ext
原始文件的扩展名，不带英文点，如 txt、png、jpg等

#### 随机数 $random
返回 0 ~ 10000000 间的随机数

#### 文件索引 $index
同时上传多个文件时，$index 从0开始叠加

#### 获取配置 $conf(path)
从 `upload.conf.json` 配置文件中的内容中获取数据，path代表路径，如 cloud.qiniu.accessKey



