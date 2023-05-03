import React from 'react'
import axios from 'axios'
import { useState, useRef } from 'react'

export default function FileLink(props) {
  const fileName = useRef(props.fileName)
  const userAddress = useRef(props.id)
  const [data, setdata] = useState('')

  const handleLoad = async () => {
    const res = await axios.post('/retrieveFile', {
      id : userAddress.current,
      name : fileName.current
    })

    console.log(res)
    setdata(res.data.message)
  }

  return (
    <div className="FileLink">
      <div>{fileName.current}</div>
      <button onClick={handleLoad}>Load Data</button>
      <textarea value={data}/>
    </div>
  )
}