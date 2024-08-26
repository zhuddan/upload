import fs from 'node:fs'
import process from 'node:process'
import path from 'node:path'
import prompts from 'prompts'
import { cyan } from 'picocolors'
import { onCancel } from './utils/cancel'
import { values } from './utils/args'
import type { UserConfigItem } from './types/types'
import { parseJson } from './utils/parseJson'
import { validateUserConfig } from './utils/validateUserConfig'
import { logger } from './utils/logger'
import { SftpTool } from './utils/sftp'
import { getFiles } from './utils/getFiles'
import { banner } from './utils/banner'
import { EXAMPLE_CONFIG } from './utils/constants'
import { openFile } from './utils/openFile'

const userConfigPath = path.normalize(`${process.env.HOME ?? process.env.USERPROFILE}/.upload.config.json`)

// const uploadCacheDir = path.normalize(`${process.env.HOME ?? process.env.USERPROFILE}/.upload.config.cache`)
// const cwdConfigPath = path.normalize(`${process.cwd()}/.upload.config.json`)
// const gitignore = path.normalize(`${process.cwd()}/.gitignore`)

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
        logger.infoText(`当前只有一个配置文件，默认使用 ${values.config} 配置`)
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
    // if (values.watch) {
    //   await initWatch(allConfig[`${values.config}`], values.localdir, values.serverdir)
    // }
    // else {
    // }
    await upload(allConfig[`${values.config}`], values.localdir, values.serverdir)
  }
  catch (error: any) {
    logger.error(error.message)
  }
}

async function upload(config: UserConfigItem, localdir: string, serverdir: string) {
  const cwd = process.cwd()
  const _localdir = path.resolve(cwd, localdir)

  const allFiles = getFiles(_localdir)
  if (!allFiles.length) {
    logger.warning('本地文件夹为空，无需上传')
    return
  }
  console.log(' ')
  logger.info('开始上传')
  const files = allFiles.map((filePath) => {
    const remotePath = serverdir + filePath
      .replace(_localdir, '')
      .replace(/\\/g, '/')
    return { filePath, remotePath }
  })

  const sftp = new SftpTool(config)
  await sftp.ensureRemoteDirectoryExists(serverdir)

  await sftp.uploadMultipleFiles(files)
}

// function initWatch(config: UserConfigItem, localdir: string, serverdir: string) {
//   if (!fs.existsSync(uploadCacheDir)) {
//     fs.mkdirSync(uploadCacheDir, { recursive: true })
//   }
//   const cacheJson = `${path.resolve(process.cwd(), localdir).replace(/(:?)\\/g, '-')}.json`
//   if (!fs.existsSync(cacheJson)) {
//     fs.writeFileSync(path.resolve(uploadCacheDir, cacheJson), JSON.stringify({}))
//   }
// }

main()
