const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG and WEBP are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max size
  },
  fileFilter: fileFilter
});

router.post('/', upload.fields([
  { name: 'person', maxCount: 1 },
  { name: 'cloth', maxCount: 1 }
]), async (req, res) => {
  const requestId = crypto.randomBytes(16).toString('hex');
  
  try {
    // Validate request
    if (!req.files || !req.files['person'] || !req.files['cloth']) {
      return res.status(400).json({
        success: false,
        error: 'Both person and clothing images are required.',
        request_id: requestId
      });
    }

    const personFile = req.files['person'][0];
    const clothFile = req.files['cloth'][0];

    // Check API Key and URL
    const apiUrl = process.env.CATVTON_API_URL;
    const apiKey = process.env.CATVTON_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('CatVTON API configuration is missing.');
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append('person', fs.createReadStream(personFile.path));
    formData.append('cloth', fs.createReadStream(clothFile.path));

    // Send request to CatVTON API
    const response = await axios.post(`${apiUrl}/tryon`, formData, {
      headers: {
        ...formData.getHeaders(),
        'X-API-Key': apiKey
      },
      responseType: 'arraybuffer', // Expecting image data or json
      validateStatus: function (status) {
        return status >= 200 && status < 600; // Resolve all statuses to handle them manually
      }
    });

    // Handle CatVTON response errors
    if (response.status !== 200) {
      let errorMessage = 'CatVTON server error';
      if (response.status === 401) errorMessage = 'Invalid CatVTON API key';
      else if (response.status === 400) errorMessage = 'Invalid/missing image';
      else if (response.status === 413) errorMessage = 'Image too large';
      else if (response.status === 429) errorMessage = 'Too many requests';
      else if (response.status === 502) errorMessage = 'CatVTON unavailable';
      else if (response.status === 504) errorMessage = 'CatVTON timeout';

      return res.status(response.status).json({
        success: false,
        error: errorMessage,
        request_id: requestId
      });
    }

    // Process successful response
    let generatedImage = null;
    const contentType = response.headers['content-type'];

    if (contentType && contentType.includes('application/json')) {
      const jsonResponse = JSON.parse(response.data.toString());
      if (jsonResponse.image) {
        generatedImage = jsonResponse.image; // Assume base64 or URL
      } else {
        throw new Error('Invalid response format from CatVTON API.');
      }
    } else if (contentType && contentType.startsWith('image/')) {
      // It's a direct image response, convert to base64
      const base64Image = Buffer.from(response.data, 'binary').toString('base64');
      generatedImage = `data:${contentType};base64,${base64Image}`;
    } else {
       throw new Error('Unknown response format from CatVTON API.');
    }

    // Return the response
    res.json({
      success: true,
      request_id: requestId,
      image: generatedImage
    });

  } catch (error) {
    console.error(`[${requestId}] Error:`, error.message);
    res.status(500).json({
      success: false,
      error: 'We\'re having trouble generating your try-on right now. Please try again in a moment.',
      request_id: requestId
    });
  } finally {
    // Cleanup temporary files
    if (req.files) {
      ['person', 'cloth'].forEach(field => {
        if (req.files[field]) {
          req.files[field].forEach(file => {
            fs.unlink(file.path, (err) => {
              if (err) console.error(`Failed to delete temp file ${file.path}:`, err);
            });
          });
        }
      });
    }
  }
});

module.exports = router;
