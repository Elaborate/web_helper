import { EipHop } from "eiphop";
import * as cheerio from "cheerio";

import { SessionInfo } from "../utils/SessionInfo";
import { myRequest } from "../utils/myRequest";

export interface GetUserIdPayload {
  session: SessionInfo;
}

export interface GetUserIdResponse {
  userId: string;
}

async function getUserId(
  request: EipHop.RequestObject<GetUserIdPayload>,
  response: EipHop.ResponseObject<GetUserIdResponse, any>
): Promise<void> {
  try {
    const { cookie } = request.payload.session;
    const options = {
      method: "GET",
      uri: "/home",
      headers: {
        cookie
      }
    };

    const res = await myRequest(options);

    const $ = cheerio.load(res, { xmlMode: false });

    // Positive Lookbehind Regular Expression.  Thank you Regex101
    const reg = /(?<=window.userId\s=\s)\d\d\d\d\d/gm;
    const matches = reg.exec(res);
    if (!!matches) {
      response.send({ userId: matches[0] });
    }
  } catch (err) {
    response.error({ msg: `Error: ${JSON.stringify(err, null, 2)}` });
  }
}

const getUserIdAction: EipHop.Action = getUserId;
export const getUserIdCall = getUserId.name;
export default {
  action: getUserIdAction,
  apiName: getUserIdCall
};
