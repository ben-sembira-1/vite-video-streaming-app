const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors'); // Import the cors middleware
const ffmpeg = require('fluent-ffmpeg');
const {spawn} = require('child_process'); // Import spawn from child_process module

const app = express();
const server = http.createServer(app);


const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = 3001;

app.use(cors({
    origin: 'http://localhost:3000'
}));

io.on('connection', (socket) => {
    console.log('Client connected');

    // Start FFmpeg process to receive the video stream
    const ffmpegProcess = spawn('ffmpeg', [
        '-i', 'udp://localhost:1234', // Replace $input_file with your input file or stream URL
        '-c:v', 'libx265',   // H.265 codec
        '-c:v', 'libx264',   // H.264 codec
        '-f', 'mpegts',      // MPEG-TS format
        'pipe:1'             // Output to stdout
    ]);

    // Pipe FFmpeg output to Socket.IO
    ffmpegProcess.stdout.on('data', (data) => {
        console.log("data: ", data)
        socket.emit('stream', data);
    });
    ffmpegProcess.stderr.on('data', (data) => {
        console.error('FFmpeg process error:', data.toString());
    });
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
        ffmpegProcess.kill();
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});