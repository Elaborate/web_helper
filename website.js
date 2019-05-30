"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const accounts = require('./accounts.json');
const cheerio = require('cheerio');
const electron = require('electron');
const { remote } = require('electron');
const { session } = require('electron');
const { BrowserWindow } = require('electron');
const { ipcRenderer } = require('electron');
const request = require("request-promise");
request.defaults({ jar: true });
//--------------------------------------------------------------
//--------------------------------------------------------------
//Debugging function
function investigate(obj, space = 0, path = obj, parent = null, grandparent = null) {
    console.log("Investigating " + path);
    if (obj)
        Object.keys(obj).forEach(function (k, i) {
            try {
                const type = typeof obj[k];
                const recursive = (k == "parent" || k == "next" || k == "prev" || obj[k] == obj || obj[k] == parent || obj[k] == grandparent);
                if (!recursive && space < 5 && (type == 'object'))
                    investigate(obj[k], space + 1, path + '/' + k, obj, parent);
                else if (type == 'function')
                    console.log(`${'  '.repeat(space)} ${k}(${type})`);
                else
                    console.log(`${'  '.repeat(space)} ${k}(${type}): ${obj[k]}`);
            }
            catch (_a) {
                console.log(k + " not viewable");
            }
        });
}
exports.investigate = investigate;
//--------------------------------------------------------------
//--------------------------------------------------------------
//Webite, Object/Interface for websites and stuff. 
class website {
    static test1() { return "inheritance works.<br/>\n"; }
    static test2() { return "overriding doesn't work.<br/>\n"; }
    static test3() { return "This is from the original Class...<br/>\n"; }
    static test4() { return this.test3(); }
    //Methods:
    //-----------------------------------------------------------------
    //------------------- UPDATE MAIN WINDOW --------------------------
    //-----------------------------------------------------------------
    static update() {
        if (this.window) {
            const path = require('path');
            const url = require('url');
            this.window.loadURL(url.format({
                pathname: path.join(__dirname, 'index.html'),
                protocol: 'file',
                slashes: true
            }));
        }
        else if (document) {
            window.location.reload();
        }
        else {
            //const {ipcRenderer} = require('electron'); 
            //ipcRenderer.send('please-refresh', "test");
        }
    }
    //-----------------------------------------------------------------
    //------------------- DO SETUP STUFF ------------------------------
    //-----------------------------------------------------------------
    //loadUpdateSettings, loads settings for when and what to update from file
    static loadUpdateSettings() {
        try {
            this.username = accounts[this.siteName].username;
            this.password = accounts[this.siteName].password;
        }
        catch (_a) {
            this.username = "";
            this.password = "";
        }
    }
    //----------------------------------------------
    //----------------------------------------------
    //Initialize, sets up object
    static init() {
        console.error('Init():');
        if (this.initiated == true)
            return;
        this.initiated = true;
        if (this.loaded == false)
            this.loadUpdateSettings();
        //Open window to do web stuff. 
        try {
            this.window = new BrowserWindow({ width: 800, height: 600 });
        }
        catch (_a) {
            const { BrowserWindow } = require('electron').remote;
            this.window = new BrowserWindow({ width: 800, height: 600 });
        }
        // get all cookies
        this.cookies = new Array;
        this.window.webContents.on('did-finish-load', () => {
            this.window.webContents.session.cookies.get({}, (error, cookies) => __awaiter(this, void 0, void 0, function* () {
                if (error) {
                    console.error('Error getting cookies:', error);
                    return;
                }
                // store cookies
                cookies.forEach(c => {
                    //console.log("Cookie:"+JSON.stringify(c));
                    try {
                        this.cookies.push(c);
                    }
                    catch (error) {
                        console.log("Failed: %s", error.message);
                    }
                });
            }));
        });
    }
    //-----------------------------------------------------------------
    //--------------------- LOAD PAGE ---------------------------------
    //-----------------------------------------------------------------
    static load(address, qs = {}, method = "GET") {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Loading page: " + address + ", qs:");
            investigate(qs);
            //Make sure that client is logged-in to RRL 
            this.session = this.session || (yield this.login_request());
            //Set up basic options
            const options = {
                method: method,
                uri: address,
                qs: qs,
                headers: { cookie: this.session.cookie }
            };
            console.log("loading site: " + address);
            //Special treatment for POST data
            if (method == "POST") {
                const token = this.session.rvt;
                const options = {
                    method: method,
                    uri: address,
                    form: qs,
                    headers: { cookie: this.session.cookie }
                };
                options.form["__RequestVerificationToken:"] = token;
            }
            //send a request to provided address. 
            return request(options).catch(function (err) {
                console.log("Error in load request! Request options: ");
                console.log(options);
                investigate(options);
                //Remove clutter from RRL error message
                let txt = err.message;
                txt = txt.split("col-md-12")[1]; //unique class before error message
                txt = txt.split("Return home")[0]; //link text used after error message
                txt = txt.replace(/<\/?p>..../g, "\n");
                txt = txt.replace(/\\r\\n/g, "\n");
                console.log("RRL Error message: " + txt);
                return;
            });
            /*
            try { return request(options); }
            catch (err) { console.log("Error in load request: "+err.message); }
            return;*/
        });
    }
    //-----------------------------------------------------------------
    //--------------------- SAVE TO SETTINGS --------------------------
    //-----------------------------------------------------------------
    //changeAccountDetails saves username and password in file. 
    //Encrypt later? 
    static changeAccountDetails(args = this) {
        return this._changeAccountDetails(args.service, args.username, args.password);
    }
    static _changeAccountDetails(service, username, password) {
        console.log(`${this.siteName}._changeAccountDetails(${service}, ${username}, ${password})`);
        accounts[service] = {};
        accounts[service].username = username;
        accounts[service].password = password;
        investigate(accounts);
        var fs = require('fs');
        fs.writeFile("accounts.json", JSON.stringify(accounts, null, 2), function (err) {
            if (err)
                return console.log(err);
            console.log(JSON.stringify(accounts));
            console.log('writing to ' + "accounts.json");
        });
        return "success";
    }
    //Collecting data from the different RRL forms in one place seems reasonable. 
    //Can use it to consolidate all the different JSON files later. 
    static saveSettings(args) {
        return __awaiter(this, void 0, void 0, function* () {
            //Just add entries to local parameter object. There's probably a function for this. 
            for (const key in args) {
                if (key == "order" || key == "form")
                    continue;
                this[key] = args[key]; //Maybe use parameters object here as well?
            }
            //TODO: add save-to-file here. 
        });
    }
    static login_request() {
        return __awaiter(this, void 0, void 0, function* () {
            //Placeholder
            return;
        });
    }
    static Login(uri, username = this.username, password = this.password) {
        return __awaiter(this, void 0, void 0, function* () {
            //Placeholder
            return;
        });
    }
}
exports.website = website;
//===============================================================
//===============================================================
//Object RRL, inherits from Site
class RRL extends website {
    static test() { return this.test1() + this.test2() + this.test3() + super.test3() + this.test4(); }
    static test2() { return "overwriting works.<br/>\n"; }
    static test3() { return "This is from the extended Class...<br/>\n"; }
    static init() {
        super.init();
    }
    //-----------------------------------------------------------------
    //---------------------- LOG IN -----------------------------------
    //-----------------------------------------------------------------
    static login_request() {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadUpdateSettings();
            console.log('Login Wrapper function... username: ' + this.username);
            if (this.loggedIn) {
                console.log("Aöready logged in. ");
                return this.session;
            }
            this.session = yield this.Login(this.actionPage, this.username, this.password);
            //console.log("SESSION1: "+JSON.stringify(ret, null, 2));
            this.userID = yield this.GetUserId();
            //console.log("SESSION2: "+JSON.stringify(ses, null, 2));
            if (this.userID) {
                this.loggedIn = true;
                console.log("Logged in. ");
            }
            return this.session;
        });
    }
    //----------------------------------------------
    //----------------------------------------------
    static Login(uri = this.actionPage, username = this.username, password = this.password) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Logging in to '${uri}' as '${username}', with pw: '${password}'.`);
            try {
                const session = yield RRL.GetCookieAndRVT(uri);
                if (!session) {
                    console.log("Failed to get Cookie and RVT.");
                    return;
                }
                const options = {
                    method: "POST",
                    simple: false,
                    uri,
                    form: {
                        email: username,
                        password: password,
                        remember: "false",
                        __RequestVerificationToken: session.rvt
                    },
                    headers: {
                        cookie: session.cookie
                    },
                    resolveWithFullResponse: true
                };
                const res = yield request(options);
                session.cookie = res.headers["set-cookie"];
                session.payload = Object.assign({}, session.payload, { username });
                return session;
            }
            catch (err) {
                console.log("Error in login: " + err.message);
                console.log(JSON.stringify(err, null, 2));
                return;
            }
        });
    }
    //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    // Get Cookie and __RequestVerificationToken
    static GetCookieAndRVT(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Getting Cookie and RVT at URI '" + uri + "'");
            try {
                const options = {
                    method: "GET",
                    uri,
                    resolveWithFullResponse: true
                };
                const res = yield request(options);
                const cookie = res.headers["set-cookie"];
                const rvtName = "__RequestVerificationToken";
                const $ = cheerio.load(res.body);
                const rvt = $(`input[name=${rvtName}]`).val();
                this.cookies = cookie;
                this.token = rvt;
                return {
                    rvt,
                    cookie
                };
            }
            catch (err) {
                console.log("Error in GetCookieAndRVT: " + err.message);
                console.log(JSON.stringify(err, null, 2));
                return;
            }
        });
    }
    //----------------------------------------------
    //----------------------------------------------
    static GetUserId(session = this.session, uri = this.baseURL) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Getting ID...');
            //console.log('Cookie: '+session.cookie);
            try {
                const options = {
                    method: "GET",
                    uri: uri,
                    headers: {
                        cookie: session.cookie
                    }
                };
                const res = yield request(options);
                if (!session.payload.id) {
                    const $ = cheerio.load(res, { xmlMode: false });
                    // Positive Lookbehind Regular Expression.  Thank you Regex101
                    let reg = /(?<=window.userId\s=\s)\d\d\d\d\d/gm;
                    let matches = reg.exec(res);
                    if (!!matches) {
                        session.payload = Object.assign({}, session.payload, { userId: matches[0] });
                    }
                }
                console.log("user id = " + session.payload.userId);
                this.session = session;
                return session.payload.userId;
            }
            catch (err) {
                console.log("Error: " + err.message);
                console.log(JSON.stringify(err, null, 2));
                return;
            }
        });
    }
}
RRL.siteName = "RRL";
RRL.service = "RRL";
RRL.baseURL = "https://deployment.royalroad.com";
RRL.actionPage = "https://deployment.royalroad.com/account/betalogin";
RRL.fictionsPage = "https://deployment.royalroad.com/my/fiction/";
RRL.allFictionsPage = "https://deployment.royalroad.com/my/fictions/";
RRL.settingsLoaded = false;
exports.RRL = RRL;
module.exports = RRL;
//# sourceMappingURL=website.js.map