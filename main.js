"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { app, BrowserWindow, ipcMain, remote } = require('electron');
const path = require('path');
const url = require('url');
const rrl = require('./website');
const form = require('./form_instances');
let win;
function createWindow() {
    //create browser window
    win = new BrowserWindow({ width: 800, height: 600, icon: __dirname + '/img/icon.png' });
    form.window = win;
    // load index.html
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    }));
    //console.log("testing console.log")
    //open devtools
    win.webContents.openDevTools();
    win.on('closed', () => { win = null; });
}
// Run create window function 
app.on('ready', createWindow);
/* //THIS JUST SUDDENLY STOPPED WORKING. Updated version?
app.on('uncaughtException', function (error) {
    console.log(error.stack);
 });
*/
//testing something
ipcMain.on('please-refresh', function () {
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    }));
});
// Quit when all windows are closed 
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
//# sourceMappingURL=main.js.map