export default async function handler(req, res) {
  const { shopifyCustomerId } = req.query;

  if (!shopifyCustomerId) {
    return res.status(400).json({ error: 'Missing shopifyCustomerId' });
  }

  const smartrrAccessToken = 'sUjadTdsAjFwwAcaEXASXXcAjssSgXX0aUJ0';

  try {
    // Step 1: Get subscriptions for customer
    const subRes = await fetch(`https://api.smartrr.com/subscriptions?shopify_customer_id=${shopifyCustomerId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${smartrrAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const subs = await subRes.json();

    if (!subRes.ok || !subs[0]) {
      return res.status(404).json({ error: 'No subscriptions found' });
    }

    const shopifySubscriptionId = subs[0].shopifySubscriptionId || subs[0].id;

    // Step 2: Get purchase state to access selling plan
    const planRes = await fetch(`https://api.smartrr.com/vendor/purchase-state/${shopifySubscriptionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${smartrrAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const planData = await planRes.json();

    if (!planRes.ok || !planData.sellingPlanId) {
      return res.status(404).json({ error: 'No sellingPlanId found' });
    }

    const sellingPlanId = planData.sellingPlanId;

    // Step 3: Map to readable plan name
    const planMap = {
      'gid://shopify/SellingPlan/691978305902': 'Weekly Box',
      'gid://shopify/SellingPlan/691978305915': 'Every 2 Weeks',
      'gid://shopify/SellingPlan/691978305928': 'Monthly Box',
    };

    const planName = planMap[sellingPlanId] || 'Unknown Plan';

    res.status(200).json({ planName, sellingPlanId });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', detail: err.message });
  }
}
