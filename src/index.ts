#!/usr/bin/env node
import fs from 'node:fs'
import process from 'node:process'
import path from 'node:path'
import prompts from 'prompts'
import { cyan } from 'picocolors'
import { onCancel } from './utils/helpers/cancel'
import { values } from './utils/helpers/args'
import { parseJson } from './utils/helpers/parseJson'
import { validateUserConfig, validateUserConfigItem } from './utils/config/validateUserConfig'
import { logger } from './utils/helpers/logger'
import { banner } from './utils/banner'
import { EXAMPLE_CONFIG, userConfigPath } from './utils/config'
import { openFile } from './utils/helpers/openFile'
import { showIp } from './utils/helpers/showIp'
import { upload } from './utils/upload'
import type { UserConfigItem } from './types'

async function main() {
  try {
    banner()
    const empty = !fs.existsSync(userConfigPath)
    if (empty) {
      const { create } = await prompts({
        name: 'create',
        type: 'toggle',
        message: `未找到配置文件，是否创建?`,
        initial: false,
        active: '是',
        inactive: '否',
      })
      if (!create) {
        onCancel()
      }
      else {
        fs.writeFileSync(userConfigPath, JSON.stringify(EXAMPLE_CONFIG, null, 2))
        await openFile(userConfigPath)
      }
      const { proceed } = await prompts([
        {
          name: 'proceed',
          type: 'toggle',
          message: '请保存好你的配置后再继续操作',
          initial: false,
          active: '保存好了',
          inactive: '取消',
        },
      ], {
        onCancel,
      })
      if (!proceed) {
        onCancel()
      }
    }

    if (!values.localdir) {
      throw new Error(`请使用 ${cyan('--l xxx')} 指定本地文件夹 `)
    }
    if (!values.serverdir) {
      throw new Error(`请使用 ${cyan('--s xxx')} 指定服务器文件夹 `)
    }

    const allConfig = validateUserConfig(parseJson(userConfigPath), userConfigPath)
    const configNames = Object.keys(allConfig)
    let selectedConfig: UserConfigItem | null = null
    logger.info(`全局配置文件 ${userConfigPath}`)
    console.log('')

    if (!values.config) {
      const { configName } = await prompts({
        name: 'configName',
        type: 'select',
        message: '请选择配置文件',
        initial: 0,
        choices: configNames.map(name => ({
          title: `${name} (${showIp(allConfig[name])})`,
          value: name,
        })),
      }, {
        onCancel,
      })
      selectedConfig = allConfig[configName]
    }
    else if (values.config.endsWith('.json')) {
      const cwd = process.cwd()
      const filePath = path.join(cwd, values.config)
      const json = parseJson(filePath) as UserConfigItem
      selectedConfig = validateUserConfigItem(filePath, json)
      logger.infoText(`当配置为 (${`${showIp(selectedConfig)}`})`)
    }
    else if (!configNames.includes(values.config)) {
      logger.warning(`当前所有配置文件如下：\n${configNames.map(e => cyan(`  ${e} (${allConfig[e].host}:${allConfig[e].port}) `)).join('\n')}`)
      throw new Error(`配置文件 "${values.config}" 不存在 `)
    }
    if (selectedConfig) {
      await upload(selectedConfig, values.localdir, values.serverdir)
    }
    else {
      throw new Error(`未知错误`)
    }
  }
  catch (error: any) {
    logger.error(error.message)
  }
}

main()
