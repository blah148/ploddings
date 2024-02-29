const express = require('express');
const next = require('next');
const helmet = require('helmet');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

server.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-eval'", // Required to allow eval()
      "https://www.google-analytics.com", // If you're using Google Analytics
      "https://mc.yandex.com", // If you're using Yandex Metrica
      // ... add other script sources as needed
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // If you have inline styles
      // ... add other style sources as needed
    ],
    imgSrc: [
      "'self'",
      "https://musescore.com", // If you're loading images from here
      "https://*.dropboxusercontent.com", // If you're loading images from Dropbox
      // ... add other image sources as needed
    ],
    mediaSrc: [
      "'self'",
      "https://*.dropboxusercontent.com", // Allow media from Dropbox
      // ... add other media sources as needed
    ],
    frameSrc: [
      "'self'",
      "https://musescore.com", // If you're using frames from Musescore
      // ... add other frame sources as needed
    ],
    connectSrc: [
      "'self'",
      "https://www.google-analytics.com", // If you're using Google Analytics
      "https://mc.yandex.com", // If you're using Yandex Metrica
      // ... add other connect sources as needed
    ],
    // ... additional directives as needed
  },
  // Set to true if you only want browsers to report errors, not block them
  // This is helpful when you're just starting to implement your CSP
  reportOnly: false,
}));

  // Custom middleware to block requests to "https://mc.yandex.com"
  server.use((req, res, next) => {
    if (req.url.includes('https://mc.yandex.com')) {
      // Block the request
      return res.status(403).send('Access to this resource is forbidden');
    }
    next();
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});

