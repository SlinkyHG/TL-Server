import net from 'net'
import dgram from 'dgram'
import Client from './client.js'

export default class Controller {

    broadcastPort = 4210
    controllerPort = 9999
    host = '0.0.0.0'
    controllerServer = net.createServer()
    broadcastServer = dgram.createSocket("udp4")
    clients = []

    constructor(port){

        this.controllerPort = port

        /* Init TCP Server for TL Clients */
        console.log(`Starting controller server on ${this.host}:${this.controllerPort}`)
        this.controllerServer.listen(this.controllerPort, this.host, function(){
            console.log(`[CONTROLLER] UP`)
        })

        /* Init Broadcast server to get new TL Clients */
        console.log(`Starting broadcast server on ${this.host}:${this.broadcastPort}`)
        let broadcastServer = this.broadcastServer
        this.broadcastServer.bind(this.broadcastPort, this.host, function() {
            broadcastServer.setBroadcast(true)
            console.log(`[BROADCAST] UP`)
        })
        
        this.broadcastListen()
    }

    broadcastListen(){
        this.broadcastServer.on('message', function (message, rinfo) {
            if(message = "TCACK"){
                addClient(rinfo.address)
                console.log(`[BROADCAST] TCACK from: ${rinfo.address}:${rinfo.port}, acquiring...`);
            }
        });
    }


    addClient(ip){
        console.log(`[BROADCAST] Searching client ${ip} in cache`);
        // let connecting = false

        /* Looking for cached client */
        let potentialClient = this.clients[this.clients.map(function(x) {return x.source; }).indexOf(ip)]
        if(potentialClient){
            /* Client found but no wirecast source defined, waiting for... */
            if(element.source === null){
                console.log(`[BROADCAST] ${ip} found in cache, but null source, waiting for configuration.`);
            }
            else {
            /* Client found and wirecast source defined, reconnecting before update color */
                console.log(`[BROADCAST] ${ip} found in cache, reconnecting`);
                element.connect()
            }
        } else {
            /* No client were found, caching new one */
            console.log(`[BROADCAST] ${ip} not found in cache, creating`);
            this.clients.push(new Client(ip, this.host, this.controllerPort))
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