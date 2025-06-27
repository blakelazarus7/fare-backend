export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { email } = req.method === 'POST' ? req.body : req.query;
  if (!email) return res.status(400).json({ error: 'Missing customer email' });

  const token = 'sUjadTdsAjFwwAcaEXASXXcAjssSgXX0aUJ0';
  const url = `https://api.smartrr.com/vendor/customer?filterEquals[email]=${encodeURIComponent(email)}`;

  try {
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Failed to fetch Smartrr customer' });

    const json = await resp.json();
    if (!json.data?.[0]) return res.status(404).json({ error: 'Customer not found' });

    const customer = json.data[0];
    const sub = customer.subscriptions?.[0];
    if (!sub) return res.status(404).json({ error: 'No subscriptions found' });

    const planName = sub.sellingPlanName || sub.planName || 'Unknown';
    return res.status(200).json({ plan: planName });
  } catch (e) {
    return res.status(500).json({ error: 'Internal error', detail: e.message });
  }
}
