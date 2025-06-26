export default async function handler(req, res) {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  const rechargeToken = "sk_1x1_195a6d72ab5445ab862e1b1c36afeb23d4792ea170cd8b698a999eb8322bb81c";

  try {
    const response = await fetch(`https://api.rechargeapps.com/customers?email=${email}`, {
      headers: {
        "X-Recharge-Access-Token": rechargeToken
      }
    });

    const data = await response.json();

    if (!data.customers || data.customers.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const customerId = data.customers[0].id;

    const subsResponse = await fetch(`https://api.rechargeapps.com/subscriptions?customer_id=${customerId}`, {
      headers: {
        "X-Recharge-Access-Token": rechargeToken
      }
    });

    const subsData = await subsResponse.json();

    if (!subsData.subscriptions || subsData.subscriptions.length === 0) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    const plan = subsData.subscriptions[0].order_interval_unit;

    return res.status(200).json({ plan });
  } catch (err) {
    console.error("Recharge fetch failed", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
