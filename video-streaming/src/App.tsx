import React, { useEffect, useRef, useState } from 'react';
import './styles.css'; // Import your CSS file

const App: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const ws = useRef<WebSocket | null>(null);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    useEffect(() => {
        const establishWebSocketConnection = () => {
            ws.current = new WebSocket('ws://localhost:8000/ws');

            if (ws.current) {
                ws.current.binaryType = 'arraybuffer';
                ws.current.onmessage = handleWebSocketMessage;
                ws.current.onclose = handleWebSocketClose;
            }
        };

        establishWebSocketConnection();

        return () => {
            if (ws.current !== null && ws.current.readyState === WebSocket.OPEN) {
                ws.current.close();
            }
        };
    }, []);

    const handleWebSocketMessage = async (event: MessageEvent) => {
        const data = event.data;
        console.log('Received data:', data);
        console.log('Data type:', typeof data);

        if (typeof data === 'string') {
            console.log("string")
            handleTextMessage(data);
        } else if (data instanceof Blob) {
            console.log("Blob")
            handleBlobMessage(data);
        } else if (data instanceof ArrayBuffer) {
            console.log("ArrayBuffer")
            handleArrayBufferMessage(data);
        }
    };

    const handleTextMessage = (data: string) => {
        console.log('Text message from server:', data);
        // Handle text message if needed
    };

    const handleBlobMessage = (data: Blob) => {
        console.log('Blob received:', data.size);
        const blobUrl = URL.createObjectURL(data);
        setVideoSource(blobUrl);
    };

    const handleArrayBufferMessage = (data: ArrayBuffer) => {
        console.log('ArrayBuffer received:', data.byteLength);
        console.log('ArrayBuffer bytes:', new Uint8Array(data));
        // Assuming the ArrayBuffer represents video data with MIME type 'video/mp4'
        const blob = new Blob([data], { type: 'video/mp4' });
        const blobUrl = URL.createObjectURL(blob);
        setVideoSource(blobUrl);
    };

    const setVideoSource = (sourceUrl: string) => {
        if (videoRef.current) {
            console.log("sourceUrl: ",sourceUrl)
            videoRef.current.src = sourceUrl;
            videoRef.current.addEventListener('loadedmetadata', () => {
                if (!videoRef.current.paused) {
                    videoRef.current.play().catch((error) => {
                        console.error('Failed to play video:', error);
                    });
                }
            });
        }
    };

    const handleWebSocketClose = (event: CloseEvent) => {
        console.log('WebSocket connection closed:', event);
        // Handle WebSocket close event if needed
    };
    return (
        <div className="video-container">
            <h1>WebSocket Messages</h1>
            <p>Check console for server messages.</p>
            <video
                ref={videoRef}
                className="video-player"
                controls
                autoPlay
                muted
                onLoadedData={() => setIsLoaded(true)}
            />
        </div>
    );
};

export default App;
