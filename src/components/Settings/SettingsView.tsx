// // --------------------------------------------------------------
// // ------------------       RRL UPDATE SETTINGS FORM       ------
// // --------------------------------------------------------------

// // This form is the most changed from the baseline,
// // Because I needed to accommodate the possibility of multiple fictions.
// const settings = new form("RRL_UpdateSettings");
// settings.legend = "Update Settings";
// settings.website = RRL;
// settings.mainHTML = (id: any): string => {
//   console.log(`Called settings.mainHTML('${id}')`);
//   if (id === undefined) {
//     return "";
//   }
//   // if (this.parameters === undefined) { return "error, undefined parameters"; }
//   // if (this.parameters.fictions === undefined) { this.parameters.fictions = {}; }
//   // if (this.parameters.fictions[id] === undefined) { return "error for " + id; }
//   // const fiction = this.parameters.fictions[id];
//   // const formName = "settings_RRL_" + fiction.ID;
//   // console.log("displaying form: " + formName);
//   // try {
//   //   ipcRenderer.on(`${formName}`, () => {
//   //     console.log("ipcRenderer got form request: " + formName);
//   //   });
//   // } catch {
//   //   ipcMain.on(`${formName}`, () => {
//   //     console.log("ipcRenderer got form request: " + formName);
//   //   });
//   // }
//   // const title = fiction.title || "";
//   // const folder = fiction.folder || "";
//   // const pattern = fiction.pattern || "";
//   // const number = fiction.number || 1;
//   // const time = fiction.time || "00:00";
//   // const ID = fiction.ID || "undefined";
//   // return `
//   //       <input type=hidden name=order value="saveSettings"/>
//   //       <input type=hidden name=ID value="${ID}"/>
//   //       Fiction name: <input name=title value="${title}"/><br/>
//   //       Fiction ID: ${ID}<br/>
//   //       Folder path: <input name=folder value="${folder}"/><br/>
//   //       Chapter Title Pattern: <input name=pattern value="${pattern}"/><br/>
//   //       Release on <input name="time" type="time" value="${time}"/><br/>
//   //       Daily update<br/>
//   //       Weekday updates on <select name="weekday">
//   //         <option value="monday">monday</option>
//   //         <option value="tuesday">tuesday</option>
//   //         <option value="wednesday">wednesday</option>
//   //         <option value="thursday">thursday</option>
//   //         <option value="friday">friday</option>
//   //         <option value="saturday">saturday</option>
//   //         <option value="sunday">sunday</option>
//   //       </select>
//   //       Number of chapters per update: <input name=number value="${number}"/>
//   //       <input type=submit value="Apply Release Settings"/>
//   //     `;
// };
// // -----------------------------------------------------
// // Display form for a single fiction
// settings.mainHTML = function(id): string {
//   // console.log(`Called settings.mainHTML('${id}')`);
//   // if (id === undefined) { return ""; }
//   // if (this.parameters === undefined) { return "error, undefined parameters"; }
//   // if (this.parameters.fictions === undefined) { this.parameters.fictions = {}; }
//   // if (this.parameters.fictions[id] === undefined) { return "error for " + id; }
//   // const fiction = this.parameters.fictions[id];
//   // let formName = "settings_RRL_" + fiction.ID;
//   // console.log("displaying form: " + formName);
//   // try {
//   //   ipcRenderer.on("${formName}", function() {
//   //     console.log("ipcRenderer got form request: " + formName);
//   //   });
//   // } catch {
//   //   ipcMain.on("${formName}", function() {
//   //     console.log("ipcRenderer got form request: " + formName);
//   //   });
//   // }
//   // const title = fiction.title || "";
//   // const folder = fiction.folder || "";
//   // const pattern = fiction.pattern || "";
//   // const number = fiction.number || 1;
//   // const time = fiction.time || "00:00";
//   // const ID = fiction.ID || "undefined";
//   // return `
//   //       <input type=hidden name=order value="saveSettings"/>
//   //       <input type=hidden name=ID value="${ID}"/>
//   //       Fiction name: <input name=title value="${title}"/><br/>
//   //       Fiction ID: ${ID}<br/>
//   //       Folder path: <input name=folder value="${folder}"/><br/>
//   //       Chapter Title Pattern: <input name=pattern value="${pattern}"/><br/>
//   //       Release on <input name="time" type="time" value="${time}"/><br/>
//   //       Daily update<br/>
//   //       Weekday updates on <select name="weekday">
//   //         <option value="monday">monday</option>
//   //         <option value="tuesday">tuesday</option>
//   //         <option value="wednesday">wednesday</option>
//   //         <option value="thursday">thursday</option>
//   //         <option value="friday">friday</option>
//   //         <option value="saturday">saturday</option>
//   //         <option value="sunday">sunday</option>
//   //       </select>
//   //       Number of chapters per update: <input name=number value="${number}"/>
//   //       <input type=submit value="Apply Release Settings"/>
//   //     `;
// };

