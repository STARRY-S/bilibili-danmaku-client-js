"use strict";

const WebSocket = require("ws");
const Utils = require("../utils/utils");
const zlib = require("zlib")

const client = {
    debugMode: false,
    isDebugMode: () => {
        return client.debugMode;
    },
    setDebugMode: (b) => {
        if (b === true) {
            client.debugMode = true;
        } else {
            client.debugMode = false;
        }
    },
    roomid: -1,
    setRoomID: function(id) {
        if (!Number.isInteger(id)) {
            throw "id is not integer.";
        } else if (id <= 0) {
            throw "invalid id.";
        } else {
            client.roomid = id;
        }
    },
    socket: null,
    heartbeatTimer: -1,
    connect: () => {
        console.log("Connecting...");
        if (client.roomid <= 0) {
            throw "Invalid roomid.";
        }
        client.socket = new WebSocket(Utils.getDanmakuURL());
        // send 'first data' when connected
        const firstData = {
            "uid": 0,                   // user id, 0 for unlogin user
            "roomid": client.roomid,    // room id
            "protover": 2,              // protocol version, always 2
            "platform": "web",          // platform, can be 'web'
            "clientver": "1.14.3",      // client version, can be '1.14.3'
            "type": 2,                  // type, always 2
        };
        // send heartbeat data every 30s
        const heartData = "[object Object]";
        client.socket.on("open", () => {
            console.log("Server Connected!");
            client.sendData(JSON.stringify(firstData), 1, 7);
            client.heartbeatTimer = setInterval(() => {
                client.sendData(heartData, 1, 2, 1);
            }, 30000);
        });

        client.socket.on("message", (message) => {
            client.handleMessage(message);
        });

        client.socket.on("close", () => {
            // TODO: auto reconnect
            console.log("Disconnected!");
        });
    },
    sendData: function(dataStr, version, protocol) {
        let dataUint8Array = Utils.stringToUint(dataStr);
        let buffer = new ArrayBuffer(dataUint8Array.byteLength + 16);
        let dv = new DataView(buffer);
        dv.setUint32(0, dataUint8Array.byteLength + 16); // package len: head + body
        dv.setUint16(4, 16);                     // header len, always 1
        dv.setUint16(6, parseInt(version, 10));  // protocol version
        dv.setUint32(8, parseInt(protocol, 10)); // protocol type
        dv.setUint32(12, 1);                     // serial number, always 1
        for (let i = 0; i < dataUint8Array.byteLength; i++) {
            dv.setUint8(16 + i, dataUint8Array[i]);
        }
        if (client.debugMode) {
            console.log("send message:", dataStr, dataStr.length);
        }
        if (!client.socket) {
            throw "Socket is NULL";
        }
        client.socket.send(buffer);
    },
    handleMessage: (msg) => {
        let buffer = new ArrayBuffer(msg.length);   // Copy msg data to ArrayBuffer
        let u8Array = new Uint8Array(buffer);
        for (let i = 0; i < msg.length; ++i) {
            u8Array[i] = msg[i];
        }
        const dv = new DataView(buffer);
        const packageLen = dv.getUint32(0); // package length
        const headerLen = dv.getUint16(4);  // header length
        const protover = dv.getUint16(6);   // protocol version
        const operation = dv.getUint32(8);  // protocol type
        const sequence = dv.getUint32(12);  // serial number, always be 1
        buffer = buffer.slice(headerLen, packageLen);
        switch (protover) {
        case 0:     // broadcast junk message.
            break;
        case 1:     // uncompressed data and popularity value.
            const dvUnCompress = new DataView(buffer);
            if (operation === 3) {  // popularity value
                console.log("气人值:", dvUnCompress.getUint32(0));
            } else if (operation === 8) {   // server return { code: 0 } on success
                const str = Utils.uintToString(new Uint8Array(buffer));
                if (client.debugMode) {
                    console.log(str);
                }
            }
            break;
        case 2:     // Compressed JSON data, need to uncompress first
            if (operation === 5) {
                try {
                    // use zlib inflate
                    let uncompressData = zlib.inflateSync(buffer);
                    const dv = new DataView(uncompressData.buffer);
                    let u8array = new Uint8Array(uncompressData.buffer);
                    u8array = u8array.slice(dv.getUint16(4), dv.getUint32(0));
                    client.handleDanmaku(Utils.uintToString(u8array));
                } catch(e) {
                    console.error(e);
                }
            } else {
                console.log("Unknown compressed data.");
            }
            break;
        default:
            console.log("Unknown data.");
        }
    },
    handleDanmaku: (str) => {
        let data = null;
        try {
            data = JSON.parse(str);
            if (client.isDebugMode()) {
                console.log(data);
            }
        } catch(e) {
            console.error(e);
            return;
        }

        if (typeof(data["cmd"]) == undefined) {
            return;
        }
        switch(data["cmd"]) {
        case "DANMU_MSG": {   // output danmaku message
            console.log(`${data["info"][2][1]}说: ${data["info"][1]}`);
            break;
        }
        case "INTERACT_WORD": { // output visit message
            console.log(`欢迎${data["data"]["uname"]}进入直播间。`);
            break;
        }
        case "COMBO_SEND": { // output combo gift message
            console.log(`感谢老板${data["data"]["uname"]}一口气` +
                `${data["data"]["action"]}了${data["data"]["combo_num"]}` +
                `个${data["data"]["gift_name"]}`);
            break;
        }
        case "LIVE_INTERACTIVE_GAME": { // output gift message
            console.log(`感谢老板${data["data"]["uname"]}赠送的` +
                `${data["data"]["gift_num"]}个${data["data"]["gift_name"]}`);
            break;
        }
        }
    }
}

module.exports = client;
