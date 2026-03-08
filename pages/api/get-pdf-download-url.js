import B2 from 'backblaze-b2';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { fileName } = req.body;

    if (!fileName || typeof fileName !== 'string') {
      return res.status(400).json({ error: 'A valid fileName is required.' });
    }

    const b2 = new B2({
      applicationKeyId: process.env.B2_KEY_ID,
      applicationKey: process.env.B2_APPLICATION_KEY,
    });

    await b2.authorize();

    const authResponse = await b2.getDownloadAuthorization({
      bucketId: process.env.B2_BUCKET_ID,
      fileNamePrefix: fileName,
      validDurationInSeconds: 300,
    });

    const encodedFileName = fileName
      .split('/')
      .map(encodeURIComponent)
      .join('/');

    const encodedToken = encodeURIComponent(
      authResponse.data.authorizationToken
    );

    const downloadUrl = `https://f005.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${encodedFileName}?Authorization=${encodedToken}`;

    return res.status(200).json({
      downloadUrl,
      expiresInSeconds: 300,
    });
  } catch (error) {
    console.error('Error generating PDF download URL:', error);
    return res.status(500).json({ error: 'Failed to generate download URL.' });
  }
}
