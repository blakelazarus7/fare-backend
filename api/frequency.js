export default async function handler(req, res) {
  const { customerId } = req.query;

  if (!customerId) {
    return res.status(400).json({ error: 'Missing customerId' });
  }

  try {
    const response = await fetch(`https://api.smartrr.com/v1/subscriptions?customer_id=${customerId}`, {
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
