import net from 'net'
import dgram from 'dgram'
import Client from './client.js'
import express from 'express'

export default class Controller {

    broadcastPort = 4210
    controllerPort = 9999
    expressPort = 8080
    controllerServer = net.createServer()
    broadcastServer = dgram.createSocket("udp4")
    expressServer = express()
    clients = []
    apiPath = '/api'

    constructor(port){
        this.controllerPort = port

        /* Init TCP Server for TL Clients */
        console.log(`Starting controller server on ${this.controllerPort}`)
        this.controllerServer.listen(this.controllerPort, function(){
            console.log(`[CONTROLLER] UP`)
        })

        /* Init Broadcast server to get new TL Clients */
        console.log(`Starting broadcast server on ${this.broadcastPort}`)
        let broadcastServer = this.broadcastServer
        this.broadcastServer.bind(this.broadcastPort, function() {
            broadcastServer.setBroadcast(true)
            console.log(`[BROADCAST] UP`)
        })
        
        this.expressRoutes()
        /* Init Broadcast server to get new TL Clients */
        console.log(`Starting express server on ${this.broadcastPort}`)
        this.expressServer.listen(this.expressPort, function() {
            console.log(`[EXPRESS] UP`)
        })
                
        this.controllerListen()
        this.broadcastListen()
    }

    expressRoutes = () => {
        this.expressServer.use(express.static('../../frontend/dist'));
        this.expressServer.get(`${this.apiPath}/getClients`, this.expressGetClients)
    }

    broadcastListen = () => {
        let addClient = this.addClient
        this.broadcastServer.on('message', function (message, rinfo) {
            if(message.toString() === "TLACK"){
                console.log(`[BROADCAST] TLACK from: ${rinfo.address}:${rinfo.port}, acquiring...`);
                addClient(rinfo.address)
            }
        })
    }

    controllerListen = () => {
        let getClient = this.getClient
        this.controllerServer.on('connection', function (socket) {
            let potentialClient = getClient(socket.remoteAddress.split(":").pop())
            if(potentialClient){
                console.log(`[CONTROLLER] Socket ${socket.remoteAddress} accepted`);
                potentialClient.socket = socket
                potentialClient.socket.setKeepAlive(true, 5)
            } else {
                console.log(`[CONTROLLER] Socket ${socket.remoteAddress} refused, not cached.`);
                let message = Buffer.from(`TLController didn't cached this client.`);
                socket.end(message)
            }
        })
    }

    addClient = (ip) => {
        console.log(`[BROADCAST] Searching client ${ip} in cache`);
        // let connecting = false

        /* Looking for cached client */
        let potentialClient = this.getClient(ip)
        if(potentialClient){
            /* Client found but no wirecast source defined, waiting for... */
            if(potentialClient.source === null){
                console.log(`[BROADCAST] ${ip} found in cache, but null source, waiting for configuration.`);
            }
            else {
            /* Client found and wirecast source defined, reconnecting before update color */
                console.log(`[BROADCAST] ${ip} found in cache, reconnecting`);
                potentialClient.connect()
            }
        } else {
            /* No client were found, caching new one */
            console.log(`[BROADCAST] ${ip} not found in cache, creating`);
            this.clients.push(new Client(ip, this.controllerPort))
        }
    }

    getClient = (ip) => {
        return this.clients[this.clients.map((x) => {return x.ipAddress}).indexOf(ip)]
    }

    expressGetClients = (req, rep) => {
        rep.json(this.clients)
    }

}