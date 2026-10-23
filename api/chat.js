// Zakiy AI — server qismi (Vercel). Kalit faqat shu yerda, ochiq emas.
const MODEL = 'claude-sonnet-5-5';

const BASE = 'Sen Zakiy AI isming — foydalanuvchining barcha savollariga javob beradigan aqlli yordamchisan. Foydalanuvchi qaysi tilda yozsa, shu tilda javob ber (asosan oʻzbek tilida). Aniq, foydali va ravon javob ber. Kod soʻralsa, ``` bilan kod bloki ishlat.';
const DRAW = ' RASM CHIZISH REJIMI: foydalanuvchi rasm soʻradi. Rasmni SVG kod bilan chiz: faqat bitta ```svg kod bloki ichida, viewBox="0 0 800 600" bilan toʻliq <svg> yoz. Skript va tashqi havolalar ishlatma. Blokdan keyin bitta qisqa izoh yoz.';
const SONG = ' QOʻSHIQ YOZISH REJIMI: foydalanuvchi qoʻshiq soʻradi. Mutlaqo original qoʻshiq yoz, mavjud qoʻshiqlardan satr olma. Tuzilishi: sarlavha, janr va tempo, akkordlar, 2 ta band, nakorat va ixtiyoriy koʻprik. Oxirida ijro haqida 1-2 gap yoz.';

// Oddiy cheklov: bitta IP dan 10 daqiqada 20 ta soʻrov (xarajatni himoya qiladi)
const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000;
  const arr = (hits.get(ip) || []).filter(t => now - t < win);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 20;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'Server sozlanmagan' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ error: 'Koʻp soʻrov yuborildi. Birozdan soʻng urinib koʻring.' });

  const body = req.body || {};
  const msgs = body.messages;
  if (!Array.isArray(msgs) || msgs.length === 0 || msgs.length > 13 || msgs[0].role !== 'user') {
    return res.status(400).json({ error: 'Notoʻgʻri soʻrov' });
  }
  for (const m of msgs) {
    if (m.role !== 'user' && m.role !== 'assistant') return res.status(400).json({ error: 'Notoʻgʻri soʻrov' });
    if (typeof m.content === 'string') {
      if (m.content.length > 8000) return res.status(400).json({ error: 'Xabar juda uzun' });
    } else if (Array.isArray(m.content) && m.role === 'user') {
      for (const b of m.content) {
        if (b.type === 'text') { if (String(b.text).length > 8000) return res.status(400).json({ error: 'Xabar juda uzun' }); }
        else if (b.type === 'image') {
          const ok = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(b.source && b.source.media_type);
          if (!ok || String(b.source.data).length > 3500000) return res.status(400).json({ error: 'Rasm mos emas' });
        } else return res.status(400).json({ error: 'Notoʻgʻri soʻrov' });
      }
    } else return res.status(400).json({ error: 'Notoʻgʻri soʻrov' });
  }

  const system = BASE + (body.mode === 'draw' ? DRAW : body.mode === 'song' ? SONG : '');

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 2000, system, messages: msgs })
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: 'AI xizmati xatosi' });
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: 'Ulanish xatosi' });
  }
};
