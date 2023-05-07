global.logLevel = "error";

// IMPORTS
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const commander = require('commander');

// UTILS
const getFilename = (file) => path.parse(file).name;
const getChatsFromHTML = (absPath) => {
  // Parses HTML sms list from Google Voice HTML
  const htmlContent = fs.readFileSync(absPath, { encoding: 'utf8' });
  const dom = new JSDOM(htmlContent);
  const smsContainerElem = dom.window.document.querySelector('.hChatLog');
  return smsContainerElem.innerHTML;
}
const getChatsFromXML = (absPath) => {
  // Parses XML text message backup from "SMS Backup & Restore" in Google Playstore
  const xmlContent = fs.readFileSync(absPath, { encoding: 'utf8' });
  const dom = new JSDOM(xmlContent);
  const xmlDocument = dom.window.DOMParser.parseFromString(xmlContent, 'text/xml');
  const smsesElem = dom.window.document.getElementsByTagName('smses');
  console.log('smsesElem', smsesElem);
  return smsesElem.innerHTML;
  // <sms protocol="0" address="9173716758" date="1663991443700" type="2" subject="null" body="你好抒扬，&#10;这是Tim 施明君&#10;&#10;我们多找时间一起打羽毛球" toa="null" sc_toa="null" service_center="null" read="1" status="-1" locked="0" date_sent="0" sub_id="2" readable_date="Sep 23, 2022 11:50:43 PM" contact_name="ShuYang Wang" />

}
const getStyleFromHTML = (absPath) => {
  // Parses HTML style from Google Voice HTML
  const htmlContent = fs.readFileSync(absPath, { encoding: 'utf8' });
  const dom = new JSDOM(htmlContent);
  return dom.window.document.getElementsByTagName('style')[0].innerHTML;
}

// DEFAULTS
const defaultDataDirPath = path.resolve(String.raw`C:\Users\Timot\Downloads\takeout-20230506T180703Z-001\Takeout\Voice\Calls`);
const defaultFilenamePrefix = '';
const defaultExtraFilename = 'sms-20230506223117.xml'; // Created text message backup via "SMS Backup & Restore" from Google Playstore

// Parse command line arguments
commander
  .version('1.0.0', '-v, --version')
  .usage('[OPTIONS]...')
  .option('-p, --path', 'Detects if data directory path is present.', defaultDataDirPath)
  .option('-f, --filename_prefix [prefix]', 'Detects if the filename prefix is present.', defaultFilenamePrefix)
  .option('-e, --extra_filename', 'Detects if extra file to include.', defaultExtraFilename)
  .parse(process.argv);
const options = commander.opts();
const {
  path: dataDirPath,
  filename_prefix: filenamePrefix,
  extra_filename: extraFilename
} = options;
console.info('options', dataDirPath, filenamePrefix, extraFilename);

// Get list of HTML files to combine
const dataDir = dataDirPath ?? __dirname;
console.info('names', fs.readdirSync(dataDir));
const files = fs.readdirSync(dataDir)
  .filter(fn => fn.endsWith('.html'))
  .filter(fn => fn.startsWith(filenamePrefix ?? ''));
files.push(extraFilename);

// Combine contents of Google Voice HTML files
const htmlOutput = new JSDOM("<!doctype html>");
const document = htmlOutput.window.document;
const divElem = document.createElement('div');
const styleElem = document.createElement("style");
for (const [index, file] of files.entries()) {
  const absPath = path.resolve(dataDir, file);
  if (path.extname(file) === 'html') {
    divElem.innerHTML += getChatsFromHTML(absPath, divElem);
  }
  else divElem.innerHTML += getChatsFromXML(absPath, divElem);
}
styleElem.type = 'text/css';
styleElem.innerHTML += getStyleFromHTML(path.resolve(dataDir, files[0]), styleElem);
divElem.className = "hChatLog hfeed";
document.head.appendChild(styleElem);
document.body.appendChild(divElem);

// Save HTML file
const outputPath = path.resolve(__dirname, "output", "output.html");
fs.writeFileSync(outputPath, htmlOutput.serialize(), { flag: 'w' });
console.info(`DONE! Output written to ${outputPath}`);
