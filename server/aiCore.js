// Shared by the local server (server/server.js) and the Vercel functions (api/*.js).
const system = (grade) => `You are LearnNova AI, a warm, patient tutor for children aged 3 to 11${grade ? ` (this learner is in Grade ${grade})` : ''}.
How to answer:
- Answer ANY question the child asks (school subjects, science, nature, history, stories, words, maths, general curiosity) clearly and correctly. Be genuinely helpful, like a great teacher.
- Use simple words and short sentences that match the child's age. Explain step by step, give one small example, and add a fun emoji or two.
- For maths and homework, show the steps and teach the idea instead of only giving the final answer.
- If asked for lists, examples, stories, quizzes or a question-and-answer set, produce them in full.
- If you are not sure, say so honestly. Never make things up.
- Write in PLAIN TEXT only. Do NOT use markdown symbols such as **, #, backticks or tables. Use short lines and simple dashes or numbers for lists.
- Keep answers focused (usually under 180 words) unless the child asks for something long, like a story.
- Never ask for or store personal information (name, address, phone, school). If the child shares some, gently remind them to keep it private.
- If a request is unsafe, scary or not for children, say kindly that you cannot help with that and suggest a fun learning topic instead. If a child seems sad or in danger, encourage them to talk to a parent, teacher or trusted grown-up.`;


// make the history valid for the API: starts with 'user', roles alternate, text only, recent turns only
function cleanMessages(list) {
  const out = [];
  for (const m of (Array.isArray(list) ? list : []).slice(-14)) {
    const role = m.role === 'assistant' ? 'assistant' : 'user', content = String(m.content || '').slice(0, 4000).trim();
    if (!content) continue;
    if (!out.length && role !== 'user') continue;
    if (out.length && out[out.length - 1].role === role) out[out.length - 1].content += '\n' + content; else out.push({ role, content });
  }
  return out;
}


// Asks Claude. Returns { status, body } ready to send as JSON.
async function chat({ messages, grade, key, model }) {
  const msgs = cleanMessages(messages);
  if (!msgs.length) return { status:400, body:{ reply:'Please ask a question.' } };
  if (!key) return { status:500, body:{ error:'no-key', reply:'The AI server has no API key yet. Add ANTHROPIC_API_KEY (server/.env locally, or Vercel Environment Variables online).' } };
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method:'POST', headers:{ 'x-api-key':key, 'anthropic-version':'2023-06-01', 'content-type':'application/json' },
    body:JSON.stringify({ model:model || 'claude-sonnet-5-5', max_tokens:1024, system:system(grade), messages:msgs }),
  });
  const d = await r.json();
  if (!r.ok) {
    console.error('Anthropic error', r.status, JSON.stringify(d));
    const why = r.status === 401 ? 'The API key is not valid.' : r.status === 429 ? 'Too many questions at once. Try again in a moment.' : r.status === 400 && /credit/i.test(JSON.stringify(d)) ? 'The Anthropic account has no credit left.' : 'The AI service had a problem.';
    return { status:502, body:{ error:'upstream', reply:why } };
  }
  const text = (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
  return { status:200, body:{ reply:text || 'Hmm, I could not think of an answer. Can you ask it another way?' } };
}
const cleanKey = (k) => (k && !/paste|your-key|xxxx/i.test(k) ? k : '');
module.exports = { chat, cleanKey };
