#! /usr/bin/env node

import tfvm from './tfvm.mjs';

tfvm();

// const os = require("os");

// console.log("PLATFORM", os.platform());
// console.log("ARCH:", os.arch());
// console.log("CPUS:", JSON.parse(JSON.stringify(os.cpus())))

// import fetch from "node-fetch";
// import cheerio from "cheerio";

// // const response = await fetch('https://releases.hashicorp.com/terraform/');

// const response = await fetch('https://www.terraform.io/downloads.html');
// const body = await response.text();


// const $ = cheerio.load(body);

// const links = $('li > a');

// for (let i = 1; i < links.length; i++) {
//   const element = $(links[i]).attr("href");
//   console.log(element);
// }



// const yargs = require("yargs/yargs");
// const { hideBin } = require("yargs/helpers");
// const argv = yargs(hideBin(process.argv)).argv;
// const chalk = require("chalk");
// const boxen = require("boxen");

// const appName = chalk.white.bold("Terraform Version Manager");

// const boxenOptions = {
//   padding: 1,
//   margin: 1,
//   borderStyle: "round",
//   borderColor: "green",
//   backgroundColor: "#555555"
// }

// const msgBox = boxen(appName, boxenOptions);

// console.log(msgBox, "\n");

// if (argv.ships > 3 && argv.distance < 53.5) {
//   console.log("Plunder more...!");
// } else {
//   console.log("Retreat...!!!");
// }

// yargs(hideBin(process.argv))
//   .command("serve [port]", "start the server", (yargs) => {
//     return yargs
//            .positional("port", {
//              describe: "port to bind on",
//              default: 5000
//            })
//   }, (argv) => {
//     if (argv.verbose) console.info(`start server on :${argv.port}`)
//   })
//   .option("verbose", {
//     alias: "v",
//     type: "boolean",
//     description: "run with verbose logging"
//   })
//   .parse();

// yargs(hideBin(process.argv))
//   .command('curl <url>', 'fetch the contents of the URL', () => {}, (argv) => {
//     console.info(argv)
//   })
//   .demandCommand(1)
//   .parse();
