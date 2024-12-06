import { bgCyan, bgGreen, bgRed, bgYellow, cyan, green, red, yellow } from 'picocolors'
import type { Ora } from 'ora'
import ora from 'ora'

type LogFn = () => void

class Logger {
  spinner?: Ora
  ln = () => console.log()
  withStartLn = (log: LogFn) => {
    this.ln()
    log()
  }

  withEndLn = (log: LogFn) => {
    log()
    this.ln()
  }

  withBothLn = (log: LogFn) => {
    this.ln()
    log()
    this.ln()
  }

  warning = (msg: string) => {
    console.warn(`${bgYellow(' WARNING ')} ${yellow(msg)}`)
  }

  info = (msg: string) => {
    console.log(`${bgCyan(' INFO ')} ${cyan(msg)}`)
  }

  success = (msg: string) => {
    console.log(`${bgGreen(' SUCCESS ')} ${green(msg)}`)
  }

  error = (msg: string) => {
    console.error(`${bgRed(' ERROR ')} ${red(msg)}`)
  }

  warningText = (msg: string) => {
    console.warn(`${yellow(msg)}`)
  }

  infoText = (msg: string) => {
    console.log(`${cyan(msg)}`)
  }

  successText = (msg: string) => {
    console.log(`${green(msg)}`)
  }

  errorText = (msg: string) => {
    console.error(`${red(msg)}`)
  }

  loading(text: string, color: Ora['color'] = 'yellow') {
    this.spinner = ora('Loading...').start()
    this.spinner.color = color
    this.spinner.text = text
  }

  stopLoading() {
    if (this.spinner) {
      this.spinner?.stop()
    }
  }
}

export const logger = new Logger()
