// pages/api/subscription-frequency.js
export default async function handler(req, res) {
  const { customerId } = req.query;
  if (!customerId) {
    return res.status(400).json({ error: "Missing customerId query parameter" });
  }

  try {
    // Call Smartrr API to get subscription (purchase state) data for the customer
    const smartrrResponse = await fetch(
      `https://api.smartrr.com/vendor/customer/${customerId}/purchase-state`,
      {
        method: "GET",
        headers: {
          // API key provided via custom header
          "x-smartrr-access-token": process.env.SMARTRR_API_KEY 
            || "juTaTgaEAajJdAcTg0ASwUUAjTJwTX00TFju",  // use env or given key
          "Accept": "application/json"
        }
      }
    );

    if (!smartrrResponse.ok) {
      throw new Error(`Smartrr API error: ${smartrrResponse.status}`);
    }

    const data = await smartrrResponse.json();
    // The response may contain one or multiple subscriptions (purchase states)
    // For this example, we’ll use the first subscription in the list (if any)
    let frequencyUnit = null;
    let deliveryFrequency = null;

    if (Array.isArray(data) && data.length > 0) {
      // In some cases the API might return an array under a data wrapper
      const firstEntry = data[0];
      if (firstEntry.sts && firstEntry.sts.length > 0) {
        // "sts" likely holds the list of subscription objects for the customer
        frequencyUnit = firstEntry.sts[0].frequencyUnit;
        deliveryFrequency = firstEntry.sts[0].deliveryFrequency;
      }
    } else if (data && data.sts) {
      // If the response is a single object with an sts array
      if (data.sts.length > 0) {
        frequencyUnit = data.sts[0].frequencyUnit;
        deliveryFrequency = data.sts[0].deliveryFrequency;
      }
    }

    if (frequencyUnit === null || deliveryFrequency === null) {
      return res.status(404).json({ error: "No subscription found for this customer" });
    }

    // Construct a readable frequency string, e.g. "2 months"
    const frequencyString = `${deliveryFrequency} ${frequencyUnit}`;

    return res.status(200).json({ frequency: frequencyString });
  } catch (err) {
    console.error("Error fetching from Smartrr:", err);
    return res.status(500).json({ error: err.message });
  }
}
