import os from 'node:os'
import process from 'node:process'
import { logger } from './logger'
import { exec } from './exec'

export function getOperatingSystem() {
  const platform = os.platform()

  if (platform === undefined || platform === null) {
    throw new Error('os.platform() returned null or undefined')
  }

  switch (platform) {
    case 'win32':
      return 'Windows'
    case 'darwin':
      return 'macOS'
    case 'linux':
      return 'Linux'
    default:
      return 'Unknown OS'
  }
}

export async function openFile(filePath: string) {
  const platform = process.platform

  let command
  let args

  switch (platform) {
    case 'win32':
      // Windows 系统使用 start 命令
      command = 'cmd'
      args = ['/c', 'start', '', filePath]
      break
    case 'darwin':
      // macOS 使用 open 命令
      command = 'open'
      args = [filePath]
      break
    case 'linux':
      // Linux 使用 xdg-open 命令
      command = 'xdg-open'
      args = [filePath]
      break
    default:
      logger.error('Unsupported operating system.')
      return
  }

  try {
    const result = await exec(command, args)
    if (result.ok) {
      // logger.success('File opened successfully!')
    }
    else {
      logger.error(`Error opening file:${result.stderr}`)
    }
  }
  catch (error) {
    logger.error(`Error executing command:${error}`)
  }
}
