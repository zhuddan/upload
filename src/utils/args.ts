import { parseArgs } from 'node:util'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    config: {
      type: 'string',
      short: 'c',
    },
    localdir: {
      type: 'string',
      short: 'l',
    },
    serverdir: {
      type: 'string',
      short: 's',
    },
    // watch: {
    //   type: 'boolean',
    //   short: 'w',
    // },
  },
})

export { values, positionals }
