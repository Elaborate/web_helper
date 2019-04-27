import { EOF } from "dns";
import { win32 } from "path";
import { RSA_X931_PADDING } from "constants";
const accounts = require('./accounts.json');

//const request = require('request');
const cheerio = require('cheerio');
const electron = require('electron');
const {remote} = require('electron');
const {session} = require('electron');
const react = require('react');
const {BrowserWindow} = require('electron');
const {ipcRenderer} = require('electron');
const {ipcMain} = require('electron') || electron.remote.ipcMain;

import * as request from "request-promise";
//import * as cheerio from "cheerio";

request.defaults({ jar: true });

interface SessionInfo {
  rvt: string;
  cookie: string;
  payload?: any;
}


//--------------------------------------------------------------
//--------------------------------------------------------------
//Debugging function
export function investigate(obj, space=0, path=obj, parent=null, grandparent=null){
  console.log("Investigating "+path); 
  if (obj)
  Object.keys(obj).forEach(function(k, i) {
    try{
    const type = typeof obj[k]; 
    const recursive = (k=="parent" || k=="next" || k=="prev" || obj[k]==obj || obj[k]==parent || obj[k]==grandparent) 
    if (!recursive && space<5 && (type == 'object')) investigate(obj[k], space+1,path+'/'+k, obj, parent);
    else 
    
    if (type == 'function') console.log(`${'  '.repeat(space)} ${k}(${type})`);
    else console.log(`${'  '.repeat(space)} ${k}(${type}): ${obj[k]}`);
    }
    catch{console.log(k+" not viewable");}
    });
  }

  //--------------------------------------------------------------
//--------------------------------------------------------------
//Searching function
export function contains(obj, query, space=0, path=obj.name, parent=null, grandparent=null):boolean{
  console.log("Investigating "+obj.name); 
  let attr = ""; 
  Object.keys(obj).forEach(function(k, i) { attr += " "+k;});
  console.log("Keys: "+attr); 
  if (obj)
  obj.children.forEach(function(k, i) {
    try{
    const type = i.name || k || typeof obj[k]; 
    const data = i.val() || i.toString() || i.data || "";
    console.log(`${'  '.repeat(space)} ${type}: ${data}`);
    //investigate(i);
    if (data && typeof data == 'string' && data.includes(query)) return true;
    const recursive = (k=="parent" || k=="next" || k=="prev" || obj[k]==obj || obj[k]==parent || obj[k]==grandparent) 
    if (!recursive && space<5 && (type == 'object') && contains(obj[k], query, space+1,path+'/'+k, obj, parent)) return true;
    }
    catch(err){console.log(err.message);}
    });
    return false;
  }


//--------------------------------------------------------------
//--------------------------------------------------------------
//Webite, Object/Interface for websites and stuff. 
export class website {
    static test1(): string{return "inheritance works.<br/>\n"}
    static test2(): string{return "overriding doesn't work.<br/>\n"}
    static test3(): string{return "This is from the original Class...<br/>\n"}
    static test4(): string{return this.test3()}

    static initiated: boolean
    static loaded: boolean
    static window: any
    static cookies: any[]; 
    static siteName: string; 
    static account: any;
    static username: string;
    static password: string;

    //Methods:

    //loadUpdateSettings, loads settings for when and what to update from file
    static loadUpdateSettings(): void{
      try{
        this.username = accounts[this.siteName].username; 
        this.password = accounts[this.siteName].password; 
      }
      catch{
        this.username = ""; 
        this.password = ""; 
      }
    }

  //Initialize, sets up object
    static init(): void{
      console.error('Init():');
      if (this.initiated==true) return;
      this.initiated=true;
      if (this.loaded==false) this.loadUpdateSettings();

      //Open window to do web stuff. 
      try{
        this.window = new BrowserWindow({width: 800, height: 600});
        }
      catch{
        const { BrowserWindow } = require('electron').remote
        this.window = new BrowserWindow({width: 800, height: 600});
        }

      // get all cookies
      this.cookies = new Array
      this.window.webContents.on('did-finish-load', () => {
        this.window.webContents.session.cookies.get({}, async (error, cookies) => {
        if (error) {
          console.error('Error getting cookies:', error);
          return;
          }

      // store cookies
        cookies.forEach(c => {
          //console.log("Cookie:"+JSON.stringify(c));
          try{ this.cookies.push(c);  }
          catch(error){console.log("Failed: %s",error.message)}
          });
        })});  
    }

