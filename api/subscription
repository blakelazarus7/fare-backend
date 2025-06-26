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
    const id = customerId.split("/").pop(); // Get Shopify numeric ID

    const smartrrResponse = await fetch(`https://api.smartrr.com/customers/shopify/${id}/subscriptions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "juTaTgaEAajJdAcTg0ASwUUAjTJwTX00TFju"
      }
    });

    const text = await smartrrResponse.text();

    if (smartrrResponse.status !== 200) {
      console.error("❌ Smartrr non-200:", smartrrResponse.status, text);
      return res.status(smartrrResponse.status).json({
        error: "Smartrr returned non-200",
        status: smartrrResponse.status,
        body: text
      });
    }

    const data = JSON.parse(text);

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(200).json({ message: "No subscriptions found", frequency: null });
    }

    const subscription = data[0];
    const boxSize = subscription.productName || "Unknown";
    const frequency = subscription.billingSchedule?.interval || "Unknown";

    return res.status(200).json({ boxSize, frequency });

  } catch (err) {
    console.error("❌ Smartrr API error:", err);
    return res.status(500).json({ error: "Internal error", detail: err.message });
  }
}
