'use strict';

const fs = require('fs');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const documentRoutes = require('./routes/documents');

const pkg = require('./package.json');
const SW_CACHE_VERSION = `afridoc-v${pkg.version}`;
const STATS_PATH = path.join(__dirname, 'data', 'stats.json');

const locales = {
  fr: require('./locales/fr.json'),
  en: require('./locales/en.json'),
  bm: require('./locales/bm.json'),
};

const app = express();
const PORT = process.env.PORT || 3000;
const supportedLangs = Object.keys(locales);
const IS_PROD = process.env.NODE_ENV === 'production';

/* ─── Persistent stats ───────────────────────────────── */
function loadStats() {
  try {
    return JSON.parse(fs.readFileSync(STATS_PATH, 'utf8'));
  } catch (_) {
    return { total: 0 };
  }
}

function saveStats(stats) {
  try {
    fs.mkdirSync(path.dirname(STATS_PATH), { recursive: true });
    fs.writeFileSync(STATS_PATH, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e.message);
  }
}

if (!global.docStats) {
  global.docStats = loadStats();
}

global.saveStats = saveStats;

function parseCookies(header) {
  return (header || '').split(';').reduce((acc, part) => {
    const [rawKey, ...rest] = part.trim().split('=');
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join('=') || '');
    return acc;
  }, {});
}

const rateLimitMessages = {
  fr: 'Trop de générations de documents. Réessayez dans 15 minutes.',
  en: 'Too many document generations. Please try again in 15 minutes.',
  bm: 'Dɔkimani kɛcogo caaman. Segin miniti 15 kɔfɛ.',
};

const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: (req) => {
    const cookies = parseCookies(req.headers.cookie);
    const lang = supportedLangs.includes(req.query.lang) ? req.query.lang
      : supportedLangs.includes(cookies.lang) ? cookies.lang : 'fr';
    return rateLimitMessages[lang] || rateLimitMessages.fr;
  },
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(morgan('dev'));
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ─── Language & i18n middleware ──────────────────────── */
app.use((req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);
  const requestedLang = supportedLangs.includes(req.query.lang) ? req.query.lang : '';
  const cookieLang = supportedLangs.includes(cookies.lang) ? cookies.lang : '';
  const lang = requestedLang || cookieLang || 'fr';

  if (requestedLang && requestedLang !== cookieLang) {
    const cookieFlags = IS_PROD
      ? `lang=${requestedLang}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`
      : `lang=${requestedLang}; Path=/; Max-Age=31536000; SameSite=Lax`;
    res.setHeader('Set-Cookie', cookieFlags);
  }

  res.locals.lang = lang;
  res.locals.t = locales[lang] || locales.fr;
  res.locals.stats = global.docStats;
  res.locals.pageTitle = (locales[lang] || locales.fr).pageTitle || 'Afridoc';
  res.locals.pageDesc = (locales[lang] || locales.fr).pageDesc || '';
  res.locals.canonical = `https://afridoc.app${req.path}`;
  next();
});

/* ─── Security headers ────────────────────────────────── */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; ')
  );
  next();
});

/* ─── Serve sw.js with injected cache version ─────────── */
app.get('/sw.js', (req, res) => {
  try {
    const swContent = fs.readFileSync(path.join(__dirname, 'public', 'sw.js'), 'utf8')
      .replace("'AFRIDOC_CACHE_VERSION'", `'${SW_CACHE_VERSION}'`);
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.setHeader('Cache-Control', 'no-store');
    res.send(swContent);
  } catch (e) {
    console.error('Failed to serve sw.js:', e);
    res.status(500).send('/* Service Worker unavailable */');
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/documents', (req, res, next) => {
  if (req.method === 'POST' && req.path.endsWith('/generate')) {
    return generateLimiter(req, res, next);
  }
  return next();
});

app.get('/', (req, res) => {
  res.render('index', { stats: global.docStats });
});

app.get('/about', (req, res) => {
  const t = res.locals.t;
  res.locals.pageTitle = t.aboutPageTitle || 'À propos — Afridoc';
  res.locals.pageDesc = t.aboutPageDesc || '';
  res.render('about');
});

app.get('/faq', (req, res) => {
  const t = res.locals.t;
  res.locals.pageTitle = t.faqPageTitle || 'FAQ — Afridoc';
  res.locals.pageDesc = t.faqPageDesc || '';
  res.render('faq');
});

app.get('/api/stats', (req, res) => {
  res.json({ total: global.docStats.total });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.floor(process.uptime()), timestamp: new Date().toISOString() });
});

app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send([
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    'Sitemap: https://afridoc.app/sitemap.xml',
  ].join('\n'));
});

app.get('/sitemap.xml', (req, res) => {
  const docTypes = ['cv', 'lettre-motivation', 'demande-emploi', 'demande-stage',
    'attestation-travail', 'declaration-honneur', 'lettre-administrative',
    'demande-acte-naissance', 'contrat-travail', 'recu-paiement', 'procuration',
    'demande-conge', 'certificat-residence', 'lettre-recommandation',
    'mise-en-demeure', 'attestation-scolarite'];

  const base = 'https://afridoc.app';
  const today = new Date().toISOString().split('T')[0];

  const urls = [
    `<url><loc>${base}/</loc><changefreq>weekly</changefreq><priority>1.0</priority><lastmod>${today}</lastmod></url>`,
    `<url><loc>${base}/about</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
    `<url><loc>${base}/faq</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
    ...docTypes.map((t) => `<url><loc>${base}/documents/${t}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`),
  ].join('\n  ');

  res.setHeader('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${urls}\n</urlset>`);
});

app.use('/documents', documentRoutes);

app.use((req, res) => {
  res.status(404).render('404');
});

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: err.message });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Afridoc server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
