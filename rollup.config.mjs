// @ts-check
import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import del from 'rollup-plugin-delete'
import terser from '@rollup/plugin-terser'

export default defineConfig({
  input: './src/index.ts',
  output: {
    file: './dist/script.js',
    format: 'commonjs',
  },
  plugins: [
    del({
      targets: ['dist/*'],
      force: true,
      hook: 'buildStart',
    }),
    terser(),
    typescript(),
    nodeResolve({
      exportConditions: ['node'], // add node option here,
    }),
    commonjs(),
    json(),
  ],
})
