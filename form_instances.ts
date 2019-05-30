const cheerio = require('cheerio');
const electron = require('electron');
const {remote} = require('electron');
const {BrowserWindow} = require('electron');
const {ipcRenderer} = require('electron');
const {ipcMain} = require('electron') || electron.remote.ipcMain;
const dateformat = require('dateformat');

const RRL = require("./website");
const renderer = require("./renderer");
//import("./renderer.js");
//investigate(RRL);
import * as request from "request-promise";
import { inherits, formatWithOptions } from "util";
import { relative } from "path";

const form = require("./form_class");

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
  let main=(ipcRenderer===undefined)
    if (main) console.log(`Investigating ${path}`); 
    else console.log(`%cInvestigating ${path}`,"color: #773"); 
    if (obj)
    Object.keys(obj).forEach(function(k, i) {
      try{
      const type = typeof obj[k]; 
      const recursive = (k=="parent" || k=="next" || k=="prev" || obj[k]==obj || obj[k]==parent || obj[k]==grandparent) 
      if (!recursive && space<5 && (type == 'object')) investigate(obj[k], space+1,path+'/'+k, obj, parent);
      else 
      
      if (type == 'function') 
      {
        if (main) console.log(`${'  '.repeat(space)} ${k}(${type})`);
        else console.log(`%c${'  '.repeat(space)} ${k}(${type})`,"color: #773");
    }
      else {
        if (main) console.log(`${'  '.repeat(space)} ${k}(${type}): ${obj[k]}`);
        else console.log(`%c${'  '.repeat(space)} ${k}(${type}): ${obj[k]}`,"color: #773");
      }
      }
      catch{console.log(k+" not viewable");}
      });
    }





  //--------------------------------------------------------------
  //------------------       RRL ACCOUNT FORM     ----------------
  //--------------------------------------------------------------
  
  const accounts = new form("RRL_account"); 
  accounts.legend="Account Information";
  accounts.website=RRL;

  accounts.mainHTML=function(): string{
      console.log("called mainHTML()")
      //investigate(this)
      this.init();  
      const username = this.parameters['username'] || ""; 
      const password = this.parameters['password'] || ""; 
      return `
        <input type=hidden name=order value="saveSettings"/>
        <input name=username placeholder=email value="${username}"/><br/>
        <input type=password placeholder=password name=password value="${password}"/><br/>
        <button type=submit value=saveSettings>Change Account Data</button>
     `}

  //Add a line to saveSettingsToFile() so it also saves to accounts.json
  accounts._saveSettingsToFile=accounts.saveSettingsToFile;
  accounts.saveSettingsToFile=function(){
    this._saveSettingsToFile(); 
    RRL._changeAccountDetails(this.website.siteName, this.parameters.username, this.parameters.password); 
    }
  

 

  //--------------------------------------------------------------
  //------------------       CHAPTERS-ON-DISK FORM        --------
  //--------------------------------------------------------------

  const localChapters = new form("RRL_LocalChapters");
  localChapters.legend="Chapters on Computer"
  localChapters.website=RRL
  localChapters.mainHTML=function(): string{
    console.log(`mainHTML()`)
    //this.loadData();
    console.log("Looking at chapters: ",JSON.stringify(this.chapters));
    const chapters = this.parameters.chapters; 
    const fictions = form["RRL_UpdateSettings"].parameters.fictions;
    if (typeof chapters == 'undefined') return "Bad Folder Address"

    //Return unordered list of chapters
    let ret =""
    Object.keys(chapters).forEach(function(chap){ 
      const chapter = chapters[chap];
      const fictionID = chapter.fictionID || undefined; 
      const pattern = fictions[fictionID.pattern];
      const path = chapter.filepath || 'unknown';
      const name = chapter.title || chapter.filename;
      ret+=`<li>${name}<button id='${path}' onclick="changeValue(this, 'chapterPath', '${path}'); changeOrder(this,'release');">schedule</button></li>` });
    return `<ul>\n${ret}\n</ul>
    <input type=hidden name=order value="release"/>
    <input type=hidden name=chapterPath value="0"/>
    <input type=submit value="Refresh local file list" onclick="changeOrder(this,'loadData');"/>
    `}

  //------------------------------------------------------------------------------
  //For every fiction, look through its folder for chapters matching its pattern.
  localChapters.loadData=function(){
    this.init();
    console.log(`%c${this.formName} called loadData()`, "color: blue;");
    const this_form=this; 
    //get list of fictions.
    const fictions = form["RRL_UpdateSettings"].parameters["fictions"];
    if (fictions===undefined) {
      console.log(`found no fictions in RRL_UpdateSettings.`)
      investigate(form["RRL_UpdateSettings"])
      return;}
    //For every fiction, load chapters recognized by pattern into local memory.
    const fs=require('fs');      
    let ret = {};
    Object.keys(fictions).forEach(function(novelID){
      const dirName = fictions[novelID].folder
      if (dirName===undefined) return;
      let res;
      //try { res = await RRL.readDirectory(dirName) } 
      try { res = fs.readdirSync(dirName); }
      catch (e) { console.log('error: ', e.message); }
      console.log(`found chapters: ${JSON.stringify(res)}`)
      for (const chap in res){
        const chapter = res[chap];
        ret[chapter]={}
        ret[chapter]["fictionID"] = novelID;
        ret[chapter]["filename"] = chapter;
        ret[chapter]["filepath"] = dirName+"/"+chapter;
        ret[chapter]["title"] = chapter.replace(/\..../,"");
      }
      //investigate(ret);
    });
    this_form.parameters.chapters=ret;
    console.log(`final result: ${JSON.stringify(ret)}`)
    investigate(ret); 
    this.saveSettingsToFile();
    return ret;
  }

  localChapters.release=function(args){
    console.log(`${this.formName} called loadData()`);
    this.action(args.chapterPath)
  } 

  localChapters.action=function(chapterPath="", status="New"){
    console.log(`%c${this.formName} called action('${chapterPath}')`, "color: blue;");
    if (!chapterPath){alert("invalid filepath: "+chapterPath); return;}
    let chapter;
    for (const c in this.parameters.chapters){
      const chap = this.parameters.chapters[c];
      investigate(chap);
      if (chap["filepath"]==chapterPath) {
        chapter=chap;
        break; 
        }
      else{
        console.log(`No match! Compared:\n${chapterPath}\n${chap["filepath"]}`)
      }}
    if (!chapter){
      console.log("could not find chapter with filepath: '"+chapterPath+"'")
      investigate(this.parameters.chapters)
    }
    console.log("chapter found: ");
    investigate(chapter);
    //const chapter=this.parameters.chapters[ChapterName]; //FIX

    //Preparing submission parameters
    const fictionID=chapter.fictionID;
    const fiction=form["RRL_UpdateSettings"].parameters.fictions[fictionID];
    const pre = chapter.pre || fiction.pre || "";
    const post = chapter.post || fiction.post || "";
    const date = chapter.date || (new Date(Date.now()+7*24*60*60*1000));
    const formattedDate = dateformat(date, 'yyyy-mm-dd hh:MM');
    const timezone = "-120" //FIX 
    const address = "https://deployment.royalroad.com/fiction/chapter/new/"+fictionID;
    const title = chapter.title || chapter.filename || "title"; 
    const testText="abcd ".repeat(101); //Just using a simple test text for now
    const fs=require('fs');      
    let qs={};

    //Reading in chapter text
    fs.readFile(chapterPath, 'utf8', function (err, chapterText) {
      if (err) return console.log(err);    
      if (!chapterText) {alert("Could not find file: "+chapterPath); return;}
      if (chapterText.length<500) {alert("Must be at least 500 characters: "+chapterPath); return;}
      
      qs={
        Status: status, 
        fid: fictionID,
        Title: title, 
        PreAuthorNotes: pre,
        Content: testText,//chapterText,
        PostAuthorNotes: post, 
        ScheduledRelease: formattedDate,
        timezone: timezone,
        PollQuestion: "",
        PollMultiple: 1, 
        action: "draft"
        }
        //Poll option parameters. Is this necessary? 
        qs["PollOptions[0].options"] = ""
        qs["PollOptions[0].votes"] = 0;
        qs["PollOptions[1].options"] = ""
        qs["PollOptions[1].votes"] = 0;
      investigate(qs);
      });
    
    RRL.load(address,qs,"POST").then(function(){
      console.log("draft scheduled")
      
      });
  }

  //--------------------------------------------------------------
  //------------------       SCHEDULED RELEASES FORM        ------
  //--------------------------------------------------------------

  const releases = new form("RRL_ScheduledReleases");
  releases.legend="Scheduled Releases"
  releases.website=RRL

  releases.mainHTML=function(): string{
    console.log(`${this.legend} mainHTML()`)
    this.init();
    const formName = "releases";
    const scheduledReleases=this.parameters.releases || {}
    let schedule="";
    Object.keys(scheduledReleases).forEach( function(id,i){
      const chapter = scheduledReleases[id];
      const novelID = chapter['novelID']
      let title = chapter['title'];
      try{
        const fictions = form["RRL_UpdateSettings"].parameters.fictions; 
        const pattern = fictions[novelID].pattern;
        if (pattern) title = chapter['title'].replace(pattern,"");
      }catch{console.log("Couldn't load pattern for "+novelID)}
      
      //Convert timestamp into time to chapter release
      const now = new Date().getTime();
      const then = new Date(chapter['time']).getTime();;
      const time = (then - now);
      const days = Math.floor(time / 1000 / 60 / 60 / 24); 
      const hours = Math.floor((time / 1000 / 60 / 60) % 24);
      const minutes = Math.floor((time / 1000 / 60 / 24) % (60));
      if (!!id) schedule+=`
        <li>${title} - ${days} days, ${hours} h, ${minutes} m</li>
        `;
      }); 
    return `
      <ul>${schedule}</ul>
      <input type=hidden name=order value="loadData"/>
      <input type=submit value="Download Releases"/>
    `;
    }

  //-----------------------------------------------------
  //Load release schedule from RRL 
  releases.loadData=function(){
    this.init();
    const this_form=this;
    const novelID=12147
    console.log(`${this.formName} called loadData()`);
    console.log("username: "+RRL.username+" pw: "+RRL.password);
    const uri = RRL.fictionsPage+novelID;
    RRL.load(uri).then(function(response){
      try {
        var $ = cheerio.load(response);
        console.log("loaded site: "+ typeof response + "length: "+response.length);
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
          this_form.parameters["releases"] = result;
          this_form.saveSettingsToFile();
          this_form.display();
          RRL.releases = result; //unnecessary
          console.log("finished loadData() for "+this_form.formName);  
        return result;
      } 
        catch (err) {
          console.log("Error in release download: "+err.message);
          console.log("Tried to load site: "+uri);
          //console.log(JSON.stringify(err, null, 2));
          return;
          } 
        })   
    
  }

  

  //--------------------------------------------------------------
  //------------------       TEST FUNCTIONS FORM        ----------
  //--------------------------------------------------------------

  const tests = new form("test_buttons"); 
  tests.legend="Update Settings";
  tests.website=RRL;
  tests.compose=function(){
    return tests.mainHTML();
    }
  tests.mainHTML=function(): string {
    console.log(`Called tests.mainHTML()`);
    return `
    <form id=${this.formName} onSubmit="JavaScript:sendForm(event, '${this.formName}')"> 
      <input type=hidden name=FictionNr value="4293"/>
      <input type=hidden name=order value="bookmark"/>
      <input type=submit value="bookmark Iron Teeth"/>
    </form>
    <div>
      <button onclick="window.form.updateAll();">reload page</button>
      <button onclick="console.log(window.form); investigate(form)">investigate form</button>
      <button onclick="console.log('Forms: '+window.form.forms);">check form keys</button>
      <button onclick="window.form['test_buttons'].bookmark()">bookmark test</button>
      <button onclick="window.form=require('./form_instances.js');">reset form</button>
      <button onclick="var test_variable='test'">make a test var</button>
      <button onclick="console.log(test_variable);">log test var</button>
    </div>
    `}

  //Bookmarks fiction, defaults to "Goblin Teeth"
  tests.bookmark = async function(args={}){
    
    const fictionNr=args["FictionNr"] || "4293";
    console.log("bookmarking via request");
    const address=RRL.baseURL+"/fictions/setbookmark/"+fictionNr;
    const qs = {
          type: "follow",   
          mark: "True"
        }
    RRL.load(address, qs).then(function(){
        console.log("Successfully bookmarked.");  
        });
        
    }







  //--------------------------------------------------------------
  //------------------       RRL UPDATE SETTINGS FORM       ------
  //--------------------------------------------------------------

  //This form is the most changed from the baseline, 
  //Because I needed to accommodate the possibility of multiple fictions. 
  const settings = new form("RRL_UpdateSettings"); 
  settings.legend="Update Settings";
  settings.website=RRL;
  settings.mainHTML=function(id): string {
    console.log(`Called settings.mainHTML('${id}')`);
    //investigate(this);
    if (id===undefined) return "";
    if (this.parameters===undefined ) return "error, undefined parameters";
    if (this.parameters.fictions===undefined) this.parameters.fictions = {};
    if (this.parameters.fictions[id]===undefined) return "error for "+id;
    const fiction = this.parameters.fictions[id]; 
    let formName="settings_RRL_"+fiction.ID; 
    console.log("displaying form: "+formName)
    try{
      ipcRenderer.on("${formName}", function(){console.log("ipcRenderer got form request: "+formName)}); 
    }
    catch{
      ipcMain.on("${formName}", function(){console.log("ipcRenderer got form request: "+formName)}); 
    }
    const title=fiction.title || ""
    const folder=fiction.folder || ""
    const pattern=fiction.pattern || ""
    const number=fiction.number || 1
    const time=fiction.time || "00:00"
    const ID=fiction.ID || "undefined"
    return `
        <input type=hidden name=order value="saveSettings"/>
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
      `
  }
  //-----------------------------------------------------
  //Display form for a single fiction
  settings.mainHTML=function(id): string {
    console.log(`Called settings.mainHTML('${id}')`);
    //investigate(this);
    if (id===undefined) return "";
    if (this.parameters===undefined ) return "error, undefined parameters";
    if (this.parameters.fictions===undefined) this.parameters.fictions = {};
    if (this.parameters.fictions[id]===undefined) return "error for "+id;
    const fiction = this.parameters.fictions[id]; 
    let formName="settings_RRL_"+fiction.ID; 
    console.log("displaying form: "+formName)
    try{
      ipcRenderer.on("${formName}", function(){console.log("ipcRenderer got form request: "+formName)}); 
    }
    catch{
      ipcMain.on("${formName}", function(){console.log("ipcRenderer got form request: "+formName)}); 
    }
    const title=fiction.title || ""
    const folder=fiction.folder || ""
    const pattern=fiction.pattern || ""
    const number=fiction.number || 1
    const time=fiction.time || "00:00"
    const ID=fiction.ID || "undefined"
    return `
        <input type=hidden name=order value="saveSettings"/>
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
      `
  }

  //-----------------------------------------------------
  //Modified compose(), which is usually the same for every form, 
  // because a separate form will be needed for each fiction.
  settings.compose=function(): string{
    console.log(`Called settings.compose()`);
    this.init();
    const this_form=this;
    const siteName=this.siteName;
    const fictions = this.parameters["fictions"];
    let fictionsNr = 0; 
    //investigate(Object.keys(fictions));
    if (fictions) fictionsNr = Object.keys(fictions).length; 
    console.log("# of fictions: "+fictionsNr); 

    //Make dropdown to choose between different forms. UNFINISHED
    let title_choices="";
    if (fictionsNr>1){
      title_choices="<select name=fic_title>"
      Object.keys(fictions).forEach(function(id) {
        const fic = fictions[id]; 
        title_choices += `<option value="${fic.title}">${fic.title}</option>`
        });
      title_choices += "</select>"
    }   
    let html=title_choices;

    //Compose html for all titles
    if (fictionsNr>0)
      Object.keys(fictions).forEach(function(id) { html += `
      <form id=${this_form.formName+'_'+id} onSubmit="JavaScript:sendForm(event, '${this_form.formName+'_'+id}')"> 
        <fieldset>
          <legend>${this_form.legend}</legend> 
          <input type=hidden name=form value="${this_form.formName}"/>
            ${this_form.mainHTML(id)}
        </fieldset>
      </form>
      `});

    //Add a button for updating list of RRL fictions
    html += `
    <form id="add_fiction" onSubmit="JavaScript:sendForm(event, 'add_fiction')">
      <fieldset>
        <legend>Add new fiction</legend>
        <input type=hidden name=order value="loadData"/>
        <input type=hidden name=form value="RRL_UpdateSettings"/>
        <button type=submit order="loadData" value="loadData" onclick="changeOrder(this);">Synchronize with RRL fictions</button>
      </fieldset>
    </form>
    `
    return html;
    }
  //-----------------------------------------------------
  //Load all of user's fiction IDs from RRL. 
  settings.loadData=function():void{
    console.log(`${this.formName} (settings) called loadData()%s`);
    if (ipcMain===undefined) console.log(`Not in main`);
    if (ipcRenderer===undefined) console.log(`Not in renderer`);
    //investigate (this.parameters);
    const fictionsList = this.parameters.fictions || {}
    const this_thing = this;

    //Load RRL Fictions page
    const address = RRL.allFictionsPage;
    RRL.load(address).then(function(response, this_form=this_thing){
      //Extracting fiction IDs from fictions page
      console.log("got fics");
      const cheerio = require('cheerio');
      const $ = cheerio.load(response);
      const links = $('a');
      console.log("loaded links list: "+links.html());
      let result = [];
      const query = "/fiction/chapter/new";
      links.each(function(i,el){ //Searching links for the query pattern. 
        const element = $(this);
        console.log("examining field "+i+": "+element.attr('href'));
        if (element.attr('href') && element.attr('href').includes(query)){ 
          console.log("fiction: "+element.attr('href'));
          result.push(element.attr('href').split('/').slice(-1)[0]);
          }
        });

      //Entering fiction IDs into local memory
      //Also Removing deleted fictions from local memory

      const newList = {};
      result.forEach(function(id){
        newList[id]={}
        if (fictionsList[id]) {
          console.log('fiction '+id+' is still there.');
          newList[id] = fictionsList[id]; 
          }
        else {
          console.log('adding fiction '+id);
          newList[id]["ID"]=id; //For convenience, I want the fiction to contain its own ID
        }});
      this_form.parameters.fictions=newList;

      //Save to disk
      this_form.saveSettingsToFile();
      
      //Update updateSettings form with new values.
      this_form.display();
    });
  }

    //-----------------------------------------------------
    //Changing saveSettings to accommodate multiple fictions
    settings.saveSettings=function(args): void {
      console.log(`${this.legend} called custom saveSettings()`);
      //investigate(this)
      //Just add entries to local parameter object. There's probably a function for this. 
      const id = args['ID']
      if (this.parameters===undefined) this.parameters={}
      if (this.parameters.fictions===undefined) this.parameters.fictions={}
      if (this.parameters.fictions[id]===undefined) this.parameters.fictions[id]={}
    
      for (const key in args){ 
          if (key=="order" || key=="form") continue; 
          this.parameters.fictions[id][key]=args[key] 
          }
      
      //Save copy of parameters in website class
      this.website.saveSettings();

      //Save local parameters to disk.
      this.saveSettingsToFile();
      //investigate(this);        
      }


  //--------------------------------------------------------------
  //------------------       Module Export        ----------------
  //--------------------------------------------------------------

  module.exports = form; 
