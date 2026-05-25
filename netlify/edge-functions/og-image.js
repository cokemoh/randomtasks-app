const SUPABASE_URL = 'https://gxuwdaaiieevibpjygig.supabase.co';
const SUPABASE_ANON = 'sb_publishable_9b-VNXLQWi1VFPUL4SnvPA_BVVoj-Dq';

// Convert an emoji string to its Twemoji CDN PNG URL.
// Strips variation-selector-16 (fe0f) per Twemoji filename convention.
function twemojiUrl(emoji) {
  const codepoints = [...emoji]
    .map(c => c.codePointAt(0).toString(16))
    .filter(cp => cp !== 'fe0f');
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${codepoints.join('-')}.png`;
}

export default async function handler(request, context) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  let icon = 'app';
  if (token) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/lists?share_token=eq.${encodeURIComponent(token)}&select=icon&limit=1`,
        { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
      );
      const rows = await res.json();
      if (rows?.[0]?.icon) icon = rows[0].icon;
    } catch (_) {}
  }

  // ── App icon ─────────────────────────────────────────────────────────────
  if (!icon || icon === 'app') {
    // Serve the static pre-rendered PNG that lives next to index.html
    const canonical = new URL(url);
    canonical.host = 'randomtask.app';
    canonical.protocol = 'https:';
    canonical.pathname = '/og-icon.png';
    canonical.search = '';
    return Response.redirect(canonical.toString(), 302);
  }

  // ── Genmoji / pasted image (data: URL) ───────────────────────────────────
  if (icon.startsWith('data:')) {
    const [header, b64] = icon.split(',');
    const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/png';
    try {
      const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      return new Response(bytes, {
        headers: {
          'content-type': mimeType,
          'cache-control': 'public, max-age=3600',
        },
      });
    } catch (_) {
      // Corrupted data URL — fall through to app icon
      const canonical = new URL(url);
      canonical.host = 'randomtask.app';
      canonical.protocol = 'https:';
      canonical.pathname = '/og-icon.png';
      canonical.search = '';
      return Response.redirect(canonical.toString(), 302);
    }
  }

  // ── Emoji ─────────────────────────────────────────────────────────────────
  // Redirect to Twemoji CDN which serves proper PNG images
  return Response.redirect(twemojiUrl(icon), 302);
}
