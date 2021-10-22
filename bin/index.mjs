#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import availablePlatforms from "./available-platforms.mjs";

yargs(hideBin(process.argv))
  .scriptName("tfvm")
  .usage('$0 <cmd> [args]')
  .command('available-platforms', 'List all the supported platforms for installing Terraform excutable', (yargs) => {
    // yargs.positional('name', {
    //   type: 'string',
    //   default: 'Cambi',
    //   describe: 'the name to say hello to'
    // })
  }, availablePlatforms)
  .help()
  .argv