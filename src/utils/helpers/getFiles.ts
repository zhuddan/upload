import fs from 'node:fs'
import path from 'node:path'

export function getFiles(dir: string) {
  const _files = fs.readdirSync(dir)
  const files: string[] = []
  for (let index = 0; index < _files.length; index++) {
    const filePath = path.resolve(dir, _files[index])
    const stat = fs.lstatSync(filePath) // 使用 lstat 来获取符号链接的状态
    if (stat.isDirectory()) {
      files.push(...getFiles(filePath))
    }
    else if (stat.isFile()) {
      files.push(filePath)
    }
  }
  return files
}
