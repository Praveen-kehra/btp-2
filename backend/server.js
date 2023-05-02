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

const numChunks = 2
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

//this is a mapping from (userId => (fileName => fileId))
var fileMapping = new Map();

//shards is a map from a file to its shards
var shards = new Map();

//shardLocate is a map from a particular shard to all the nodes its saved on(currently 2 for each shard)
var shardLocate = new Map();

//this stores the hash of every shard
var shardHashes = new Map();

//this stores the size of the data Store generated for every file
var dataStoreSizes = new Map();

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

    if(fileMapping.has(userId) == false) {
        fileMapping.set(userId, new Map())
    }

    fileIds.set(userId, [...fileIds.get(userId), fileId])

    fileNames.set(userId, [...fileNames.get(userId), fileName])

    fileMapping.get(userId).set(fileName, fileId)

    dataStoreSizes.set(fileId, dataStore.length)

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

    console.log(user)

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

var tempDataStore = []

app.post('/retrieveFile', (req, res) => {

    tempDataStore = []

    const userId = req.body.id
    const fileName = req.body.name

    if(user.includes(userId) == false) {
        res.json({ message : 'Cannot find specified user.'})
        return
    }

    if(fileMapping.get(userId).has(fileName) == false) {
        res.json({ message : 'Cannot find the specified file.'})
        return
    }

    //fileMapping tells us relationship between fileNames and fileIds for every userId
    const fileId = fileMapping.get(userId).get(fileName)

    for(const shardId of shards.get(fileId)) {
        console.log(shardId)

        for(const nodeId of shardLocate.get(shardId)) {
            console.log("Ran")
            if(clients.has(nodeId) == true) {
                const nodeSocket = clients.get(nodeId)
                const callback = uuid().slice(0, 50)

                nodeSocket.on(callback, (data) => {
                    tempDataStore.push(data)

                    if(tempDataStore.length == dataStoreSizes.get(fileId)) {
                        //sort the dataStore first
                        tempDataStore.sort((first, second) => {
                            let a = parseInt(first.position)
                            let b = parseInt(second.position)

                            if(a < b) return -1;
                            else if(a == b) return 0;
                            else return 1;
                        })

                        let data = ''

                        for(const obj of tempDataStore) {
                            data += obj.store
                        }

                        res.json({ message : data })
                    }
                })

                nodeSocket.emit('serverRequestData', { id : shardId, callback : callback })
            }

            break
        }
    }
})

app.post("/userFiles", (req, res) => {
    const userId = req.body.id
    return res.json(
        {files: fileNames.get(userId)}
    );
})

app.get("*", (req, res) => {
    res.sendFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../frontend/build', 'index.html'))
})

io.on('connection', (socket) => {
    console.log('A user connected')

    // setTimeout(() => {
    //     console.log('sent')
    //     socket.emit('serverRequestData', {
    //         id : '7ad1e776-8536-43d0-8fa1-'
    //     })
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