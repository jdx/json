import {Command, flags} from '@oclif/command'
import * as _ from 'lodash'
import {inspect} from 'util'

const sw = require('string-width')

class JdxcodeJson extends Command {
  static description = 'describe the command here'

  static flags = {
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    table: flags.string({char: 't'}),
  }

  columns!: string[]

  async run() {
    const {flags} = this.parse(JdxcodeJson)
    if (flags.table) this.columns = flags.table.split(',')
    if (process.stdin.isTTY) this.error(`USAGE: echo '{"foo": "bar"}' | json`)
    const input = await this.read()
    this.debug(input)
    if (flags.table) return this.table(input)
    process.stdout.write(inspect(input) + '\n')
  }

  table(arr: any[]) {
    if (!Array.isArray(arr)) throw new Error('not an array')
    const table = arr.map(row => this.columns.map(c => {
      const v = _.get(row, c)
      return typeof v === 'string' ? v : inspect(v, {breakLength: Infinity})
    }))
    const widths = _.map(this.columns, (__, i) => sw(_.maxBy(table.map(row => row[i]), r => sw(r)) || '') + 1)
    for (let row of table) {
      for (let j = 0; j < row.length; j++) {
        let o = row[j].padEnd(widths[j])
        process.stdout.write(o)
      }
      process.stdout.write('\n')
    }
  }

  get maxWidth() {
    return (process.stdout as any).getWindowSize()[0]
  }

  read() {
    process.stdin.setEncoding('utf8')
    return new Promise<any>(resolve => {
      let input = ''
      process.stdin.on('readable', () => {
        input += process.stdin.read() || ''
      })
      process.stdin.on('end', () => {
        resolve(JSON.parse(input))
      })
    })
  }
}

export = JdxcodeJson
