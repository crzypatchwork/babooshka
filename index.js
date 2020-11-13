/* eslint-disable no-console */
'use strict'

const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const Mplex = require('libp2p-mplex')
const { NOISE } = require('libp2p-noise')
const Gossipsub = require('libp2p-gossipsub')
const u8 = require('uint8arrays')

const createNode = async () => {
    const node = await Libp2p.create({
        addresses: {
            listen: ['/ip4/0.0.0.0/tcp/0']
        },
        modules: {
            transport: [TCP],
            streamMuxer: [Mplex],
            connEncryption: [NOISE],
            pubsub: Gossipsub
        }
    })

    await node.start()
    return node
}

(async () => {

    const topic = 'coronachan'

    const [node] = await Promise.all([
        createNode()
    ])

    node.pubsub.on(topic, (msg) => {
        console.log(`node received: ${u8.toString(msg.data)}`)
    })

    await node.pubsub.subscribe(topic)

    process.stdin.on('readable', () => {

        let variable = process.stdin.read();

        variable = variable.toString().replace(/\n/, "");
        variable = variable.replace(/\r/, "");

        node.pubsub.publish(topic, u8.fromString(variable))

    });

})()



