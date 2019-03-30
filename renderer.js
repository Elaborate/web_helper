const ipcRenderer = require('electron').ipcRenderer;
const {remote} = require('electron')
const ipcMain = remote.ipcMain;
const main_RRL = remote.require("./library.js")
const RRL = require('./library.js');
//const ipcMain = require('electron').remote;
function sendForm(event, formName) {
    event.preventDefault() // stop the form from submitting
    //alert("form sent: "+formName)
    let form="";
    try{form = document.getElementById(formName).innerHTML;}
    catch{alert(`no form with id='${formName}'`);}
    ipcRenderer.send(formName, form);
    //ipcMain.send(formName, form);
    //RRL.message(formName, form);
    main_RRL.message(formName, form);
    //ipcMain.send(formName, form);
}