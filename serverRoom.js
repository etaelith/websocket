import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 7575 });
const maxClients = 2;
let rooms = {};
wss.on('connection', function connection(ws) {
    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });

    ws.send('something');
    ws.on('message', function message(data) {
        const obj = JSON.parse(data);
        const type = obj.type;
        const params = obj.params;
        console.log(obj)
        switch (type) {
            case "info":
                generalInformation(ws)
                break;
            case "create":
                create();
                break;
            case "join":
                join(params);
                break;
            case "leave":
                leave(params);
                break;
            default:
                console.warn(`Type: ${type} unknown`);
                break;
        }
        function create() {
            const room = genKey(5);
            console.log(room)
            rooms[room] = [ws];
            ws["room"] = room;

            generalInformation(ws);
        }
        function join(params) {
            const room = params.code;
            if (!Object.keys(rooms).includes(room)) {
                console.warn(`Room ${room} does not exist!`);
                return;
            }

            if (rooms[room].length >= maxClients) {
                console.warn(`Room ${room} is full!`);
                return;
            }

            rooms[room].push(ws);
            ws["room"] = room;

            generalInformation(ws);
        }

        function leave(params) {
            const room = ws.room;
            rooms[room] = rooms[room].filter(so => so !== ws);
            ws["room"] = undefined;

            if (rooms[room].length == 0)
                close(room);
        }

        function close(room) {
            rooms = rooms.filter(key => key !== room);
        }
        function generalInformation(ws) {
            let obj;
            if (ws["room"] === undefined)
                obj = {
                    "type": "info",
                    "params": {
                        "room": "no room",
                    }
                }
            else
                obj = {
                    "type": "info",
                    "params": {
                        "room": ws["room"],
                        "no-clients": rooms[ws["room"]].length,
                    }
                }

            ws.send(JSON.stringify(obj));
        }
        function genKey(length) {
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            for (let i = 0; i < length; i++) {
                result += characters.charAt(
                    Math.floor(Math.random() * characters.length));
            }
            return result;
        }
    });

});




function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}