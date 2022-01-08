import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import {
  saveSubscription,
  updateSubscription,
} from "./_lib/manageSubscription";

async function buffer(readable: Readable) {
  let chunks = "";

  await new Promise((resolve) => {
    readable.on("data", (chunk) => {
      chunks += chunk;
    });
    readable.on("end", () => {
      resolve(Buffer.from(chunks).toString());
    });
  });

  return chunks;

  // const chunks = [];

  // for await (const chunk of readable) {
  //   chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  // }

  // return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
    return;
  }

  const bufferRequest = await buffer(req);

  const stripeWebhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET;

  const signature = req.headers["stripe-signature"];

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      bufferRequest,
      signature,
      stripeWebhookSecret
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (!relevantEvents.has(event.type)) {
    res.status(200).json({ received: true });
    return;
  }

  async function saveCustomerSubsbcription(subscription: Stripe.Subscription) {
    try {
      await saveSubscription(subscription.id, subscription.customer.toString());
    } catch (err) {
      console.error(`[saveCustomerSubsbcription]: ${err}`);
    }
  }

  async function updateCustomerSubscription(subscription: Stripe.Subscription) {
    try {
      await updateSubscription(
        subscription.id,
        subscription.customer.toString()
      );
    } catch (err) {
      console.error(`[updateCustomerSubscription]: ${err}`);
    }
  }

  const eventsHelper: {
    [key: string]: (event: Stripe.Event.Data.Object) => Promise<void>;
  } = {
    "customer.subscription.created": saveCustomerSubsbcription,
    "customer.subscription.updated": updateCustomerSubscription,
    "customer.subscription.deleted": updateCustomerSubscription,
  };

  const eventHandler = eventsHelper[event.type] ?? null;

  if (!eventHandler) {
    return res
      .status(200)
      .json({ error: `No handler for event ${event.type}` });
  }

  await eventHandler(event.data.object);

  res.status(200).json({ received: true });
}
