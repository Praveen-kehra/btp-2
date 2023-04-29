import { queue, addNode, showQueue, removeNode } from './queue.js'
import * as path from 'path'
import { WebSocketServer } from 'ws'
import { v4 as uuid } from 'uuid'
import { fileURLToPath } from 'url'

import express from 'express'
const app = express()

// require('dotenv').config()

const PORT = process.env.PORT || 8081
const numChunks = 2
const redundantFactor = 2

app.use(express.static(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../frontend/build')))

var clients = new Map()

var user = []

//files is a map from users to an array of their files
var files = new Map();

//shards is a map from a file to its shards(currently 3 for each file) 
var shards = new Map();

//shardLocate is a map from a particular shard to all the nodes its saved on(currently 2 for each shard)
var shardLocate = new Map();

//only one file distribute query should be run at a time, so as to avoid
//editing of queue data structure by multiple actors
//client Map should remain same while function is running
function distributeData(userId, dataStore) {
    //need to generate ids for file and its shards
    const fileId = uuid.slice(0, 20)

    if(files.has(userId) == false) {
        files.set(userId, [])
    }

    files.set(userId, [...files.get(userId), fileId])

    while(dataStore.length > 0) {
        const shardId = uuid().slice(0, 24)

        //find last element of dataStore and delete it
        const shard = dataStore[dataStore.length - 1]
        dataStore.pop()

        shard.id = shardId

        if(shards.has(fileId) == false) {
            shards.set(fileId, [])
        }

        shards.set(fileId, [...shards.get(fileId), shardId])

        let counter = 0

        while(queue.length > 0 && counter < redundantFactor) {
            //removing a node from the end of the queue
            const node = queue[queue.length - 1]
            queue.pop()

            const nodeSocket = clients.get(node)

            nodeSocket.send(JSON.stringify(shard))

            if(shardLocate.has(shardId) == false) {
                shardLocate.set(shardId, [])
            }

            shardLocate.set(shardId, [...shardLocate.get(shardId), node])

            queue.unshift(node)

            counter++
        }
    }
}

app.post("/sendToServer", (req, res) => {
    //data is in string format req.body.textData
    dataStore = []
    let data = req.body.textData
    const id = req.body.id

    if(user.includes(id) == false) {
        user.push(id);
    }

    let chunkSize = Math.floor(data / numChunks)

    let i = 0, counter = 0

    while(true) {
        i = counter * chunkSize

        if(i >= data.length) break

        let currObject = {
            position : counter,
            store : data.splice(counter * chunkSize, Math.min(chunkSize, data.length - i))
        }

        dataStore.push(currObject)
        
        counter++
    }

    distributeData(id, dataStore)

});

// app.post("/nodeOnline", (req, res) => {
//     const ethAddress = req.body.ethereumAddress;

//     //this node is now live
//     addNode(queue, ethAddress);

//     // res.json({message : 'Eth Address Received.'});
// })

// app.post("/nodeOffline", (req, res) => {
//     const ethAddress = req.body.ethereumAddress;

//     //this node is now offline
//     removeNode(queue, ethAddress);
// })

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/client/build', 'index.html'))
})

app.listen(PORT, ()=> {
    console.log(`Server is running on ${PORT}`)
})

// const ws = new WebSocketServer({ port : 886 })

// ws.on('connection', (socket) => {
//     console.log('Client Connected')

//     setTimeout(() => {
//         console.log('sent')
//         socket.send(JSON.stringify({
//             id : '83838',
//             position: 73,
//             store: 'lksjdfsdklf'
//         }))
//     }, 10000)

//     socket.on('message', (message) => {
//         const obj = JSON.parse(message)

//         if(obj.type === 'id') {
//             clients.set(obj.content, socket)
//             addNode(queue, obj.content)
//         } else if(obj.type === 'close') {
//             clients.delete(obj.content)
//             removeNode(queue, obj.content)
//         }
//     })

//     socket.on('close', () => {
//         console.log('Disconnected')
//     })
// })