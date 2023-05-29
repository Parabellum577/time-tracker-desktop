import { execFile } from 'child_process'

export default (fn: any): Promise<string> => {
  const code = `
        ObjC.import('stdlib')
        var fn   = (${fn.toString()})
        var out  = fn()
        JSON.stringify(out)
    `

  return new Promise((res, rej) => {
    const child = execFile(
      '/usr/bin/osascript',
      ['-l', 'JavaScript'],
      {
        env: {},
      },
      (err: Error, stdout, stderr) => {
        if (err) {
          return rej(err)
        }

        if (stderr) {
          console.log(stderr)
        }

        if (!stdout) {
          res(undefined)
        }

        try {
          res(JSON.parse(stdout.toString()))
        } catch (e) {
          rej(e)
        }
      },
    )
    child.stdin.write(code)
    child.stdin.end()
  })
}
