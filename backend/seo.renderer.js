// backend/seo.renderer.js
import fs from 'fs/promises';
import path from 'path';

export async function renderWithMeta(staticPath, meta) {
    const indexPath = path.join(staticPath, 'index.html');
    let html = await fs.readFile(indexPath, 'utf8');

    // Build tags (keep your UI untouched)
    const tags = [
        `<title>${escapeHtml(meta.title || 'Kewi Store')}</title>`,
        meta.description ? `<meta name="description" content="${escapeHtml(meta.description)}">` : '',
        `<meta property="og:title" content="${escapeHtml(meta.title || '')}">`,
        meta.description ? `<meta property="og:description" content="${escapeHtml(meta.description)}">` : '',
        meta.image ? `<meta property="og:image" content="${escapeAttr(meta.image)}">` : '',
        meta.url ? `<meta property="og:url" content="${escapeAttr(meta.url)}">` : '',
        `<meta property="og:type" content="${escapeAttr(meta.type || 'website')}">`,
        // Twitter
        `<meta name="twitter:card" content="summary_large_image">`,
        `<meta name="twitter:title" content="${escapeHtml(meta.title || '')}">`,
        meta.description ? `<meta name="twitter:description" content="${escapeHtml(meta.description)}">` : '',
        meta.image ? `<meta name="twitter:image" content="${escapeAttr(meta.image)}">` : '',
        // JSON-LD (optional for product)
        meta.jsonld
            ? `<script type="application/ld+json">${JSON.stringify(meta.jsonld)}</script>`
            : '',
    ].filter(Boolean).join('\n    ');

    // Inject before </head> (minimal change, won’t touch your fonts/Bootstrap)
    html = html.replace('</head>', `  \n    ${tags}\n  </head>`);

    // Also replace existing <title> if present, to avoid duplicate titles
    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(meta.title || 'Kewi Store')}</title>`);

    return html;
}

function escapeHtml(s = '') {
    return String(s)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}
function escapeAttr(s = '') {
    return String(s).replaceAll('"', '&quot;');
}
