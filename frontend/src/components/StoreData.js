import { useEffect, useRef } from 'react'
import { v4 as uuid } from 'uuid'
import io from 'socket.io-client'
import UploadData from './UploadData/UploadData';

const id = uuid().slice(0, 16);

const StoreData = () => {
    const socketRef = useRef(null)
    const folderHandle = useRef(null)

    const onClickHandler = async () => {
        folderHandle.current = await window.showDirectoryPicker({ mode : 'readwrite' })
        console.log(folderHandle)
    }

    useEffect(() => {
        console.log("first")
        // socketRef.current = io.connect("https://my-app-a0p5.onrender.com:10000")
        // socketRef.current = io.connect(`http://127.0.0.1:8081`)
        socketRef.current = io.connect()

        console.log("second")
        console.log(socketRef.current)

        socketRef.current.on('connect', () => {
            console.log('Connected to the Server')

            setTimeout(() => {
                socketRef.current.emit('id', JSON.stringify({
                    content : id
                }))
            }, 1000)
        })

        socketRef.current.on('storeData', async (data) => {
            const shard = JSON.parse(data)

            console.log('Message from server received')
            console.log(shard)

            if(folderHandle != null) {
                console.log(folderHandle.current)
                const newFileHandle = await folderHandle.current.getFileHandle(shard.id, { create : true })

                const writable = await newFileHandle.createWritable()

                await writable.write(JSON.stringify(shard))

                await writable.close()
            }
        })

        socketRef.current.on('disconnect', () => {
            console.log('Disconnectd from Socket Server')
        })

        window.addEventListener('beforeunload', (event) => {
            socketRef.current.emit('beforeConnectionClose', JSON.stringify({
                content: id
            }))

            socketRef.current.disconnect()
        })
    }, []);

    return (
        <div className="StoreData">
            <UploadData id={id}/>
            <button onClick = {onClickHandler}>Grant Permissions</button>
        </div>
    )
}

export default StoreData;