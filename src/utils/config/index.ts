import path from 'node:path'
import process from 'node:process'

import type { UserConfig } from '../../types/types'

export const configFileName = 'upload.config.json'
export const userConfigPath = path.normalize(
  path.join(`${process.env.HOME ?? process.env.USERPROFILE}/`, configFileName),
)

export const EXAMPLE_CONFIG: UserConfig = {
  example: {
    host: '127.0.0.1',
    port: 22,
    username: 'root',
    password: '123456',
  },
}
