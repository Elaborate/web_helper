import { EipHop } from "eiphop";
import login from "./actions/loginAction";
import getUserId from "./actions/getUserIdAction";

// Unfortunately this list has to be maintained
// and updated by hand each time a new action is created.

// Dynamic imports are in proposal and a babel plugin
// could allow for this list to be populated automatically
// from directory contents,  BUT it would likely play
// havoc with the build tooling(caching, tree shaking, etc).

// The same likely goes for dynamic commonjs require().
const actions: EipHop.Actions = {
  [login.apiName]: login.action,
  [getUserId.apiName]: getUserId.action
};

export default actions;
