#!/usr/bin/env node
// Posts a weekday morning "something interesting" message to Discord.
// Includes NASA's Astronomy Picture of the Day plus 2-3 AI headlines.
//
// No local time-of-day gating: GitHub Actions `schedule` events are
// best-effort and frequently fire 1-6 hours late, so any client-side
// clock window turns into a silent skip. The workflow's cron slots
// (15:00/16:00 UTC weekdays) are the ONLY arbiter of "morning".

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!WEBHOOK_URL) {
  console.error('Missing DISCORD_WEBHOOK_URL');
  process.exit(1);
}

console.log(`Running at ${new Date().toISOString()} (no local time gate; workflow schedule decides).`);

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

// Headlines older than this are "stale": they're held back unless nothing
// fresher exists in either feed, so a quiet feed can't produce the same
// links day after day. 48h allows at most ~2 consecutive weekday posts of
// the same item; the Ars Technica fallback tops up when MIT TR is quiet.
const FRESH_WINDOW_MS = 48 * 60 * 60 * 1000;

function parseItem(block) {
  const title = (block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1] || '')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code))
    .trim();
  const link = block.match(/<link>\s*(.*?)\s*<\/link>/)?.[1]?.trim() || '';
  const pubRaw = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || '';
  const published = pubRaw ? new Date(pubRaw) : null;
  return {
    title,
    link,
    published: published && !Number.isNaN(published.getTime()) ? published.getTime() : null,
  };
}

async function fetchFeedHeadlines(feedUrl, seen) {
  const res = await fetch(feedUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`${feedUrl} ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map((match) => parseItem(match[1]))
    .filter((item) => item.title && item.link && !seen.has(item.link));
}

async function fetchAiHeadlines() {
  const feeds = [
    'https://www.technologyreview.com/topic/artificial-intelligence/feed/',
    'https://arstechnica.com/tag/artificial-intelligence/feed/',
  ];

  const seen = new Set();
  const fresh = [];
  const stale = [];

  for (const feedUrl of feeds) {
    try {
      const headlines = await fetchFeedHeadlines(feedUrl, seen);
      for (const item of headlines) {
        seen.add(item.link);
        const isFresh = item.published !== null && item.published >= Date.now() - FRESH_WINDOW_MS;
        (isFresh ? fresh : stale).push(item);
      }
    } catch (err) {
      console.warn('AI feed failed:', err.message);
    }
    if (fresh.length >= 3) break;
  }

  if (fresh.length > 0) return fresh.slice(0, 3);
  // Neither feed has anything recent: fall back to the newest available
  // rather than dropping the section entirely.
  return stale.slice(0, 3);
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
