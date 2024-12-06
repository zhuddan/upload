import type { Options } from 'boxen'
import boxen from 'boxen'
import { bgRed, cyan, gray, red } from 'picocolors'

import { version } from '../../../package.json'

const bannerMessage = `${cyan(`欢迎使用 @zd~/upload@${version}`)}
${bgRed('警告')} ${red('请不要将任何服务器信息存放到不受信任的地方!')}
${gray('建议将上传配置文件 upload.config.json 加入')}
${gray('.gitignore 以避免上传到版本控制系统。')}
${gray('由于操作失误导致的服务器信息泄露，概不负责。')}`

const boxenOptions: Options = {
  padding: 1,
  margin: 1,
  borderColor: '#00FFFF',
  borderStyle: 'round',
  align: 'center',
}

export const banner = () => console.log(boxen(bannerMessage, boxenOptions))
