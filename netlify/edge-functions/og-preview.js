const SUPABASE_URL = 'https://gxuwdaaiieevibpjygig.supabase.co';
const SUPABASE_ANON = 'sb_publishable_9b-VNXLQWi1VFPUL4SnvPA_BVVoj-Dq';

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default async function handler(request, context) {
  const url = new URL(request.url);
  const token = url.searchParams.get('join');

  if (!token) return context.next();

  let listName = 'a list';
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/lookup_share_token`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_token: token }),
    });
    const rows = await res.json();
    if (rows?.length) listName = rows[0].name;
  } catch (_) {}

  if (listName === 'a list') {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/lists?share_token=eq.${token}&select=name`, {
        headers: {
          'apikey': SUPABASE_ANON,
          'Authorization': `Bearer ${SUPABASE_ANON}`,
        },
      });
      const rows = await res.json();
      if (rows?.length) listName = rows[0].name;
    } catch (_) {}
  }

  const title = esc(`Join my ${listName} list`);
  const desc  = esc(`You've been invited to collaborate on "${listName}" in randomtasks.`);
  const pageUrl = esc(url.toString());

  const ogTags = `
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:site_name" content="randomtasks">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">`;

  const response = await context.next();
  const html = await response.text();
  const modified = html.replace('<head>', `<head>${ogTags}`);

  return new Response(modified, {
    status: response.status,
    headers: response.headers,
  });
}
