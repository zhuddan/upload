#!/usr/bin/env node
import fs from 'node:fs'
import prompts from 'prompts'
import { cyan } from 'picocolors'
import { onCancel } from './utils/helpers/cancel'
import { values } from './utils/helpers/args'
import { parseJson } from './utils/helpers/parseJson'
import { validateUserConfig } from './utils/config/validateUserConfig'
import { logger } from './utils/helpers/logger'
import { banner } from './utils/banner'
import { EXAMPLE_CONFIG, userConfigPath } from './utils/config'
import { openFile } from './utils/helpers/openFile'
import { showIp } from './utils/helpers/showIp'
import { upload } from './utils/upload'

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

    const allConfig = validateUserConfig(parseJson(userConfigPath))

    const configNames = Object.keys(allConfig)

    if (!values.config) {
      if (configNames.length === 1) {
        values.config = configNames[0]
        logger.infoText(`当前只有一个配置文件，默认使用 ${values.config} (${`${showIp(allConfig[values.config])}`}) 配置`)
      }
      else {
        logger.info(`当前配置文件目录 ${userConfigPath}`)
        console.log('')
        const { config } = await prompts({
          name: 'config',
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
        values.config = config
      }
    }
    else if (!configNames.includes(values.config)) {
      logger.warning(`当前所有配置文件如下：\n${configNames.map(e => cyan(`  ${e} (${allConfig[e].host}:${allConfig[e].port}) `)).join('\n')}`)
      throw new Error(`配置文件 "${values.config}" 不存在 `)
    }
    await upload(allConfig[`${values.config}`], values.localdir, values.serverdir)
  }
  catch (error: any) {
    logger.error(error.message)
  }
}

main()
