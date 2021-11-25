#! /usr/bin/env node

const { program } = require('commander');

const list = require('./commands/list')

program
  .command('list')
  .description('List all the downloaded versions of terraform')
  .action(list)

program
  .command('dir')
  .description('Displays the directory where terraform executables are stored')
  .action(dir)

program.parse()
