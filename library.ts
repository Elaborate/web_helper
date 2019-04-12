import { EOF } from "dns";
import { win32 } from "path";
import { RSA_X931_PADDING } from "constants";
const accounts = require('./accounts.json');

const request = require('request');
const cheerio = require('cheerio');
const electron = require('electron');
const {remote} = require('electron');
const {session} = require('electron');
const react = require('react');
const {BrowserWindow} = require('electron');
const {ipcRenderer} = require('electron');
const {ipcMain} = require('electron') || electron.remote.ipcMain;
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
export function investigate(obj, space=0, path=obj, parent="", grandparent=""){
  console.log("Investigating "+path); 
  if (obj)
  Object.keys(obj).forEach(function(k, i) {
    const type = typeof obj[k]; 
    const recursive = (k==parent || k==grandparent) 
    if (!recursive && (type == 'object')) investigate(obj[k], space+1,path+'/'+k, k, parent);
    else if (type == 'function') console.log(`${'  '.repeat(space)} ${k}(${type})`);
    else console.log(`${'  '.repeat(space)} ${k}(${type}): ${obj[k]}`);
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
      if (this.initiated==true) return;
      this.initiated=true;
      if (this.loaded==false) this.loadUpdateSettings();
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
    static message(name, form){
      //alert("RRL.message got form request: "+name);
      
      /*
      try {ipcRenderer.send(name, form);}
      catch{console.log("No ipcRenderer"); 
      try{ipcMain.send(name, form);}
      catch{console.log("No ipcMain");}
      */

      console.log("MESSAGE RECEIVED!");
      /*
      //Extract inputs from form. 
      var $ = cheerio.load(form);
      var input = $('input');
      var args={};
      input.each(function(i,element){
        console.log("field "+element.attribs['name']+": "+element.attribs['value']);
        args[element.attribs['name']]=element.attribs['value']; 
        });
*/
      var args={};
      var split = form.split("&"); 
      split.forEach(function(x){
        const y = x.split('=');
        console.log(y[0]+" "+y[1]);
        let new_arg = decodeURIComponent(y[1]) 
        if (new_arg.includes(',')) new_arg=split(',')
        args[y[0]]=new_arg;
      })

      //Call the function specified in form input "order"  
      //investigate(args);
      try{this[args["order"]](args);}
      catch(e){console.log(this.siteName+ ` method called '${args["order"]}' did not work. ${e.message}
      
      
      `)
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
    static login(): string{return "success"}  
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
            }
            });  
            if (token.length>1) {
              //const {ipcMain} = require('electron');
              //this.ipcMain.send('hasToken', "test");
              this.window.webContents.send("hasToken");
              return token;
            }
            
          return `did not find token (${token})`;
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



    //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    static bookmark(args){this._bookmark(args.fictionNr);}

    static _bookmark(fictionNr){
      console.log("calling bookmark()");
      this.loadUpdateSettings();
      //const {ipcMain} = require('electron');

      ipcMain.once('hasToken', (event, body) => {
        RRL.getTokenFromHTML(body);
        console.log("Has gotten Token.");
        RRL.login_win();
        });

      ipcMain.once('hasLoggedIn', (event, body) => {
        console.log("Has logged in.")
        RRL.bookmark_win(fictionNr);
        });

      ipcMain.once('hasBookmarked', (event, body) => {
        console.log("Has bookmarked.")
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
    }


     //----------------------------------------------
     //----------------------------------------------
    //Bookmark a novel
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

    this.window.webContents.once('dom-ready', () => {
      console.log("Detecting login");
      RRL.loggedIn=true;
      RRL.window.webContents.executeJavaScript(`
        require('electron').ipcRenderer.send('hasLoggedIn', document.body.innerHTML);
        `
        );
      return this.token;
      });  
      return "success";
    }

    //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    //Log in the 'right' way. Currently non-functional. 
    static login(): string{
      console.log('Logging in');
        const token = this.getToken();
        this.token = token;

        RRL.pageLoaded = "test";
        const formData = {
            //key-value pairs
            Email: this.username,
            Password: this.password, 
            Remember: "false",
            __RequestVerificationToken: token
            };
            const r = request.post({url: this.actionPage, formData: formData}, function optionalCallback(err, httpResponse, body) {
            if (err) { return console.error('upload failed:', err); }
            console.log('Upload successful!  Server responded with:', body);
            return body;
          });
          const ses = session.fromPartition('persist:name');
          console.log("Session info: "+ses.getUserAgent());
          // Get all cookies
          ses.cookies.get(
            {}, 
            (error, result) => console.log('Found the following cookies', result)
            )
        this.loggedIn=true;
        return r;
        return RRL.pageLoaded;
    }

    //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    static loadFictions(): void{  
    //<a href="/fiction/submission/edit?id=12134" class="btn btn-default col-xs-6">
      console.log("calling loadFictions()");
      this.loadUpdateSettings();
      //const {ipcMain} = require('electron');

      ipcMain.once('hasToken', (event, body) => {
        RRL.getTokenFromHTML(body);
        console.log("Has gotten Token.");
        RRL.login_win();
        });

      ipcMain.once('hasLoggedIn', (event, body) => {
        console.log("Has logged in.")
        RRL._loadFictions();
        });

      ipcMain.once('hasGottenFictions', (event, body) => {
        console.log("Has gotten fictions: "+body);
        RRL.message('updateFictions', body); 
        });

        this.getToken_win(); 

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

    static updateFictions(args): void{
      console.log('updating fictions');
      //investigate(args); 
      const fics = new Array(args['fictions'])
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
    //-----------------------------------------------------------------
    static loadUpdateSettings(): void{
        super.loadUpdateSettings();
        this.chaptersPerUpdate=7; 
        this.baseURL = "https://deployment.royalroad.com";
        this.loggedIn = false; 
        this.token = "";
        this.actionPage = "https://deployment.royalroad.com/account/betalogin";
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
        try{
          console.log(investigate(this.fictions));
        }
        catch{
          console.log("can't investigate 'fictions'");
        } 
        
    }
    //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    //changeUpdateSettings, changes settings for site updates
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
            Updates on <input name="time" type="time" value="${time}"/><br/>
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
            <input type=submit value="Update Settings"/>
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
