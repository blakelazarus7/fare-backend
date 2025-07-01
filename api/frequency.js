export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://www.eatfare.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Your Recharge API Key
  const RECHARGE_API_KEY = "sk_1x1_195a6d72ab5445ab862eb1cb36afeb234d792ea170cd8f869a999eb8322bb81c";

  // ✅ Get email from query
  const customerEmail = req.query.email;
  if (!customerEmail) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  try {
    // ✅ Find customer by email
    const customerResp = await fetch(`https://api.rechargeapps.com/customers?email=${encodeURIComponent(customerEmail)}`, {
      headers: {
        "X-Recharge-Access-Token": RECHARGE_API_KEY,
        "Accept": "application/json"
      }
    });

    const customerData = await customerResp.json();
    const customer = customerData.customers[0];

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // ✅ Get subscriptions for customer
    const subsResp = await fetch(`https://api.rechargeapps.com/subscriptions?customer_id=${customer.id}`, {
      headers: {
        "X-Recharge-Access-Token": RECHARGE_API_KEY,
        "Accept": "application/json"
      }
    });

    const subsData = await subsResp.json();
    const subscription = subsData.subscriptions[0];

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    // ✅ Return plan and product title
    return res.status(200).json({
      plan: subscription.order_interval_frequency + " " + subscription.order_interval_unit,
      product_title: subscription.product_title
    });

  } catch (err) {
    console.error("Error in /api/frequency:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
