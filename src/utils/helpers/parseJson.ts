import fs from 'node:fs'

export function parseJson<T extends object>(jsonPath: string) {
  try {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8').toString()) as T
  }
  catch {
    throw new Error(`${jsonPath} 配置解析失败`)
  }
}
