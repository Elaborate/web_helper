var request = require('request');
var cheerio = require('cheerio');
var loginPage = "https://www.royalroad.com/account/login";
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
Object.defineProperty(exports, "__esModule", { value: true });
var request = require('request');
var cheerio = require('cheerio');
//Site, Object/Interface for websites and stuff
var website = /** @class */ (function () {
    function website() {
    }
    website.test1 = function () { return "inheritance works.<br/>\n"; };
    website.test2 = function () { return "overriding doesn't work.<br/>\n"; };
    website.test3 = function () { return "This is from the original Class...<br/>\n"; };
    website.test4 = function () { return this.test3(); };
    //Methods:
    //Initialize, sets up object
    //login, logins to site
    website.login = function () { return "success"; };
    //logout 
    website.prototype.logout = function () { return "success"; };
    //loadUpdateSettings, loads settings for when and what to update from file
    website.prototype.loadUpdateSettings = function () { return "success"; };
    //displayUpdateSettings, displays HTML form to change settings for site updates
    website.prototype.displayUpdateSettings = function () { return "success"; };
    //changeUpdateSettings, saves changed settings on file
    website.prototype.saveUpdateSettings = function () { return "success"; };
    //loadAccountDetails, gets username and password from encrypted file 
    website.prototype.loadAccountDetails = function () { return "success"; };
    //changeAccountDetails saves username and password in encrypted file 
    website.prototype.changeAccountDetails = function () { return "success"; };
    //formatChapter, transforms chapter into acceptable format for site.  
    website.prototype.formatChapter = function () { return "success"; };
    //getPublishedChapters, gets list of already published chapters
    website.prototype.getPublishedChapters = function () { return "success"; };
    //getUnpublishedChapters, gets list of yet-to-be-published chapters on site
    website.prototype.getUnublishedChapters = function () { return "success"; };
    //publishChapterOnDate (Date, chapter)
    website.prototype.publishChapterOnDate = function () { return "success"; };
    //publishBatchOnDate (Date, chapter1, chapter2...), batch function calls publishChapterOnDate
    website.prototype.publishBatchOnDate = function () { return "success"; };
    //batchRename, replaces chapter
    website.prototype.batchRename = function () { return "success"; };
    //run, logs in, uploads chapters according to settings, 
    //double-checks that every chapter that should be uploaded IS uploaded, logs out
    website.prototype.run = function () { return "success"; };
    return website;
}());
//Object RRL, inherits from Site
var RRL = /** @class */ (function (_super) {
    __extends(RRL, _super);
    function RRL() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RRL.test = function () { return this.test1() + this.test2() + this.test3() + _super.test3.call(this) + this.test4(); };
    RRL.test2 = function () { return "overwriting works.<br/>\n"; };
    RRL.test3 = function () { return "This is from the extended Class...<br/>\n"; };
    //Visit login page and get their token
    RRL.getToken = function () {
        let error; 
        let response;
        let html;
        const loginPage = "https://www.royalroad.com/account/login"; 
        request(loginPage, function (error, response, html) {
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
    //login
    RRL.login = function () {
        const actionPage = "https://www.royalroad.com/account/externallogin?returnUrl=https%3A%2F%2Fwww.royalroad.com%2Fhome"
        var token = this.getToken();
        var formData = {
            //key-value pairs
            Email: '',
            Password: '',
            Renember: "false",
            __RequestVerificationToken: token
        };
        request.post({ url: actionPage, formData: formData }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('Upload successful!  Server responded with:', body);
            return body;
        });
        return "Success";
    };
    RRL.loadUpdateSettings = function () {
        this.chaptersPerUpdate = 7;
    };
    //displayUpdateSettings, displays HTML form to change settings for site updates
    RRL.displayUpdateSettings = function () {
        this.loadUpdateSettings();
        return "\n          Updates on <input name=\"time\" type=\"time\"/>\n          Daily update\n          Weekly update on <select name=\"weekday\">\n          <option value=\"monday\">monday</option>\n          <option value=\"tuesday\">tuesday</option>\n          <option value=\"wednesday\">wednesday</option>\n          <option value=\"thursday\">thursday</option>\n          <option value=\"friday\">friday</option>\n          <option value=\"saturday\">saturday</option>\n          <option value=\"sunday\">sunday</option>\n          Number of chapters per update: \n        </select>\n          ";
    };
    return RRL;
}(website));
//var RRL = new website(); 
//RRL.test2 = function(){return "overwriting doesn't work"};
//Object Patreon, inherits from website 
//Objecd Discord, inherits from website
//Object Google Docs, inherits from website
//
//$('test2').innerHTML=RRL.test(); 
//# sourceMappingURL=library.js.map


/*
request(loginPage, function (error, response, html) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(html);
    var input = $('input');
    var token = $('#__RequestVerificationToken');

    console.log(html);
    console.log(token.attr());
    input.each(function(i,element){
        //element.attribs
        console.log("field "+element.attribs['name']+": "+element.attribs['value']);
        if (element.attribs['name']=="__RequestVerificationToken"){ console.log("token is "+element.attribs['value'])}
        });
    }
    });
*/

const token = RRL.getToken();

const html = RRL.login(); 

/*
const { BrowserWindow } = require('electron');
let win = new BrowserWindow({ width: 800, height: 600 });
win.loadURL('http://localhost:8000/post', {
    postData: [{
    type: 'rawData',
    bytes: Buffer.from('hello=world')
  }],
  extraHeaders: 'Content-Type: application/x-www-form-urlencoded'
})


    win.loadURL('http://github.com')
    
    const ses = win.webContents.session
    console.log(ses.getUserAgent())    
*/
