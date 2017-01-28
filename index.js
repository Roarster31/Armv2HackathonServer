var ws = require("nodejs-websocket")

var instructionCallbacks = {}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function encapsulateMsg(msg) {
  return JSON.stringify({event: "message", payload: {msg: msg}})
}

var server = ws.createServer(function (conn) {
    console.log("New connection")
    conn.on("text", function (str) {
        
        if (isJson(str)) {
          var data = JSON.parse(str);
          if (data.event && data.payload) {
            switch(data.event) {
              case 'request':
                console.log("received send request")
                conn.sendText(encapsulateMsg("I'll get right on it honey"))
                break
              case 'location':
                console.log("received location update")
                conn.sendText(encapsulateMsg("thanks for the update bae"))
                break
              case 'identity':
                console.log("received identity")
                if(data.payload.identity) {
                  conn.sendText(encapsulateMsg("pleased to meet you "+data.payload.identity))
                  if (data.payload.identity == "robot" && !instructionCallbacks[conn.key]) {
                    // start nagging
                    console.log("nagging");
                    instructionCallbacks[conn.key] = setInterval(function(){
                      conn.sendText(JSON.stringify({
                        event: "instruction",
                        payload: {}
                      }))
                    }, 5000);
                  } else if (data.payload.identity != "robot") {
                    conn.sendText(encapsulateMsg("if your idenity was 'robot', I might think about giving you some instructions..."))
                  }
                } else {
                  conn.sendText(encapsulateMsg("who are you? Give me an identity field"))
                }
                break
              default:
                console.log("received unknown event: '"+data.event+"'")
                conn.sendText(encapsulateMsg("event: " + data.event + "?!?! WHAT DOES THAT EVEN MEAANNNNN?????"))
                break
            }
          } else if (!data.event) {
            conn.sendText(encapsulateMsg("I need an event plzzzz"))
          } else if (!data.payload) {
            conn.sendText(encapsulateMsg("your forgot the payload"))            
          }
        } else {
          console.log("NOT JSON", str)
          conn.sendText(encapsulateMsg("Je ne parle pas anglais. Seulement JSON."))
        }
    })
    conn.on("close", function (code, reason) {
        console.log("Connection closed")
        clearInterval(instructionCallbacks[conn.key])
        delete instructionCallbacks[conn.key]
    })
}).listen(8001)