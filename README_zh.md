Bilibili Danmaku Client JS
----

[English](./README.md)

一个简易的**命令行**[Bilibili](https://bilibili.com)弹幕姬，由Node JS编写。

在终端中输出弹幕、礼物以及其他互动消息。

> 目前只是个Demo，写着玩的，可能不稳定

## 食用方法

首先安装Node JS和npm，之后克隆这个仓库到你的电脑上，使用`npm install`安装依赖。

`./index.js -r [直播间号]`运行本程序。

```
git clone https://github.com/STARRY-S/bilibili-danmaku-client-js.git
cd bilibili-danmaku-client-js
npm install
./index.js -h
```

## 开发

编辑 `srcs/client.js` 这个文件下的 `handleMessage()` 和
`handleDanmaku()` 这两个函数。

## 其他

有问题请提issue，如果你有比较不错的主意也可以提pr。

(仅限中文或英语交流)

## License

> Apache-2.0
