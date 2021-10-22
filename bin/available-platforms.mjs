import fetch from "node-fetch";
import cheerio from "cheerio";

const response = await fetch('https://www.terraform.io/downloads.html');
const body = await response.text();
const $ = cheerio.load(body);

function supportedOS() {
    const osList = $('h2.os-name');
    const osNames = [];
    for (let i = 0; i < osList.length; i++) {
        osNames.push($(osList[i]).text())
        
    }
    return osNames;
}

function availablePlatforms(argv) {
    const osNames = supportedOS();
    for (let i = 0; i < osNames.length; i++) {
      const osName = osNames[i];
      console.log(i + 1, osName);
    }
}

export default availablePlatforms;