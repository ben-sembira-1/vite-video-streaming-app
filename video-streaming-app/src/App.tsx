import { useState, useEffect } from "react";
import './App.css'


function App() {
  const [videoSrc, setVideoSrc] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/camera-video");

    socket.onopen = () => {
      console.log("WebSocket connection established.");
    };

    socket.onmessage = (event) => {
      const frameData = event.data;
      const blob = new Blob([frameData], { type: "video/mp4" }); // Assuming frames are in MP4 format
      const url = URL.createObjectURL(blob);
      console.log(url);
      setVideoSrc(url);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div>
      <h1>Before video</h1>
      {videoSrc && (
        <video controls autoPlay>
          <source src={videoSrc} type="video/mp4" />{" "}
          {/* Update the type as per your frame format */}
          Your browser does not support the video tag.
        </video>
      )}
      <h1>After video</h1>
    </div>
  );
}

export default App;