    static displayAccountForm(): string{
      this.loadUpdateSettings();
      let formName="account_"+this.siteName;
      ipcRenderer.on("${formName}", function(){console.log("ipcRenderer got form request: "+formName)}); 
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
      `}

    //------------------------------------------------------------------------------
    //------------------------------------------------------------------------------
    //---- MESSAGE ------- Recieves orders from forms via renderer.js
    static message(name, form){
      console.log("MESSAGE RECEIVED!");
      var args={};
      var split = form.split("&"); 
      split.forEach(function(x){
        const y = x.split('=');
        console.log(y[0]+" "+y[1]);
        let new_arg = decodeURIComponent(y[1].replace(/\+/g, '%20')); 
        if (new_arg.includes(',')) new_arg=split(',')
        args[y[0]]=new_arg;
        })

      //Call the function specified in form input "order"  
      try{this[args["order"]](args);}
      catch(e){
        console.log(`${this.siteName} method '${args["order"]}' did not work. ${e.message}`);
        investigate(args)
        }
      }


    //------------------------------------------------------------------------------
    //------------------------------------------------------------------------------
    //changeAccountDetails saves username and password in file. 
    //Encrypt later? 
    static changeAccountDetails(args): string{
      return this._changeAccountDetails(args.service, args.username, args.password)
    }

    static _changeAccountDetails(service, username,password): string{
      //keytar.setPassword(this.siteName, this.username, this.password);
      accounts[service]=Object();
      accounts[service].username=username;
      accounts[service].password=password;
      var fs = require('fs');
      fs.writeFile("accounts.json", JSON.stringify(accounts, null, 2), function (err) {
        if (err) return console.log(err);
        console.log(JSON.stringify(accounts));
        console.log('writing to ' + "accounts.json");
        });
      return "success"}
      


  //------------------------------------------------------------------------------
  //------------------------------------------------------------------------------
  //login, logins to site
    static login(): any{return "success"}  
  //logout 
    static logout(): string{return "success"}
  //displayUpdateSettings, displays HTML form to change settings for site updates
  static displayUpdateSettings(): string{return "success"}
  //changeUpdateSettings, saves changed settings on file
  static saveUpdateSettings(): string{return "success"}
  //loadAccountDetails, gets username and password from encrypted file 
  static loadAccountDetails(): string{return "success"}
  //formatChapter, transforms chapter into acceptable format for site.  
  static formatChapter(): string{return "success"}
  //getPublishedChapters, gets list of already published chapters
  static getPublishedChapters(): string{return "success"}
  //getUnpublishedChapters, gets list of yet-to-be-published chapters on site
  static getUnublishedChapters(): string{return "success"}
  //publishChapterOnDate (Date, chapter)
  static publishChapterOnDate(): string{return "success"}
  //publishBatchOnDate (Date, chapter1, chapter2...), batch function calls publishChapterOnDate
  static publishBatchOnDate(): string{return "success"}
  //batchRename, replaces chapter
  static batchRename(): string{return "success"}
  //run, logs in, uploads chapters according to settings, 
    //double-checks that every chapter that should be uploaded IS uploaded, logs out
    static run(): string{return "success"}
}


//===============================================================
//===============================================================

//Object RRL, inherits from Site
export class RRL extends website{
    static test(): string{return this.test1()+this.test2()+this.test3()+super.test3()+this.test4()}
    static test2(): string{return "overwriting works.<br/>\n"}
    static test3(): string{return "This is from the extended Class...<br/>\n"}
    static siteName = "RRL";
    static fictions: any; 
    static releases: any; 
    static chaptersPerUpdate: number; 
    static hourOfDayToUpdate: number;
    static weekdaysToUpdate: [];
    static dateEachMonthToUpdate: number; 
    static daysBetweenUpdates: number;
    static pageLoaded: string;
    static baseURL = "https://deployment.royalroad.com";
    static actionPage = "https://deployment.royalroad.com/account/betalogin";
    static fictionsPage = "https://deployment.royalroad.com/my/fictions"; 
    //static loginPage: "https://www.royalroad.com/account/login"; 
    //static actionPage: "https://www.royalroad.com/account/externallogin";
    //static fictionsPage = "https://www.royalroad.com/my/fictions";
    
    static session: any;
    static userID: number;
    static token: any;
    static gettingToken: boolean;
    static loggedIn: boolean;
    static loggingIn: boolean;
    static bookmarked: boolean;
    static bookmarking: boolean;
    static ipcMain: any;
    
    static init(): void{
      super.init();
    }

    //-----------------------------------------------------------------
    //------------------- UPDATE MAIN WINDOW --------------------------
    //-----------------------------------------------------------------

    static update(): void { //How much of this is even needed?
      const path = require('path');
      const url = require('url');
      this.window.loadURL(url.format({
          pathname: path.join(__dirname, 'index.html'),
          protocol: 'file',
          slashes: true
      })
      )
    }

    //-----------------------------------------------------------------
    //---------------------- LOG IN -----------------------------------
    //-----------------------------------------------------------------

    static async login_request(): Promise<SessionInfo> | undefined{
      this.loadUpdateSettings();
      console.log('Login Wrapper function... username: '+this.username);
      if (this.loggedIn){
        console.log("Aöready logged in. ");
        return this.session;
      } 

      this.session = await this.Login(this.actionPage, this.username, this.password);
      //console.log("SESSION1: "+JSON.stringify(ret, null, 2));

      this.userID = await this.GetUserId();
      //console.log("SESSION2: "+JSON.stringify(ses, null, 2));

      if (this.userID){
        this.loggedIn=true;
        console.log("Logged in. ");
      } 

      return this.session;
      }

    //----------------------------------------------
    //----------------------------------------------

    static async Login(
      uri: string = this.actionPage,
      username: string = this.username,
      password: string = this.password
    ): Promise<SessionInfo> | undefined {
      console.log(`Logging in to '${uri}' as '${username}', with pw: '${password}'.`);

      try {
        const session: SessionInfo = await RRL.GetCookieAndRVT(uri);
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
        const res = await request(options);
        session.cookie = res.headers["set-cookie"];
        session.payload = {
          ...session.payload,
          username
        };
        return session;
      } 
      catch (err) {
        console.log("Error in login: "+err.message);
        console.log(JSON.stringify(err, null, 2));
        return;
      }
    }

    //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    // Get Cookie and __RequestVerificationToken
    static async GetCookieAndRVT(uri: string): Promise<SessionInfo> | undefined {
      console.log("Getting Cookie and RVT at URI '"+uri+"'"); 
      try {
        const options = {
          method: "GET",
          uri,
          resolveWithFullResponse: true
        };
        const res = await request(options);
        const cookie = res.headers["set-cookie"];
        const rvtName: string = "__RequestVerificationToken";
        const $ = cheerio.load(res.body);
        const rvt = $(`input[name=${rvtName}]`).val();

        this.cookies = cookie; 
        this.token = rvt;
     
        return {
          rvt,
          cookie
        };
      } catch (err) {
        console.log("Error in GetCookieAndRVT: "+err.message);
        console.log(JSON.stringify(err, null, 2));
        return;
      }
    }

    //----------------------------------------------
    //----------------------------------------------

    static async GetUserId(
      session: SessionInfo = this.session,
      uri: string = this.baseURL
    ): Promise<number> | undefined {
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
        const res = await request(options);
     
        if (!session.payload.id) {
          const $ = cheerio.load(res, { xmlMode: false });
          // Positive Lookbehind Regular Expression.  Thank you Regex101
          let reg = /(?<=window.userId\s=\s)\d\d\d\d\d/gm;
          let matches = reg.exec(res);
          if (!!matches) {
            session.payload = {
              ...session.payload,
              userId: matches[0]
            };
          }
        }
        console.log("user id = "+session.payload.userId)
        this.session = session; 
        return session.payload.userId;
      } 
      catch (err) {
        console.log("Error: "+err.message);
        console.log(JSON.stringify(err, null, 2));
        return;
      }
    }


    //-----------------------------------------------------------------
    //--------------------- UPDATING FICTIONS -------------------------
    //-----------------------------------------------------------------

    static async loadFictions(): Promise<string>{  
      this.loadUpdateSettings();
      const fictions = await this.loadFictions_request();
      this.updateFictions(fictions); 
      this.update();
      return "success";
      }

    //----------------------------------------------
    //----------------------------------------------

    static async loadFictions_request(session: SessionInfo = this.session): Promise<Object> | undefined {
      console.log("loading fics via request");
      //investigate(RRL.session);
      session = this.session || await this.login_request(); 
      const address = this.fictionsPage;
      try {
        const options = {
          method: "GET",
          uri: address,
          headers: {
            cookie: session.cookie
          }
        };
        console.log("loading site: "+address);
        const res = await request(options);
      
        //Processing
        console.log("got fics");
        const cheerio = require('cheerio');
        var $ = cheerio.load(res);
        var links = $('a');
        console.log("loaded html: "+links.html());
        var result = [];
        var query = "/fiction/chapter/new";
        links.each(function(i,el){
          const element = $(this);
          console.log("field "+i+": "+element.attr('href'));
          
          if (element.attr('href') && element.attr('href').includes(query)){ 
            console.log("fiction: "+element.attr('href'));
            result.push(element.attr('href').split('/').slice(-1)[0]);
          }
          });  
        var result_string="order=updateFictions&fictions="+result.join(','); 
        return result;
      } 
      catch (err) {
        console.log("Error in loadFictions_request: "+err.message);
        //console.log(JSON.stringify(err, null, 2));
        return;
      }
    }

    //----------------------------------------------
    //----------------------------------------------

    static updateFictions(fics): void{
      console.log('updating fictions');
      //investigate(args); 
      //const fics = new Array(args['fictions'])
      //investigate(fics);
      
      fics.forEach(function(id){
        if (!(RRL.fictions[id])){
          console.log('adding fiction '+id);
          RRL.fictions[id]={};
          RRL.fictions[id]["ID"] = id;
        }
        else console.log('ignoring fiction '+id);
      })
      console.log('converting into JSON: ');
      investigate(RRL.fictions);

      const settingsFile=RRL.siteName+".json";
      var fs = require('fs');
      var jsonString = JSON.stringify(RRL.fictions);
      console.log(jsonString);
      fs.writeFile(settingsFile, jsonString, function (err) {
        if (err) return console.log(err);
        console.log('writing to ' + settingsFile);
        });
   
    }



    //-----------------------------------------------------------------
    //----------------------- RELEASES --------------------------------
    //-----------------------------------------------------------------

    static async downloadScheduledReleases(novelID=12147): Promise<string>{
      console.log("Calling downloadScheduledReleases for "+novelID);
      const releases = await this.downloadScheduledReleases_request(12147);
      console.log("saving result: "+JSON.stringify(releases));
      this.saveScheduledReleases(releases);     
      this.update(); 
      return "success"; 
    }

    //----------------------------------------------
    //----------------------------------------------

    //displayScheduledReleases
    static displayScheduledReleases(): string{
      this.loadUpdateSettings();
      console.log('displaying releases: '+JSON.stringify(this.releases));
      console.log('releases has type: '+typeof this.releases);
      const formName = "releases";
      let schedule="";
      Object.keys(this.releases).forEach( function(id,i){
        const chapter = RRL.releases[id];
        let title = chapter['title'];
        try{
          const pattern = RRL.fictions[chapter['novelID']].pattern;
          if (pattern) title = chapter['title'].replace(pattern,"");
        }catch{}
        const now = new Date().getTime();
        const then = new Date(chapter['time']).getTime();;
        const time = (then - now);
        const days = Math.floor(time / 1000 / 60 / 60 / 24); 
        const hours = Math.floor((time / 1000 / 60 / 60) % 24);
        if (!!id) schedule+=`
          <li>${title} - ${days} days, ${hours} hours.</li>
        `;
      }); 
      let form=`
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

    static async downloadScheduledReleases_request(novelID=12147,session: SessionInfo = this.session): Promise<Object>{
      this.loadUpdateSettings();
      console.log("downloading releases for "+novelID+" via request");
      console.log("username: "+this.username+" pw: "+this.password);

      session = this.session || await this.login_request(); 
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
        console.log("loading site: "+options.baseUrl+options.url);
        const res = await request(options);
      
        var $ = cheerio.load(res);
        console.log("loaded site: "+ typeof res + "length: "+res.length);
        var links = $('tr');
        var result = {};
        var query = "Unschedule";
        links.each(function(i,element){
          if ($(links[i]).text().includes(query)){ 
            const title=$($(links[i]).find('td')[0]).text().trim(); 
            const time=$(links[i]).find('time').attr('datetime');
            const id=$(links[i]).find('form').attr('action').split('/').slice(-1)[0]; 
            result[id] = {};
            result[id]['novelID'] = novelID;
            result[id]['title']=title;
            result[id]['time']=time;
            console.log("chapter '"+title+"' updates "+time+" id:"+id);
            }
          });  
          console.log(JSON.stringify(result));  
          RRL.releases = result;
        return result;
      } 
        catch (err) {
          console.log("Error in release download: "+err.message);
          //console.log(JSON.stringify(err, null, 2));
          return;
          } 
          
        }

