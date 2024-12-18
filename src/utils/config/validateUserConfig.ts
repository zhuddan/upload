import type { UserConfig, UserConfigItem } from '../../types'

export function validateUserConfig(config: any, fileName: string) {
  if (config === undefined || config === null) {
    throw new Error('配置解析失败 config is null or undefined')
  }
  const allConfigNames = Object.keys(config)
  if (!allConfigNames.length) {
    throw new TypeError('配置解析失败 At least one configuration is required')
  }

  for (let index = 0; index < allConfigNames.length; index++) {
    const configName = allConfigNames[index]
    const item = config[configName]
    validateUserConfigItem(fileName, item, configName)
  }
  return config as UserConfig
}
export function validateUserConfigItem(filename: string, item: UserConfigItem, configName?: string) {
  const keys: (keyof UserConfigItem)[] = ['host', 'port']
  const cname = configName ? `配置 [${configName}] ` : ''
  for (const key of keys) {
    if (item[key] === undefined || item[key] === null) {
      throw new TypeError(`配置解析失败 ${filename}\n        ${cname}"${key}" is null or undefined`)
    }
    if (key === 'port' && typeof item[key] !== 'number') {
      throw new TypeError(`配置解析失败 ${filename}\n        ${cname}"${key}" is not a number`)
    }
    if (key === 'host' && typeof item[key] !== 'string') {
      throw new TypeError(`配置解析失败 ${filename}\n        ${cname}"${key}" is not a string`)
    }
  }
  return item
}
