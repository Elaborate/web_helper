import { EipHop } from "eiphop";

import * as SessionInfo from "../utils/SessionInfo";
import { myRequest } from "../utils/myRequest";
import { getCookieAndRVT } from "../utils/getCookieAndRVT";

export interface LoginPayload {
  username: string;
  password: string;
}

// This "SessionInfo.SessionInfo" silliness
// is so I can have LoginResponse be a direct alias for
// SessionInfo w/o having, "using as value, but only
// refers to a type," issues.
// With a direct alias I avoid ugly double nesting like:
// "response.session.session"
export import LoginResponse = SessionInfo.SessionInfo;

async function login(
  request: EipHop.RequestObject<LoginPayload>,
  response: EipHop.ResponseObject<LoginResponse, any>
): Promise<void> {
  const { username, password } = request.payload;

  try {
    const session: SessionInfo.SessionInfo = await getCookieAndRVT();

    if (!session) {
      response.error({ msg: "Error: Failed to get Cookie and RVT." });
      return;
    }

    const options = {
      simple: false,
      method: "POST",
      uri: "/account/betalogin",
      form: {
        email: username,
        password,
        remember: "false",
        __RequestVerificationToken: session.rvt
      },
      headers: {
        cookie: session.cookie
      },
      resolveWithFullResponse: true
    };

    const res = await myRequest(options);
    session.cookie = res.headers["set-cookie"];
    response.send(session);
  } catch (err) {
    response.error({
      msg: `Error: ${JSON.stringify(err, null, 2)}`
    });
  }
}

const loginAction: EipHop.Action = login;

export const loginCall = login.name;
export default {
  action: loginAction,
  apiName: loginCall
};
