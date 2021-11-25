#! /usr/bin/env node

const { program } = require('commander');

const list = require('./commands/list')
const download = require('./commands/download')
const dir = require('./commands/dir')

program
  .command('list')
  .description('List all the downloaded versions of terraform')
  .option('-r', 'Displays a list of terraform versions available at https://releases.hashicorp.com/terraform/')
  .action(list)

program
  .command('download [version]')
  .description('Downloads a specific version of terraform')
  .action(download)

program
  .command('dir')
  .description('Displays the directory where terraform executables are stored')
  .action(dir)

program.parse()
