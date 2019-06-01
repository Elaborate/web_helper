// // --------------------------------------------------------------
// // ------------------       CHAPTERS-ON-DISK FORM        --------
// // --------------------------------------------------------------

// const localChapters = new form("RRL_LocalChapters");
// localChapters.legend = "Chapters on Computer";
// localChapters.website = RRL;
// localChapters.mainHTML = function(): string {
//   console.log(`mainHTML()`);
//   // this.loadData();
//   console.log("Looking at chapters: ", JSON.stringify(this.chapters));
//   const chapters = this.parameters.chapters;
//   const fictions = form.RRL_UpdateSettings.parameters.fictions;
//   // const fictions = form["RRL_UpdateSettings"].parameters.fictions;
//   if (typeof chapters === "undefined") {
//     return "Bad Folder Address";
//   }

//   // Return unordered list of chapters
//   let ret = "";
//   Object.keys(chapters).forEach((chap: any) => {
//     const chapter = chapters[chap];
//     const fictionID = chapter.fictionID || undefined;
//     const pattern = fictions[fictionID.pattern];
//     const path = chapter.filepath || "unknown";
//     const name = chapter.title || chapter.filename;
//     ret += `<li>${name}<button id='${path}' onclick="changeValue(this, 'chapterPath', '${path}'); changeOrder(this,'release');">schedule</button></li>`;
//   });
//   return `<ul>\n${ret}\n</ul>
//     <input type=hidden name=order value="release"/>
//     <input type=hidden name=chapterPath value="0"/>
//     <input type=submit value="Refresh local file list" onclick="changeOrder(this,'loadData');"/>
//     `;
// };

// // ------------------------------------------------------------------------------
// // For every fiction, look through its folder for chapters matching its pattern.
// localChapters.loadData = function() {
//   this.init();
//   console.log(`%c${this.formName} called loadData()`, "color: blue;");
//   // get list of fictions.
//   // const fictions = form["RRL_UpdateSettings"].parameters["fictions"];
//   const fictions = form.RRL_UpdateSettings.parameters.fictions;
//   if (fictions === undefined) {
//     console.log(`found no fictions in RRL_UpdateSettings.`);
//     return;
//   }
//   // For every fiction, load chapters recognized by pattern into local memory.
//   const fs = require("fs");
//   const ret: any = {};
//   Object.keys(fictions).forEach(function(novelID) {
//     const dirName = fictions[novelID].folder;
//     if (dirName === undefined) {
//       return;
//     }
//     let res;
//     // try { res = await RRL.readDirectory(dirName) }
//     try {
//       res = fs.readdirSync(dirName);
//     } catch (e) {
//       console.log("error: ", e.message);
//     }
//     console.log(`found chapters: ${JSON.stringify(res)}`);
//     for (const chap in res) {
//       if (res.hasOwnProperty(chap)) {
//         const chapter: string = res[chap];
//         ret[chapter] = {};
//         ret[chapter].fictionID = novelID;
//         ret[chapter].filename = chapter;
//         ret[chapter].filepath = dirName + "/" + chapter;
//         ret[chapter].title = chapter.replace(/\..../, "");
//       }
//     }
//   });
//   // this_form.parameters.chapters = ret;
//   console.log(`final result: ${JSON.stringify(ret)}`);
//   this.saveSettingsToFile();
//   return ret;
// };

// // Adds a fictitious chapter and submits it as a draft.
// localChapters.testSubmit = function() {
//   console.log("called testSubmit");
//   const chapterPath = "test";
//   const fiction: any = {};
//   fiction.fictionID = 12147;
//   fiction.filename = "test";
//   fiction.filepath = "test";
//   fiction.title = "Lorem Ipsum Ch.5";
//   this.parameters.chapters[chapterPath] = fiction;
//   this.action(chapterPath);
//   // this.parameters.chapters[chapterPath]=null;
// };

// localChapters.release = function(args: any) {
//   console.log(`${this.formName} called loadData()`);
//   this.action(args.chapterPath);
// };

// localChapters.action = function(
//   chapterPath: string = "",
//   status: string = "New"
// ) {
//   console.log(
//     `%c${this.formName} called action('${chapterPath}')`,
//     "color: blue;"
//   );
//   if (!chapterPath) {
//     alert("invalid filepath: " + chapterPath);
//     return;
//   }
//   let chapter;
//   for (const c in this.parameters.chapters) {
//     if (this.parameters.chapters.hasOwnProperty(c)) {
//       const chap = this.parameters.chapters[c];
//       if (chap.filepath === chapterPath) {
//         chapter = chap;
//         break;
//       } else {
//         console.log(`No match! Compared:\n${chapterPath}\n${chap.filepath}`);
//       }
//     }
//   }
//   if (!chapter) {
//     console.log("could not find chapter with filepath: '" + chapterPath + "'");
//   }
//   // console.log("chapter found: ");
//   // const chapter=this.parameters.chapters[ChapterName]; //FIX

//   // Preparing submission parameters
//   const fictionID = chapter.fictionID;
//   // const fiction = form["RRL_UpdateSettings"].parameters.fictions[fictionID];
//   const fiction = form.RRL_UpdateSettings.parameters.fictions[fictionID];
//   const pre = chapter.pre || fiction.pre || "";
//   const post = chapter.post || fiction.post || "";
//   const date = chapter.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
//   const formattedDate = dateformat(date, "yyyy-mm-dd hh:MM");
//   const timezone = "-120"; // FIX
//   const address =
//     "https://deployment.royalroad.com/fiction/chapter/new/" + fictionID;
//   const title = chapter.title || chapter.filename || "title";
//   const testText = "abcd ".repeat(101); // Just using a simple test text for now
//   const fs = require("fs");
//   let qs = {};

//   // Reading in chapter text
//   /*
//     fs.readFile(chapterPath, 'utf8', function (err, chapterText) {
//       if (err) return console.log(err);
//       if (!chapterText) {alert("Could not find file: "+chapterPath); return;}
//       if (chapterText.length<500) {alert("Must be at least 500 characters: "+chapterPath); return;}

//       qs={
//         Status: status,
//         fid: fictionID,
//         Title: title,
//         PreAuthorNotes: pre,
//         Content: testText,//chapterText,
//         PostAuthorNotes: post,
//         ScheduledRelease: formattedDate,
//         timezone: timezone,
//         PollQuestion: "",
//         PollMultiple: 1,
//         action: "draft"
//         }
//         //Poll option parameters. Is this necessary?
//         qs["PollOptions[0].options"] = ""
//         qs["PollOptions[0].votes"] = 0;
//         qs["PollOptions[1].options"] = ""
//         qs["PollOptions[1].votes"] = 0;
//       });
//       */
//   qs = {
//     Status: status,
//     fid: fictionID,
//     Title: title,
//     PreAuthorNotes: pre,
//     Content: testText, // chapterText,
//     PostAuthorNotes: post,
//     ScheduledRelease: formattedDate,
//     timezone,
//     PollQuestion: "",
//     PollMultiple: 1,
//     action: "draft"
//   };
//   // Poll option parameters. Is this necessary?
//   // qs["PollOptions[0].options"] = "";
//   // qs["PollOptions[0].votes"] = 0;
//   // qs["PollOptions[1].options"] = "";
//   // qs["PollOptions[1].votes"] = 0;
//   RRL.load(address, qs, "POST").then(() => {
//     console.log("draft scheduled");
//   });
// };
