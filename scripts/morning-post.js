#!/usr/bin/env node
// Posts a weekday morning "something interesting" message to Discord.
// Includes NASA's Astronomy Picture of the Day plus 2-3 AI headlines.

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!WEBHOOK_URL) {
  console.error('Missing DISCORD_WEBHOOK_URL');
  process.exit(1);
}

function getPacificParts() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const get = (type) => parseInt(parts.find((p) => p.type === type)?.value, 10);
  return { hour: get('hour'), minute: get('minute') };
}

const { hour: ptHour, minute: ptMinute } = getPacificParts();
if (ptHour !== 8 || ptMinute > 10) {
  console.log(`Skipping: PT is ${ptHour}:${String(ptMinute).padStart(2, '0')}, not ~8:00 AM.`);
  process.exit(0);
}

function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

async function fetchApod() {
  const key = process.env.NASA_API_KEY || '***';
  const url = `https://api.nasa.gov/planetary/apod?api_key=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`APOD ${res.status}`);
  return res.json();
}

async function fetchWikipediaFallback() {
  const url = 'https://en.wikipedia.org/api/rest_v1/page/random/summary';
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Wikipedia ${res.status}`);
  return res.json();
}

async function fetchAiHeadlines() {
  const feeds = [
    'https://www.technologyreview.com/topic/artificial-intelligence/feed/',
    'https://arstechnica.com/tag/artificial-intelligence/feed/',
  ];

  for (const feedUrl of feeds) {
    try {
      const res = await fetch(feedUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`${feedUrl} ${res.status}`);
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
      const headlines = items.slice(0, 3).map((match) => {
        const block = match[1];
        const title = (block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1] || '')
          .replace(/<\/?[^>]+>/g, '')
          .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code))
          .trim();
        const link = block.match(/<link>\s*(.*?)\s*<\/link>/)?.[1]?.trim() || '';
        return { title, link };
      }).filter((h) => h.title && h.link);

      if (headlines.length > 0) return headlines;
    } catch (err) {
      console.warn('AI feed failed:', err.message);
    }
  }

  return [];
}

async function buildPayload() {
  const [apod, headlines] = await Promise.allSettled([fetchApod(), fetchAiHeadlines()]);

  let mainSection = '';
  if (apod.status === 'fulfilled') {
    const data = apod.value;
    const media = data.media_type === 'video'
      ? `[Watch today's APOD](${data.url})`
      : data.url;
    mainSection = `**${data.title}**\n${media}\n>${truncate(data.explanation, 250)}`;
  } else {
    console.warn('APOD failed:', apod.reason.message);
    try {
      const wiki = await fetchWikipediaFallback();
      const link = wiki.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(wiki.titles?.canonical || wiki.title)}`;
      mainSection = `**${wiki.title}**\n${link}\n>${truncate(wiki.extract, 250)}`;
    } catch (err) {
      console.warn('Wikipedia failed too:', err.message);
      mainSection = 'Good morning! Here is something interesting: the universe is about 13.8 billion years old.';
    }
  }

  let headlineSection = '';
  if (headlines.status === 'fulfilled' && headlines.value.length > 0) {
    const list = headlines.value.map((h) => `• ${h.title} — <${h.link}>`).join('\n');
    headlineSection = `\n\n**AI headlines**\n${list}`;
  }

  return {
    username: 'Morning Interest Bot',
    content: `${mainSection}${headlineSection}`,
  };
}

async function main() {
  const payload = await buildPayload();
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Webhook ${res.status}: ${text}`);
  }
  console.log('Posted:', JSON.stringify(payload, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
