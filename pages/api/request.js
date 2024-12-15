
import axios from 'axios';
import crypto from 'crypto';
require('dotenv').config({ path: '.env.local' });

const bucketName = process.env.NEXT_PUBLIC_CLOUD_bucketName;

const bucketDomain = process.env.NEXT_PUBLIC_CLOUD_bucketDomain; 
const accessKey = process.env.NEXT_PUBLIC_CLOUD_SDK_AK; 
const secretKey = process.env.NEXT_PUBLIC_CLOUD_SDK_SK;

// Generate an authorization header for the OBS API request
const generateAuthHeader = (method, canonicalizedResource) => {
  const date = new Date().toUTCString();
  const stringToSign = `${method}\n\n\n${date}\n${canonicalizedResource}`;
  const signature = crypto
    .createHmac('sha1', secretKey)
    .update(stringToSign)
    .digest('base64');
  return { Authorization: `OBS ${accessKey}:${signature}`, Date: date };
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { Authorization, Date } = generateAuthHeader('GET', `/${bucketName}/`);
      const response = await axios.get(`https://${bucketDomain}/`, {
        headers: {
          Authorization,
          Date,
        },
      });

      // Extract file keys and derive UUIDs
      const files = response.data
        .match(/<Key>(.*?)<\/Key>/g)
        .map((key) => key.replace(/<\/?Key>/g, ''))
        .map((file) => ({
          file,
          uuid: file.split('/')[0], // Assuming UUID is the first part before a slash
        }));

      res.status(200).json({ files });
    } catch (error) {
      console.error('Error fetching files:', error.message);
      res.status(500).json({ error: 'Failed to fetch files from OBS.' });
    }
  } else if (req.method === 'DELETE') {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const encodedFilename = encodeURIComponent(filename);

    try {
      const { Authorization, Date } = generateAuthHeader('DELETE', `/${bucketName}/${encodedFilename}`);
      await axios.delete(`https://${bucketDomain}/${encodedFilename}`, {
        headers: {
          Authorization,
          Date,
        },
      });

      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error.message);
      res.status(500).json({ error: 'Failed to delete the file from OBS.' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}