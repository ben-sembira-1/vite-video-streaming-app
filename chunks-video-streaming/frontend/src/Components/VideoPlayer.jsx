import React, { useRef, useEffect, useState } from 'react';

const VideoPlayer = ({ videoId }) => {
    const videoRef = useRef(null);
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        if (videoRef.current) {
            // Pause the video, remove the source, and reload it
            videoRef.current.pause();
            videoRef.current.removeAttribute('src');
            videoRef.current.load();
            
            // Add event listener for loadstart event
            videoRef.current.addEventListener('loadstart', handleLoadStart);
            
            // Cleanup function to remove event listener
            return () => {
                videoRef.current.removeEventListener('loadstart', handleLoadStart);
            };
        }
    }, [videoId]);

    const handleLoadStart = () => {
        // Record the start time when the video begins to load
        setStartTime(Date.now());
    };

    const handleLoadedData = () => {
        if (startTime !== null) {
            // Calculate the latency when video data is loaded
            const latency = Date.now() - startTime;
            console.log(`Latency: ${latency} ms`);
        }
    };

    return (
        <video ref={videoRef} width='320' height='240' controls autoPlay onLoadedData={handleLoadedData}>
            <source src={`http://localhost:3000/videos/${videoId}`} type='video/mp4' />
            Your browser does not support the video tag.
        </video>
    );
};

export default VideoPlayer;
