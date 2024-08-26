import { spawn } from 'node:child_process'
import process from 'node:process'
import { Buffer } from 'node:buffer'

export async function exec(command: string, args: ReadonlyArray<string>, options: object = {}) {
  return new Promise<{ ok: boolean, code: number | null, stderr: string, stdout: string }>((resolve, reject) => {
    const _process = spawn(command, args, {
      stdio: [
        'ignore', // stdin
        'pipe', // stdout
        'pipe', // stderr
      ],
      ...options,
      shell: process.platform === 'win32',
    })

    const stderrChunks: Buffer[] = []

    const stdoutChunks: Buffer[] = []

    _process.stderr?.on('data', (chunk) => {
      stderrChunks.push(chunk)
    })

    _process.stdout?.on('data', (chunk) => {
      stdoutChunks.push(chunk)
    })

    _process.on('error', (error) => {
      reject(error)
    })

    _process.on('exit', (code) => {
      const ok = code === 0
      const stderr = Buffer.concat(stderrChunks).toString('utf-8').trim()
      const stdout = Buffer.concat(stdoutChunks).toString('utf-8').trim()
      const result = { ok, code, stderr, stdout }
      resolve(result)
    })
  })
}
