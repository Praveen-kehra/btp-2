import React, { useState } from 'react'
import "./uploadData.css";

export default function UploadData() {
  const [file, setFile] = useState(null);
  const uploadHandler = async(e) => {
      e.preventDefault();
      if(!file){
        console.log(file.name);
      }
  }
  return (
    <div className="upload-data-container">
        <form onSubmit={uploadHandler}>
            <label htmlFor="file">
              <span className="file-label">
                Select file
              </span>
              <input
                style={{ display: "none" }} 
                type="file" id="file" 
                accept=".txt" 
                onChange={(e) => setFile(e.target.files[0])} 
              />
            </label>
            <button type="submit" className="shareButton">Upload</button>
        </form>
    </div>
  )
}
