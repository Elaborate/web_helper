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
//const request = require('request');
const cheerio = require('cheerio');
const electron = require('electron');
const { remote } = require('electron');
const { session } = require('electron');
const react = require('react');
const { BrowserWindow } = require('electron');
const { ipcRenderer } = require('electron');
const { ipcMain } = require('electron') || electron.remote.ipcMain;
const request = require("request-promise");
//import * as cheerio from "cheerio";
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
//Searching function
function contains(obj, query, space = 0, path = obj.name, parent = null, grandparent = null) {
    console.log("Investigating " + obj.name);
    let attr = "";
    Object.keys(obj).forEach(function (k, i) { attr += " " + k; });
    console.log("Keys: " + attr);
    if (obj)
        obj.children.forEach(function (k, i) {
            try {
                const type = i.name || k || typeof obj[k];
                const data = i.val() || i.toString() || i.data || "";
                console.log(`${'  '.repeat(space)} ${type}: ${data}`);
                //investigate(i);
                if (data && typeof data == 'string' && data.includes(query))
                    return true;
                const recursive = (k == "parent" || k == "next" || k == "prev" || obj[k] == obj || obj[k] == parent || obj[k] == grandparent);
                if (!recursive && space < 5 && (type == 'object') && contains(obj[k], query, space + 1, path + '/' + k, obj, parent))
                    return true;
            }
            catch (err) {
                console.log(err.message);
            }
        });
    return false;
}
exports.contains = contains;
//--------------------------------------------------------------
//--------------------------------------------------------------
//Webite, Object/Interface for websites and stuff. 
class website {
    static test1() { return "inheritance works.<br/>\n"; }
    static test2() { return "overriding doesn't work.<br/>\n"; }
    static test3() { return "This is from the original Class...<br/>\n"; }
    static test4() { return this.test3(); }
    //Methods:
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
    static displayAccountForm() {
        this.loadUpdateSettings();
        let formName = "account_" + this.siteName;
        ipcRenderer.on("${formName}", function () { console.log("ipcRenderer got form request: " + formName); });
        return `
      <form id="${formName}" onSubmit="JavaScript:sendForm(event, '${formName}')">
      <fieldset>
        <legend>Account Information, ${this.siteName}</legend>
        <input type=hidden name=service value="${this.siteName}"/>
        <input type=hidden name=order value="changeAccountDetails"/>
        <input name=username placeholder=email value="${this.username}"/>
        <input type=password placeholder=password name=password value="${this.password}"/>
        <input type=submit value="Change Account Data"/>
      </fieldset>
      </form>
      `;
    }
    //------------------------------------------------------------------------------
    //------------------------------------------------------------------------------
    //---- MESSAGE ------- Recieves orders from forms via renderer.js
    static message(name, form) {
        console.log("MESSAGE RECEIVED!");
        var args = {};
        var split = form.split("&");
        split.forEach(function (x) {
            const y = x.split('=');
            console.log(y[0] + " " + y[1]);
            let new_arg = decodeURIComponent(y[1].replace(/\+/g, '%20'));
            if (new_arg.includes(','))
                new_arg = split(',');
            args[y[0]] = new_arg;
        });
        //Call the function specified in form input "order"  
        try {
            this[args["order"]](args);
        }
        catch (e) {
            console.log(`${this.siteName} method '${args["order"]}' did not work. ${e.message}`);
            investigate(args);
        }
    }
    //------------------------------------------------------------------------------
    //------------------------------------------------------------------------------
    //changeAccountDetails saves username and password in file. 
    //Encrypt later? 
    static changeAccountDetails(args) {
        return this._changeAccountDetails(args.service, args.username, args.password);
    }
    static _changeAccountDetails(service, username, password) {
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
    }
    //------------------------------------------------------------------------------
    //------------------------------------------------------------------------------
    //login, logins to site
    static login() { return "success"; }
    //logout 
    static logout() { return "success"; }
    //displayUpdateSettings, displays HTML form to change settings for site updates
    static displayUpdateSettings() { return "success"; }
    //changeUpdateSettings, saves changed settings on file
    static saveUpdateSettings() { return "success"; }
    //loadAccountDetails, gets username and password from encrypted file 
    static loadAccountDetails() { return "success"; }
    //formatChapter, transforms chapter into acceptable format for site.  
    static formatChapter() { return "success"; }
    //getPublishedChapters, gets list of already published chapters
    static getPublishedChapters() { return "success"; }
    //getUnpublishedChapters, gets list of yet-to-be-published chapters on site
    static getUnublishedChapters() { return "success"; }
    //publishChapterOnDate (Date, chapter)
    static publishChapterOnDate() { return "success"; }
    //publishBatchOnDate (Date, chapter1, chapter2...), batch function calls publishChapterOnDate
    static publishBatchOnDate() { return "success"; }
    //batchRename, replaces chapter
    static batchRename() { return "success"; }
    //run, logs in, uploads chapters according to settings, 
    //double-checks that every chapter that should be uploaded IS uploaded, logs out
    static run() { return "success"; }
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
    //------------------- UPDATE MAIN WINDOW --------------------------
    //-----------------------------------------------------------------
    static update() {
        const path = require('path');
        const url = require('url');
        this.window.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file',
            slashes: true
        }));
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
    //-----------------------------------------------------------------
    //--------------------- UPDATING FICTIONS -------------------------
    //-----------------------------------------------------------------
    static loadFictions() {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadUpdateSettings();
            const fictions = yield this.loadFictions_request();
            this.updateFictions(fictions);
            this.update();
            return "success";
        });
    }
    //----------------------------------------------
    //----------------------------------------------
    static loadFictions_request(session = this.session) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("loading fics via request");
            //investigate(RRL.session);
            session = this.session || (yield this.login_request());
            const address = this.fictionsPage;
            try {
                const options = {
                    method: "GET",
                    uri: address,
                    headers: {
                        cookie: session.cookie
                    }
                };
                console.log("loading site: " + address);
                const res = yield request(options);
                //Processing
                console.log("got fics");
                const cheerio = require('cheerio');
                var $ = cheerio.load(res);
                var links = $('a');
                console.log("loaded html: " + links.html());
                var result = [];
                var query = "/fiction/chapter/new";
                links.each(function (i, el) {
                    const element = $(this);
                    console.log("field " + i + ": " + element.attr('href'));
                    if (element.attr('href') && element.attr('href').includes(query)) {
                        console.log("fiction: " + element.attr('href'));
                        result.push(element.attr('href').split('/').slice(-1)[0]);
                    }
                });
                var result_string = "order=updateFictions&fictions=" + result.join(',');
                return result;
            }
            catch (err) {
                console.log("Error in loadFictions_request: " + err.message);
                //console.log(JSON.stringify(err, null, 2));
                return;
            }
        });
    }
    //----------------------------------------------
    //----------------------------------------------
    static updateFictions(fics) {
        console.log('updating fictions');
        //investigate(args); 
        //const fics = new Array(args['fictions'])
        //investigate(fics);
        fics.forEach(function (id) {
            if (!(RRL.fictions[id])) {
                console.log('adding fiction ' + id);
                RRL.fictions[id] = {};
                RRL.fictions[id]["ID"] = id;
            }
            else
                console.log('ignoring fiction ' + id);
        });
        console.log('converting into JSON: ');
        investigate(RRL.fictions);
        const settingsFile = RRL.siteName + ".json";
        var fs = require('fs');
        var jsonString = JSON.stringify(RRL.fictions);
        console.log(jsonString);
        fs.writeFile(settingsFile, jsonString, function (err) {
            if (err)
                return console.log(err);
            console.log('writing to ' + settingsFile);
        });
    }
    //-----------------------------------------------------------------
    //----------------------- RELEASES --------------------------------
    //-----------------------------------------------------------------
    static downloadScheduledReleases(novelID = 12147) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Calling downloadScheduledReleases for " + novelID);
            const releases = yield this.downloadScheduledReleases_request(12147);
            console.log("saving result: " + JSON.stringify(releases));
            this.saveScheduledReleases(releases);
            this.update();
            return "success";
        });
    }
    //----------------------------------------------
    //----------------------------------------------
    //displayScheduledReleases
    static displayScheduledReleases() {
        this.loadUpdateSettings();
        console.log('displaying releases: ' + JSON.stringify(this.releases));
        console.log('releases has type: ' + typeof this.releases);
        const formName = "releases";
        let schedule = "";
        Object.keys(this.releases).forEach(function (id, i) {
            const chapter = RRL.releases[id];
            let title = chapter['title'];
            try {
                const pattern = RRL.fictions[chapter['novelID']].pattern;
                if (pattern)
                    title = chapter['title'].replace(pattern, "");
            }
            catch (_a) { }
            const now = new Date().getTime();
            const then = new Date(chapter['time']).getTime();
            ;
            const time = (then - now);
            const days = Math.floor(time / 1000 / 60 / 60 / 24);
            const hours = Math.floor((time / 1000 / 60 / 60) % 24);
            if (!!id)
                schedule += `
          <li>${title} - ${days} days, ${hours} hours.</li>
        `;
        });
        let form = `
      <form id="${formName}" onSubmit="JavaScript:sendForm(event, '${formName}')">
      <fieldset>
        <legend> Scheduled Releases, ${RRL.siteName}</legend>
        <ul>${schedule}</ul>
        <input type=hidden name=order value="downloadScheduledReleases"/>
        <input type=submit value="Download Releases"/>
      </fieldset>
      </form>
      `;
        return form;
    }
    //----------------------------------------------
    //----------------------------------------------
    static downloadScheduledReleases_request(novelID = 12147, session = this.session) {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadUpdateSettings();
            console.log("downloading releases for " + novelID + " via request");
            console.log("username: " + this.username + " pw: " + this.password);
            session = this.session || (yield this.login_request());
            try {
                const options = {
                    method: "GET",
                    baseUrl: this.fictionsPage,
                    url: novelID,
                    qs: {
                        type: "follow",
                        mark: "True",
                    },
                    headers: {
                        cookie: session.cookie
                    }
                };
                console.log("loading site: " + options.baseUrl + options.url);
                const res = yield request(options);
                var $ = cheerio.load(res);
                console.log("loaded site: " + typeof res + "length: " + res.length);
                var links = $('tr');
                var result = {};
                var query = "Unschedule";
                links.each(function (i, element) {
                    if ($(links[i]).text().includes(query)) {
                        const title = $($(links[i]).find('td')[0]).text().trim();
                        const time = $(links[i]).find('time').attr('datetime');
                        const id = $(links[i]).find('form').attr('action').split('/').slice(-1)[0];
                        result[id] = {};
                        result[id]['novelID'] = novelID;
                        result[id]['title'] = title;
                        result[id]['time'] = time;
                        console.log("chapter '" + title + "' updates " + time + " id:" + id);
                    }
                });
                console.log(JSON.stringify(result));
                RRL.releases = result;
                return result;
            }
            catch (err) {
                console.log("Error in release download: " + err.message);
                //console.log(JSON.stringify(err, null, 2));
                return;
            }
        });
    }
    //----------------------------------------------
    //----------------------------------------------
    static saveScheduledReleases(chapters) {
        console.log('updating releases: ' + JSON.stringify(chapters));
        //investigate(args);
        const settingsFile = RRL.siteName + "_releases.json";
        var fs = require('fs');
        var jsonString = JSON.stringify(RRL.releases);
        console.log(jsonString);
        fs.writeFile(settingsFile, jsonString, function (err) {
            if (err)
                return console.log(err);
            console.log('writing to ' + settingsFile);
        });
    }
    //-----------------------------------------------------------------
    //------------------ UPDATE SETTINGS ------------------------------
    //-----------------------------------------------------------------
    static loadUpdateSettings() {
        console.log("Loading update settings");
        super.loadUpdateSettings();
        this.chaptersPerUpdate = 7;
        this.baseURL = "https://deployment.royalroad.com";
        this.loggedIn = false;
        this.token = "";
        //this.actionPage = "https://deployment.royalroad.com/account/betalogin";
        //this.actionPage = "https://www.royalroad.com/account/externallogin?returnUrl=https%3A%2F%2Fwww.royalroad.com%2Fhome";
        //this.loginPage = "https://www.royalroad.com/account/login"; 
        this.siteName = "RRL";
        this.gettingToken = false;
        this.loggingIn = false;
        this.bookmarked = false;
        this.bookmarking = false;
        const { ipcMain } = require('electron');
        this.ipcMain = ipcMain;
        try {
            this.fictions = require('./' + RRL.siteName + '.json');
        }
        catch (_a) {
            console.log("can't find RRL file");
            this.fictions = {};
        }
        try {
            this.releases = require('./' + RRL.siteName + '_releases.json');
        }
        catch (_b) {
            console.log("can't find RRL schedule file");
            this.releases = {};
        }
        try {
            console.log(investigate(this.fictions));
        }
        catch (_c) {
            console.log("can't investigate 'fictions'");
        }
    }
    //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    static changeUpdateSettings(fiction) {
        this.loadUpdateSettings();
        console.log("called changeUpdateSettings");
        const settingsFile = this.siteName + ".json";
        var fs = require('fs');
        console.log("fiction: " + fiction.ID);
        investigate(this.fictions);
        this.fictions[fiction.ID] = fiction;
        let jsonString = JSON.stringify(this.fictions, null, 2);
        fs.writeFile(settingsFile, jsonString, function (err) {
            if (err)
                return console.log(err);
            console.log("JSON: " + jsonString);
            console.log('writing to ' + settingsFile);
        });
        this.update();
        return "success";
    }
    //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    //displayUpdateSettings, displays HTML form to change settings for site updates
    static displayUpdateSettings() {
        console.log("displaying update settings");
        this.loadUpdateSettings();
        console.log("fictions: " + investigate(this.fictions));
        console.log("# of fictions: " + Object.keys(this.fictions).length);
        let title_choices = "";
        if (Object.keys(this.fictions).length > 1) {
            title_choices = "<select name=fic_title>";
            Object.keys(this.fictions).forEach(function (id) {
                //for (const fiction of this.fictions){ 
                const fiction = RRL.fictions[id];
                title_choices += `<option value="${fiction.title}">${fiction.title}</option>`;
            });
            title_choices += "</select>";
        }
        const siteName = this.siteName;
        let form = title_choices;
        Object.keys(this.fictions).forEach(function (id) {
            let fiction = RRL.fictions[id];
            //for (const fiction of this.fictions){
            let formName = "settings_" + siteName + '_' + fiction.ID;
            console.log("displaying form: " + formName);
            ipcRenderer.on("${formName}", function () { console.log("ipcRenderer got form request: " + formName); });
            const title = fiction.title || "";
            const folder = fiction.folder || "";
            const pattern = fiction.pattern || "";
            const number = fiction.number || 1;
            const time = fiction.time || "00:00";
            const ID = fiction.ID || "undefined";
            form += `
          <form id="${formName}" onSubmit="JavaScript:sendForm(event, '${formName}')">
            <fieldset>
            <legend> Site settings, ${siteName}</legend>
            <input type=hidden name=order value="changeUpdateSettings"/>
            <input type=hidden name=ID value="${ID}"/>
            Fiction name: <input name=title value="${title}"/><br/>
            Fiction ID: ${ID}<br/>
            Folder path: <input name=folder value="${folder}"/><br/> 
            Chapter Title Pattern: <input name=pattern value="${pattern}"/><br/> 
            Release on <input name="time" type="time" value="${time}"/><br/>
            Daily update<br/>
            Weekday updates on <select name="weekday">
              <option value="monday">monday</option>
              <option value="tuesday">tuesday</option>
              <option value="wednesday">wednesday</option>
              <option value="thursday">thursday</option>
              <option value="friday">friday</option>
              <option value="saturday">saturday</option>
              <option value="sunday">sunday</option>
            </select>
            Number of chapters per update: <input name=number value="${number}"/>
            <input type=submit value="Apply Release Settings"/>
            </fieldset>
          </form>
          `;
        });
        form += `
        <form id="add_fiction" onSubmit="JavaScript:sendForm(event, 'add_fiction')">
          <fieldset>
            <legend>Add new fiction</legend>
            <input type=hidden name=order value="loadFictions"/>
            <input type=submit value="Update Fictions"/>
          </fieldset>
        </form>
        `;
        return form;
    }
    //------------------------------------------------------------------------------
    //-------------------------- TEST CASES ----------------------------------------    
    //------------------------------------------------------------------------------
    //displayTestButtons, some function testing stuff
    static displayTestButtons() {
        let formName = "test_" + this.siteName;
        ipcRenderer.on(formName, function () { console.log("got form request: " + formName); });
        return `
          <form id="${formName}" onSubmit="JavaScript:sendForm(event, '${formName}')">
            <fieldset>
              <legend> Test buttons </legend>
              <input type=hidden name=FictionNr value="4293"/>
              <input type=hidden name=order value="bookmark"/>
              <input type=submit value="bookmark Iron Teeth"/>
            </fieldset
          </form>
          `;
    }
    //-----------------------------------------------------------------
    //--------------------- BOOKMARK ----------------------------------
    //-----------------------------------------------------------------
    static bookmark_request(fictionNr = 4293, session = this.session) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("bookmarking via request");
            //investigate(RRL.session);
            session = this.session || (yield this.login_request());
            //console.log('Cookie: '+session.cookie);
            try {
                const options = {
                    method: "GET",
                    baseUrl: this.baseURL,
                    url: "/fictions/setbookmark/" + fictionNr,
                    qs: {
                        type: "follow",
                        mark: "True",
                    },
                    headers: {
                        cookie: session.cookie
                    }
                };
                console.log("loading site: " + options.url);
                const res = yield request(options);
                console.log("Successfully bookmarked.");
                return session;
            }
            catch (err) {
                console.log("Error in bookmark_request: " + err.message);
                //console.log(JSON.stringify(err, null, 2));
                return;
            }
        });
    }
}
RRL.siteName = "RRL";
RRL.baseURL = "https://deployment.royalroad.com";
RRL.actionPage = "https://deployment.royalroad.com/account/betalogin";
RRL.fictionsPage = "https://deployment.royalroad.com/my/fictions";
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