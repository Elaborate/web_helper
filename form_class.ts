const cheerio = require('cheerio');
const electron = require('electron');
const {remote} = require('electron');
const {BrowserWindow} = require('electron');
const {ipcRenderer} = require('electron');
const {ipcMain} = require('electron') || electron.remote.ipcMain;

import * as request from "request-promise";
import { inherits, formatWithOptions } from "util";

request.defaults({ jar: true });

interface SessionInfo {
  rvt: string;
  cookie: string;
  payload?: any;
}

//--------------------------------------------------------------
//------------------       FORM        -------------------------
//--------------------------------------------------------------
//Experimental class for forms
export class form {
  static window: any; 
  static forms: string[]; 
  initiated = false;
  loaded = false;
  formName = "default_form"; 
  filename = "default_form.json"; 
  html: string; 
  legend = "Form Legend"
  parameters: any;
  website: any;
  targetForm: any;
  
  constructor(formName){
      this.formName=formName || "basicForm";
      this.filename=formName + ".json";
      this.parameters = {};
      this.init();
  }

  //-----------------------------------------------------
  //-----------------------------------------------------
  //Init function, set initial values
  init(): boolean{
      this.loadSettingsFromFile();
    if (this.initiated) {
      console.log("Cancel init(), initiated is "+this.initiated)
      return true;
      }
    console.log("Initiating form "+this.formName)     
    form[this.formName] = this;
    if (form.forms===undefined) form.forms=[];
    form.forms.push(this.formName);
    this.initiated=true;

    return true; 
  }


  //-----------------------------------------------------
  //-----------------------------------------------------
  //Generate html code for form.
  //This part is the same for every form.
  compose(id=0): string {
    if (!!ipcRenderer) ipcRenderer.on("${formName}", function(){
      console.log("Form "+this.formName+" got form request. ");

    }); 
    return `
      <form id=${this.formName} onSubmit="JavaScript:sendForm(event, '${this.formName}')"> 
        <fieldset>
          <legend>${this.legend}</legend> 
          <input type=hidden name=form value="${this.formName}"/>
            ${this.mainHTML()}
        </fieldset>
      <form>
  `}


  //-----------------------------------------------------
  //-----------------------------------------------------
  //Generate html code for form.
  //This part is custom for every form; here's a placeholder. 
  mainHTML(id=0): string {return "This is a form!"}


  //-----------------------------------------------------
  //-----------------------------------------------------
  //Get data from form in BrowserWindow, without the user pressing the button. 
  //UNFINISHED
  getNewSettings(): void {
    console.log("Called getNewSettings() for "+this.formName)
    /*
    if (form.window===undefined) {
      console.log("Form not assigned to a BrowserWindow! Assuming this is on Renderer...");
      //Send data from form.
      ipcRenderer.once("${formName}_save_settings", function(){ 
        console.log("Saving settings for: "+this.formName); 
      }); 
      sendForm(event, '${this.formName}');
      }     
      
    
    else{
      console.log("Form has BrowserWindow! Assuming this is on Main...");
      //Set up a callback for when data is sent from form.
      form.window.webContents.executeJavaScript(`
      JavaScript:sendForm(event, '${this.formName}')
      `); 

      
      return;
      
  }
  */
}
  

  //-----------------------------------------------------
  //-----------------------------------------------------
  //Save form parameters locally, and also to file. 
  saveSettings(args): void {
    console.log(`${this.formName} called saveSettings()`);

    //Just add entries to local parameter object. 
    //There's probably a function for this. 
    
    for (const key in args){ 
        if (key=="order" || key=="form") continue; 
        this.parameters[key]=args[key] 
        }
    
    //Save copy of parameters in website class
    this.website.saveSettings();

    //Save local parameters to disk.
    this.saveSettingsToFile();
    //investigate(this);        
    }

