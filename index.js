#!/usr/bin/env node
"use strict";

const client = require("./srcs/client");

const showHelp = () => {
    console.log("Bilibili Danmaku Client JS");
    console.log("Usage ./index.js -r [roomid] -d");
    console.log("\t -h, --help \t Show help message");
    console.log("\t -r, --roomid \t Set room id");
    console.log("\t -d, --debug \t Enable debug mode.");
}

const startDanmakuClient = () => {
    console.log("Start to connect room:", client.roomid);
    client.connect();
}

const mainFunc = () => {
    const myArgs = process.argv.slice(2);
    let roomid = -1;
    let shouldShowHelp = true;
    for (let i = 0; i < myArgs.length; ++i) {
        switch (myArgs[i])
        {
            case "-h":
            case "--help":
                break;
            case "-r":
            case "--roomid":
                if (myArgs[i + 1] != 0) {
                    roomid = parseInt(myArgs[++i]);
                    client.setRoomID(roomid);
                    shouldShowHelp = false;
                }
                break;
            case "-d":
            case "--debug":
                client.setDebugMode(true);
                break;
            default:
                break;
        }
    }
    if (shouldShowHelp) {
        showHelp();
        return;
    }

    startDanmakuClient(roomid);
}

mainFunc();
