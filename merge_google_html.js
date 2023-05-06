/*
- input
  - file name prefix
  - path to find files
- output
  - TXT file with all text messages
*/
const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const commander = require('commander');

// DEFAULTS
const { dir: absPathDir, name: dirName } = path.parse(String.raw`C:\Users\Timot\Downloads\takeout-20230506T180703Z-001\Takeout\Voice\Calls`)
const defaultPath = path.join(absPathDir, dirName);
const defaultFilenamePrefix = '';

// Parse command line arguments
commander
  .version('1.0.0', '-v, --version')
  .usage('[OPTIONS]...')
  .option('-fp, --filename_prefix', 'Detects if the file prefix is present.')
  .option('-p, --path', 'Detects if custom path is present.')
  .action((args, cmd) => {
    cmd.filenamePrefix = cmd.filenamePrefix ?? defaultFilenamePrefix;
    cmd.path = cmd.path ?? defaultPath;
  })
  .parse(process.argv);
const options = commander.opts();
const { prefix, path: customPath } = options;
console.log('options', prefix, customPath);

// Get list of HTML files to combine
const dataDir = customPath ?? __dirname;
console.log('names', fs.readdirSync(dataDir));
const files = fs.readdirSync(dataDir)
  .filter(fn => fn.endsWith('.html'))
  .filter(fn => fn.startsWith(prefix ?? ''));
console.log('files', files);

// Combine contents of Google Voice HTML files
const totalBody = [];
for (const file of files) {
  const htmlContent = fs.readFile(path.resolve(dataDir, file), 'UTF-8', callback);
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;
  console.error('document', document);
}
// hChatLog hfeed

// UTILS  
const getFilename = (file) => path.parse(file).name;