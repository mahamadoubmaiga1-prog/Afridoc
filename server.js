'use strict';

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const documentRoutes = require('./routes/documents');

const locales = {
  fr: require('./locales/fr.json'),
  en: require('./locales/en.json'),
  bm: require('./locales/bm.json'),
};

const app = express();
const PORT = process.env.PORT || 3000;
const supportedLangs = Object.keys(locales);

if (!global.docStats) {
  global.docStats = { total: 0 };
}

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

app.use((req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);
  const requestedLang = supportedLangs.includes(req.query.lang) ? req.query.lang : '';
  const cookieLang = supportedLangs.includes(cookies.lang) ? cookies.lang : '';
  const lang = requestedLang || cookieLang || 'fr';

  if (requestedLang && requestedLang !== cookieLang) {
    res.setHeader('Set-Cookie', `lang=${requestedLang}; Path=/; Max-Age=31536000; SameSite=Lax`);
  }

  res.locals.lang = lang;
  res.locals.t = locales[lang] || locales.fr;
  res.locals.stats = global.docStats;
  next();
});

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
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
  res.render('about');
});

app.get('/api/stats', (req, res) => {
  res.json({ total: global.docStats.total });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.floor(process.uptime()), timestamp: new Date().toISOString() });
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
