export default async function handler(req, res) {
  const { shopifyCustomerId } = req.query;

  if (!shopifyCustomerId) {
    return res.status(400).json({ error: 'Missing shopifyCustomerId' });
  }

  try {
    const response = await fetch(`https://api.smartrr.com/subscriptions?shopify_customer_id=${shopifyCustomerId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer sUjadTdsAjFwwAcaEXASXXcAjssSgXX0aUJ0',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', detail: err.message });
  }
}
