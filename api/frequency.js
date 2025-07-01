export default async function handler(req, res) {
  const RECHARGE_API_KEY = "sk_1x1_195a6d72ab5445ab862e1b1c36afeb23d4792ea170cd8b698a999eb8322bb81c";

  // Allow all origins for script injection or fetch fallback
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const customerEmail = req.query.email;
  if (!customerEmail) {
    res.setHeader("Content-Type", "application/javascript");
    return res.status(400).send(`window.renderPlan({ error: "Missing email parameter" });`);
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
      res.setHeader("Content-Type", "application/javascript");
      return res.status(404).send(`window.renderPlan({ error: "Customer not found" });`);
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
      res.setHeader("Content-Type", "application/javascript");
      return res.status(404).send(`window.renderPlan({ error: "No active subscriptions found" });`);
    }

    const subscription = subsData.subscriptions[0];

    const frequency =
      subscription.order_interval_unit === "day"
        ? subscription.order_interval_frequency === 7
          ? "1 week"
          : subscription.order_interval_frequency === 14
          ? "2 weeks"
          : `${subscription.order_interval_frequency} days`
        : `${subscription.order_interval_frequency} ${subscription.order_interval_unit}`;

    // ✅ Send JavaScript code for script injection
    res.setHeader("Content-Type", "application/javascript");
    return res.status(200).send(
      `window.renderPlan(${JSON.stringify({
        plan: frequency,
        product_title: subscription.product_title,
      })});`
    );
  } catch (err) {
    console.error("Server error:", err);
    res.setHeader("Content-Type", "application/javascript");
    return res.status(500).send(`window.renderPlan({ error: "Server error" });`);
  }
}
