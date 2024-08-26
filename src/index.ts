import fs from 'node:fs'
import process from 'node:process'
import path from 'node:path'
import prompts from 'prompts'
import { cyan, red } from 'picocolors'
import figures from 'prompts/lib/util/figures.js'
import { onCancel } from './utils/cancel'
import { values } from './utils/args'
import type { UserConfig, UserConfigItem } from './types/types'
import { openFile } from './utils/openFile'
import { parseJson } from './utils/parseJson'
import { validateUserConfig } from './utils/validateUserConfig'
import { logger } from './utils/logger'
import { SftpTool } from './utils/sftp'
import { getFiles } from './utils/getFiles'

const userConfigPath = `${process.env.HOME ?? process.env.USERPROFILE}/zd.upload.config.json`

const EXAMPLE_CONFIG: UserConfig = {
  example: {
    host: '127.0.0.1',
    port: 22,
    username: 'root',
    password: '123456',
  },
}

async function main() {
  try {
    const empty = !fs.existsSync(userConfigPath)
    if (empty) {
      const { create } = await prompts({
        name: 'create',
        type: 'toggle',
        message: '未发现任何配置文件，请先创建?',
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
        logger.warning(`当前只有一个配置文件，默认使用 ${values.config} 配置`)
      }
      else {
        const { config } = await prompts({
          name: 'config',
          type: 'select',
          message: '请选择配置文件',
          initial: 0,
          choices: configNames.map(name => ({
            title: name,
            value: name,
          })),
        })
        values.config = config
      }
    }
    await upload(allConfig[`${values.config}`], values.localdir, values.serverdir)
  }
  catch (error: any) {
    logger.error(error.message)
  }
}

async function upload(config: UserConfigItem, localdir: string, serverdir: string) {
  const cwd = process.cwd()
  const _localdir = path.resolve(cwd, localdir)
  const sftp = new SftpTool(config)
  await sftp.ensureRemoteDirectoryExists(serverdir)
  const files = getFiles(_localdir).map((filePath) => {
    const remotePath = serverdir + filePath
      .replace(_localdir, '')
      .replace(/\\/g, '/')
    return { filePath, remotePath }
  })
  await sftp.uploadMultipleFiles(files)
}

main()
