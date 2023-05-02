import React, { useEffect, useState } from 'react'
import FileLink from '../fileLink/FileLink';
import axios from 'axios';

export default function UserFiles(props) {
  const {userAddress} = props;
  const [files, setFiles] = useState([]);
  useEffect(()=>{
    const getFiles = async() => {
      const res = await axios.post("/userFiles", {userId: userAddress});
      console.log(res);
    }
    getFiles();

  }, [])

  return (
    <div className="userfile-container">
      <p>UserFiles</p>
        <ul>
          {files.map((f) => 
            <fileLink fileName={f} />
          )}
        </ul>
    </div>
  )
}
