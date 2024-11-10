import type { Buffer } from 'node:buffer'
import type { Readable } from 'node:stream'
import type { ConnectOptions } from 'ssh2-sftp-client'
import SftpClient from 'ssh2-sftp-client'
import * as ftp from 'basic-ftp'
import type { UserConfigItem } from 'src/types'
import { logger } from './logger'

class SftpTool {
  sftp: SftpClient | null = null
  constructor(private config: ConnectOptions) { }
  async connect() {
    try {
      if (!this.sftp) {
        this.sftp = new SftpClient()
        await this.sftp.connect({
          ...this.config,
          timeout: 99999,
        })
      }
    }
    catch (error) {
      throw new Error(`sftp 连接失败: ${(error as any).message}`)
    }
  }

  async disconnect() {
    if (this.sftp) {
      await this.sftp.end()
      this.sftp = null
    }
  }

  async ensureRemoteDirectoryExists(remotePath: string) {
    const remoteDirectory = remotePath.substring(0, remotePath.lastIndexOf('/'))
    if (!this.sftp) {
      await this.connect()
    }
    if (!this.sftp) {
      throw new Error('SFTP client not connected')
    }

    const exists = await this.sftp.exists(remoteDirectory)
    if (!exists) {
      logger.warning(`${remoteDirectory} does not exist`)
      await this.sftp.mkdir(remoteDirectory, true)
    }
  }

  async uploadFile(filePath: string | Buffer | NodeJS.ReadableStream, remotePath: string) {
    logger.info(`${filePath} 开始上传`)

    try {
      if (!this.sftp)
        throw new Error('SFTP client not connected')

      await this.ensureRemoteDirectoryExists(remotePath)

      if (typeof filePath === 'string') {
        await this.sftp.fastPut(filePath, remotePath)
      }
      else {
        await this.sftp.put(filePath, remotePath)
      }

      logger.success(`${filePath} 上传成功`)
    }
    catch (err) {
      logger.error(`${filePath} to ${remotePath} 上传失败`)
      throw err
    }
  }

  async list(remotePath: string): Promise<SftpClient.FileInfo[]> {
    if (!this.sftp)
      throw new Error('SFTP client not connected')

    return await this.sftp.list(remotePath)
  }

  async uploadMultipleFiles(files: { filePath: string | Buffer | NodeJS.ReadableStream, remotePath: string }[]) {
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

class FtpTool {
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

export function createSftpClient(config: UserConfigItem) {
  if (config.port === 21 || config.port === 20) {
    return new FtpTool({
      host: config.host,
      port: config.port,
      user: config.username === '' ? undefined : config.username,
      password: config.password === '' ? undefined : config.password,
    })
  }
  else {
    return new SftpTool({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
    })
  }
}
