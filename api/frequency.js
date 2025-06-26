export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Missing token" });
  }

  const shopifyDomain = "faregrocery.myshopify.com"; // Replace with your actual store
  const storefrontAccessToken = "c8df2eb7ec9b1a14d7062269f0276a74"; // Your Storefront API access token
  const rechargeToken = "sk_1x1_195a6d72ab5445ab862e1b1c36afeb23d4792ea170cd8b698a999eb8322bb81c";

  try {
    // Step 1: Get customer email using Shopify Storefront API
    const shopifyRes = await fetch(`https://${shopifyDomain}/api/2024-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken
      },
      body: JSON.stringify({
        query: `
          {
            customer(customerAccessToken: "${token}") {
              email
            }
          }
        `
      })
    });

    const shopifyData = await shopifyRes.json();
    const email = shopifyData?.data?.customer?.email;

    if (!email) {
      return res.status(404).json({ error: "Could not find customer email." });
    }

    // Step 2: Get Recharge customer ID
    const rechargeRes = await fetch(`https://api.rechargeapps.com/customers?email=${email}`, {
      headers: {
        "X-Recharge-Access-Token": rechargeToken
      }
    });

    const rechargeData = await rechargeRes.json();

    if (!rechargeData.customers || rechargeData.customers.length === 0) {
      return res.status(404).json({ error: "Recharge customer not found" });
    }

    const customerId = rechargeData.customers[0].id;

    // Step 3: Get subscription plan
    const subRes = await fetch(`https://api.rechargeapps.com/subscriptions?customer_id=${customerId}`, {
      headers: {
        "X-Recharge-Access-Token": rechargeToken
      }
    });

    const subData = await subRes.json();

    if (!subData.subscriptions || subData.subscriptions.length === 0) {
      return res.status(404).json({ error: "No active subscription found." });
    }

    const plan = subData.subscriptions[0].order_interval_unit;

    return res.status(200).json({ plan });
  } catch (err) {
    console.error("Failed to get plan:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
