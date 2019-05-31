let main_form;
let main_RRL;
let ipcRenderer;

try {
  ipcRenderer = require("electron").ipcRenderer;
  const { remote } = require("electron");
  //const ipcMain = remote.ipcMain;
  main_RRL = remote.require("./website.js");
  main_form = remote.require("./form_instances.js");
} catch (err) {
  console.log("Renderer assignment did not work: " + err.message);
  console.log("Assuming main.");
  main_RRL = require("./website.js");
  main_form = require("./form_instances.js");
}
//const {RRL,form} = require('./forms_non-static.js');
//const ipcMain = require('electron').remote;

//-------------------------------------------------------------------
//Found this on stackoverflow, by TibTibs
//Edited because I hate excessive nesting, and also didn't need events.
//This function goes through a form and converts the inputs into a string.
function serialize(form) {
  var field,
    query = "";
  if (!(typeof form == "object" && form.nodeName == "FORM"))
    return "Not a form, but a " + form.nodeName;
  for (let i = form.elements.length - 1; i >= 0; i--) {
    field = form.elements[i];
    if (!(field.name && field.type != "file" && field.type != "reset"))
      continue;
    if (!(field.type != "submit" && field.type != "button")) continue;
    if (field.type == "select-multiple") {
      for (let j = form.elements[i].options.length - 1; j >= 0; j--) {
        if (field.options[j].selected) {
          query +=
            "&" +
            field.name +
            "=" +
            encodeURIComponent(field.options[j].value).replace(/%20/g, "+");
        }
      }
    } else {
      if (
        (field.type != "checkbox" && field.type != "radio") ||
        field.checked
      ) {
        query +=
          "&" +
          field.name +
          "=" +
          encodeURIComponent(field.value).replace(/%20/g, "+");
      }
    }
  }
  return query.substr(1);
}

//-------------------------------------------------------------------
//This function is used in forms with two or more submit buttons,
//to change the value of the hidden "order" input before serialize() activates.
//There's probably a better way of doing this stuff.
//It annoys me that I have to add an "onclick:changeOrder(this)" to each such button.
function changeOrder(el, ord = "") {
  let nodeName = el.name || el.id || el.type || "undefined";
  const order = ord || el.order || el.value;
  console.log(
    "changeOrder() called by node: '" + nodeName + "' with new order: " + order
  );
  const form = findTheForm(el);
  for (let i = form.elements.length - 1; i >= 0; i--) {
    const node = form.elements[i];
    nodeName = node.name || node.id || node.type || "undefined";
    console.log("searching node: '" + nodeName + "'");
    if (nodeName == "order") {
      console.log(
        "node: '" + nodeName + "' matches 'order', setting it to :" + order
      );
      node.setAttribute("value", order);
      return;
    }
  }
}

//Goes up through the DOM tree until it hits a form element.
function findTheForm(el) {
  if (!el) {
    console.log("error: findTheForm('" + el + "')!");
    return;
  }
  let name;
  while ((el = el.parentNode)) {
    name =
      el.nodeName ||
      el.tagName ||
      el.name ||
      el.type ||
      "cannot find node name";
    console.log("looking at '" + name + "'");
    if (name == "FORM" || name == "form") return el;
  }
  console.log("could not find form!");
  return;
}

//Version to change a value in a named form element.
//I really need to find a better way to do this.
function changeValue(el, name, val = 0) {
  let nodeName = el.name || el.id || el.type || "undefined node";
  const value = val || el.value;
  console.log(
    "changeValue() called by node: '" +
      nodeName +
      "' wanting to change '" +
      name +
      "' to new value: '" +
      value +
      "'"
  );

  const form = findTheForm(el);
  let node;
  for (let i = form.elements.length - 1; i >= 0; i--) {
    node = form.elements[i];
    nodeName = node.name || node.id || node.type || "undefined";
    console.log("searching node: '" + nodeName + "'");
    if (node.name == name) {
      console.log(
        "node: '" +
          nodeName +
          "' matches '" +
          name +
          "', setting it to :" +
          value
      );
      node.setAttribute("value", value);
      return;
    } else {
      console.log("node: '" + nodeName + "' is not a match for '" + name + "'");
    }
  }
  let nextName = "undefined node";
  if (node) nextName = node.name || node.id || "undefined name";
  console.log(
    "Exiting changeValue() at node:'" +
      nextName +
      "'without finding target node."
  );
}

//-------------------------------------------------------------------
//When a form is submitted, this function is activated
//and sends the form data to the proper destination.
function sendForm(event, formName) {
  event.preventDefault(); // stop the form from submitting
  main_form.log("test");
  //alert("form sent: "+formName);
  try {
    const target = document.getElementById(formName);
    if (target)
      console.log(
        `Found form with id='${formName}', innerHTML:${target.innerHTML}`
      );
    const formData = serialize(target);
    console.log(`Sending form: ${formName} '${formData}'`);
    main_form.message(formName, formData);
    //main_RRL.message(formName, formData);
  } catch (e) {
    alert(`no form with id='${formName}', error: ${e.message}`);
  }
  console.log(`Sent form.`);
}
