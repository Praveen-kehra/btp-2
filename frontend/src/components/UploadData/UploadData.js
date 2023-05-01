import React, { useState } from 'react'
import "./uploadData.css";
import axios from 'axios';

export default function UploadData(props) {
    console.log(props);
    const [file, setFile] = useState(null);
    let reader;
    const handleFileLoad = (event) => {
        const text = reader.result;
        console.log(text);
        axios.post("/sendToServer", {
            textData: text,
            id: props.id
        })
    }
    const uploadHandler = (e) => {
        e.preventDefault();
        // console.log(file);
        if(file!==null){
            reader = new FileReader();
            reader.onloadend = handleFileLoad;
            reader.readAsText(file);
            // setFile(null);
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
            <button type="submit">Upload</button>
        </form>
    </div>
  )
}
