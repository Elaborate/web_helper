import * as React from "react";
import * as ReactDOM from "react-dom";

import * as electron from "electron";
import { setupFrontendListener } from "eiphop";

// import { App } from "./App";
import { SandboxView } from "./components/Sandbox/SandboxView";
import { LoginView } from "./components/Login/LoginView";

// listen to ipc responses
setupFrontendListener(electron);

ReactDOM.render(
  //  <App compiler="TypeScript" framework="React" />,
  <React.Fragment>
    <SandboxView />
    <hr />
    <LoginView />
  </React.Fragment>,
  document.getElementById("root")
);