    //----------------------------------------------
    //----------------------------------------------

    static saveScheduledReleases(chapters): void{
      console.log('updating releases: '+JSON.stringify(chapters));
      //investigate(args);
      const settingsFile=RRL.siteName+"_releases.json";      
      var fs = require('fs');
      var jsonString = JSON.stringify(RRL.releases);
      console.log(jsonString);
      fs.writeFile(settingsFile, jsonString, function (err) {
        if (err) return console.log(err);
        console.log('writing to ' + settingsFile);
        });
      }
    

    //-----------------------------------------------------------------
    //------------------ UPDATE SETTINGS ------------------------------
    //-----------------------------------------------------------------


    static loadUpdateSettings(): void{
      console.log("Loading update settings");
        super.loadUpdateSettings();
        this.chaptersPerUpdate=7; 
        this.baseURL = "https://deployment.royalroad.com";
        this.loggedIn = false; 
        this.token = "";
        //this.actionPage = "https://deployment.royalroad.com/account/betalogin";
        //this.actionPage = "https://www.royalroad.com/account/externallogin?returnUrl=https%3A%2F%2Fwww.royalroad.com%2Fhome";
        //this.loginPage = "https://www.royalroad.com/account/login"; 
        this.siteName = "RRL"; 
        this.gettingToken=false;
        this.loggingIn=false;
        this.bookmarked=false;
        this.bookmarking=false;
        const {ipcMain} = require('electron'); 
        this.ipcMain = ipcMain;
        try{ this.fictions = require('./'+RRL.siteName+'.json'); }
        catch{ 
          console.log("can't find RRL file");
          this.fictions = {}; 
          }
        try{ this.releases = require('./'+RRL.siteName+'_releases.json'); }
        catch{ 
          console.log("can't find RRL schedule file");
          this.releases = {}; 
          }
        try{
          console.log(investigate(this.fictions));
        }
        catch{
          console.log("can't investigate 'fictions'");
        } 
        
    }

