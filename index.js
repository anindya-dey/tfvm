#! /usr/bin/env node

const { program } = require('commander');

const list = require('./commands/list')

program
  .command('list')
  .description('List all the downloaded versions of terraform')
  .action(list)

program.parse()
