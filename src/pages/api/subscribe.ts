import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../services/stripe";
import { getSession } from "next-auth/react";
import { faunaClient } from "../../services/fauna";
import { query as q } from "faunadb";

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
    return;
  }

  const session = await getSession({ req });

  const user = await faunaClient.query<User>(
    q.Get(q.Match(q.Index("user_by_email"), q.Casefold(session.user.email)))
  );

  let customerId = user.data.stripe_customer_id;

  if (!customerId) {
    const stripeCustomer = await stripe.customers.create({
      email: session.user.email,
    });
    await faunaClient.query(
      q.Update(q.Ref(q.Collection("users"), user.ref.id), {
        data: {
          stripe_customer_id: stripeCustomer.id,
        },
      })
    );
    customerId = stripeCustomer.id;
  }

  const stripeCheckoutSession = stripe.checkout.sessions;
  const stripeCheckoutSessionResponse = await stripeCheckoutSession.create({
    mode: "subscription",
    payment_method_types: ["card"],
    billing_address_collection: "required",
    line_items: [
      {
        price: "price_1KF142J3DdVlGVY5KArfIqwy",
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    customer: customerId,
    success_url: process.env.STRIPE_SUCCESS_URL,
    cancel_url: process.env.STRIPE_CANCEL_URL,
  });

  return res.status(200).json({ sessionId: stripeCheckoutSessionResponse.id });
}
