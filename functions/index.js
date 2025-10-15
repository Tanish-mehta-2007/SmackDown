const functions = require('firebase-functions');
const express = require('express');
const fetch = require('node-fetch');

const app = express();

// Parse JSON bodies and raw bodies
app.use(express.json());
app.use(express.raw({ type: '*/*', limit: '5mb' }));

// Target backend (Render)
const TARGET = process.env.TARGET_BACKEND || 'https://smackdown-r2qj.onrender.com';

app.all('/api/*', async (req, res) => {
  try {
    const path = req.path; // includes /api/...
    const url = `${TARGET}${path}`;
    console.log(`Proxying ${req.method} ${path} -> ${url}`);

    // Copy headers but remove host to avoid host mismatch
    const headers = { ...req.headers };
    delete headers.host;

    const options = {
      method: req.method,
      headers,
      // For GET/HEAD no body
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
      redirect: 'manual'
    };

    const upstream = await fetch(url, options);

    // copy status
    res.status(upstream.status);

    // copy headers except hop-by-hop
    upstream.headers.forEach((value, name) => {
      const lname = name.toLowerCase();
      if (!['transfer-encoding', 'connection', 'keep-alive', 'upgrade', 'content-encoding'].includes(lname)) {
        res.setHeader(name, value);
      }
    });

    const buffer = await upstream.buffer();
    res.send(buffer);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Proxy error', detail: err.message });
  }
});

exports.apiProxy = functions.https.onRequest(app);
