export default async function handler(req, res) {
  const RECHARGE_API_KEY = "sk_1x1_195a6d72ab5445ab862e1b1c36afeb23d4792ea170cd8b698a999eb8322bb81c";
  const customerEmail = req.query.email;

  if (!customerEmail) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  try {
    // 1. Get customer by email
    const customerResp = await fetch(`https://api.rechargeapps.com/customers?email=${encodeURIComponent(customerEmail)}`, {
      headers: {
        "X-Recharge-Access-Token": RECHARGE_API_KEY,
        "Accept": "application/json"
      }
    });

    const customerData = await customerResp.json();

    if (!customerData.customers || customerData.customers.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const customerId = customerData.customers[0].id;

    // 2. Get subscriptions for this customer
    const subsResp = await fetch(`https://api.rechargeapps.com/subscriptions?customer_id=${customerId}`, {
      headers: {
        "X-Recharge-Access-Token": RECHARGE_API_KEY,
        "Accept": "application/json"
      }
    });

    const subsData = await subsResp.json();

    if (!subsData.subscriptions || subsData.subscriptions.length === 0) {
      return res.status(404).json({ error: "No active subscriptions found" });
    }

    const subscription = subsData.subscriptions[0]; // assuming 1 sub
    const frequency = subscription.order_interval_unit === "day"
      ? (subscription.order_interval_frequency === 7 ? "weekly" : subscription.order_interval_frequency === 14 ? "biweekly" : `${subscription.order_interval_frequency} days`)
      : `${subscription.order_interval_frequency} ${subscription.order_interval_unit}`;

    return res.status(200).json({
      plan: frequency,
      product_title: subscription.product_title
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error retrieving plan" });
  }
}
