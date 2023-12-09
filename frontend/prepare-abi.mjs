import * as fs from 'node:fs/promises'
import { exec } from 'node:child_process'

const inputDirs = ['../contracts/artifacts/contracts']
const outputDir = './src/abi'

// makes abi look like:
// export default {...} as const;
async function handleAbi(abiPath, contractName) {
  let fileHandleRead;
  let fileHandleWrite;
  const outputFilePath = `${outputDir}/${contractName}.ts`

  try {
    fileHandleRead = await fs.open(abiPath, 'r')
    fileHandleWrite = await fs.open(outputFilePath, 'w')

    let content = await fileHandleRead.readFile({encoding: 'utf8'})
    content = `export default ${content.slice(0, -1)} as const;`
    await fileHandleWrite.writeFile(content, {encoding: 'utf8'})

    console.log(outputFilePath)
  } finally {
    await fileHandleRead?.close()
    await fileHandleWrite?.close()
  }
}

async function findFilesWithAbi(path, isNested) {
  const inputFiles = await fs.opendir(path)

  for await (const dirent of inputFiles) {
    if (!dirent.isDirectory()) continue

    const [contractName, extension] = dirent.name.split('.')
    if (extension === 'sol') {
      const abiPath = `${path}/${dirent.name}/${contractName}.json`
      await handleAbi(abiPath, contractName)
    } else if (isNested) {
      findFilesWithAbi(`${path}/${dirent.name}`)
    }
  }
}

async function main() {
  await fs.rm(outputDir, {recursive: true, force: true})
  await fs.mkdir(outputDir)

  for (const inputDir of inputDirs) {
    await findFilesWithAbi(inputDir, true)
  }

  // reformat generated code
  exec('yarn eslint --fix "src/abi/*.ts"')
}

main()
