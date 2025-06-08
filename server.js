import express from 'express';
import multer from 'multer';

const CONVERT_API_KEY = 'secret_gwACX7APZCZuyT88';
const API_BASE_URL = 'https://v2.convertapi.com';

const app = express();
const upload = multer();

app.post('/api/convert', upload.single('File'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const formData = new FormData();
    formData.append('File', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
    formData.append('StoreFile', 'true');
    if (req.body.Password) {
      formData.append('Password', req.body.Password);
    }

    const response = await fetch(`${API_BASE_URL}/convert/pdf/to/xlsx?Secret=${CONVERT_API_KEY}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${CONVERT_API_KEY}`
      }
    });

    const data = await response.text();
    res.status(response.status);
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }
    res.send(data);
  } catch (err) {
    console.error('Error forwarding to ConvertAPI:', err);
    res.status(500).json({ error: 'Conversion failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
