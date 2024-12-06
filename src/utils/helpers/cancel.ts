export const cancelMesssage = `操作已取消`

export function onCancel() {
  throw new Error(cancelMesssage)
}