// // -----------------------------------------------------
// // Modified compose(), which is usually the same for every form,
// // because a separate form will be needed for each fiction.
// settings.compose = function(): string {
//   // console.log(`Called settings.compose()`);
//   // this.init();
//   // const this_form = this;
//   // const siteName = this.siteName;
//   // const fictions = this.parameters["fictions"];
//   // let fictionsNr = 0;
//   // if (fictions) { fictionsNr = Object.keys(fictions).length; }
//   // console.log("# of fictions: " + fictionsNr);
//   // // Make dropdown to choose between different forms. UNFINISHED
//   // let title_choices = "";
//   // if (fictionsNr > 1) {
//   //   title_choices = "<select name=fic_title>";
//   //   Object.keys(fictions).forEach(function(id) {
//   //     const fic = fictions[id];
//   //     title_choices += `<option value="${fic.title}">${fic.title}</option>`;
//   //   });
//   //   title_choices += "</select>";
//   // }
//   // let html = title_choices;
//   // // Compose html for all titles
//   // if (fictionsNr > 0) {
//   //   Object.keys(fictions).forEach(function(id) {
//   //     html += `
//   //     <form id=${this_form.formName +
//   //       "_" +
//   //       id} onSubmit="JavaScript:sendForm(event, '${this_form.formName +
//   //       "_" +
//   //       id}')">
//   //       <fieldset>
//   //         <legend>${this_form.legend}</legend>
//   //         <input type=hidden name=form value="${this_form.formName}"/>
//   //           ${this_form.mainHTML(id)}
//   //       </fieldset>
//   //     </form>
//   //     `;
//   //   });
//   // }
//   // // Add a button for updating list of RRL fictions
//   // html += `
//   //   <form id="add_fiction" onSubmit="JavaScript:sendForm(event, 'add_fiction')">
//   //     <fieldset>
//   //       <legend>Add new fiction</legend>
//   //       <input type=hidden name=order value="loadData"/>
//   //       <input type=hidden name=form value="RRL_UpdateSettings"/>
//   //       <button type=submit order="loadData" value="loadData" onclick="changeOrder(this);">Synchronize with RRL fictions</button>
//   //     </fieldset>
//   //   </form>
//   //   `;
//   // return html;
// };

// // -----------------------------------------------------
// // Load all of user's fiction IDs from RRL.
// settings.loadData = function(): void {
//   // console.log(`${this.formName} (settings) called loadData()%s`);
//   // if (ipcMain === undefined) { console.log(`Not in main`); }
//   // if (ipcRenderer === undefined) { console.log(`Not in renderer`); }
//   // const fictionsList = this.parameters.fictions || {};
//   // const this_thing = this;
//   // // Load RRL Fictions page
//   // const address = RRL.allFictionsPage;
//   // RRL.load(address).then(function(response, this_form = this_thing) {
//   //   // Extracting fiction IDs from fictions page
//   //   console.log("got fics");
//   //   const cheerio = require("cheerio");
//   //   const $ = cheerio.load(response);
//   //   const links = $("a");
//   //   console.log("loaded links list: " + links.html());
//   //   let result = [];
//   //   const query = "/fiction/chapter/new";
//   //   links.each(function(i, el) {
//   //     // Searching links for the query pattern.
//   //     const element = $(this);
//   //     console.log("examining field " + i + ": " + element.attr("href"));
//   //     if (element.attr("href") && element.attr("href").includes(query)) {
//   //       console.log("fiction: " + element.attr("href"));
//   //       result.push(
//   //         element
//   //           .attr("href")
//   //           .split("/")
//   //           .slice(-1)[0]
//   //       );
//   //     }
//   //   });
//   //   // Entering fiction IDs into local memory
//   //   // Also Removing deleted fictions from local memory
//   //   const newList = {};
//   //   result.forEach(function(id) {
//   //     newList[id] = {};
//   //     if (fictionsList[id]) {
//   //       console.log("fiction " + id + " is still there.");
//   //       newList[id] = fictionsList[id];
//   //     } else {
//   //       console.log("adding fiction " + id);
//   //       newList[id]["ID"] = id; // For convenience, I want the fiction to contain its own ID
//   //     }
//   //   });
//   //   this_form.parameters.fictions = newList;
//   //   // Save to disk
//   //   this_form.saveSettingsToFile();
//   //   // Update updateSettings form with new values.
//   //   this_form.display();
//   // });
// };

// // -----------------------------------------------------
// // Changing saveSettings to accommodate multiple fictions
// settings.saveSettings = function(args): void {
//   // console.log(`${this.legend} called custom saveSettings()`);
//   // // Just add entries to local parameter object. There's probably a function for this.
//   // const id = args["ID"];
//   // if (this.parameters === undefined) { this.parameters = {}; }
//   // if (this.parameters.fictions === undefined) { this.parameters.fictions = {}; }
//   // if (this.parameters.fictions[id] === undefined) {
//   //   this.parameters.fictions[id] = {};
//   // }
//   // for (const key in args) {
//   //   if (key == "order" || key == "form") { continue; }
//   //   this.parameters.fictions[id][key] = args[key];
//   // }
//   // // Save copy of parameters in website class
//   // this.website.saveSettings();
//   // // Save local parameters to disk.
//   // this.saveSettingsToFile();
// };
