import dgram from 'dgram'
export default class Client {

    source = null
    broadcastClient = dgram.createSocket("udp4");
    controllerIp = "127.0.0.1"
    controllerPort = "9999"
    ipAddress= "0.0.0.0"
    broadcastPort = "4210"
    
    constructor(ip, controllerIp, controllerPort){
        this.ipAddress = ip
        this.controllerIp = controllerIp
        this.controllerPort = controllerPort
        console.log(`[CLIENT] ${this.ipAddress} waiting for source configuration.`)
    }

    connect(){
        let message = Buffer.from(`TLController on  ${this.controllerIp}:${this.controllerPort}`);
        this.client.setBroadcast(true)
        this.client.send(message, 0, message.length, 4210, this.ip)
    }

}