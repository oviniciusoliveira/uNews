import Prismic from "@prismicio/client";
import { apiEndpoint, accessToken } from "../../prismicConfiguration";

export const Client = (req = null) => {
  return Prismic.client(apiEndpoint, { req, accessToken });
};
