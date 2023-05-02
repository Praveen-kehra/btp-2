import React from 'react'
import FileLink from '../fileLink/FileLink';

export default function UserFiles(props) {
  const {userAddress} = props;
  const [files, setFiles] = useState({});
  return (
    <div className="userfile-container">
        <ul>
          {files.map((f) => 
            <fileLink file={f} />
          )}
        </ul>
    </div>
  )
}
