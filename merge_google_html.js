/*
- input
  - file name prefix
  - path to find files
- output
  - TXT file with all text messages
*/
const commander = require('commander');

commander
  .version('1.0.0', '-v, --version')
  .usage('[OPTIONS]...')
  .option('-f, --flag', 'Detects if the flag is present.')
  .option('-c, --custom <value>', 'Overwriting value.', 'Default')
  .parse(process.argv);

const options = commander.opts();

const flag = (options.flag ? 'Flag is present.' : 'Flag is not present.');

console.log('Flag:', `${flag}`);
console.log('Custom:', `${options.custom}`);

const fs = require('fs');
fs.readFileSync()