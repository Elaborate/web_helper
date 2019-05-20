let main_form;
let main_RRL;
let ipcRenderer;

try{
    ipcRenderer = require('electron').ipcRenderer;
    const {remote} = require('electron')
    //const ipcMain = remote.ipcMain;
    main_RRL = remote.require("./website.js")
    main_form = remote.require("./form_instances.js")    
}
catch(err) {
    console.log("Renderer assignment did not work: "+err.message)
    console.log("Assuming main.")
    main_RRL = require("./website.js")
    main_form = require("./form_instances.js")  
}
//const {RRL,form} = require('./forms_non-static.js');
//const ipcMain = require('electron').remote;


//-------------------------------------------------------------------
//Found this on stackoverflow, by TibTibs
//Edited because I hate excessive nesting, and also didn't need events. 
//This function goes through a form and converts the inputs into a string. 
function serialize(form){ 
    var field, query='';
    if(!(typeof form == 'object' && form.nodeName == "FORM")) return "Not a form, but a "+ form.nodeName;
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

//-------------------------------------------------------------------
//This function is used in forms with two or more submit buttons, 
//to change the value of the hidden "order" input before serialize() activates. 
//There's probably s a better way of doing this. 
//It annoys me that I have to add an "onclick:changeOrder(this)" to each such button. 
function changeOrder(el){
    //investigate(el);
    const name = el.name || el.id || el.type || "undefined"
    const order = el.order || el.value; 
    console.log("changeOrder() called by node: '"+el.name+"' with new order: "+order);
    node = el.parentNode.firstChild;
    while (node && !!node){
        //console.log("searching node: '"+node.name+"'");
        if (node.name=="order") {
            node.setAttribute("value", order);
            return;
            }
        node = node.nextElementSibling || node.nextSibling;
        }
    }



//-------------------------------------------------------------------
//When a form is submitted, this function is activated 
//and sends the form data to the proper destination. 
function sendForm(event, formName) {
    event.preventDefault() // stop the form from submitting
    //alert("form sent: "+formName)
    try{
        const target = document.getElementById(formName);
        if (target) console.log(`Found form with id='${formName}', innerHTML:${target.innerHTML}`);
        const formData = serialize(target);
        console.log(`Sending form: ${formName} '${formData}'`);
        main_form.message(formName, formData);
        //main_RRL.message(formName, formData);
        }
    catch(e){alert(`no form with id='${formName}', error: ${e.message}`);}
    console.log(`Sent form.`);
    }