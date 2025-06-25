export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.eatfare.com");
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
    const smartrrResponse = await fetch(`https://api.smartrr.com/customers/shopify/${customerId}/subscriptions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "sUjadTdsAjFwwAcaEXASXXcAjssSgXX0aUJ0"
      }
    });

    const data = await smartrrResponse.json();

    if (!data.length) {
      return res.status(200).json({ message: "No subscriptions found." });
    }

    const subscription = data[0]; // Assume 1 active subscription
    const boxSize = subscription.productName || "Unknown";
    const frequency = subscription.billingSchedule?.interval || "Unknown";

    return res.status(200).json({
      boxSize,
      frequency
    });

  } catch (err) {
    console.error("Smartrr API error:", err);
    return res.status(500).json({ error: "Failed to fetch subscription from Smartrr" });
  }
}
