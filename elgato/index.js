const path = require('path');
const streamDeck = require('elgato-stream-deck');
const fetch = require('node-fetch');
const XMLParser = require('xml2js');
const Jimp = require('jimp');
const bmp = require("bmp-js");
const WebSocket = require('ws');

// Configuration
const serverAddress = "localhost:5000"

// Button map
const buttonMapping = [ 4, 3, 2, 9, 8, 7, 14, 13, 12 ];
const buttonReload = 0;
const buttonLoop = 1;
const buttonPageNext = 5;
const buttonPagePrev = 6;
const buttonAuto = 10;
const buttonRun = 11;

let blackFont = null;
let whiteFont = null;
function getBlackFont(){
  if (blackFont != null)
    return Promise.resolve(blackFont);

  return Jimp.loadFont(Jimp.FONT_SANS_16_BLACK).then(f => blackFont = f);
}
function getWhiteFont(){
  if (whiteFont != null)
    return Promise.resolve(whiteFont);

  return Jimp.loadFont(Jimp.FONT_SANS_16_WHITE).then(f => whiteFont = f);
}

let pageNumber = 0;
let pageCount = 0;
let macroData = [];
let selectedMacro = -1;
let isAuto = true;
let atemState = {};

const ws = new WebSocket("ws://" + serverAddress + '/ws');
ws.on('message', function incoming(data) {
  atemState = JSON.parse(data);
  console.log("Got state", atemState);
  updateButtons();
});

function reloadList(){
  console.log("Reload list");

  fetch("http://" + serverAddress + '/api/macros').then(function(response) {
      if(response.ok) {
        return response.text();
      }
      throw new Error('Network response was not ok.');
    }).then(xmlText => {
      XMLParser.parseString(xmlText, (err, res) => {
        const macros = res.Macros.Macros[0].MacroProperties
        const newMacroData = [];
        
        for(let m of macros){
          newMacroData.push(m.$);
        }

        macroData = newMacroData;
        pageCount = Math.ceil(newMacroData.length/buttonMapping.length);

        if (pageNumber < 1)
          pageNumber = 1;
        if (pageNumber > pageCount)
          pageNumber = pageCount;

        updateButtons();
      });
    });
}

function toggleLoop(){
  console.log("Toggle loop");

  postUrl('/api/player/loop/' + (atemState.Loop ? 0 : 1));
}

function changePage(delta){
  console.log("Change page:", delta);

  pageNumber += delta;
  if (pageNumber < 1)
    pageNumber = pageCount;
  if (pageNumber > pageCount)
    pageNumber = 1;

  updateButtons();
}

function autoMode(){
  console.log("Toggle auto");

  isAuto = !isAuto;
  updateButtons();
}

function postUrl(path){
  fetch("http://" + serverAddress + path, {
    method: "POST",
    headers: {
      'Content-Type': 'application/xml'
    },
  });
}

function runMacro(){
  console.log("Run macro");
  if (isAuto || selectedMacro < 0)
    return;

  console.log("Running", selectedMacro);
  postUrl('/api/player/run/' + selectedMacro);
}

function runOrQueueMacro(i){
  console.log("Run macro:", i);
  const index = getCurrentIndex(i)

  if (!isAuto){
    selectedMacro = selectedMacro == index ? -1 : index;
    updateButtons();
  } else {
    postUrl('/api/player/run/' + index);
  }
}

function getCurrentIndex(i){
  return ((pageNumber-1) * buttonMapping.length) + parseInt(i);
}

function updateButtons(){
  console.log("Updating buttons. Page", pageNumber);

  writeFileToButton(buttonAuto, isAuto ? 'images/auto-on.png' : 'images/auto-off.png');
  writeFileToButton(buttonLoop, atemState.Loop ? 'images/loop-on.png' : 'images/loop-off.png');

  if (isAuto || selectedMacro == -1)
    streamDeck.fillColor(buttonRun, 0, 0, 0);
  else
    writeFileToButton(buttonRun, 'images/run-on.png');

  for (let i in buttonMapping)
    writeMacroButton(macroData[getCurrentIndex(i)], buttonMapping[i]);
}

function writeTextButton(key, col, txt, white){
  new Jimp(72, 72, col, function (err, image) {
    (white ? getWhiteFont() : getBlackFont()).then(f => {
      image.print(f, 5, 5, txt, 10, (err, image) => {
          image.getBuffer(Jimp.MIME_BMP, (_, img) => {
            const byteData = bmp.decode(img).data;
            const res = [];
            for (let i=0; i<byteData.length; i++){
              if ((i+1) % 4 != 0)
                res.push(byteData[i]);
            }

            streamDeck.fillImage(key, new Buffer(res))
          });
      });
    });
  });
}

function writeMacroButton(macro, key){
  if (macro === undefined || macro.used == "false"){
    streamDeck.fillColor(key, 0, 0, 0);
  } else if (atemState.IsRunning && macro.id == atemState.Index) {
    writeTextButton(key, 0xff0000ff, macro.name, true);
  } else if (!isAuto && macro.id == selectedMacro) {
    writeTextButton(key, 0x00ff00ff, macro.name, false);
  } else {
    writeTextButton(key, 0xffec19ff, macro.name, false);
  }
}

function writeFileToButton(key, filename){
  streamDeck.fillImageFromFile(key, path.resolve(__dirname, filename));
}

streamDeck.on('down', keyIndex => {
    // console.log('key %d down', keyIndex);
    switch (keyIndex){
    case buttonReload:
      return reloadList();
    case buttonLoop:
      return toggleLoop();
    case buttonPageNext:
      return changePage(1);
    case buttonPagePrev:
      return changePage(-1);
    case buttonAuto:
      return autoMode();
    case buttonRun:
      return runMacro();
    }

    for (let i in buttonMapping){
      if (buttonMapping[i] == keyIndex)
        return runOrQueueMacro(i);
    }

    console.log("Unknown button pressed")
});

// streamDeck.on('up', keyIndex => {
//     console.log('key %d up', keyIndex);
// });

streamDeck.on('error', error => {
    console.error(error);
});

writeFileToButton(buttonReload, "images/reload.png");
writeFileToButton(buttonPageNext, "images/next.png");
writeFileToButton(buttonPagePrev, "images/prev.png");

reloadList();