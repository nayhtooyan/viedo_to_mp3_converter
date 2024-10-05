const express = require('express');
const fileUpload = require('express-fileupload');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Middleware for file uploads
app.use(fileUpload());
app.use(express.static('public'));
app.use(express.static('uploads'));

// Endpoint for video to MP3 conversion
app.post('/convert', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const videoFile = req.files.videoFile;
    const inputPath = path.join(__dirname, 'uploads', videoFile.name);
    const outputPath = path.join(__dirname, 'uploads', 'present_by_codecollab.mp3');

    // Move the uploaded file to the uploads directory
    videoFile.mv(inputPath, (err) => {
        if (err) {
            return res.status(500).send(err);
        }

        // Use ffmpeg to convert video to MP3
        ffmpeg(inputPath)
            .toFormat('mp3')
            .on('end', () => {
                // After conversion, send the file for download
                res.download(outputPath, (err) => {
                    if (err) {
                        console.error(err);
                    }
                    // Clean up files after download
                    fs.unlinkSync(inputPath); // Remove uploaded video
                    fs.unlinkSync(outputPath); // Remove converted MP3
                });
            })
            .on('error', (err) => {
                console.error(err);
                res.status(500).send('Error converting file.');
            })
            .save(outputPath);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
