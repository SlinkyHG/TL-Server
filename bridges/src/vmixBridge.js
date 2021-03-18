const axios = require("axios"),
    xml2js = require("xml2js")

const VMIX_API = "http://localhost:8088",
    CONTROLLER_API = "http://localhost:8080",
    XML_PARSER = new xml2js.Parser()


function getInfos(){
    return new Promise((res, rej) => {
        axios.get(`${VMIX_API}/API`,{
            headers: {
            'Content-Type': 'application/json'
            }
        })
        .then((response) => {
            XML_PARSER.parseStringPromise(response.data)
            .then((parsed) => {
                res(parsed)
            })
            .catch((e) => {
                throw(e)
            })
                
        })
        .catch((e) => {
            rej(e)
        })

    })
}

function extract (datas) {
    return new Promise((res, rej) => {
        if(datas.vmix.inputs && datas.vmix.preview && datas.vmix.active){
            let inputs = datas.vmix.inputs[0].input.map((e) => { return {
                title: e._,
                id: e.$.number
            }})

            let displays = {
                Live: inputs.filter(e => { return ( datas.vmix.active.indexOf(e.id) !== -1 )}).map(e => { return e.title}).pop(),
                Preview: inputs.filter(e => { return ( datas.vmix.preview.indexOf(e.id) !== -1 )}).map(e => { return e.title}).pop()
            }
            res({inputs: inputs.map(e => {return e.title}), displays: displays})
        } else {
            rej({inputs: [], displays: {
                Live: null,
                Preview: null
            }})
        }
    })
}

function main() {

    setInterval(async () => {
        try {
            const parsed = await getInfos()
            const infos = await extract(parsed)

            axios.post(`${CONTROLLER_API}/api/pushSources`, infos.inputs)
            .then(() => {
                console.log(`${infos.inputs.length} inputs pushed`)
            })
            /*.catch((e) => {
                console.warn(e)
            })*/

            axios.post(`${CONTROLLER_API}/api/pushLayers`, infos.displays)
            .then(() => {
                console.log(`${infos.inputs.length} layers pushed`)
            })
            /*.catch((e) => {
                console.warn(e)
            })*/
        } catch (e) {
            console.warn(e)
        }
    }, 1000)
}


main()