/*
Parse Google HTML file into CSV
warning: use SEPARATOR to change which characters are not allowed (the default is commas)

Input:
HTML file with all Google Voice messages (created by previous script)

Output:
CSV file with parsed data
*/


/**
 * IMPORTS
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * CONSTANTS
 */
const DATA_HTML_PATH = path.join(__dirname, 'data', '5_7_2023_google_voice_messages.html');
const OUTPUT_PATH = path.join(__dirname, 'output', '5_7_2023_google_voice_messages.csv');
const SEPARATOR = ',';

/**
 * SCRIPT BODY
 */
const msgList = [];
// Constants
const htmlContent = fs.readFileSync(DATA_HTML_PATH, { encoding: 'utf8' });
const dom = new JSDOM(htmlContent);
const document = dom.window.document;
const messageElemList = document.querySelectorAll('.message');
console.log(messageElemList.length);
for (const messageElem of messageElemList) {
  // `.text` does not show actual content for some reason
  // therefore, I used `.innerHTML` (possibly related to Chinese/Japanese characters)
  const messageTextElem = messageElem.getElementsByTagName('q')[0];
  const message = messageTextElem.innerHTML.replace("<br>", "").replace(SEPARATOR, "");

  const dateElem = messageElem.getElementsByTagName('abbr')[0];
  const date = dateElem.innerHTML
    .replace("\nEastern Time", "")
    .replace(SEPARATOR, ""); // account for XML text differences from Voice differences

  const senderTextElem = messageElem.getElementsByClassName('fn')[0];
  const sender = senderTextElem.innerHTML;
  msgList.push({
    date,
    message,
    sender,
  });
}

/**
 * SAVE OUTPUT TO CSV
 */
const columns = [
  "date",
  "message",
  "sender",
];
const csvString = [columns, ...msgList.map(msg => [msg.date, msg.message, msg.sender])]
  .map(e => {
    console.log(e)
    return e.join(",")
  })
  .join("\n");
fs.writeFileSync(OUTPUT_PATH, csvString, { flag: 'w' });
