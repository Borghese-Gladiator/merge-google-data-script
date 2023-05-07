/**
 * IMPORTS
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const commander = require('commander');

/**
 * UTILS
 */
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
  const DOMParser = dom.window.DOMParser;
  const parser = new DOMParser;
  const document = parser.parseFromString(xmlContent, 'text/xml');
  const smsesElem = document.getElementsByTagName('sms');

  // Create HTML elements for innerHTML
  const htmlOutput = new JSDOM("<!doctype html>");
  const htmlDocument = htmlOutput.window.document;
  const divContainerElem = htmlDocument.createElement('div');
  
  for (const smsElem of smsesElem) {
    // Load data from XML element
    const dateStr = smsElem.getAttribute('readable_date');
    const message = smsElem.getAttribute('body');
    const senderIsMe = smsElem.getAttribute('type') === 2;
    const contactName = smsElem.getAttribute('contact_name');
    
    // Initialize elements
    const divElem = htmlDocument.createElement('div');
    divElem.className = 'message';
    const abbrElem = htmlDocument.createElement('abbr');
    abbrElem.className = "dt";
    abbrElem.textContent = dateStr;
    const citeElem = htmlDocument.createElement('cite');
    citeElem.className = "sender vcard";
    const childAbbrElem = htmlDocument.createElement('abbr');
    childAbbrElem.className = "fn";
    childAbbrElem.textContent = senderIsMe ? 'Me' : contactName;
    citeElem.appendChild(childAbbrElem);
    const qElem = htmlDocument.createElement('q');
    qElem.textContent = message;
    // Save elements
    divElem.appendChild(abbrElem);
    divElem.appendChild(citeElem);
    divElem.appendChild(qElem);
    divContainerElem.appendChild(divElem);
  }

  return divContainerElem.innerHTML;
}
const getStyleFromHTML = (absPath) => {
  // Parses HTML style from Google Voice HTML
  const htmlContent = fs.readFileSync(absPath, { encoding: 'utf8' });
  const dom = new JSDOM(htmlContent);
  return dom.window.document.getElementsByTagName('style')[0].innerHTML;
}

/**
 * DEFAULTS
 */
const defaultDataDirPath = path.resolve(String.raw`C:\Users\Timot\Downloads\takeout-20230506T180703Z-001\Takeout\Voice\Calls`);
const defaultFilenamePrefix = '';
const defaultExtraFilename = 'sms-20230506223117.xml'; // Created text message backup via "SMS Backup & Restore" from Google Playstore

/**
 * COMMAND LINE ARGUMENTS
 */
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

/**
 * SCRIPT BODY
 */
// Get list of HTML files to combine
const dataDir = dataDirPath ?? __dirname;
const files = fs.readdirSync(dataDir)
  .filter(fn => fn.endsWith('.html'))
  .filter(fn => fn.startsWith(filenamePrefix ?? ''));
files.push(extraFilename);
console.info('files', files);

// Combine contents of Google Voice HTML files
const htmlOutput = new JSDOM("<!doctype html>");
const document = htmlOutput.window.document;
const divElem = document.createElement('div');
const styleElem = document.createElement("style");
for (const [index, file] of files.entries()) {
  const absPath = path.resolve(dataDir, file);
  if (path.extname(file) === '.xml')
    divElem.innerHTML += getChatsFromXML(absPath, divElem);
  else
    divElem.innerHTML += getChatsFromHTML(absPath, divElem);
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
