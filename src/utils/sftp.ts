import type { Buffer } from 'node:buffer'
import type { ConnectOptions } from 'ssh2-sftp-client'

import Client from 'ssh2-sftp-client'
import { logger } from './logger'

export class SftpTool {
  sftp: Client | null = null
  constructor(private config: ConnectOptions) { }
  async connect() {
    try {
      if (!this.sftp) {
        this.sftp = new Client()
        await this.sftp.connect(this.config)
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

  async list(remotePath: string): Promise<Client.FileInfo[]> {
    if (!this.sftp)
      throw new Error('SFTP client not connected')

    return await this.sftp.list(remotePath)
  }

  async uploadMultipleFiles(files: { filePath: string | Buffer | NodeJS.ReadableStream, remotePath: string }[]) {
    try {
      await this.connect()
      console.log(this.sftp)
      console.log(this.sftp)
      console.log(this.sftp)
      console.log(this.sftp)
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

export class SftpQueue {
  queue: Array<() => Promise<void>>
  isProcessing: boolean
  constructor() {
    this.queue = []
    this.isProcessing = false
  }

  addToQueue(task: { (): Promise<void> }) {
    this.queue.push(task)
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0)
      return
    this.isProcessing = true
    try {
      await this.queue.shift()?.()
    }
    catch (error) {
      console.error('Error during task:', error)
    }
    this.isProcessing = false
    this.processQueue()
  }
}
