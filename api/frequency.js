export default async function handler(req, res) {
  // ✅ Set proper CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const RECHARGE_API_KEY = "sk_1x1_195a6d72ab5445ab862eb1cb36afeb234d792ea170cd8f869a999eb8322bb81c";
  const customerEmail = req.query.email;

  if (!customerEmail) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  try {
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

    const subsResp = await fetch(`https://api.rechargeapps.com/subscriptions?customer_id=${customerId}`, {
      headers: {
        "X-Recharge-Access-Token": RECHARGE_API_KEY,
        "Accept": "application/json"
      }
    });

    const subsData = await subsResp.json();
    if (!subsData.subscriptions || subsData.subscriptions.length === 0) {
      return res.status(404).json({ error: "No subscriptions found" });
    }

    const subscription = subsData.subscriptions[0];
    const frequency =
      subscription.order_interval_unit === "day"
        ? subscription.order_interval_frequency === 7
          ? "1 week"
          : subscription.order_interval_frequency === 14
          ? "2 week"
          : `${subscription.order_interval_frequency} days`
        : `${subscription.order_interval_frequency} ${subscription.order_interval_unit}`;

    return res.status(200).json({
      plan: frequency,
      product_title: subscription.product_title
    });

  } catch (err) {
    console.error("Recharge fetch error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
