import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socket.on('stream', (chunk) => {
      console.log('Received chunk:', chunk.byteLength, 'bytes');
      appendChunk(chunk);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && !mediaSourceRef.current) {
      mediaSourceRef.current = new MediaSource();
      mediaSourceRef.current.addEventListener('sourceopen', handleSourceOpen);
      videoRef.current.src = URL.createObjectURL(mediaSourceRef.current);
    }
  }, [videoRef.current]);

  const handleSourceOpen = () => {
    console.log('MediaSource opened');
    sourceBufferRef.current = mediaSourceRef.current.addSourceBuffer('video/mp4; codecs="avc1.4D401F"');
  };

  const appendChunk = (chunk) => {
    if (sourceBufferRef.current && !sourceBufferRef.current.updating) {
      try {
        console.log('Appending chunk:', chunk.byteLength, 'bytes');
        sourceBufferRef.current.appendBuffer(new Uint8Array(chunk));
      } catch (error) {
        console.error('Error appending chunk:', error);
      }
    }
  };

  return (
    <video
      ref={videoRef}
      style={{ width: '640px', height: '360px', border: 'solid 1px' }}
      controls
      autoPlay
    />
  );
};

export default VideoPlayer;
