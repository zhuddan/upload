export interface UserConfigItem {
  host: string
  port: number
  username: string
  password: string
}

export type UserConfig = Record<string, UserConfigItem>
