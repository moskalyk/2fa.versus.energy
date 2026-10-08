class VFAASNetSocket {
    socket;
    notConnected
    isFrontendClient;
    constructor(url, protocol){
      try{
          this.notConnected = false;
         try{
             if(process) {
                // process.argv exists
                const net = require('net')
                const client = new net.Socket();
                client.setNoDelay(false)

                this.socket = client
                this.socket.connect(url.split(':')[1], url.split(':')[0], () => {
                    this.socket.write(JSON.stringify({status: 200, msg: 'Hello, server! From client.' + url.split(':')[1] + url.split(':')[0]}));
                })
            }else {
                this.socket = new WebSocket(url)
                isFrontendClient = true
            }
         } catch(err){
            this.socket = new WebSocket(protocol + "://"+url.split(':')[0] +':'+url.split(':')[1])
            this.isFrontendClient = true
         }
      }catch(err){
        this.notConnected = true;
      }
    }
    
    send(channel, message) {
        if(this.isFrontendClient) this.socket.send(JSON.stringify({channel: channel, msg: JSON.parse(message).msg, status: JSON.parse(message).status}))
        else this.socket.write(JSON.stringify({channel: channel, msg: message}))
    }
    
    on(channel, func) {
        if(this.isFrontendClient){
            this.socket.onmessage = event => {
                const d = JSON.parse(event.data)
                console.log()
                if(d.channel == channel) func(d)
                else if(d.channel == '*') func(d)
            }
            
        } else {
            this.socket.on('data', (datum) => {
                console.log()
                // prevent double messages
                const re = /\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g
                let msg;
                let runner
                const messages = []
                while ((runner = re.exec(datum)) !== null) {
                    messages.push(runner[0])
                }
                
                const processMessage = async (msg) => {
                    try {
                        const data = JSON.parse(msg)
                        if(data.status == 201){
                            console.log(channel)
                            console.log(data)
                            this.socket.write(JSON.stringify({channel: '*', msg: 'message'}))
                        } else {
                            if(channel == data.channel){
                                func(data)
                            } else if(data.channel == '*') func(data)
                        }
                    }catch(err){
                        console.log(err)
                    }
                }
                
                messages.map((m) => {
                    if(m.msg == 'connection created') {
                        console.log('ak')
                    } else {
                        processMessage(m)
                    }
                })
            })
        }
    }
}

class VFAASNet {
  webSocket;

  constructor({protocol, host, port }) {
    this.webSocket = new VFAASNetSocket(`${host}:${port}`, protocol)
  }

  aBoot(cb) {
    const msg = 'connection created'
    console.log()
    if(this.webSocket.isFrontendClient){
        this.webSocket.socket.onopen = () => {
            cb({boot: this, msg: msg})
        }
    } else {
        this.webSocket.socket.on('connect', () => {
            console.log('client connected')
            cb({boot: this, msg: msg})
        })
    }
  }

  aPath(func) {
    let val = func.name
    this.webSocket.on(val, (message) => func(message))
    return this
  }
  
  aDelete(func) {
      // TODO: 
  }

  aLeave(){
      if(this.webSocket.isFrontendClient){
          this.webSocket.socket.onclose = () => {
              console.log('server disconnected')
          }
      }else {
        this.webSocket.socket.on('disconnection', () => console.log('user disconnected')) // convert to 'a' user
      }
  }
}

try {
    if(process != undefined) module.exports = VFAASNet
} catch(err){
    window.VFAASNet = VFAASNet
}
