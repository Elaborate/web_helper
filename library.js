"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var accounts = require('./accounts.json');
var request = require('request');
var cheerio = require('cheerio');
var electron = require('electron');
var remote = require('electron').remote;
var session = require('electron').session;
var react = require('react');
var BrowserWindow = require('electron').BrowserWindow;
var ipcRenderer = require('electron').ipcRenderer;
var ipcMain = (require('electron') || electron.remote.ipcMain).ipcMain;
//try{ipcMain}
//const keytar = require('keytar')
//var ipc = electron.ipcMain;
//investigate(ipcMain);
//ipcRenderer.on('gpu', (_, gpu) => {
//  console.log(gpu)
//})
//--------------------------------------------------------------
//--------------------------------------------------------------
//Debugging function
function investigate(obj, space, path, parent, grandparent) {
    if (space === void 0) { space = 0; }
    if (path === void 0) { path = obj; }
    if (parent === void 0) { parent = ""; }
    if (grandparent === void 0) { grandparent = ""; }
    console.log("Investigating " + path);
    if (obj)
        Object.keys(obj).forEach(function (k, i) {
            var type = typeof obj[k];
            var recursive = (k == parent || k == grandparent);
            if (!recursive && (type == 'object'))
                investigate(obj[k], space + 1, path + '/' + k, k, parent);
            else if (type == 'function')
                console.log('  '.repeat(space) + " " + k + "(" + type + ")");
            else
                console.log('  '.repeat(space) + " " + k + "(" + type + "): " + obj[k]);
        });
}
exports.investigate = investigate;
//--------------------------------------------------------------
//--------------------------------------------------------------
//Webite, Object/Interface for websites and stuff. 
var website = /** @class */ (function () {
    function website() {
    }
    website.test1 = function () { return "inheritance works.<br/>\n"; };
    website.test2 = function () { return "overriding doesn't work.<br/>\n"; };
    website.test3 = function () { return "This is from the original Class...<br/>\n"; };
    website.test4 = function () { return this.test3(); };
    //Methods:
    //loadUpdateSettings, loads settings for when and what to update from file
    website.loadUpdateSettings = function () {
        try {
            this.username = accounts[this.siteName].username;
            this.password = accounts[this.siteName].password;
        }
        catch (_a) {
            this.username = "";
            this.password = "";
        }
    };
    //Initialize, sets up object
    website.init = function () {
        var _this = this;
        if (this.initiated == true)
            return;
        this.initiated = true;
        if (this.loaded == false)
            this.loadUpdateSettings();
        /*
        this.account = keytar.findCredentials(this.siteName)
        this.account.then(function(x){
          if (!x === undefined){
            console.log(x)
            investigate(x)
            this.username = x.account;
            this.password = x.password;
          }
        }).catch(function(e){console.log(`Cannot find username or password for service: ${e.message}`)})
        */
        //Open window to do web stuff. 
        try {
            this.window = new BrowserWindow({ width: 800, height: 600 });
        }
        catch (_a) {
            var BrowserWindow_1 = require('electron').remote.BrowserWindow;
            this.window = new BrowserWindow_1({ width: 800, height: 600 });
        }
        // get all cookies
        this.cookies = new Array;
        this.window.webContents.on('did-finish-load', function () {
            _this.window.webContents.session.cookies.get({}, function (error, cookies) { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    if (error) {
                        console.error('Error getting cookies:', error);
                        return [2 /*return*/];
                    }
                    // store cookies
                    cookies.forEach(function (c) {
                        //console.log("Cookie:"+JSON.stringify(c));
                        try {
                            _this.cookies.push(c);
                        }
                        catch (error) {
                            console.log("Failed: %s", error.message);
                        }
                    });
                    return [2 /*return*/];
                });
            }); });
        });
    };
    website.displayAccountForm = function () {
        this.loadUpdateSettings();
        var formName = "account_" + this.siteName;
        ipcRenderer.on("${formName}", function () { console.log("ipcRenderer got form request: " + formName); });
        return "\n      <form id=\"" + formName + "\" onSubmit=\"JavaScript:sendForm(event, '" + formName + "')\">\n      <fieldset>\n        <legend>Account Information, " + this.siteName + "</legend>\n        <input type=hidden name=service value=\"test_" + this.siteName + "\"/>\n        <input type=hidden name=order value=\"changeAccountDetails\"/>\n        <input name=username placeholder=email value=\"" + this.username + "\"/>\n        <input type=password placeholder=password name=password value=\"" + this.password + "\"/>\n        <input type=submit value=\"Change Account Data\"/>\n      </fieldset>\n      </form>\n      ";
    };
    //------------------------------------------------------------------------------
    //------------------------------------------------------------------------------
    website.message = function (name, form) {
        //alert("RRL.message got form request: "+name);
        /*
        try {ipcRenderer.send(name, form);}
        catch{console.log("No ipcRenderer");
        try{ipcMain.send(name, form);}
        catch{console.log("No ipcMain");}
        */
        console.log("Argument: " + form);
        //Extract inputs from form. 
        var $ = cheerio.load(form);
        var input = $('input');
        var args = {};
        input.each(function (i, element) {
            console.log("field " + element.attribs['name'] + ": " + element.attribs['value']);
            args[element.attribs['name']] = element.attribs['value'];
        });
        //Call the function specified in form input "order"  
        //investigate(args);
        try {
            this[args["order"]](args);
        }
        catch (_a) {
            console.log(this.siteName + (" method called '" + args["order"] + "' did not work"));
        }
    };
    //------------------------------------------------------------------------------
    //------------------------------------------------------------------------------
    //changeAccountDetails saves username and password in file. 
    //Encrypt later? 
    website.changeAccountDetails = function (args) {
        return this._changeAccountDetails(args.service, args.username, args.password);
    };
    website._changeAccountDetails = function (service, username, password) {
        //keytar.setPassword(this.siteName, this.username, this.password);
        accounts[service] = Object();
        accounts[service].username = username;
        accounts[service].password = password;
        var fs = require('fs');
        fs.writeFile("accounts.json", JSON.stringify(accounts, null, 2), function (err) {
            if (err)
                return console.log(err);
            console.log(JSON.stringify(accounts));
            console.log('writing to ' + "accounts.json");
        });
        return "success";
    };
    //------------------------------------------------------------------------------
    //------------------------------------------------------------------------------
    //login, logins to site
    website.login = function () { return "success"; };
    //logout 
    website.logout = function () { return "success"; };
    //displayUpdateSettings, displays HTML form to change settings for site updates
    website.displayUpdateSettings = function () { return "success"; };
    //changeUpdateSettings, saves changed settings on file
    website.saveUpdateSettings = function () { return "success"; };
    //loadAccountDetails, gets username and password from encrypted file 
    website.loadAccountDetails = function () { return "success"; };
    //formatChapter, transforms chapter into acceptable format for site.  
    website.formatChapter = function () { return "success"; };
    //getPublishedChapters, gets list of already published chapters
    website.getPublishedChapters = function () { return "success"; };
    //getUnpublishedChapters, gets list of yet-to-be-published chapters on site
    website.getUnublishedChapters = function () { return "success"; };
    //publishChapterOnDate (Date, chapter)
    website.publishChapterOnDate = function () { return "success"; };
    //publishBatchOnDate (Date, chapter1, chapter2...), batch function calls publishChapterOnDate
    website.publishBatchOnDate = function () { return "success"; };
    //batchRename, replaces chapter
    website.batchRename = function () { return "success"; };
    //run, logs in, uploads chapters according to settings, 
    //double-checks that every chapter that should be uploaded IS uploaded, logs out
    website.run = function () { return "success"; };
    return website;
}());
exports.website = website;
//===============================================================
//===============================================================
//Object RRL, inherits from Site
var RRL = /** @class */ (function (_super) {
    __extends(RRL, _super);
    function RRL() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RRL.test = function () { return this.test1() + this.test2() + this.test3() + _super.test3.call(this) + this.test4(); };
    RRL.test2 = function () { return "overwriting works.<br/>\n"; };
    RRL.test3 = function () { return "This is from the extended Class...<br/>\n"; };
    RRL.init = function () {
        _super.init.call(this);
    };
    //Dealing with responses
    /*
        static bodyResponse(event,payload) {
          RRL.hasToken(null, RRL.getTokenFromHTML(payload));
          }
    
        static hasToken(event, payload) {
          // BLAH
          }
    */
    //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    //Visit login page and get their token
    RRL.getToken = function () {
        var error;
        var response;
        var html;
        this.loadUpdateSettings();
        console.log("getting tokens from " + this.baseURL);
        request(this.baseURL, function (error, response, html) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);
                var input = $('input');
                input.each(function (i, element) {
                    console.log("field " + element.attribs['name'] + ": " + element.attribs['value']);
                    if (element.attribs['name'] == "__RequestVerificationToken") {
                        return element.attribs['value'];
                    }
                });
            }
        });
        return "Error";
    };
    ;
    //----------------------------------------------
    //----------------------------------------------
    //Get token from HTML and store it
    RRL.getTokenFromHTML = function (html) {
        console.log("getTokenFromHTML");
        var $ = cheerio.load(html);
        var input = $('input');
        var token = "";
        input.each(function (i, element) {
            //console.log("field "+element.attribs['name']+": "+element.attribs['value']);
            if (element.attribs['name'] == "__RequestVerificationToken") {
                console.log("token is: " + element.attribs['value']);
                RRL.token = element.attribs['value'];
                token = element.attribs['value'];
            }
        });
        if (token.length > 1) {
            //const {ipcMain} = require('electron');
            //this.ipcMain.send('hasToken', "test");
            this.window.webContents.send("hasToken");
            return token;
        }
        return "did not find token (" + token + ")";
    };
    //----------------------------------------------
    //----------------------------------------------
    //Tell window to visit login page and get their token
    RRL.getToken_win = function () {
        var _this = this;
        var error;
        var response;
        var html;
        if (this.token.length > 2) {
            console.log("already has token");
            return this.token;
        }
        this.init();
        this.loadUpdateSettings();
        console.log("getting tokens from " + this.baseURL);
        this.window.loadURL(this.baseURL);
        //const {ipcMain} = require('electron');
        ipcMain.on('body', function (event, body) {
            console.log("Receiving token: ");
            //console.log(body)
            console.log(RRL.getTokenFromHTML(body));
            event.sender.send('hasToken', "test");
        });
        this.window.webContents.once('dom-ready', function () {
            RRL.window.webContents.executeJavaScript("\n              //var token = document.getElementById(\"__RequestVerificationToken\");\n              //require('electron').ipcRenderer.send('body', token);\n              require('electron').ipcRenderer.send('hasToken', document.body.innerHTML);\n              ");
            return _this.token;
        });
        return "Error";
    };
    ;
    //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    RRL.bookmark = function (args) { this._bookmark(args.fictionNr); };
    RRL._bookmark = function (fictionNr) {
        console.log("calling bookmark()");
        this.loadUpdateSettings();
        //const {ipcMain} = require('electron');
        ipcMain.once('hasToken', function (event, body) {
            RRL.getTokenFromHTML(body);
            console.log("Has gotten Token.");
            RRL.login_win();
        });
        ipcMain.once('hasLoggedIn', function (event, body) {
            console.log("Has logged in.");
            RRL.bookmark_win(fictionNr);
        });
        ipcMain.once('hasBookmarked', function (event, body) {
            console.log("Has bookmarked.");
        });
        this.getToken_win();
        /*
       let time = 0;
      while(true) {
        if (!this.token && !this.gettingToken) this.getToken_win();
        if (this.token && !this.loggedIn && !this.loggingIn) this.login_win();
        if (this.loggedIn && !this.bookmarked && !this.bookmarking) this.bookmark_win();
        if (this.token && this.loggedIn && this.bookmarked) break;
        time++;
        if (time>10000) {console.log("Bookmark() timed out"); break;}
        }
      this.bookmarked=false;
      */
    };
    //----------------------------------------------
    //----------------------------------------------
    //Bookmark a novel
    RRL.bookmark_win = function (fictionNr) {
        var _this = this;
        if (fictionNr === void 0) { fictionNr = 4293; }
        //const fictionNr = 4293; //Iron Teeth
        if (!this.loggedIn)
            this.login_win();
        console.log('bookmarking using a browser window.');
        var dataString = "type=follow&mark=true}";
        console.log("Datastring: '" + dataString + "'");
        this.window.loadURL(this.baseURL + "/fictions/setbookmark/" + fictionNr, {
            postData: [{
                    type: 'rawData',
                    bytes: Buffer.from(dataString)
                }],
            extraHeaders: 'Content-Type: application/x-www-form-urlencoded'
        });
        this.window.webContents.once('dom-ready', function () {
            console.log("Detecting bookmark");
            RRL.window.webContents.executeJavaScript("\n           require('electron').ipcRenderer.send('hasBookmarked', document.body.innerHTML);\n           ");
            return _this.token;
        });
        return "bookmarking";
    };
    //----------------------------------------------
    //----------------------------------------------
    //Bookmark a novel
    /*
    static bookmark(): string{
      if (!this.loggedIn) this.login();
      //const token = this.getToken();
      //this.token = token;

      const fictionNr = 4293; //Iron Teeth
      const command = `${this.baseURL}/fictions/setbookmark/${fictionNr}`;
      console.log(`Bookmarking fiction, command: ${command}`);
      RRL.pageLoaded = "test";
      const formData = {
                  //key-value pairs
                  type: 'follow',
                  mark: "True"
                  };
          const r = request.post({url: command, formData: formData}, function optionalCallback(err, httpResponse, body) {
          if (err) { return console.error('upload failed:', err); }
          console.log(`Command: '${command}', response: '${httpResponse}', body: '${body}'`);
          return body;
        });
      return r;
      return RRL.pageLoaded;
    }
    */
    //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    //Make a new window and use that to log in. Experimental. 
    RRL.login_win = function () {
        var _this = this;
        if (this.loggedIn) {
            console.log("already logged in");
            return "error";
        }
        this.init();
        this.getToken_win();
        console.log('Logging in using a browser window.');
        var formData = {
            //key-value pairs
            Email: this.username,
            Password: this.password,
            Remember: "false",
            __RequestVerificationToken: this.token
        };
        var dataString = "email=" + formData.Email + "&password=" + formData.Password + "&remember=" + formData.Remember + "&__RequestVerificationToken=" + formData.__RequestVerificationToken;
        console.log("Datastring: '" + dataString + "'");
        this.window.loadURL("" + this.actionPage, {
            postData: [{
                    type: 'rawData',
                    bytes: Buffer.from(dataString)
                }],
            extraHeaders: 'Content-Type: application/x-www-form-urlencoded'
        });
        this.window.webContents.once('dom-ready', function () {
            console.log("Detecting login");
            RRL.loggedIn = true;
            RRL.window.webContents.executeJavaScript("\n        require('electron').ipcRenderer.send('hasLoggedIn', document.body.innerHTML);\n        ");
            return _this.token;
        });
        return "success";
    };
    //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    //Log in the 'right' way. Currently non-functional. 
    RRL.login = function () {
        console.log('Logging in');
        var token = this.getToken();
        this.token = token;
        RRL.pageLoaded = "test";
        var formData = {
            //key-value pairs
            Email: this.username,
            Password: this.password,
            Remember: "false",
            __RequestVerificationToken: token
        };
        var r = request.post({ url: this.actionPage, formData: formData }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('Upload successful!  Server responded with:', body);
            return body;
        });
        var ses = session.fromPartition('persist:name');
        console.log("Session info: " + ses.getUserAgent());
        // Get all cookies
        ses.cookies.get({}, function (error, result) { return console.log('Found the following cookies', result); });
        this.loggedIn = true;
        return r;
        return RRL.pageLoaded;
    };
    //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    RRL.loadUpdateSettings = function () {
        _super.loadUpdateSettings.call(this);
        this.chaptersPerUpdate = 7;
        this.baseURL = "https://deployment.royalroad.com";
        this.loggedIn = false;
        this.token = "";
        this.actionPage = "https://deployment.royalroad.com/account/betalogin";
        //this.actionPage = "https://www.royalroad.com/account/externallogin?returnUrl=https%3A%2F%2Fwww.royalroad.com%2Fhome";
        //this.loginPage = "https://www.royalroad.com/account/login"; 
        this.siteName = "RRL";
        this.gettingToken = false;
        this.loggingIn = false;
        this.bookmarked = false;
        this.bookmarking = false;
        var ipcMain = require('electron').ipcMain;
        this.ipcMain = ipcMain;
    };
    //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    //displayUpdateSettings, displays HTML form to change settings for site updates
    RRL.displayUpdateSettings = function () {
        this.loadUpdateSettings();
        var formName = "settings_" + this.siteName;
        ipcRenderer.on("${formName}", function () { console.log("ipcRenderer got form request: " + formName); });
        return "\n        <form id=\"" + formName + "\" onSubmit=\"JavaScript:sendForm(event, '" + formName + "')\">\n          <fieldset>\n          <legend> Site settings, " + this.siteName + "</legend>\n          Fiction name: X<br/>\n          Updates on <input name=\"time\" type=\"time\"/><br/>\n          Daily update<br/>\n          Weekly update on <select name=\"weekday\">\n          <option value=\"monday\">monday</option>\n          <option value=\"tuesday\">tuesday</option>\n          <option value=\"wednesday\">wednesday</option>\n          <option value=\"thursday\">thursday</option>\n          <option value=\"friday\">friday</option>\n          <option value=\"saturday\">saturday</option>\n          <option value=\"sunday\">sunday</option>\n          Number of chapters per update: \n          </select>\n          </fieldset>\n        </form>\n        ";
    };
    //------------------------------------------------------------------------------
    //------------------------------------------------------------------------------    
    //displayTestButtons, some function testing stuff
    RRL.displayTestButtons = function () {
        var formName = "test_" + this.siteName;
        ipcRenderer.on(formName, function () { console.log("got form request: " + formName); });
        return "\n          <form id=\"" + formName + "\" onSubmit=\"JavaScript:sendForm(event, '" + formName + "')\">\n            <fieldset>\n              <legend> Test buttons </legend>\n              <input type=hidden name=FictionNr value=\"4293\"/>\n              <input type=hidden name=order value=\"bookmark\"/>\n              <input type=submit value=\"bookmark Iron Teeth\"/>\n            </fieldset\n          </form>\n          ";
    };
    RRL.siteName = "RRL";
    RRL.baseURL = "https://deployment.royalroad.com";
    RRL.actionPage = "https://deployment.royalroad.com/account/betalogin";
    return RRL;
}(website));
exports.RRL = RRL;
//Outside the RRL class
//const {ipcMain} = require('electron');
//ipcMain.on('body', RRL.bodyResponse);
//ipcMain.on('hasToken', RRL.hasToken);
module.exports = RRL;
//var RRL = new website(); 
//RRL.test2 = function(){return "overwriting doesn't work"};
//Object Patreon, inherits from website 
//Objecd Discord, inherits from website
//Object Google Docs, inherits from website
//
//$('test2').innerHTML=RRL.test(); 
//# sourceMappingURL=library.js.map