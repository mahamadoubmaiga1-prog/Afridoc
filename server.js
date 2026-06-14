'use strict';

const express = require('express');
const path = require('path');
const documentRoutes = require('./routes/documents');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.use('/documents', documentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Error handler
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
