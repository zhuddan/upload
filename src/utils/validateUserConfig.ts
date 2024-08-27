import type { UserConfig, UserConfigItem } from 'src/types'

export function validateUserConfig(config: any) {
  if (config === undefined || config === null) {
    throw new Error('配置解析失败 config is null or undefined')
  }
  const allConfigNames = Object.keys(config)
  if (!allConfigNames.length) {
    throw new TypeError('配置解析失败 At least one configuration is required')
  }
  const keys: (keyof UserConfigItem)[] = ['host', 'port']
  for (let index = 0; index < allConfigNames.length; index++) {
    const name = allConfigNames[index]
    const item = config[name]
    for (const key of keys) {
      if (item[key] === undefined || item[key] === null) {
        throw new TypeError(`配置解析失败 config[${index}][${key}] is null or undefined`)
      }
      if (key === 'port' && typeof item[key] !== 'number') {
        throw new TypeError(`配置解析失败 config[${index}][${key}] is not a number`)
      }
      if (key === 'host' && typeof item[key] !== 'string') {
        throw new TypeError(`配置解析失败 config[${index}][${key}] is not a string`)
      }
    }
  }
  return config as UserConfig
}
