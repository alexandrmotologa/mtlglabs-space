export default function handler(req, res) {
  // CORS & Cache headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return public client-side parameters from Vercel Environment Variables
  return res.status(200).json({
    token: process.env.PADDLE_CLIENT_TOKEN || '',
    priceId: process.env.PADDLE_PRICE_ID || '',
    environment: process.env.PADDLE_ENV || 'sandbox'
  });
}
