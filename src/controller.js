import net from 'net'
import dgram from 'dgram'

export default class Controller{

    broadcastPort = 4210
    controllerPort = 9999
    host = '0.0.0.0'
    controllerServer = net.createServer()
    broadcastServer = dgram.createSocket("udp4")

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
        
        /* function broadcastNew() {
            var message = Buffer.from("Broadcast message!");
            server.send(message, 0, message.length, PORT, BROADCAST_ADDR, function() {
                console.log("Sent '" + message + "'");
            });
        }*/
        
    }

    broadcastListen(){
        this.broadcastServer.on('message', function (message, rinfo) {
            console.log('Message from: ' + rinfo.address + ':' + rinfo.port +' - ' + message);
        });
    }

}