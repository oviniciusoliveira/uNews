import { query as q } from "faunadb";
import { faunaClient } from "../../../services/fauna";
import { stripe } from "../../../services/stripe";

async function subscriptionExistsInFauna(
  subscriptionId: string
): Promise<boolean> {
  return await faunaClient.query(
    q.Exists(q.Match(q.Index("subscription_by_id"), subscriptionId))
  );
}

export async function saveSubscription(
  subscriptionId: string,
  customerId: string
) {
  const subExists = await subscriptionExistsInFauna(subscriptionId);
  if (subExists) return;

  const userRef = await faunaClient.query(
    q.Select(
      "ref",
      q.Get(q.Match(q.Index("user_by_stripe_customer_id"), customerId))
    )
  );

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
  };

  await faunaClient.query(
    q.Create(q.Collection("subscriptions"), {
      data: subscriptionData,
    })
  );
}

export async function updateSubscription(
  subscriptionId: string,
  customerId: string
) {
  const subExists = await subscriptionExistsInFauna(subscriptionId);
  if (!subExists) return;

  const userRef = await faunaClient.query(
    q.Select(
      "ref",
      q.Get(q.Match(q.Index("user_by_stripe_customer_id"), customerId))
    )
  );

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
  };

  await faunaClient.query(
    q.Replace(
      q.Select(
        "ref",
        q.Get(q.Match(q.Index("subscription_by_id"), subscription.id))
      ),
      {
        data: subscriptionData,
      }
    )
  );
}
