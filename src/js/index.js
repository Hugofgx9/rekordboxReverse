const ipc = require('electron').ipcRenderer;
const fs = require('fs');
const convert = require('xml-js');
const Emitter = require('./js/emitter.js');

let event = new Emitter();

console.log(event);

let tracks; 
let missingFiles = [];
let $progressBar = document.querySelector('.progress-bar');

$progressBar.addEventListener('click', () => $progressBar.style.width = '80%');

let $button = document.querySelector('button');
$button.addEventListener('click', () => {
  ipc.send('open-file-dialog');
});

event.on('change-loader-width', (width) => {
  $progressBar.style.width = width;
  //console.log(`${ratio * 100}px`);
})