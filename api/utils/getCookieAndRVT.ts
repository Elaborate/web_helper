import { SessionInfo } from "./SessionInfo";
import { myRequest } from "./myRequest";
import * as cheerio from "cheerio";

export async function getCookieAndRVT(): Promise<SessionInfo> | undefined {
  const options = {
    method: "GET",
    uri: "/account/betalogin",
    resolveWithFullResponse: true
  };

  const res = await myRequest(options);
  const cookie = res.headers["set-cookie"];
  const rvtName: string = "__RequestVerificationToken";
  const $ = cheerio.load(res.body);
  const rvt = $(`input[name=${rvtName}]`).val();

  return {
    rvt,
    cookie
  };
}
