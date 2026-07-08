const fs = require('fs')
const path = require('path')
const unzip = require('unzip-stream')

async function extractServer() {
  const pkg = require('../package.json')
  const serverPackage = `omega-edit-grpc-server-${pkg.version}`
  const zipFilePath = path.resolve(__dirname, '../../server/scala/serv/target/universal', `${serverPackage}.zip`)
  const outDir = path.resolve(__dirname, '../out')

  if (!fs.existsSync(zipFilePath)) {
    console.warn(`Server package ${zipFilePath} not found, skipping extraction`)
    return
  }

  await new Promise((resolve, reject) => {
    fs.createReadStream(zipFilePath)
      .pipe(unzip.Extract({ path: outDir }))
      .on('close', resolve)
      .on('error', reject)
  })

  ;['bin', 'lib'].forEach((dir) => {
    fs.renameSync(path.join(outDir, serverPackage, dir), path.join(outDir, dir))
  })

  fs.rmSync(path.join(outDir, serverPackage), { recursive: true, force: true })
}

async function main() {
  await extractServer()
  // copy license into package root for publishing
  const licenseSrc = path.resolve(__dirname, '../../../LICENSE.txt')
  const licenseDst = path.resolve(__dirname, '../LICENSE.txt')
  fs.copyFileSync(licenseSrc, licenseDst)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
