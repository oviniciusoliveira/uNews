import { Client } from "faunadb";

export const client = new Client({
  secret: process.env.FAUNADB_KEY,
  domain: "db.fauna.com",
  port: 443,
  scheme: "https",
});
