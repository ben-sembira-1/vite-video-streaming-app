// import React, { useState, useEffect } from "react";

// function App() {
//   const [frame, setFrame] = useState(null);

//   useEffect(() => {
//     const socket = new WebSocket("ws://localhost:8080/camera-video");

//     socket.onopen = () => {
//       console.log("WebSocket connection established.");
//     };

//     socket.onmessage = (event) => {
//       console.log(event.data);
//       setFrame(event.data);
//     };

//     socket.onclose = () => {
//       console.log("WebSocket connection closed.");
//     };

//     return () => {
//       socket.close();
//     };
//   }, []);

//   return (
//     <div>
//       Video App
//       {frame && (
//         <img
//           src={`data:image/jpeg;base64,${frame}`}
//           alt="Video Frame"
//           style={{ width: "100px", height: "100px" }}
//         />
//       )}
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect } from 'react';

function App() {
  const [videoSrc, setVideoSrc] = useState(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080/camera-video');

    socket.onopen = () => {
      console.log('WebSocket connection established.');
    };

    socket.onmessage = (event) => {
      const frameData = event.data;
      const blob = new Blob([frameData], { type: 'video/mp4' }); // Assuming frames are in MP4 format
      const url = URL.createObjectURL(blob);
      console.log(url);
      setVideoSrc(url);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed.');
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div>
      {videoSrc && (
        <video controls autoPlay>
          <source src={videoSrc} type="video/mp4" /> {/* Update the type as per your frame format */}
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}

export default App;
