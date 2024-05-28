const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Configure AWS SDK v3 S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Endpoint to handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  const fileContent = fs.readFileSync(req.file.path);
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: req.file.originalname,
    Body: fileContent
  };

  try {
    const command = new PutObjectCommand(params);
    const data = await s3Client.send(command);
    res.status(200).send(`File uploaded successfully. ${data.Location}`);
  } catch (err) {
    res.status(500).send(err);
  } finally {
    // Remove file from local server after upload
    fs.unlinkSync(req.file.path);
  }
});


app.get('/check',async (req, res) => {
    res.status(200).send("Health Check Ok !!!")
})



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
