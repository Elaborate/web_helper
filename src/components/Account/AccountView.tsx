// // --------------------------------------------------------------
// // ------------------       RRL ACCOUNT FORM     ----------------
// // --------------------------------------------------------------

// const accounts = new Form("RRL_account");
// accounts.legend = "Account Information";
// accounts.website = RRL;

// accounts.mainHTML = function(): string {
//   console.log("called mainHTML()");
//   this.init();
//   const username = this.parameters.username || "";
//   const password = this.parameters.password || "";
//   return `
//         <input type=hidden name=order value="saveSettings"/>
//         <input name=username placeholder=email value="${username}"/><br/>
//         <input type=password placeholder=password name=password value="${password}"/><br/>
//         <button type=submit value=saveSettings>Change Account Data</button>
//      `;
// };

// // Add a line to saveSettingsToFile() so it also saves to accounts.json
// accounts._saveSettingsToFile = accounts.saveSettingsToFile;
// accounts.saveSettingsToFile = function() {
//   this._saveSettingsToFile();
//   RRL._changeAccountDetails(
//     this.website.siteName,
//     this.parameters.username,
//     this.parameters.password
//   );
// };
