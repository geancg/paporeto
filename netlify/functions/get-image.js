const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const filename = event.queryStringParameters?.file;
  if (!filename) {
    return { statusCode: 400, body: 'Missing file param' };
  }

  try {
    const store = getStore('site-images');
    const { data, metadata } = await store.getWithMetadata(filename);
    if (!data) return { statusCode: 404, body: 'Not found' };

    const buffer = Buffer.from(await data.arrayBuffer());
    return {
      statusCode: 200,
      headers: {
        'Content-Type': metadata?.mimetype || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (e) {
    return { statusCode: 404, body: 'Not found' };
  }
};