    //-----------------------------------------------------------------
    //-----------------------------------------------------------------

    static changeUpdateSettings(fiction): string{
      this.loadUpdateSettings();
      console.log("called changeUpdateSettings");
      const settingsFile=this.siteName+".json"
      var fs = require('fs');
      console.log("fiction: " + fiction.ID);
      investigate(this.fictions);
      this.fictions[fiction.ID]=fiction;
      let jsonString=JSON.stringify(this.fictions, null, 2);
      fs.writeFile(settingsFile, jsonString, function (err) {
        if (err) return console.log(err);
        console.log("JSON: "+jsonString);
        console.log('writing to ' + settingsFile);
        });
      this.update();
      return "success";
    }

    //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    //displayUpdateSettings, displays HTML form to change settings for site updates

      static displayUpdateSettings(): string{
        console.log("displaying update settings"); 
        this.loadUpdateSettings();
        console.log("fictions: "+investigate(this.fictions)); 
        console.log("# of fictions: "+Object.keys(this.fictions).length); 
        let title_choices="";
        if (Object.keys(this.fictions).length>1){
          title_choices="<select name=fic_title>"
          Object.keys(this.fictions).forEach(function(id) {
          //for (const fiction of this.fictions){ 
            const fiction = RRL.fictions[id]; 
            title_choices += `<option value="${fiction.title}">${fiction.title}</option>`
          });
          title_choices += "</select>"
        }
        const siteName=this.siteName;
        let form=title_choices;
        Object.keys(this.fictions).forEach(function(id) {
          let fiction = RRL.fictions[id]; 
        //for (const fiction of this.fictions){
          let formName="settings_"+siteName+'_'+fiction.ID; 
          console.log("displaying form: "+formName)
          ipcRenderer.on("${formName}", function(){console.log("ipcRenderer got form request: "+formName)}); 
          const title=fiction.title || ""
          const folder=fiction.folder || ""
          const pattern=fiction.pattern || ""
          const number=fiction.number || 1
          const time=fiction.time || "00:00"
          const ID=fiction.ID || "undefined"
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
          `
        });
        form += `
        <form id="add_fiction" onSubmit="JavaScript:sendForm(event, 'add_fiction')">
          <fieldset>
            <legend>Add new fiction</legend>
            <input type=hidden name=order value="loadFictions"/>
            <input type=submit value="Update Fictions"/>
          </fieldset>
        </form>
        `
        return form;
        
        }

      //------------------------------------------------------------------------------
      //-------------------------- TEST CASES ----------------------------------------    
      //------------------------------------------------------------------------------

      //displayTestButtons, some function testing stuff
        static displayTestButtons(): string{
          let formName="test_"+this.siteName;
          ipcRenderer.on(formName, function(){console.log("got form request: "+formName)}); 
          return `
          <form id="${formName}" onSubmit="JavaScript:sendForm(event, '${formName}')">
            <fieldset>
              <legend> Test buttons </legend>
              <input type=hidden name=FictionNr value="4293"/>
              <input type=hidden name=order value="bookmark"/>
              <input type=submit value="bookmark Iron Teeth"/>
            </fieldset
          </form>
          `
          }

    //-----------------------------------------------------------------
    //--------------------- BOOKMARK ----------------------------------
    //-----------------------------------------------------------------



    static async bookmark_request(fictionNr=4293,session: SessionInfo = this.session): Promise<SessionInfo> | undefined {
      console.log("bookmarking via request");
      //investigate(RRL.session);
      session = this.session || await this.login_request(); 
      //console.log('Cookie: '+session.cookie);
      try {
        const options = {
          method: "GET",
          baseUrl: this.baseURL,
          url: "/fictions/setbookmark/"+fictionNr,
          qs: {
            type: "follow",   
            mark: "True",
          },
          headers: {
            cookie: session.cookie
          }
        };
        console.log("loading site: "+options.url);
        const res = await request(options);
        console.log("Successfully bookmarked.");
        return session;
      } catch (err) {
        console.log("Error in bookmark_request: "+err.message);
        //console.log(JSON.stringify(err, null, 2));
        return;
      }
    }

      //----------------------------------------------
      //----------------------------------------------
      //        ***  OBSOLETE FUNCTIONS  ***
      //----------------------------------------------
      //----------------------------------------------
/*
      static _downloadScheduledReleases_win(novelID=12147): void{/*
        if (!this.loggedIn) {console.log("not logged in"); return;}
        this.init();
        this.getToken_win();
        console.log('Loading Fictions via a browser window.');
        const url = this.baseURL+"/my/fiction/"+novelID;
        console.log("loading '"+url+"'");
        this.window.loadURL(url);
        this.window.webContents.openDevTools(); 
        this.window.webContents.once('dom-ready', () => {
          console.log("Finding Releases");
          RRL.window.webContents.executeJavaScript(`
          console.log("Looking at Releases Page");
          if (typeof module === 'object') {window.module = module; module = undefined;} 
          const jQuery = require('jquery');
          const cheerio = require('node_modules/cheerio');
          if (window.module) module = window.module;
          alert("test");
          var $ = cheerio.load(document.body.innerHTML);
          var links = $('td.div');
          var result = {};
          var novelID = "${novelID}";
          var query = "Lorem Ipsum";
          links.each(function(i,element){
            console.log("field "+element.text()+": "+element);
            if (element.children('[class="col-sm-8"']).text() && element.children(['class="col-sm-8"']).text().includes(query))
              { 
              console.log("fiction: "+element.children(['class="col-sm-8"']).text());
              console.log("time: "+element.children(['class="col-sm-4"']).text());
              result.push(element.text());
              }
            }
            );  
          var json = JSON.stringify(result);
          var result_string="order=updateReleases&releases="+json; 
          //alert("finding fictions: "+result_string)
          require('electron').ipcRenderer.send('hasGottenFictions', result_string);
          `
          );
        return this.token;
        });     
        
      }

          static saveCookies(cookies): void{ 
      this.cookies = cookies; 
      console.log("cookies: "+cookies)
    }

    static _loadFictions(): void{  
      if (!this.loggedIn) {console.log("not logged in"); return;}
      this.init();
      this.getToken_win();
      console.log('Loading Fictions via a browser window.');
      this.window.loadURL(this.fictionsPage)
      this.window.webContents.openDevTools(); 
    this.window.webContents.once('dom-ready', () => {
      console.log("Finding Fictions");
      RRL.window.webContents.executeJavaScript(`     
        const cheerio = require('cheerio');
        var $ = cheerio.load(document.body.innerHTML);
        var links = $('a');
        var result = [];
        var query = "/fiction/submission/edit?id=";
        links.each(function(i,element){
          //console.log("field "+element.attribs['name']+": "+element.attribs['value']);
          if (element.attribs['href'] && element.attribs['href'].includes(query)){ 
            console.log("fiction: "+element.attribs['href']);
            result.push(element.attribs['href'].split('=')[1]);
          }
          });  
        var result_string="order=updateFictions&fictions="+result.join(','); 
        //alert("finding fictions: "+result_string)
        require('electron').ipcRenderer.send('hasGottenFictions', result_string);
        `
        );
      return this.token;
      });  
    }

    static bookmark(args){this._bookmark(args.fictionNr);}

    static _bookmark(fictionNr){
      console.log("calling bookmark()");
      this.loadUpdateSettings();
      //const {ipcMain} = require('electron');
      //if (!this.loggedIn) this.login(); 
      this.bookmark_request(fictionNr);
      }


    //----------------------------------------------
    //----------------------------------------------

      //Tell window to visit login page and get their token
        static getToken_win(): string{
          let error; 
          let response;
          let html;
          if (this.token.length>2) {console.log("already has token"); return this.token;}
          this.init(); 
          this.loadUpdateSettings();
          
          console.log(`getting tokens from ${this.baseURL}`);
          this.window.loadURL(this.baseURL);

          //const {ipcMain} = require('electron');
          ipcMain.on('body', function(event, body){
            console.log("Receiving token: ")
            //console.log(body)
            console.log(RRL.getTokenFromHTML(body));
            event.sender.send('hasToken', "test");
          })

          this.window.webContents.once('dom-ready', () => {
            RRL.window.webContents.executeJavaScript(`
              //var token = document.getElementById("__RequestVerificationToken");
              //require('electron').ipcRenderer.send('body', token);
              require('electron').ipcRenderer.send('hasToken', document.body.innerHTML);
              `
              );
            return this.token;
            });            
              return "Error";
              };
        static bookmark_win(fictionNr=4293): string{
        //const fictionNr = 4293; //Iron Teeth
          if (!this.loggedIn) this.login_win(); 
          console.log('bookmarking using a browser window.');
          const dataString=`type=follow&mark=true}`;
          console.log(`Datastring: '${dataString}'`);  
          this.window.loadURL(`${this.baseURL}/fictions/setbookmark/${fictionNr}`, {
          postData: [{
            type: 'rawData',
            bytes: Buffer.from(dataString)
            }],
          extraHeaders: 'Content-Type: application/x-www-form-urlencoded'
          })
          this.window.webContents.once('dom-ready', () => {
          console.log("Detecting bookmark");
          RRL.window.webContents.executeJavaScript(`
          require('electron').ipcRenderer.send('hasBookmarked', document.body.innerHTML);
          `
          );
          return this.token;
          });  
          return "bookmarking";
          }
              //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    //Visit login page and get their token
    static getToken(): string{
      let error; 
      let response;
      let html;
      this.loadUpdateSettings();
      console.log(`getting tokens from ${this.baseURL}`);
      request(this.baseURL, function (error, response, html) {
        if (!error && response.statusCode == 200) {
          var $ = cheerio.load(html);
          var input = $('input');
          input.each(function(i,element){
              console.log("field "+element.attribs['name']+": "+element.attribs['value']);
              if (element.attribs['name']=="__RequestVerificationToken"){ return element.attribs['value']}
              });
      }});
      return "Error";
      };

  //----------------------------------------------
  //----------------------------------------------
  //Get token from HTML and store it
      static getTokenFromHTML(html): string{
        console.log("getTokenFromHTML")
        var $ = cheerio.load(html);
        var input = $('input');
        var token = "";
        input.each(function(i,element){
          //console.log("field "+element.attribs['name']+": "+element.attribs['value']);
          if (element.attribs['name']=="__RequestVerificationToken"){ 
            console.log("token is: "+element.attribs['value']);
            RRL.token=element.attribs['value'];
            token = element.attribs['value'];
          }});  
        if (token.length>1) {
          //const {ipcMain} = require('electron');
          //this.ipcMain.send('hasToken', "test");
          this.window.webContents.send("hasToken");
          return token;
          }
          
        return `did not find token (${token})`;        
        }

    //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    //Make a new window and use that to log in. Redundant. 
    static login_win(): string{
      
      if (this.loggedIn) {console.log("already logged in"); return "error";}
      this.init();
      this.getToken_win();
      console.log('Logging in using a browser window.');
      const formData = {
        //key-value pairs
        Email: this.username,
        Password: this.password, 
        Remember: "false",
        __RequestVerificationToken: this.token
        };
        const dataString=`email=${formData.Email}&password=${formData.Password}&remember=${formData.Remember}&__RequestVerificationToken=${formData.__RequestVerificationToken}`
      console.log(`Datastring: '${dataString}'`);  
      this.window.loadURL(`${this.actionPage}`, {
    postData: [{
      type: 'rawData',
      bytes: Buffer.from(dataString)
      }],
    extraHeaders: 'Content-Type: application/x-www-form-urlencoded'
    })

    ipcMain.once('hasCookies', (event, body) => {
      const cookies = JSON.parse(body);
      investigate(cookies);
      RRL.cookies = cookies;
      });

    this.window.webContents.once('dom-ready', () => {
      console.log("Detecting login");
      RRL.loggedIn=true;
      const ses = session.fromPartition('persist:name');
      console.log("Session info: "+ses.getUserAgent());
      // Get all cookies
      ses.cookies.get(
        {}, 
        (error, result) => console.log('Found the following cookies', result)
        )
      RRL.window.webContents.executeJavaScript(`
        let cookies="";  
        for (const c in document.cookie){
          
        }
        require('electron').ipcRenderer.send('hasCookies', document.cookie);
        require('electron').ipcRenderer.send('hasLoggedIn', document.body.innerHTML);
        `
        );
      return this.token;
      });  
      
      return "success";
    }      
       */ 
}


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
