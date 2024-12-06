import type { UserConfigItem } from '../../types'

export function showIp(config: UserConfigItem) {
  return (`${config.host}:${config.port}`).replace(/^(\d+)\.(\d+)\.(\d+)\.(\d+)/, (_, p1, p2, p3, p4) => {
    return `${p1}.***.***.${p4}`
  })
}
