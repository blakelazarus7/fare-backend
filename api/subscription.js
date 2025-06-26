export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { customerId } = req.query;

  if (!customerId) {
    return res.status(400).json({ error: "Missing customerId" });
  }

  try {
    const response = await fetch(`https://api.smartrr.com/customers/shopify/${customerId}/subscriptions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-smartrr-access-token": "juTaTgaEAajJdAcTg0ASwUUAjTJwTX00TFju" // ← USE THIS HEADER NAME
      }
    });

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(200).json({ message: "No subscriptions found." });
    }

    const subscription = data[0];
    return res.status(200).json({
      boxSize: subscription.productName || "Unknown",
      frequency: subscription.billingSchedule?.interval || "Unknown"
    });

  } catch (err) {
    console.error("Smartrr API error:", err);
    return res.status(500).json({ error: "Failed to fetch subscription from Smartrr", detail: err.message });
  }
}
