const { getStore } = require('@netlify/blobs');
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const store = getStore('site-content');
    const data = await store.get('content', { type: 'json' });
    if (data) {
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }
  } catch (e) {
    // Blobs not available, fall through to file
  }

  try {
    const filePath = path.join(__dirname, '../../content.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Content not found' }) };
  }
};
