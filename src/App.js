import "./App.css";
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

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoCaptureRef = useRef(null);

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

  return (
    <div
      style={{
        position: "relative",
        padding: "2rem",
        textAlign: "center",
        color: "#6a1b9a",
        backgroundImage: `url(${process.env.PUBLIC_URL + "/Background.png"})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center",
        minHeight: "100dvh",
      }}
    >
      {/* Background Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255,255,255,0.7)",
          zIndex: 0,
        }}
      />

      {/* Main Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "1rem",
          textAlign: "center",
        }}
      >
     <h1
  style={{
    fontFamily: "'Sweet Gentle', cursive",
    fontSize: window.innerWidth < 600 ? "1.4rem" : "2.2rem",
    fontWeight: "600",
    marginTop: window.innerWidth < 600 ? "0.5rem" : "2rem",
    marginBottom: "0.5rem",
  }}
>
  Ramez & Maria Big Moments 💍♥
</h1>


        <p>Upload, Take, or Record Photos & Videos</p>

        {/* Hidden Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        <input
          ref={videoCaptureRef}
          type="file"
          accept="video/*"
          capture="environment"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        {/* Buttons */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          <button
            onClick={() => fileInputRef.current.click()}
            style={btnStyle}
          >
            📁 Upload from Gallery
          </button>
          <button
            onClick={() => cameraInputRef.current.click()}
            style={btnStyle}
          >
            📷 Take Photo
          </button>
          <button
            onClick={() => videoCaptureRef.current.click()}
            style={btnStyle}
          >
            🎥 Record Video
          </button>
        </div>

        {uploading && (
          <p style={{ color: "orange" }}>📤 Uploading... Please wait</p>
        )}

        {/* Media Preview */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          {media.map((item, index) => (
            <div key={index}>
              {item.type.startsWith("image/") ? (
                <img
                  src={item.url}
                  alt={`Uploaded ${index}`}
                  style={{ width: "100%", borderRadius: "10px" }}
                />
              ) : (
                <>
                  <video
                    src={item.url}
                    controls
                    style={{ width: "100%", borderRadius: "10px" }}
                  />
                  <a
                    href={item.url}
                    download
                    style={{
                      display: "inline-block",
                      marginTop: "5px",
                      fontSize: "14px",
                      color: "#a8326e",
                    }}
                  >
                    ⬇ Download Video
                  </a>
                </>
              )}
            </div>
          ))}
        </div>
      </div> {/* ✅ this was the missing closing div */}
    </div>
  );
}

const btnStyle = {
  margin: "8px",
  padding: "8px 12px",
  backgroundColor: "#6a1b9a",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

<h1 style={{ fontFamily: 'Sweet Gentle' }}>
  Ramez & Maria Big Moments 💍♥
</h1>
