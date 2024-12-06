import fs from 'node:fs'

export function parseJson<T extends object>(jsonPath: string) {
  try {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8').toString()) as T
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (_error: any) {
    throw new Error('配置解析失败')
  }
}
