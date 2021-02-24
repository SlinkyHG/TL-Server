import dgram from 'dgram'


export default class Client {

    source = []
    broadcastClient = dgram.createSocket("udp4")
    socket = null
    controllerPort = "9999"
    ipAddress= "0.0.0.0"
    timer = null
    blinkStatus = false

    constructor(ip, controllerPort){
        this.ipAddress = ip
        this.controllerPort = controllerPort
        console.log(`[CLIENT] ${this.ipAddress} waiting for source configuration.`)
    }

    connect = () => {
        console.log(`[CLIENT] Sending  TLController to ${this.ipAddress}`)
        let message = Buffer.from(`TLController on  ${this.controllerPort}`);
        //this.broadcastClient.send(message, 4210, this.ipAddress)
        this.broadcastClient.send(message, 4211, this.ipAddress)
    }

    update = (r,g,b) => {
        if(this.socket !== null) {
            console.log(`[CLIENT] Updating light ${this.ipAddress} : R=${r} G=${g} B=${b}`)
            let message = Buffer.from(`${r},${g},${b}`);
            //this.broadcastClient.send(message, 4210, this.ipAddress)
            this.socket.write(message)
        }
    }

    powerOff = () => {
        this.update(0,0,0)
    }

    switchBlinking = () => {
        if(this.timer === null) {
            console.log(`[CLIENT] ${this.ipAddress} enter in blinking mode`)
            const blink = this.blink
            this.timer = setInterval(() => {
                blink()
            }, 1000)
        } else {
            console.log(`[CLIENT] ${this.ipAddress} go back to source mode`)
            clearInterval(this.timer)
            this.timer = null
        }
    }

    blink = () => {
        if(this.blinkStatus)
            this.update(0, 0, 255)
        else
            this.powerOff()
        
        this.blinkStatus = !this.blinkStatus
    }
}