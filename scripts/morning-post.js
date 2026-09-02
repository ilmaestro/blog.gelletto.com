#!/usr/bin/env node
// Posts a weekday morning "something interesting" message to Discord.
// Content source: NASA Astronomy Picture of the Day, with a Wikipedia fallback.

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
console.log(`PT is ${ptHour}:${String(ptMinute).padStart(2, '0')} (guard disabled for test).`);

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

function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

async function buildPayload() {
  try {
    const apod = await fetchApod();
    const media = apod.media_type === 'video'
      ? `[Watch today's APOD](${apod.url})`
      : apod.url;
    return {
      username: 'Morning Interest Bot',
      content: `**${apod.title}**\n${media}\n>${truncate(apod.explanation, 250)}`,
    };
  } catch (err) {
    console.warn('APOD failed, falling back to Wikipedia:', err.message);
    try {
      const wiki = await fetchWikipediaFallback();
      const link = wiki.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(wiki.titles?.canonical || wiki.title)}`;
      return {
        username: 'Morning Interest Bot',
        content: `**${wiki.title}**\n${link}\n>${truncate(wiki.extract, 250)}`,
      };
    } catch (err2) {
      console.warn('Wikipedia failed too:', err2.message);
      return {
        username: 'Morning Interest Bot',
        content: 'Good morning! Here is something interesting: the universe is about 13.8 billion years old.',
      };
    }
  }
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
