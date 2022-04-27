import resourceLoader from './utils/ResourceLoader.js';
import getFileData from './utils/GetFileData.js';
import saveFileData from './utils/SaveFileData.js';

import Sleep from './algorithms/Sleep.js'

import Telegram from './telegram/Telegram.js';
import Instagram from './instagram/Instagram.js';

import fetch from 'node-fetch';


let Server = {

    data: {},

    quake: {},

    getCurTime: () => {
        let currentdate = new Date(new Date().toLocaleString('en-US', {timeZone: 'Asia/Jakarta'}));
        return '[' + currentdate.getDate() + '/'
        + (currentdate.getMonth()+1)  + '/' 
        + currentdate.getFullYear() + '|'  
        + currentdate.getHours() + ':'  
        + currentdate.getMinutes() + ':' 
        + currentdate.getSeconds() + ']';
    },

    sendLogs: (logText) => {

        console.log('\n\n' + Server.getCurTime() + ': ' + logText);

    }

}


const main = async () => {

    await resourceLoader();

    Server.data.config = await getFileData('config.yml', 'YAML');
    Server.quake.latestQuake = await getFileData('quake_data/latest.json', 'JSON');
    Server.quake.historyQuake = await getFileData('quake_data/history.json', 'JSON');

    await runApp();
    quakeDataUpdater();
    

    return;
}


const quakeDataUpdater = async () => {

    while(true) {

        let respondBMKG_API;

        try{

            respondBMKG_API = await fetch(Server.data.config.quakeDataAPI);

        } catch(err) {

            Server.sendLogs('Error Fetching ' + Server.data.config.quakeDataAPI);

            await Sleep.sleep(5);

            continue;
        }
        
        let bmkgLatestQuake = (await respondBMKG_API.json()).Infogempa.gempa;
        
        // console.log(bmkgLatestQuake);

        if(JSON.stringify(Server.quake.latestQuake) !== JSON.stringify(bmkgLatestQuake)) {

            Server.sendLogs('Terjadi Gempa');

            Server.quake.latestQuake = bmkgLatestQuake;
            Server.quake.historyQuake.data.unshift(bmkgLatestQuake);

            await saveFileData(Server.quake.latestQuake, 'quake_data/latest.json', 'JSON');
            await saveFileData(Server.quake.historyQuake, 'quake_data/history.json', 'JSON');

            broadcaster(Server.quake.latestQuake);

        }

        if(Server.data.config.syncQuakeData !== 0) {

            await Sleep.sleep(Server.data.config.syncQuakeData);

        }
    }

}

const runApp = async () => {
    
    if(Server.data.config.token.telegram !== '') {
        
        Server.telegram = {

            App: new Telegram(Server),
            
            data: {}
        
        }

        await Server.telegram.App.run();

    }

    if(Server.data.config.token.instagram.username !== '' && Server.data.config.token.instagram.password !== '') {

        Server.instagram = {

            App: new Instagram(Server),
            
            data: {}
        
        }

        await Server.instagram.App.run();

    }

    return;
}

const broadcaster = async (latest) => {

    Server.telegram.App.broadCastQuake(latest);
    Server.instagram.App.broadCastQuake(latest);

    return;
}



main();