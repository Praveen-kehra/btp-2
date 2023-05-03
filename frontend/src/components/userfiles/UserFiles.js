import React, { useState, useRef } from 'react'
import FileLink from '../fileLink/FileLink';
import axios from 'axios';

export default function UserFiles(props) {
  const userAddress = useRef(props.userAddress)
  const [files, setFiles] = useState([]);

  const getFiles = async () => {
      const res = await axios.post("/userFiles", {userId: userAddress.current});
      setFiles(res.data.files)
  }

  return (
    <div className="userfile-container">
      <p>UserFiles</p>
        <button onClick={getFiles}>Reload</button>
        <ul>
          {files.map((f) => 
            <FileLink fileName={f} id={userAddress.current}/>
          )}
        </ul>
    </div>
  )
}