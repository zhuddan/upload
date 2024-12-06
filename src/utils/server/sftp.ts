import type { UserConfigItem } from '../../types'
import { SftpTool } from './SftpTool'
import { FtpTool } from './FtpTool'

export function createSftpClient(config: UserConfigItem) {
  if (config.protocol === 'sftp'
    || (config.port !== 21 && config.port !== 20)) {
    return new SftpTool({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
    })
  }
  else {
    return new FtpTool({
      host: config.host,
      port: config.port,
      user: config.username === '' ? undefined : config.username,
      password: config.password === '' ? undefined : config.password,
    })
  }
}
