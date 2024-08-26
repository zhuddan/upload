// import { bold, red } from 'picocolors'
// import figures from 'prompts/lib/util/figures.js'

export const cancelMesssage = `操作已取消`

export function onCancel() {
  throw new Error(cancelMesssage)
}
