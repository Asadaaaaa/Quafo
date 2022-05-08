import { TwitterApi } from "twitter-api-v2";

class Twitter {

    constructor(server) {

        this.server = server;
        this.client = new TwitterApi({
            appKey: this.server.data.config.platforms.twitter['api-key'],
            appSecret: this.server.data.config.platforms.twitter['api-secret'],
            accessToken: this.server.data.config.platforms.twitter['access-token'],
            accessSecret: this.server.data.config.platforms.twitter['access-secret']
        });
        this.rwClient = this.client.readWrite;
        this.rwClient.v2.me().then(() => {

            this.server.sendLogs('(Twitter): Platform Status \x1b[93mEnabled\x1b[0m');

        }).catch((err) => {

            this.server.sendLogs('(Twitter) \x1b[91mERROR:\x1b[0m Platform Status \x1b[91mDisabled\x1b[0m | May something wrong with API Key in config');
            this.server.data.config.platforms.twitter.isEnable = false;

        });
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

        // const photo = 'https://data.bmkg.go.id/DataMKG/TEWS/' + latestQuake.Shakemap;

        await this.rwClient.v2.tweet({text: setStatus, }).then(() => {

            this.server.sendLogs('(Twitter) Successfully sent broadcast tweet');

        }).catch((err) => {

            this.server.sendLogs('(Twitter) \x1b[91mERROR:\x1b[0m Failed Send a tweet');

        });

    }

}

export default Twitter;