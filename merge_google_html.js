// IMPORTS
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const commander = require('commander');

// UTILS
const getFilename = (file) => path.parse(file).name;

// DEFAULTS
const { dir: absPathDir, name: dirName } = path.parse(String.raw`C:\Users\Timot\Downloads\takeout-20230506T180703Z-001\Takeout\Voice\Calls`)
const defaultPath = path.join(absPathDir, dirName);
const defaultFilenamePrefix = '';

// Parse command line arguments
commander
  .version('1.0.0', '-v, --version')
  .usage('[OPTIONS]...')
  .option('-fp, --filename_prefix [prefix]', 'Detects if the file prefix is present.', defaultFilenamePrefix)
  .option('-p, --path', 'Detects if custom path is present.', defaultPath)
  .parse(process.argv);
const options = commander.opts();
const { filename_prefix: prefix, path: customPath } = options;
console.log('options', prefix, customPath);

// Get list of HTML files to combine
const dataDir = customPath ?? __dirname;
console.log('names', fs.readdirSync(dataDir));
const files = fs.readdirSync(dataDir)
  .filter(fn => fn.endsWith('.html'))
  .filter(fn => fn.startsWith(prefix ?? ''));
console.log('files', files);

// Combine contents of Google Voice HTML files
const htmlOutput = new JSDOM("<!doctype html>");
const document = htmlOutput.window.document;
const divElem = document.createElement('div');
for (const file of files) {
  const htmlContent = fs.readFileSync(path.resolve(dataDir, file), { encoding: 'utf8' });
  const dom = new JSDOM(htmlContent);
  const smsContainerElem = dom.window.document.querySelector('.hChatLog')
  divElem.innerHTML += smsContainerElem.innerHTML
  // document.appendChild(smsContainerElem.innerHTML);
}
divElem.className = "hChatLog hfeed"
document.body.appendChild(divElem);

// Save HTML file
fs.writeFileSync(path.resolve(__dirname, "output", "output.html"), htmlOutput.serialize());
