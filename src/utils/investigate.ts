//--------------------------------------------------------------
//--------------------------------------------------------------
//Debugging function
export function investigate(
  obj,
  space = 0,
  path = obj,
  parent = null,
  grandparent = null
) {
  console.log("Investigating " + path);
  if (obj)
    Object.keys(obj).forEach(function(k, i) {
      try {
        const type = typeof obj[k];
        const recursive =
          k == "parent" ||
          k == "next" ||
          k == "prev" ||
          obj[k] == obj ||
          obj[k] == parent ||
          obj[k] == grandparent;
        if (!recursive && space < 5 && type == "object")
          investigate(obj[k], space + 1, path + "/" + k, obj, parent);
        else if (type == "function")
          console.log(`${"  ".repeat(space)} ${k}(${type})`);
        else console.log(`${"  ".repeat(space)} ${k}(${type}): ${obj[k]}`);
      } catch {
        console.log(k + " not viewable");
      }
    });
}

//MOST UP TO DATE???
//--------------------------------------------------------------
//--------------------------------------------------------------
//Debugging function
export function investigate2(
  obj,
  space = 0,
  path = obj,
  parent = null,
  grandparent = null
) {
  let main = ipcRenderer === undefined;
  if (main) console.log(`Investigating ${path}`);
  else console.log(`%cInvestigating ${path}`, "color: #773");
  if (obj)
    Object.keys(obj).forEach(function(k, i) {
      try {
        const type = typeof obj[k];
        const recursive =
          k == "parent" ||
          k == "next" ||
          k == "prev" ||
          obj[k] == obj ||
          obj[k] == parent ||
          obj[k] == grandparent;
        if (!recursive && space < 5 && type == "object")
          investigate(obj[k], space + 1, path + "/" + k, obj, parent);
        else if (type == "function") {
          if (main) console.log(`${"  ".repeat(space)} ${k}(${type})`);
          else
            console.log(`%c${"  ".repeat(space)} ${k}(${type})`, "color: #773");
        } else {
          if (main)
            console.log(`${"  ".repeat(space)} ${k}(${type}): ${obj[k]}`);
          else
            console.log(
              `%c${"  ".repeat(space)} ${k}(${type}): ${obj[k]}`,
              "color: #773"
            );
        }
      } catch {
        console.log(k + " not viewable");
      }
    });
}

//--------------------------------------------------------------
//--------------------------------------------------------------
//Debugging function
export function investigate3(
  obj,
  space = 0,
  path = obj,
  parent = null,
  grandparent = null
) {
  let main = ipcRenderer === undefined;
  if (main) console.log(`Investigating ${path}`);
  else console.log(`%cInvestigating ${path}`, "color: #773");
  if (obj)
    Object.keys(obj).forEach(function(k, i) {
      try {
        const type = typeof obj[k];
        const recursive =
          k == "parent" ||
          k == "next" ||
          k == "prev" ||
          obj[k] == obj ||
          obj[k] == parent ||
          obj[k] == grandparent;
        if (!recursive && space < 5 && type == "object")
          investigate(obj[k], space + 1, path + "/" + k, obj, parent);
        else if (type == "function") {
          if (main) console.log(`${"  ".repeat(space)} ${k}(${type})`);
          else
            console.log(`%c${"  ".repeat(space)} ${k}(${type})`, "color: #773");
        } else {
          if (main)
            console.log(`${"  ".repeat(space)} ${k}(${type}): ${obj[k]}`);
          else
            console.log(
              `%c${"  ".repeat(space)} ${k}(${type}): ${obj[k]}`,
              "color: #773"
            );
        }
      } catch {
        console.log(k + " not viewable");
      }
    });
}
