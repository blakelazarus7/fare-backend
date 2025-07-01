export default async function handler(req, res) {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: "Missing email parameter" });
  }

  try {
    const response = await fetch(`https://fare-backend.vercel.app/api/frequency?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*"); // Optional: allows wider use
    return res.status(200).json(data);
  } catch (error) {
    console.error("Proxy fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch data from backend" });
  }
}
