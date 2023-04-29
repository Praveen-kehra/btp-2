//queue stores list of nodes that are free

export var queue = []

export const addNode = (queue, EthAddress) => {
    if(queue.includes(EthAddress) == false) {
        queue.push(EthAddress);
    }
}

export const showQueue = (queue) => {
    queue.forEach((val) => {
        console.log(val);
    })
}

export const removeNode = (queue, Node) => {
    queue = queue.filter((value) => {
        return value !== Node;
    })
}

// module.exports = {
//     queue,
//     addNode,
//     showQueue
// }