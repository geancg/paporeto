const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const auth = event.headers.authorization || '';
  const password = process.env.ADMIN_PASSWORD || 'papo-reto-2025';
  if (auth !== `Bearer ${password}`) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const { filename, data, mimetype } = JSON.parse(event.body);
    if (!filename || !data) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'filename and data required' }) };
    }

    const store = getStore('site-images');
    const buffer = Buffer.from(data, 'base64');
    await store.set(filename, buffer, { metadata: { mimetype } });

    const url = `/.netlify/functions/get-image?file=${encodeURIComponent(filename)}`;
    return { statusCode: 200, headers, body: JSON.stringify({ url, filename }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
