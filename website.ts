const accounts = require('./accounts.json');
const cheerio = require('cheerio');
const electron = require('electron');
const {remote} = require('electron');
const {session} = require('electron');
const {BrowserWindow} = require('electron');
const {ipcRenderer} = require('electron');

import * as request from "request-promise";

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
    static service: string;
    static session: any;

    //Methods:

    //-----------------------------------------------------------------
    //------------------- UPDATE MAIN WINDOW --------------------------
    //-----------------------------------------------------------------

    static update(): void { //How much of this is even needed?
      if (this.window){
      const path = require('path');
      const url = require('url');
      this.window.loadURL(url.format({
          pathname: path.join(__dirname, 'index.html'),
          protocol: 'file',
          slashes: true
      })
      )
    } else if (document){
      window.location.reload();
    } else {
      //const {ipcRenderer} = require('electron'); 
      //ipcRenderer.send('please-refresh', "test");
    }

    }

    //-----------------------------------------------------------------
    //------------------- DO SETUP STUFF ------------------------------
    //-----------------------------------------------------------------


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


    //----------------------------------------------
    //----------------------------------------------

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
    //-----------------------------------------------------------------
    //--------------------- LOAD PAGE ---------------------------------
    //-----------------------------------------------------------------

    static async load(address, qs={}, method="GET"): Promise<string>{
        console.log("Loading page: "+address+", qs:"); 
        investigate(qs);
      //Make sure that client is logged-in to RRL 
      this.session = this.session || await this.login_request(); 

      //Set up basic options
      const options = {
        method: method,
        uri: address,
        qs: qs,
        headers: { cookie: this.session.cookie }
        };
      console.log("loading site: "+address);
      
      //Special treatment for POST data
      if (method=="POST"){
        const token = this.session.rvt
        const options = {
          method: method,
          uri: address,
          form: qs,
          headers: { cookie: this.session.cookie }
          };
        options.form["__RequestVerificationToken:"] = token; 
        console.log("sending POST request, options: ");
        investigate(options);
        console.log("sending POST request, options: ");
      }
      //send a request to provided address. 
      return request(options).catch(function(err){
        //Remove clutter from RRL error message
        let txt = err.message;
        txt = txt.split("col-md-12")[1]; //unique class before error message
        txt = txt.split("Return home")[0]; //link text used after error message
        txt = txt.replace(/<\/?p>..../g, "\n");
        txt = txt.replace(/\\r\\n/g, "\n");
        console.log("Error in load request: "+txt); 
        return;
      }); 
      /*
      try { return request(options); } 
      catch (err) { console.log("Error in load request: "+err.message); }
      return;*/

      }
    //-----------------------------------------------------------------
    //--------------------- SAVE TO SETTINGS --------------------------
    //-----------------------------------------------------------------


    //changeAccountDetails saves username and password in file. 
    //Encrypt later? 
    static changeAccountDetails(args=this): string{
        return this._changeAccountDetails(args.service, args.username, args.password)
      }
  
    static _changeAccountDetails(service, username, password): string{
        console.log(`${this.siteName}._changeAccountDetails(${service}, ${username}, ${password})`)
    accounts[service]={};
    accounts[service].username=username;
    accounts[service].password=password;
    investigate(accounts)
    var fs = require('fs');
    fs.writeFile("accounts.json", JSON.stringify(accounts, null, 2), function (err) {
        if (err) return console.log(err);
        console.log(JSON.stringify(accounts));
        console.log('writing to ' + "accounts.json");
        });
    return "success"}



    //Collecting data from the different RRL forms in one place seems reasonable. 
    //Can use it to consolidate all the different JSON files later. 
    static async saveSettings(args){
      //Just add entries to local parameter object. There's probably a function for this. 
      for (const key in args){ 
        if (key=="order" || key=="form") continue; 
        this[key]=args[key] //Maybe use parameters object here as well?
        }

      //TODO: add save-to-file here. 

      }
      static async login_request(): Promise<SessionInfo> | undefined{
        //Placeholder
        return;
      }

      static async Login(
        uri,
        username: string = this.username,
        password: string = this.password
      ): Promise<SessionInfo> | undefined {
        //Placeholder
        return;
      }

}


//===============================================================
//===============================================================

//Object RRL, inherits from Site
export class RRL extends website{
    static test(): string{return this.test1()+this.test2()+this.test3()+super.test3()+this.test4()}
    static test2(): string{return "overwriting works.<br/>\n"}
    static test3(): string{return "This is from the extended Class...<br/>\n"}
    static siteName = "RRL";
    static service = "RRL";
    static fictions: any; 
    static releases: any; 
    static chapters: any;
    static chaptersPerUpdate: number; 
    static hourOfDayToUpdate: number;
    static weekdaysToUpdate: [];
    static dateEachMonthToUpdate: number; 
    static daysBetweenUpdates: number;
    static pageLoaded: string;
    static baseURL = "https://deployment.royalroad.com";
    static actionPage = "https://deployment.royalroad.com/account/betalogin";
    static fictionsPage = "https://deployment.royalroad.com/my/fiction/"; 
    static allFictionsPage = "https://deployment.royalroad.com/my/fictions/"; 
    //static loginPage: "https://www.royalroad.com/account/login"; 
    //static actionPage: "https://www.royalroad.com/account/externallogin";
    //static fictionsPage = "https://www.royalroad.com/my/fictions/";
    
    static session: any;
    static userID: number;
    static token: any;
    static gettingToken: boolean;
    static loggedIn: boolean;
    static settingsLoaded=false;
    static ipcMain: any;
    
    static init(): void{
      super.init();
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
}

module.exports = RRL; 
