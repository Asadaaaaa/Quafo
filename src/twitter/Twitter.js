
import saveFileData from '../utils/SaveFileData.js';
import getFileData from '../utils/GetFileData.js';

import { TwitterApi } from "twitter-api-v2";

import FileCookieStore from 'tough-cookie-filestore2';
import FS from 'fs-extra';

class Twitter {

    constructor(server) {

        this.server = server;
        this.client = new TwitterApi({
            appKey: this.server.data.config.apiAuth.twitter.appKey,
            appSecret: this.server.data.config.apiAuth.twitter.appSecret,
            accessToken: this.server.data.config.apiAuth.twitter.accessToken,
            accessSecret: this.server.data.config.apiAuth.twitter.accessSecret
        });
        this.rwClient = this.client.readWrite;
    }
    
    async broadCastQuake(latestQuake) {

        let setStatus = 'Terjadi Gempa, ' + latestQuake.Wilayah + ', ' +
        latestQuake.Tanggal + ', ' +
        latestQuake.Jam + ' | ' + 
        'Koordinat ' + latestQuake.Lintang + ', ' + 
        latestQuake.Bujur + ' | ' +
        'Magnitudo ' + latestQuake.Magnitude + ', ' +
        'Kedalaman ' + latestQuake.Kedalaman + ' | ' +
        latestQuake.Potensi + ' | https://data.bmkg.go.id/DataMKG/TEWS/' + latestQuake.Shakemap;

        const photo = 'https://data.bmkg.go.id/DataMKG/TEWS/' + latestQuake.Shakemap;

        await this.rwClient.v2.tweet({text: setStatus, }).then(() => {

            this.server.sendLogs('(Twitter) Successfully sent broadcast tweet');

        });

    }

}

export default Twitter;