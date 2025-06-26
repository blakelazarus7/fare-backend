export default async function handler(req, res) {
  const { shopifyCustomerId } = req.query;

  if (!shopifyCustomerId) {
    return res.status(400).json({ error: 'Missing shopifyCustomerId' });
  }

  const smartrrAccessToken = 'sUjadTdsAjFwwAcaEXASXXcAjssSgXX0aUJ0';

  const sellingPlanMap = {
    "gid://shopify/SellingPlan/691978240366": "Small Seasonal Box - Weekly",
    "gid://shopify/SellingPlan/691978273134": "Small Seasonal Box - Every Two Weeks",
    "gid://shopify/SellingPlan/691978305902": "Small Seasonal Box - Monthly",
    "gid://shopify/SellingPlan/691978338670": "Standard Seasonal Box - Weekly",
    "gid://shopify/SellingPlan/691978371438": "Standard Seasonal Box - Every Two Weeks",
    "gid://shopify/SellingPlan/691978404206": "Standard Seasonal Box - Monthly",
    "gid://shopify/SellingPlan/691978436974": "Full Seasonal Box - Weekly",
    "gid://shopify/SellingPlan/691978469742": "Full Seasonal Box - Every Two Weeks",
    "gid://shopify/SellingPlan/691978502510": "Full Seasonal Box - Monthly"
  };

  try {
    const subRes = await fetch(`https://api.smartrr.com/subscriptions?shopify_customer_id=${shopifyCustomerId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${smartrrAccessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!subRes.ok) {
      const errorText = await subRes.text();
      return res.status(subRes.status).json({
        error: 'Failed to fetch from Smartrr',
        detail: errorText,
      });
    }

    const subData = await subRes.json();

    // Assume first subscription is the one we care about
    const subscription = subData[0];
    const sellingPlanId = subscription?.selling_plan_id || subscription?.sellingPlanId;

    const readablePlan = sellingPlanMap[sellingPlanId] || "Unknown Plan";

    return res.status(200).json({
      sellingPlanId,
      planName: readablePlan,
    });

  } catch (err) {
    return res.status(500).json({
      error: 'Internal Server Error',
      detail: err.message || err.toString(),
    });
  }
}
