import React, { useRef, useState } from "react";

const resizeImage = (file, maxWidth) => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const reader = new FileReader();

    reader.onload = (e) => (img.src = e.target.result);

    img.onload = () => {
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, { type: "image/jpeg" }));
      }, "image/jpeg", 0.8);
    };

    reader.readAsDataURL(file);
  });
};

export default function App() {
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoCaptureRef = useRef(null);
  const videoRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setUploading(true);
    const uploaded = [];

    for (let file of files) {
      let uploadFile = file;
      if (file.type.startsWith("image/")) {
        uploadFile = await resizeImage(file, 1024);
      }

      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("upload_preset", "guestupload123");

      const res = await fetch(
        file.type.startsWith("video/")
          ? "https://api.cloudinary.com/v1_1/dc29mfwit/video/upload"
          : "https://api.cloudinary.com/v1_1/dc29mfwit/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      uploaded.push({ url: data.secure_url, type: file.type });
    }

    setUploading(false);
    setMedia((prev) => [...uploaded, ...prev]);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
    videoRef.current.srcObject = stream;
    setStream(stream);
    setRecording(true);

    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "video/mp4" });
      const file = new File([blob], "recorded-video.mp4", { type: "video/mp4" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "guestupload123");

      const res = await fetch("https://api.cloudinary.com/v1_1/dc29mfwit/video/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setMedia((prev) => [{ url: data.secure_url, type: "video/mp4" }, ...prev]);
    };

    recorder.start();
    setMediaRecorder(recorder);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    stream.getTracks().forEach((track) => track.stop());
    setRecording(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", background: "#fff0f6", textAlign: "center" }}>
      <h1 style={{ color: "#a8326e" }}>💍 Wedding Media Upload</h1>
      <p>Upload, Take, or Record Photos & Videos</p>

      <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={handleFileSelect} style={{ display: "none" }} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} style={{ display: "none" }} />
      <input ref={videoCaptureRef} type="file" accept="video/*" capture="environment" onChange={handleFileSelect} style={{ display: "none" }} />

      <div style={{ margin: "10px" }}>
        <button onClick={() => fileInputRef.current.click()} style={btnStyle}>📁 Upload from Gallery</button>
        <button onClick={() => cameraInputRef.current.click()} style={btnStyle}>📷 Take Photo</button>
        <button onClick={() => videoCaptureRef.current.click()} style={btnStyle}>🎥 Record Video</button>
        {!recording ? (
          <button onClick={startRecording} style={btnStyle}>📹 Start Recording</button>
        ) : (
          <button onClick={stopRecording} style={{ ...btnStyle, backgroundColor: "red" }}>🛑 Stop Recording</button>
        )}
      </div>

      {recording && <video ref={videoRef} autoPlay muted style={{ width: "100%", maxWidth: "400px", margin: "auto", borderRadius: "10px" }} />}
      {uploading && <p style={{ color: "orange" }}>📤 Uploading... Please wait</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginTop: "20px" }}>
        {media.map((item, index) => (
          <div key={index}>
            {item.type.startsWith("image/") ? (
              <img src={item.url} alt={`Uploaded ${index}`} style={{ width: "100%", borderRadius: "10px" }} />
            ) : (
              <>
                <video src={item.url} controls style={{ width: "100%", borderRadius: "10px" }} />
                <a href={item.url} download style={{ display: "inline-block", marginTop: "5px", fontSize: "14px", color: "#a8326e" }}>⬇ Download Video</a>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const btnStyle = {
  margin: "10px",
  padding: "10px 15px",
  backgroundColor: "#a8326e",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};
