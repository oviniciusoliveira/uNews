import { query as q } from "faunadb";
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { faunaClient } from "../../../services/fauna";

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "user:email",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const { email } = user;

      try {
        await faunaClient.query(
          q.Let(
            {
              match: q.Match(q.Index("user_by_email"), q.Casefold(email)),
            },
            q.If(
              q.Exists(q.Var("match")),
              q.Get(q.Var("match")),
              q.Create(q.Collection("users"), { data: { email } })
            )
          )
        );
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
});
