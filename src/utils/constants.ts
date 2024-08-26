import { bgRed, cyan, gray, red } from 'picocolors'

import type { UserConfig } from '../types/types'

export const bannerMessage = `
${cyan('欢迎使用 @zd~/upload')}
${bgRed('警告')} ${red('请不要将任何服务器信息存放到不受信任的地方!')}
${gray('建议将上传配置文件 upload.config.json 加入')}
${gray('.gitignore 以避免上传到版本控制系统。')}
${gray('由于操作失误导致的服务器信息泄露，概不负责。')}
`

export const EXAMPLE_CONFIG: UserConfig = {
  example: {
    host: '127.0.0.1',
    port: 22,
    username: 'root',
    password: '123456',
  },
}
