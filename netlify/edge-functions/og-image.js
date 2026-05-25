const SUPABASE_URL = 'https://gxuwdaaiieevibpjygig.supabase.co';
const SUPABASE_ANON = 'sb_publishable_9b-VNXLQWi1VFPUL4SnvPA_BVVoj-Dq';

function xmlEsc(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// App icon paths, nested inside a <svg> that reuses the original viewBox so
// coordinates are unchanged and scale naturally to whatever size we need.
const APP_ICON_INNER = `<svg x="56" y="56" width="400" height="400" viewBox="181.5 14.5 308 308" xmlns="http://www.w3.org/2000/svg">
  <g transform="rotate(-6,340,210)">
    <rect x="258" y="84" width="180" height="222" rx="22" fill="#4c1d95" opacity="0.3"/>
    <rect x="250" y="76" width="180" height="222" rx="20" fill="#7c3aed"/>
    <rect x="285" y="64" width="110" height="26" rx="5" fill="#a78bfa"/>
    <rect x="315" y="39" width="50" height="28" rx="4" fill="none" stroke="#a78bfa" stroke-width="12"/>
    <circle cx="278" cy="148" r="5" fill="white"/>
    <line x1="292" y1="148" x2="390" y2="148" stroke="white" stroke-width="5" stroke-linecap="round"/>
    <circle cx="278" cy="175" r="5" fill="white"/>
    <line x1="292" y1="175" x2="375" y2="175" stroke="white" stroke-width="5" stroke-linecap="round"/>
    <circle cx="278" cy="202" r="5" fill="white"/>
    <line x1="292" y1="202" x2="385" y2="202" stroke="white" stroke-width="5" stroke-linecap="round"/>
    <circle cx="278" cy="229" r="5" fill="white"/>
    <line x1="292" y1="229" x2="368" y2="229" stroke="white" stroke-width="5" stroke-linecap="round"/>
  </g>
</svg>`;

function buildSvg(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#1E1E1E"/>
  ${inner}
</svg>`;
}

export default async function handler(request) {
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

  let inner;
  if (!icon || icon === 'app') {
    inner = APP_ICON_INNER;
  } else if (icon.startsWith('data:')) {
    inner = `<defs><clipPath id="c"><rect x="56" y="56" width="400" height="400" rx="40"/></clipPath></defs>
  <image href="${icon}" x="56" y="56" width="400" height="400" clip-path="url(#c)" preserveAspectRatio="xMidYMid meet"/>`;
  } else {
    // emoji — rendered by the client's font stack at display time
    inner = `<text x="256" y="256" font-size="300" text-anchor="middle" dominant-baseline="middle"
    font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif">${xmlEsc(icon)}</text>`;
  }

  return new Response(buildSvg(inner), {
    headers: {
      'content-type': 'image/svg+xml',
      'cache-control': 'public, max-age=3600',
    },
  });
}
