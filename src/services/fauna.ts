import { Client } from "faunadb";

export const faunaClient = new Client({
  secret: process.env.FAUNADB_KEY,
  domain: "db.fauna.com",
  port: 443,
  scheme: "https",
});
