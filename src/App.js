import React, { useRef, useState } from "react";

const resizeImage = (file, maxWidth) => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

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
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const resized = await resizeImage(file, 1024);

    const formData = new FormData();
    formData.append("file", resized);
    formData.append("upload_preset", "guestupload123");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dc29mfwit/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    setUploading(false);
    setImages((prev) => [data.secure_url, ...prev]);
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif", backgroundColor: "#fff0f6" }}>
      <h1 style={{ color: "#a8326e" }}>💍 Wedding Photo Upload</h1>
      <p>Upload your special moments!</p>

      {/* Hidden Inputs */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {/* Buttons */}
      <button
        onClick={() => fileInputRef.current.click()}
        style={{
          margin: "10px",
          padding: "10px 20px",
          backgroundColor: "#a8326e",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        📁 Upload Photo
      </button>

      <button
        onClick={() => cameraInputRef.current.click()}
        style={{
          margin: "10px",
          padding: "10px 20px",
          backgroundColor: "#ff5c8a",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        📷 Open Camera
      </button>

      {uploading && <p style={{ color: "#ff9900" }}>Uploading... Please wait</p>}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "10px",
        marginTop: "20px"
      }}>
        {images.map((url, index) => (
          <img key={index} src={url} alt={`Uploaded ${index}`} style={{ width: "100%", borderRadius: "10px" }} />
        ))}
      </div>
    </div>
  );
}
