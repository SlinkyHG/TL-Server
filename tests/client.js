import dgram from 'dgram'
const udp = dgram.createSocket("udp4")
let start = () => {
    let port = null
    udp.bind(4211)

    let message = Buffer.from(`TLACK`);

    udp.on('message', function (message, rinfo) {
        let splitted = message.toString().split(" ")
        if(splitted[0] === "TLController"){
            port = splitted.pop()
        }
    })


    let interval = setInterval(() => {
        if(port === null){
            udp.send(message, 0, message.length, 4210, '127.0.0.1', function (err) {
                if (err) console.log(err)
                else console.log("Message sent")
            })
        } else {
            clearInterval(interval)
        }
    }, 2000)

}

start()
