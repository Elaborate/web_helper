// // --------------------------------------------------------------
// // ------------------       SCHEDULED RELEASES FORM        ------
// // --------------------------------------------------------------

// const releases = new form("RRL_ScheduledReleases");
// releases.legend = "Scheduled Releases";
// releases.website = RRL;

// releases.mainHTML = function(): string {
//   console.log(`${this.legend} mainHTML()`);
//   this.init();
//   const formName = "releases";
//   const scheduledReleases = this.parameters.releases || {};
//   let schedule = "";
//   Object.keys(scheduledReleases).forEach((id: any, i: any) => {
//     const chapter = scheduledReleases[id];
//     const novelID = chapter.novelID;
//     let title = chapter.title;
//     try {
//       const fictions = form.RRL_UpdateSettings.parameters.fictions;
//       const pattern = fictions[novelID].pattern;
//       if (pattern) {
//         title = chapter["title"].replace(pattern, "");
//       }
//     } catch {
//       console.log("Couldn't load pattern for " + novelID);
//     }

//     // Convert timestamp into time to chapter release
//     const now = new Date().getTime();
//     const then = new Date(chapter.time).getTime();
//     const time = then - now;
//     const days = Math.floor(time / 1000 / 60 / 60 / 24);
//     const hours = Math.floor((time / 1000 / 60 / 60) % 24);
//     const minutes = Math.floor((time / 1000 / 60 / 24) % 60);
//     if (!!id) {
//       schedule += `
//         <li>${title} - ${days} days, ${hours} h, ${minutes} m</li>
//         `;
//     }
//   });
//   return `
//       <ul>${schedule}</ul>
//       <input type=hidden name=order value="loadData"/>
//       <input type=submit value="Download Releases"/>
//     `;
// };

// // -----------------------------------------------------
// // Load release schedule from RRL
// releases.loadData = function() {
//   this.init();
//   // const this_form = this;
//   const novelID = 12147;
//   console.log(`${this.formName} called loadData()`);
//   console.log("username: " + RRL.username + " pw: " + RRL.password);
//   const uri = RRL.fictionsPage + novelID;
//   RRL.load(uri).then((response: any) => {
//     try {
//       const $ = cheerio.load(response);
//       console.log(
//         "loaded site: " + typeof response + "length: " + response.length
//       );
//       const links = $("tr");
//       const result = {};
//       const query = "Unschedule";
//       links.each((i: any, element: any) => {
//         if (
//           $(links[i])
//             .text()
//             .includes(query)
//         ) {
//           const title = $($(links[i]).find("td")[0])
//             .text()
//             .trim();
//           const time = $(links[i])
//             .find("time")
//             .attr("datetime");
//           const id: any = $(links[i])
//             .find("form")
//             .attr("action")
//             .split("/")
//             .slice(-1)[0];
//           // result[id] = {};
//           // result[id]["novelID"] = novelID;
//           // result[id]["title"] = title;
//           // result[id]["time"] = time;
//           console.log("chapter '" + title + "' updates " + time + " id:" + id);
//         }
//       });
//       console.log(JSON.stringify(result));
//       // this_form.parameters["releases"] = result;
//       // this_form.saveSettingsToFile();
//       // this_form.display();
//       RRL.releases = result; // unnecessary
//       // console.log("finished loadData() for " + this_form.formName);
//       return result;
//     } catch (err) {
//       console.log("Error in release download: " + err.message);
//       console.log("Tried to load site: " + uri);
//       // console.log(JSON.stringify(err, null, 2));
//       return;
//     }
//   });
// };
