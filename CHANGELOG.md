# Changelog

### [0.3.2](https://github.com/zhuddan/upload/compare/v0.3.1...v0.3.2) (2024-12-18)

### Features
 - 支持当前指定当目录下的配置进行上传

upload.json

```json
{
  "host": "your host",
  "password": "your password",
  "port": 21,
  "username": "root"
}
```

你可以使用 `-c upload.json` 指定具体的上传配置进行上传

``` bash
npx @zd~/upload@latest -c upload.json -l ./test -s /home/wang/gzh
```
