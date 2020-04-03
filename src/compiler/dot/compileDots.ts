import path from 'path'

// eslint-disable-next-line import/default
import del from 'del'
import dot from 'dot'

async function compileDots () {
  await del(path.join(__dirname, '*.js'))
  await del(path.join(__dirname, '*.js'))
  await (dot as any).process({
    path: __dirname,
    templateSettings: {
      encode: false,
      doNotSkipEncoded: true
    }
  })
}

export default compileDots
