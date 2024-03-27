import React, { useState, useEffect } from "react";

const App = () => {
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    const fetchVideoStream = async () => {
      try {
        const response = await fetch("http://localhost:8000/video");
        if (!response.ok) {
          throw new Error("Failed to fetch video stream");
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      } catch (error) {
        console.error("Error fetching video stream:", error);
      }
    };

    fetchVideoStream();

    return () => {
      // Clean up resources when unmounting
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, []);

  return (
    <div>
      <h1>Video Stream</h1>
      {videoUrl && <video controls autoPlay src={videoUrl} />}
    </div>
  );
};

export default App;
