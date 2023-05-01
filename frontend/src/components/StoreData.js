import { useEffect, useRef } from 'react'
import { v4 as uuid } from 'uuid'
import io from 'socket.io-client'

const id = uuid().slice(0, 16);

const StoreData = () => {
    const socketRef = useRef(null);

    useEffect(() => {
        // socketRef.current = new WebSocket("ws://127.0.0.1:886")

        // socketRef.current.addEventListener('open', (event) => {
        //     console.log('Connected to the server');

        //     setTimeout(() => {
        //         const message = {
        //             type : 'id',
        //             content: id
        //         }

        //         socketRef.current.send(JSON.stringify(message));
        //     }, 1000)
        // })

        // socketRef.current.addEventListener('message', async (event) => {
        //     //handles the data sent by the server and stores it using file system api on local storage
        //     const shard = JSON.parse(event.data)

        //     console.log('message from server Received')

        //     var folderHandle = JSON.parse(window.localStorage.getItem('my-app'))

        //     // console.log(folderHandle)

        //     //now write the file to the system
        //     const fileHandle = await folderHandle.getFile(shard.id, { create: true })
        //     const writable = await fileHandle.createWritable()
        //     await writable.write(JSON.stringify(shard))
        //     await writable.close()
        // })

        // socketRef.current.addEventListener('close', (event) => {
        //     console.log('Disconnected from WebSocket Server')
        // })

        // window.addEventListener('beforeunload', (event) => {
        //     const message = {
        //         type : 'close',
        //         content: id
        //     }

        //     socketRef.current.send(JSON.stringify(message))

        //     socketRef.current.close()
        // })

        socketRef.current = io.connect("https://my-app-a0p5.onrender.com:10000")
        // socketRef.current = io.connect(`http://127.0.0.1:8081`)
        console.log("H")
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

            let deserialized = JSON.parse(window.localStorage.getItem('my-app'))

            const folderHandle = await window.showDirectoryPicker({
                onlyDirectory : 'true',
                name : deserialized.name,
                kind: deserialized.kind,
                isDirectory : deserialized.isDirectory
            })

            // //now we write the file to the local file system
            const fileHandle = await folderHandle.getFile(shard.id, { create : true })
            const writable = await fileHandle.createWritable()
            await writable.write(JSON.stringify(shard))
            await writable.close()
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

        </div>
    )
}

export default StoreData;