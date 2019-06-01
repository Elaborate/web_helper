// Modules to control application life and create native browser window
import * as path from "path";
import * as electron from "electron";
import { client } from "electron-connect";
import installExtension, {
  REACT_DEVELOPER_TOOLS
} from "electron-devtools-installer";
import { setupMainHandler } from "eiphop";
import actions from "./api";
const app = electron.app;
const isProduction = process.env.NODE_ENV === "production";

setupMainHandler(electron, actions, process.env.NODE_ENV === "development");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: electron.BrowserWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Connect render to client to allow for reloading
  if (!isProduction) {
    try {
      client.create(mainWindow);
    } catch (err) {
      console.log('Did you forget to run "npm run watch" ?');
      console.log(err);
    }
  }

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "dist/index.html"));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on("ready", createWindow);
app.on("ready", () => {
  createWindow();
  if (!isProduction) {
    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => console.log(`Added Extension: ${name}`))
      .catch(err => console.log("An error occurred: ", err));
  }
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
