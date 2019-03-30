const {app, BrowserWindow, ipcMain, remote} = require('electron');
const path = require('path');
const url = require('url');
let win; 


import { website } from "./library"; 
import { RRL } from "./library"; 
import { investigate } from "./library"; 

function createWindow(){
    //create browser window
    win = new BrowserWindow({width:800, height:600, icon:__dirname+'/img/icon.png'})

    // load index.html
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'), 
        protocol: 'file', 
        slashes: true
    }));
    console.log("testing cosole.log")
    //open devtools
    win.webContents.openDevTools(); 

    win.on('closed', () => { win = null;}); 
}

// Run create window function 
 app.on('ready', createWindow); 
//app.on('ready', function(){RRL.bookmark()})

// Quit when all windows are closed 
app.on('window-all-closed', () => {
    if(process.platform !== 'darwin'){app.quit();}
});