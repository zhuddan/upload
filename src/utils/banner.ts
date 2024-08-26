import type { Options } from 'boxen'
import boxen from 'boxen'
import { bannerMessage } from './constants'

const boxenOptions: Options = {
  padding: 1,
  margin: 1,
  borderColor: '#00FFFF',
  borderStyle: 'round',
  align: 'center',
}

export const banner = () => console.log(boxen(bannerMessage, boxenOptions))
