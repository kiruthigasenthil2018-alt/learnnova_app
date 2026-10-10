const { cleanKey } = require('../server/aiCore');
module.exports = (req, res) => res.status(200).json({ ok:true, model:process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', hasKey:!!cleanKey(process.env.ANTHROPIC_API_KEY) });
