import type { Readable } from 'node:stream'
import readline from 'node:readline'
import process from 'node:process'
import * as ftp from 'basic-ftp'
import { logger } from '../helpers/logger'

export class FtpTool {
  client: ftp.Client | null = null

  constructor(private config: ftp.AccessOptions) {}

  async connect() {
    try {
      if (!this.client) {
        this.client = new ftp.Client(99999)
        await this.client.access({
          ...this.config,
          secure: false,
        })
      }
    }
    catch (error) {
      throw new Error(`FTP 连接失败: ${(error as any).message}`)
    }
  }

  async disconnect() {
    if (this.client) {
      this.client.close()
      this.client = null
    }
  }

  async ensureRemoteDirectoryExists(remotePath: string) {
    const remoteDirectory = remotePath.substring(0, remotePath.lastIndexOf('/'))
    if (!this.client) {
      await this.connect()
    }
    if (!this.client) {
      throw new Error('FTP client not connected')
    }

    const exists = await this.client.cd(remoteDirectory).then(() => true).catch(() => false)
    if (!exists) {
      logger.warning(`${remoteDirectory} does not exist`)
      await this.client.ensureDir(remoteDirectory)
    }
  }

  async uploadFile(filePath: string | Readable, remotePath: string) {
    logger.info(`${filePath} 开始上传`)

    try {
      if (!this.client)
        throw new Error('FTP client not connected')

      await this.ensureRemoteDirectoryExists(remotePath)

      if (typeof filePath === 'string') {
        await this.client.uploadFrom(filePath, remotePath)
      }
      else {
        await this.client.uploadFrom(filePath, remotePath)
      }
      readline.moveCursor(process.stdout, 0, -1) // 移动光标到上一行
      readline.clearLine(process.stdout, 0) // 清除光标所在的行
      logger.success(`${filePath} 上传成功`)
    }
    catch (err) {
      logger.error(`${filePath} to ${remotePath} 上传失败`)
      throw err
    }
  }

  async list(remotePath: string): Promise<ftp.FileInfo[]> {
    if (!this.client)
      throw new Error('FTP client not connected')

    return await this.client.list(remotePath)
  }

  async uploadMultipleFiles(files: { filePath: string | Readable, remotePath: string }[]) {
    try {
      await this.connect()
      for (const file of files) {
        await this.uploadFile(file.filePath, file.remotePath)
      }
    }
    catch (err) {
      console.error('Error during file upload:', err)
    }
    finally {
      await this.disconnect()
    }
  }
}
