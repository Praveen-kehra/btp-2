import { queue, addNode, showQueue, removeNode } from './queue.js'
import * as path from 'path'
import { v4 as uuid } from 'uuid'
import { fileURLToPath } from 'url'
import http from 'http'
import { Server } from 'socket.io'
import bodyParser from 'body-parser'

import express from 'express'

import d from 'dotenv'

d.config()

const PORT = process.env.PORT || 3000

console.log(PORT)

const app = express()
const server = http.Server(app).listen(PORT, () => {
    console.log('Listening on PORT ' + PORT)
})

const io = new Server(server)

const numChunks = 4
const redundantFactor = 2

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended : false }))
app.use(express.static(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../frontend/build')))

var clients = new Map()

var user = []

//filesName is a map from users to an array of their files(file Names)
var fileNames = new Map();

//filesIds is a map from users to an array of their files(file Ids)
var fileIds = new Map();

//this is a mapping from fileName to fileId
var fileMapping = new Map();

//shards is a map from a file to its shards(currently 3 for each file) 
var shards = new Map();

//shardLocate is a map from a particular shard to all the nodes its saved on(currently 2 for each shard)
var shardLocate = new Map();

//only one file distribute query should be run at a time, so as to avoid
//editing of queue data structure by multiple actors
//client Map should remain same while function is running
function distributeData(userId, dataStore, fileName) {
    //need to generate ids for file and its shards
    console.log(fileNames)
    const fileId = uuid().slice(0, 20)

    if(fileIds.has(userId) == false) {
        fileIds.set(userId, [])
    }

    if(fileNames.has(userId) == false) {
        fileNames.set(userId, [])
    }

    //if the fileName has already been uploaded by the user, do not process/distribute that file further
    if(fileNames.get(userId).includes(fileName) == true) {
        return false
    }

    fileIds.set(userId, [...fileIds.get(userId), fileId])

    fileNames.set(userId, [...fileNames.get(userId), fileName])

    fileMapping.set(fileName, fileId)

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

            nodeSocket.emit('storeData', JSON.stringify(shard))

            if(shardLocate.has(shardId) == false) {
                shardLocate.set(shardId, [])
            }

            shardLocate.set(shardId, [...shardLocate.get(shardId), node])

            queue.unshift(node)

            counter++
        }
    }

    // console.log(user)
    // console.log(fileNames)
    // console.log(shards)
    // console.log(shardLocate)

    return true
}

app.post("/sendToServer", (req, res) => {
    //data is in string format req.body.textData
    let dataStore = []
    let data = req.body.textData
    //id of sender
    const id = req.body.id
    const name = req.body.name

    if(user.includes(id) == false) {
        user.push(id);
    }

    let chunkSize = parseInt(Math.floor(data.length / numChunks))

    // console.log(chunkSize)

    let i = 0, counter = 0

    while(true) {
        i = counter * chunkSize

        // console.log(i)

        if(i >= data.length) break;

        let currObject = {
            position : counter,
            store : data.slice(i, i + Math.min(chunkSize, data.length - i))
        }

        console.log(currObject.store)

        dataStore.push(currObject)
        
        counter++
    }

    const returnVal = distributeData(id, dataStore, name)

    console.log(returnVal)

    if(returnVal == true) {
        res.json({ message : 'File Stored successfully.'})
    } else {
        res.json({ message : 'Cannot store file with the same name twice.'})
    }

})

app.get("*", (req, res) => {
    res.sendFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../frontend/build', 'index.html'))
})

io.on('connection', (socket) => {
    console.log('A user connected')

    // setTimeout(() => {
    //     console.log('sent')
    //     socket.emit('storeData', JSON.stringify({
    //         id : '83838',
    //         position: 73,
    //         store: 'lksjdfsdklf'
    //     }))
    // }, 10000)

    socket.on('id', (data) => {
        const obj = JSON.parse(data)

        clients.set(obj.content, socket)
        addNode(queue, obj.content)

        console.log('id received ' + obj.content)
    })

    socket.on('beforeConnectionClose', (data) => {
        const obj = JSON.parse(data)

        clients.delete(obj.content)
        removeNode(queue, obj.content)
    })

    socket.on('disconnect', () => {
        console.log('Client has Disconnected')
    })
})