import net from 'net'
import dgram from 'dgram'
import Client from './client.js'

export default class Controller {

    broadcastPort = 4210
    controllerPort = 9999
    controllerServer = net.createServer()
    broadcastServer = dgram.createSocket("udp4")
    clients = []

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
        
        this.broadcastListen()
    }

    broadcastListen = () => {
        let addClient = this.addClient
        this.broadcastServer.on('message', function (message, rinfo) {
            if(message.toString() === "TLACK"){
                console.log(`[BROADCAST] TLACK from: ${rinfo.address}:${rinfo.port}, acquiring...`);
                addClient(rinfo.address)
            }
        });
    }


    addClient = (ip) => {
        console.log(`[BROADCAST] Searching client ${ip} in cache`);
        // let connecting = false

        /* Looking for cached client */
        let potentialClient = this.clients[this.clients.map((x) => {return x.ipAddress}).indexOf(ip)]
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

        /* this.clients.forEach(element => {
            if(connecting === false && element.source === ip){
                if(element.source === null){
                    console.log(`[BROADCAST] ${ip} found in cache, but null source, waiting for configuration.`);
                }
                else {
                    console.log(`[BROADCAST] ${ip} found in cache, reconnecting`);
                    element.connect()
                }
                connecting = true
            }
        })

        if(!connecting) {
            console.log(`[BROADCAST] ${ip} not found in cache, creating`);
            this.clients.push(new Client(ip, this.host, this.controllerPort))
        } */
    }

}