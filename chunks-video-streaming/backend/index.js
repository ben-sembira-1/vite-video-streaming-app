const express = require('express');
const fs = require('fs');

const app = express();
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
const videoFileMap = {
    'ffmpeg': 'videos/random_video.mp4',
    'vikings': 'videos/vikings_short.mp4 (360p).mp4'
};
app.get('/videos/:filename', (req, res) => {
    const fileName = req.params.filename;
    const filePath = videoFileMap[fileName];
    if (!filePath) {
        return res.status(404).send('File not found');
    }
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const startTimestamp = Date.now(); // Capture the server-side timestamp

    if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
            'Content-Range': `bytes ${start} - ${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4'
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4'
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    }

    res.on('finish', () => {
        const endTimestamp = Date.now(); // Capture the server-side timestamp when response finishes
        console.log(`Server-side latency: ${endTimestamp - startTimestamp} ms`);
    });
});

app.listen(3000, () => {
    console.log('server is listening on port 3000');
});
