import dgram from 'dgram'


export default class Client {

    source = null
    broadcastClient = dgram.createSocket("udp4")
    socket = null
    controllerPort = "9999"
    ipAddress= "0.0.0.0"
    
    constructor(ip, controllerPort){
        this.ipAddress = ip
        this.controllerPort = controllerPort
        console.log(`[CLIENT] ${this.ipAddress} waiting for source configuration.`)

        setTimeout(() => {
            this.source = 'TEST'
            console.log(`[TMP] setting up src for ${this.ipAddress} : ${this.source}`)
            this.connect()
        },  1000);
    }

    connect = () => {
        console.log(`[CLIENT] Sending  TLController to ${this.ipAddress}`)
        let message = Buffer.from(`TLController on  ${this.controllerPort}`);
        //this.broadcastClient.send(message, 4210, this.ipAddress)
        this.broadcastClient.send(message, 4211, this.ipAddress)
    }

}