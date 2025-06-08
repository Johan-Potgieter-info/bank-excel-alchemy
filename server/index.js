import express from 'express';
import { google } from 'googleapis';
import { Readable } from 'stream';

const app = express();
app.use(express.json({ limit: '10mb' }));

// Google Drive folder where files should be uploaded
const GOOGLE_DRIVE_FOLDER_ID = '1Dh9qpol-pEYj0BzT4EicdajGGZcx3Syr';

app.post('/api/upload', async (req, res) => {
  const { fileUrl, fileName, serviceAccountKey } = req.body;
  if (!fileUrl || !fileName || !serviceAccountKey) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const credentials =
      typeof serviceAccountKey === 'string'
        ? JSON.parse(serviceAccountKey)
        : serviceAccountKey;

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch file');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileMetadata = {
      name: fileName,
      parents: [GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: Readable.from(buffer),
    };

    const { data } = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, webViewLink',
    });

    await drive.permissions.create({
      fileId: data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    const url =
      data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`;
    res.json({ webViewLink: url });
  } catch (error) {
    console.error('Drive upload failed:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('Google Drive upload server running on port', PORT);
});
