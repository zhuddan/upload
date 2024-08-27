@zd~/upload

一个基于[basic-ftp](https://www.npmjs.com/package/basic-ftp)和[ssh2-sftp-client](https://www.npmjs.com/package/ssh2-sftp-client)的ftp/sftp上传工具，可以快速的帮你把本地资源上传到ftp/sftp服务器。

> [!IMPORTANT]
> 这个上传是默认覆盖的原有文件的，如果你需要复原请自行备份你的文件。

``` bash
npx @zd~/upload -l ./test/ -s /home/test-2
```

首次执行会在当前用户的主目录路径(windows为 `%userprofile%` Linux 和 macOS 为 `~` 或 `$HOME`)生成一个`upload.config.json`，请请修改完成再进行操作
```json
{
  "example": {
    "host": "127.0.0.1",
    "port": 22,
    "username": "root",
    "password": "123456"
  }
}
```
`example` 为配置名称，`host` 主机 `port` 为端口，`username`(可选) 用户名，`password`(可选) 密码。
配置完成之后，你可以直接运行 `npx @zd~/upload -l 本地文件里路径 -s 目标服务器路径`，如果你有多个配置，
可以运行 `npx @zd~/upload -c 配置名称 -l 本地文件里路径 -s 目标服务器路径` 选择配置运行，或者↑↓`进行选择。
[]
