
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  console.log("🔑 Customer Access Token:", token);

  if (!token) {
    return res.status(400).json({ error: "Missing token" });
  }

  const shopifyRes = await fetch("https://tuqhcs-7a.myshopify.com/api/2024-01/graphql.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": "8b1f2fc60905539067a137028435c86a",
    },
    body: JSON.stringify({
  query: `
    {
      customer(customerAccessToken: "${token}") {
        id
        email
        firstName
        lastName
        orders(first: 100) {
          edges {
            node {
              lineItems(first: 5) {
                edges {
                  node {
                    title
                  }
                }
              }
            }
          }
        }
      }
    }
  `
})

  const data = await shopifyRes.json();
  const customer = data.data?.customer;

  if (!customer) {
    return res.status(200).json({
      orderCount: 0,
      farmsSupported: 0,
      pesticidesAvoided: 0,
      fertilizersAvoided: 0,
      carbonSequestered: 0,
      carbonFootprintAvoided: 0,
      waterSaved: 0,
    });
  }

  const orders = customer.orders.edges;
  let small = 0, standard = 0, full = 0;

  for (let order of orders) {
    const titles = order.node.lineItems.edges.map(e => e.node.title.toLowerCase());
    for (let title of titles) {
      if (title.includes("small")) small++;
      else if (title.includes("standard")) standard++;
      else if (title.includes("full")) full++;
    }
  }

  const orderCount = small + standard + full;
  const farmsSupported = Math.min((small * 6) + (standard * 8) + (full * 10), 30);
  const pesticidesAvoided = (small * 2) + (standard * 4) + (full * 7);
  const fertilizersAvoided = (small * 21) + (standard * 30) + (full * 42);
  const carbonSequestered = (small * 2.5) + (standard * 3.0) + (full * 3.8);
  const carbonFootprintAvoided = (small * 2.0) + (standard * 3.0) + (full * 4.25);
  const waterSaved = (small * 40) + (standard * 60) + (full * 85);

  return res.status(200).json({
    orderCount,
    farmsSupported,
    pesticidesAvoided,
    fertilizersAvoided,
    carbonSequestered,
    carbonFootprintAvoided,
    waterSaved
  });
}
