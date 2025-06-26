export default async function handler(req, res) {
  const rechargeToken = 'sk_1x1_195a6d72ab5445ab862e1b1c36afeb23d4792ea170cd8b698a999eb8322bb81c';

  const customerEmail = req.query.email;

  if (!customerEmail) {
    return res.status(400).json({ error: 'Missing email parameter' });
  }

  try {
    // Step 1: Get Recharge Customer by Email
    const customerRes = await fetch(`https://api.rechargeapps.com/customers?email=${customerEmail}`, {
      headers: {
        'X-Recharge-Access-Token': rechargeToken,
        'Accept': 'application/json',
      },
    });

    const customerData = await customerRes.json();
    const customer = customerData.customers[0];

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found in Recharge' });
    }

    // Step 2: Get Subscriptions for that Customer
    const subsRes = await fetch(`https://api.rechargeapps.com/subscriptions?customer_id=${customer.id}`, {
      headers: {
        'X-Recharge-Access-Token': rechargeToken,
        'Accept': 'application/json',
      },
    });

    const subsData = await subsRes.json();
    const subscriptions = subsData.subscriptions;

    // Get just the frequency (interval + unit)
    const plans = subscriptions.map(sub => ({
      product_title: sub.product_title,
      frequency: `${sub.order_interval_frequency} ${sub.order_interval_unit}`,
    }));

    res.status(200).json({ plans });
  } catch (error) {
    console.error('Recharge API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
