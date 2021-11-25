#! /usr/bin/env node

const { program } = require('commander');

const list = require('./commands/list')
const download = require('./commands/download')
const dir = require('./commands/dir')

const { TERRAFORM_DOWNLOAD_URL } = require('./config');

program
  .command('list')
  .alias('ls')
  .description('List all the downloaded versions of terraform')
  .option('-r, --remote', `Displays a list of terraform versions available at ${TERRAFORM_DOWNLOAD_URL}`)
  .action(list)

program
  .command('download [version]')
  .description('Downloads the latest version, or a specific version of terraform')
  .action(download)

program
  .command('dir')
  .description('Displays the directory where terraform executables are stored')
  .action(dir)

program.parse()

"existence"