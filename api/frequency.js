export default async function handler(req, res) {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Missing email" });

  const SMARTRR_TOKEN = process.env.SMARTRR_TOKEN;

  const custRes = await fetch(
    `https://api.smartrr.com/v1/customers?email=${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${SMARTRR_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  const { data } = await custRes.json();
  const cust = data[0];
  if (!cust) return res.status(404).json({ error: "Customer not found" });

  const subs = cust.subscriptions || [];
  if (subs.length === 0)
    return res.status(200).json({ frequency: null });

  const sub = subs[0];
  return res.status(200).json({
    frequency_unit: sub.frequency_unit,
    delivery_frequency: sub.delivery_frequency,
    next_order_date: sub.next_order_date,
    status: sub.status,
  });
}
