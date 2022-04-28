import saveFileData from '../utils/SaveFileData.js';

import instagram from 'instagram-web-api';

import FileCookieStore from 'tough-cookie-filestore2';
import FS from 'fs-extra';

class Instagram {

    constructor(server) {

        this.server = server;

    }
    
    async run() {

        await this.loadData();

        let cookieStore = new FileCookieStore('./server_data/instagram_data/cookies.json');
        let username = this.server.data.config.apiAuth.instagram.username;
        let password = this.server.data.config.apiAuth.instagram.password;

        this.client = new instagram({username, password, cookieStore});

        await this.client.login().then(() => {

            this.server.sendLogs('Instagram Automation started | Login as ' + username);

        }).catch((err) => {

            this.server.sendLogs('Instagram Login Error | ');

        });

    }

    async loadData() {
        
        const serverDataPath = './server_data';
        const instagramDataPath = '/instagram_data';

        if(!FS.existsSync(serverDataPath)) throw new Error("Server Directory doesn't exist");

        if(!FS.existsSync(serverDataPath + instagramDataPath)) {

            FS.mkdirSync(serverDataPath + instagramDataPath);

            const obj = {}
            
            await saveFileData(obj, instagramDataPath + '/cookies.json', 'JSON');

        }

        return;
    }

    async broadCastQuake(latestQuake) {

        let setCaption = '⚠️Terjadi Gempa!, ' + latestQuake.Wilayah + '\n' +
        '\n' +
        'Details:\n' +
        'Tanggal: ' + latestQuake.Tanggal + '\n' +
        'Jam: ' + latestQuake.Jam + '\n' + 
        'Lintang: ' + latestQuake.Lintang + '\n' + 
        'Bujur: ' + latestQuake.Bujur + '\n' +
        'Magnitude: ' + latestQuake.Magnitude + '\n' +
        'Kedalaman: ' + latestQuake.Kedalaman + '\n' +
        '\n' + 
        latestQuake.Potensi + '\n\n#gempa #gempaindonesia #gempaterkini #indonesia #earthquake #news #berita';

        const photo = 'https://data.bmkg.go.id/DataMKG/TEWS/' + latestQuake.Shakemap;
        
        await this.client.uploadPhoto({ photo, caption: setCaption, post: 'feed' }).then(() => {

            this.server.sendLogs('(Instagram) Successfully upload new broadcast on feed ');
        
        });

    }

}

export default Instagram;