#!/usr/bin/env node
import * as yargs from 'yargs'
import { parseFeRoutes, loadPlugin } from 'ssr-server-utils'
import { Argv } from 'ssr-types'

const spinner = require('ora')('正在构建')

yargs
  .command('start', 'Start Server', {}, async (argv: Argv) => {
    spinner.start()
    process.env.NODE_ENV = 'development'
    const plugin = loadPlugin()
    await parseFeRoutes()
    spinner.stop()
    await plugin.fePlugin?.start?.(argv)
    await plugin.serverPlugin?.start?.(argv)
  })
  .command('build', 'Build server and client files', {}, async (argv: Argv) => {
    spinner.start()
    process.env.NODE_ENV = 'production'
    const plugin = loadPlugin()
    await parseFeRoutes()
    spinner.stop()
    await plugin.fePlugin?.build?.(argv)
    await plugin.serverPlugin?.build?.(argv)
  })
  .command('deploy', 'Deploy function to aliyun cloud or tencent cloud', {}, async (argv: Argv) => {
    const plugin = loadPlugin()
    if (!plugin.serverPlugin.deploy) {
      console.log('当前插件不支持 deploy 功能，请使用 ssr-plugin-faas 插件 并创建对应 yml 文件 参考 https://www.yuque.com/midwayjs/faas/migrate_egg 或扫码进群了解')
      return
    }
    process.env.NODE_ENV = 'production'
    await plugin.serverPlugin?.deploy?.(argv)
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .option('version', {
    alias: 'v',
    default: false
  })
  .fail((msg, err) => {
    if (err) {
      console.log(err)
      process.exit(1)
    }
    console.log(msg)
  })
  .parse()
