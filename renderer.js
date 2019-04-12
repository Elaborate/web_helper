/* //Fount this on stackoverflow
function serialize(form, evt){
    var evt    = evt || window.event;
    evt.target = evt.target || evt.srcElement || null;
    var field, query='';
    if(typeof form == 'object' && form.nodeName == "FORM"){
        for(i=form.elements.length-1; i>=0; i--){
            field = form.elements[i];
            if(field.name && field.type != 'file' && field.type != 'reset'){
                if(field.type == 'select-multiple'){
                    for(j=form.elements[i].options.length-1; j>=0; j--){
                        if(field.options[j].selected){
                            query += '&' + field.name + "=" + encodeURIComponent(field.options[j].value).replace(/%20/g,'+');
                        }
                    }
                }
                else{
                    if((field.type != 'submit' && field.type != 'button') || evt.target == field){
                        if((field.type != 'checkbox' && field.type != 'radio') || field.checked){
                            query += '&' + field.name + "=" + encodeURIComponent(field.value).replace(/%20/g,'+');
                        }   
                    }
                }
            }
        }
    }
    return query.substr(1);
}
*/

function serialize(form){
    var field, query='';
    if(!(typeof form == 'object' && form.nodeName == "FORM")) return;
    for(i=form.elements.length-1; i>=0; i--){
        field = form.elements[i];
        if(!(field.name && field.type != 'file' && field.type != 'reset')) continue;
        if(!(field.type != 'submit' && field.type != 'button') ) continue; 
        if(field.type == 'select-multiple'){
            for(j=form.elements[i].options.length-1; j>=0; j--){
                if(field.options[j].selected){
                    query += '&' + field.name + "=" + encodeURIComponent(field.options[j].value).replace(/%20/g,'+');
                }
            }
        }
        else{
            if((field.type != 'checkbox' && field.type != 'radio') || field.checked){
                query += '&' + field.name + "=" + encodeURIComponent(field.value).replace(/%20/g,'+');
            }   
        }
    }
    return query.substr(1);
}

function updateHTML(el){   
    for(i=el.elements.length-1; i>=0; i--){
        //*
        const field = el.elements[i];
        if (el == field) continue;
        if(field.type=='checkbox' || field.type=='radio') field.defaultChecked=field.checked;
        else if (field.nodeName.toUpperCase()=="OPTION") field.defaultSelected = field.selected;
        if (typeof field.value == 'undefined') continue;
        console.log(`${field.name}: ${field.value}`);
        field.defaultValue = field.value;
        //*/    
        }    
    }

const ipcRenderer = require('electron').ipcRenderer;
const {remote} = require('electron')
const ipcMain = remote.ipcMain;
const main_RRL = remote.require("./library.js")
const RRL = require('./library.js');
//const ipcMain = require('electron').remote;
function sendForm(event, formName) {
    event.preventDefault() // stop the form from submitting
    //alert("form sent: "+formName)
    let form="";
    try{
        console.log(`Found form with id='${formName}'`);
        //form = document.getElementById(formName);
        //updateHTML(form);
        form = serialize(document.getElementById(formName));
        console.log(`Sending form: ${formName} '${form.toString()}'`);
        }
    catch(e){alert(`no form with id='${formName}', error: ${e.message}`);}
    //ipcRenderer.send(formName, form);
    //ipcMain.send(formName, form);
    //RRL.message(formName, form);
    main_RRL.message(formName, form);
    console.log(`Sent form.`);
    //ipcMain.send(formName, form);
}