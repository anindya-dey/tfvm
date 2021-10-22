import fetch from "node-fetch";
import cheerio from "cheerio";

const response = await fetch('https://www.terraform.io/downloads.html');
const body = await response.text();
const $ = cheerio.load(body);

function supportedOS() {
    const supportedOS = $('h2.os-name')
    for (let i = 0; i < supportedOS.length; i++) {
        const element = $(supportedOS[i]).text();
        console.log(i + 1, element);
    }
}

export default supportedOS;
