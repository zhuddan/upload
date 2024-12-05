export interface UserConfigItem {
  host: string
  port: number
  username: string
  password: string
  protocol?: string
}

export type UserConfig = Record<string, UserConfigItem>
