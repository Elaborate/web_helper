import * as request from "request-promise";

const baseUrl = "https://deployment.royalroad.com";

export const myRequest: request.RequestPromiseAPI = request.defaults({
  baseUrl
});
