"use strict";

const Zlib = require("zlib");

const utils = {
    getDanmakuURL: function() {
        return "wss://broadcastlv.chat.bilibili.com:443/sub";
    },
    stringToUint: function(s) {
        const charList = s.split('');
        const uintArray = [];
        for (let i = 0; i < charList.length; ++i) {
            uintArray.push(charList[i].charCodeAt(0));
        }
        return new Uint8Array(uintArray);
    },
    uintToString: function(uintArray) {
        return decodeURIComponent(
            escape(String.fromCodePoint.apply(null, uintArray))
        );
    },
}

module.exports = utils;
