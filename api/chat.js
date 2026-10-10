// Vercel serverless function:  POST /api/chat   (needs ANTHROPIC_API_KEY in Vercel > Settings > Environment Variables)
const { chat, cleanKey } = require('../server/aiCore');
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ reply:'Use POST' });
  try {
    const { messages, grade } = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const out = await chat({ messages, grade, key:cleanKey(process.env.ANTHROPIC_API_KEY), model:process.env.ANTHROPIC_MODEL });
    res.status(out.status).json(out.body);
  } catch (e) { console.error(e); res.status(500).json({ error:'server', reply:'Server error. Please try again.' }); }
};