  //-----------------------------------------------------
  //-----------------------------------------------------
  //Save local parameters to a JSON file. 
  saveSettingsToFile(): void {
    console.log("called saveSettingsToFile() on "+this.formName+", saving to "+this.filename);
    var fs = require('fs');
    //investigate(this);
    fs.writeFile(this.filename, JSON.stringify(this.parameters, null, 2), function (err) {
      if (err) return console.log("Couldn't save data from form"+this.formName+"Error: "+err);
      //console.log('writing to ' + this.filename);
      //console.log(JSON.stringify(this.parameters));
      });
    }


  //-----------------------------------------------------
  //-----------------------------------------------------
  //Load JSON file into local parameters. 
  loadSettingsFromFile(): void {
    console.log(`${this.formName} called loadSettingsFromFile()`);
    const file='./'+this.filename;
    try{ 
      this.parameters = require(file); 
      console.log("successfully loaded parameter file: '"+file+"' into "+this.formName);
      //investigate(this)
      this.loaded=true;
    }
    catch{ 
      console.log("can't find parameter file: '"+file+"'");
      this.parameters = {}; 
      }
  }


  //-----------------------------------------------------
  //-----------------------------------------------------
  //Load data from outside - web page or computer search. 
  loadData(): void {
      //PLACEHOLDER 
    }

  //-----------------------------------------------------
  //-----------------------------------------------------
  //Update form in BrowserWindow with generated innerHTML
  display(): void {
    console.log("Called display() on "+this.formName)
    this.init();
    const container = this.formName+"_container"
    //Before updating, get changes the user has made
    this.getNewSettings();
    //Compose html code
    const html=this.compose();
    //console.log("replacing form "+container+"with: "+html);
    //Update (different depending on whether called in main or renderer)      
    if (form.window===undefined) {
      console.log("On renderer; Finding element: "+container)
      this.targetForm = document.getElementById(container); 
      if (this.targetForm) this.targetForm.innerHTML = html;      
    }        
    else try{
      console.log("On Main; Finding element: "+container)
      form.window.webContents.executeJavaScript(`          
        var target_form = document.getElementById("${container}"); // using 'let' causes errors for some reason.
        target_form.innerHTML = \`${html}\`;  
        delete target_form;

        `)}
     
    catch {console.log("Cannot find BrowserWindow or document!"); return;}
  }


  //-----------------------------------------------------
  //-----------------------------------------------------
  //Update all forms in BrowserWindow with generated innerHTML
  static updateAll(): void {
    for (const i in this.forms){ 
        const formName=this.forms[i];
        console.log("Ordering form '"+formName+"' to display()")
        form[formName].display() 
      }
    }


  //-----------------------------------------------------
  //-----------------------------------------------------
  //Process parameter string into an object.
  static parametersToObject(formData): any {
      console.log("called parametersToObject()");
      var args={};
      var split = formData.split("&"); 
      split.forEach(function(x){
        const y = x.split('=');
        console.log(y[0]+" "+y[1]);
        let new_arg = decodeURIComponent(y[1].replace(/\+/g, '%20')); 
        if (new_arg.includes(',')) new_arg=split(',')
        args[y[0]]=new_arg;
        })
        console.log("finished parametersToObject()");
      return args;  
      }

      
  //-----------------------------------------------------
  //-----------------------------------------------------
  //---- MESSAGE ------- Recieves orders from forms via renderer.js
  static message(name, formData){
    console.log("MESSAGE RECEIVED: "+formData);
    console.log("NEXT LINE");
    //process formData string into object
    const args = form.parametersToObject(formData);

    //investigate(args)
    //investigate(form.forms)

    //Call the function specified in form input "order"  
    const formName = args["form"] || undefined;
    console.log(`formName: '${formName}'== ${args["form"]}`) 
    const order = args["order"] || undefined;
    console.log(`order: '${order}'`) 
    const formObj = form[formName] || undefined; 
    console.log(`form object: '${formObj.formName}'`) 
    if (!formObj || !formObj.formName) console.log("cannot find form "+formName) 
    const method = formObj[order]; 
    if (!method) console.log("cannot find method "+order) 

    try{
      formObj[order](args);
      //method(args)
      }
    catch(e){
      console.log(`${formName} method '${args["order"]}' did not work. ${e.message}`);
      //investigate(args)
      }
    }
}

//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
  
  module.exports = form; 