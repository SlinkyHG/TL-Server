import dgram from 'dgram'


export default class Client {

    source = []
    broadcastClient = dgram.createSocket("udp4")
    socket = null
    controllerPort = "9999"
    ipAddress= "0.0.0.0"
    timer = null
    blinkStatus = false
    status = 0
    colors = { r: 0, g: 0, b: 255}

    constructor(ip, controllerPort){
        this.ipAddress = ip
        this.controllerPort = controllerPort
        console.log(`[CLIENT] ${this.ipAddress} waiting for source configuration.`)
    }

    connect = () => {
        if(this.socket === null) {
            console.log(`[CLIENT] Sending TLController to ${this.ipAddress}`)
            let message = Buffer.from(`TLController on ${this.controllerPort}`);
            this.broadcastClient.send(message, 4210, this.ipAddress)
            //this.broadcastClient.send(message, 4211, this.ipAddress)
        }
    }

    update = (r,g,b, force = false) => {
        if(this.socket !== null) {
            if(r !== this.colors.r || g !== this.colors.g || b !== this.colors.b || force === true){
                console.log(`[CLIENT] Updating light ${this.ipAddress} : R=${r} G=${g} B=${b}`)
                let message = Buffer.from(`${r},${g},${b}\n`);
                //this.broadcastClient.send(message, 4210, this.ipAddress)
                this.socket.write(message)
                this.colors.r = r; this.colors.g = g; this.colors.b = b
            }
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
            this.update(0, 0, 255, true)
        else
            this.powerOff()
        
        this.blinkStatus = !this.blinkStatus
    }

    updateStatus = (layers) => {
        if(this.timer === null) {
            if(this.source.includes(layers.Live)) {
                this.status = 1
            }
            else if(this.source.includes(layers.Preview)) {
                this.status = 2
            }
            else if(this.source.length !== 0) {
                this.status = 3
            }
            else {
                this.status = 0
            }
            this.powerOn()
        }
    }

    powerOn = (status=this.status) => {
        this.status = status
        if(this.timer === null){
            switch(this.status){
                case 0: // SETUP
                    this.update(0, 0, 255)
                    break;

                case 1: // LIVE
                    this.update(255, 0, 0)
                    break;

                case 2: // PREVIEW
                    this.update(0, 255, 0)
                    break;

                default:
                    this.powerOff()
            }
        }
    }
}