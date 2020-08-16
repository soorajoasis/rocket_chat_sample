const WebSocketClient = require('websocket').client;
 
const client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

let pongCount = 0
client.on('connect', function(connection) {

/*  SEQUENCE

    1. connect()
    2. login()
    3. privateMessage()
    4. listenToRoom()
    5. privateMessage()
*/

    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {

            const data = JSON.parse(message.utf8Data)
            console.log('Recived message', message)

            if (data.msg === 'ping') {
                pong()
            }

            if(data.server_id === '0' ){
                login()
            }
       
        }
    });
    
    function connect() {
        console.log('connecting..')

        if (connection.connected) {
           connection.send(JSON.stringify({
            "msg": "connect",
            "version": "1",
            "support": ["1"]
        }))
        }
    }

    function login(){
        if (connection.connected) {
            console.log('login..')

            connection.send(JSON.stringify({
                "msg": "method",
                "method": "login",
                "id": "42",
                "params": [
                    { "resume": "9X_XCxr2mMNEolYYEXzdqmO_ahLy84bF-KXwAeLXMcY" }
                  ]
            })
        )
        }
    }

    function pong(){
        console.log('pong..')
        pongCount++;

        connection.send(JSON.stringify({
            "msg": "pong"
        }))

        if (pongCount===1) {
            privateMessage()
        }

        if (pongCount === 2) {
            listenToRoom()
        }
        
        if (pongCount % 2 == 1 && pongCount > 2){    
        sendHi()
        }
    }

    function privateMessage(){
        console.log('Private Message...')
        connection.send(JSON.stringify({
            "msg": "method",
            "method": "createDirectMessage",
            "id": "42",
            "params": ["Anj1843"]
        }))
    }

    function sendHi(){
        console.log("sendHi..")
        connection.send(JSON.stringify(
           
            {
                "msg": "method",
                "method": "sendMessage",
                "id": "42",
                "params": [
                    {
                        "_id": makeid(7),
                        "rid": "KBwYiWnpQ5piYtJWMtD7Jjgm7MacvkKEdi",
                        "msg": `Hello ${pongCount}`
                    }
                ]
            }
        ))
    }

    function listenToRoom(){
        console.log('Listen to Room...')
        connection.send(JSON.stringify({
            "msg": "sub",
            "id": "KBwYiWnp",
            "name": "stream-room-messages",
            "params":[
                "KBwYiWnpQ5piYtJWMtD7Jjgm7MacvkKEdi",
                false
            ]
        }))
    }

    function makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
     }

    connect()

});

client.connect('ws://13.234.172.237:3000/websocket');