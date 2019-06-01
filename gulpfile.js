"use strict";

const gulp = require("gulp");
const electron = require("electron-connect").server.create({
  stopOnClose: true
  // logLevel: 2
});

const callback = function(electronProcState) {
  console.log("electron process state: " + electronProcState);
  if (electronProcState == "stopped") {
    process.exit();
  }
};

gulp.task("serve", done => {
  // Start main process
  electron.start(callback);

  // Restart main process
  gulp.watch("./dist/main.js", gulp.series(["reload:main"]));

  // Reload renderer process
  gulp.watch(
    ["./dist/renderer.js", "./dist/index.html"],
    gulp.series(["reload:renderer"])
  );

  done();
});

gulp.task("reload:main", done => {
  // Restart main process
  electron.restart(callback);
  done();
});

gulp.task("reload:renderer", done => {
  // Reload renderer process
  electron.reload(callback);
  done();
});

// function restart(done) {
//   electron.restart("--enable-logging", function(state) {
//     if (state === "restarted" || state === "restarting") {
//       done(null);
//     } else {
//       done(
//         "Unexpected state while restarting electron-connect server. State " +
//           state
//       );
//     }
//   });
// }

// function reload(done) {
//   electron.reload(callback);
//   done(null);
// }
