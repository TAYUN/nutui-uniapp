import fs from 'fs-extra'
import { consola } from 'consola'

async function transformLodash(sourceDir: string, destDir: string) {
  await fs.copy('scripts/uni/lodash', `${destDir}/components/_plugins/lodash`)

  // noinspection JSVoidFunctionReturnValueUsed
  const lodash = await fs.readFile(`${sourceDir}/components/_plugins/lodash.ts`, 'utf-8')

  await fs.writeFile(
    `${destDir}/components/_plugins/lodash.ts`,
    lodash.replace(
      `export * from 'lodash-es'`,
      `export * from './lodash/index'`,
    ),
  )
}

async function build() {
  const sourceDir = 'packages/nutui'
  const destDir = 'example/uni_modules/nutui-uni'

  try {
    consola.info('开始构建')

    consola.info(`开始清空 ${destDir}`)
    await fs.remove(destDir)
    await fs.ensureDir(destDir)
    consola.success('清空完成')

    consola.info(`开始复制 ${sourceDir} 至 ${destDir}`)
    await fs.copy(sourceDir, destDir, {
      filter(src) {
        return !src.includes('node_modules')
      },
    })
    consola.success('复制完成')

    consola.info('开始转换lodash')
    await transformLodash(sourceDir, destDir)
    consola.success('转换完成')

    consola.info('开始复制changelog及package.json')
    await fs.copy('CHANGELOG.md', `${destDir}/changelog.md`)
    await fs.copy('scripts/uni/package.json', `${destDir}/package.json`)
    consola.success('复制完成')

    await fs.createFile(`${destDir}/components/nutui-uni/nutui-uni.vue`)
    consola.success('nutui-uni占位文件已创建')

    consola.success('构建完成')
  }
  catch (error) {
    consola.error('构建失败', error)
  }
}

build()
