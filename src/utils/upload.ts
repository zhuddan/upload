#!/usr/bin/env node
import process from 'node:process'
import path from 'node:path'
import type { UserConfigItem } from '../types/types'
import { logger } from '../utils/helpers/logger'
import { createSftpClient } from '../utils/server/sftp'
import { getFiles } from '../utils/helpers/getFiles'

export async function upload(config: UserConfigItem, localdir: string, serverdir: string) {
  const cwd = process.cwd()
  const _localdir = path.resolve(cwd, localdir)
  logger.info(`本地目录 ${_localdir}`)
  logger.info(`远程目录 ${serverdir}`)

  const allFiles = getFiles(_localdir)
  if (!allFiles.length) {
    logger.warning('本地文件夹为空，无需上传')
    return
  }
  console.log(' ')
  logger.infoText('🎈🎈🎈 开始上传')
  console.log(' ')
  const files = allFiles.map((filePath) => {
    const remotePath = serverdir + filePath
      .replace(_localdir, '')
      .replace(/\\/g, '/')
    return { filePath, remotePath }
  })

  const sftp = createSftpClient(config)
  await sftp.ensureRemoteDirectoryExists(serverdir)
  await sftp.uploadMultipleFiles(files)
  console.log(' ')
  logger.successText('🎉🎉🎉 上传完成')
  console.log(' ')
}
