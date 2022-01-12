import Prismic from "@prismicio/client";
import { apiEndpoint, accessToken } from "../config/prismic";

export const PrismicClient = (req = null) => {
  return Prismic.client(apiEndpoint, { req, accessToken });
};
