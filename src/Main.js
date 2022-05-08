import resourceLoader from './utils/ResourceLoader.js';
import getFileData from './utils/GetFileData.js';
import saveFileData from './utils/SaveFileData.js';

import Sleep from './algorithms/Sleep.js'

import Telegram from './telegram/Telegram.js';
import Instagram from './instagram/Instagram.js';
import Twitter from './twitter/Twitter.js';

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

        console.log(Server.getCurTime() + ' ' + logText);

    }

}


const main = async () => {

    console.log("Starting...");

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

            respondBMKG_API = await fetch(Server.data.config['quake-data'].api);

        } catch(err) {

            if(Server.data.config['quake-data']['error-logs']) Server.sendLogs('(Quake API) \x1b[91mERROR:\x1b[0m Fetching API'); 

            await Sleep.sleep(5);

            continue;
        }
        
        let bmkgLatestQuake = (await respondBMKG_API.json()).Infogempa.gempa;

        if(JSON.stringify(Server.quake.latestQuake) !== JSON.stringify(bmkgLatestQuake)) {

            Server.sendLogs('(Quake API) New Quake Data Detected! Sending a Broadcast...');

            Server.quake.latestQuake = bmkgLatestQuake;
            Server.quake.historyQuake.data.unshift(bmkgLatestQuake);

            await saveFileData(Server.quake.latestQuake, 'quake_data/latest.json', 'JSON');
            await saveFileData(Server.quake.historyQuake, 'quake_data/history.json', 'JSON');

            await broadcaster(Server.quake.latestQuake);

        }

        if(Server.data.config['sync-interval'] !== 0) {

            await Sleep.sleep(Server.data.config['sync-interval']);

        }
    }

}



const runApp = async () => {

    const api = Server.data.config.platforms;
    
    if(api.telegram.isEnable === true) {

        if(api.telegram !== '') {
        
            Server.telegram = {
    
                App: new Telegram(Server),
                
                data: {}
            
            }
    
            await Server.telegram.App.run();
    
        } else {

            Server.sendLogs('(Telegram) \x1b[91mERROR:\x1b[0m You must input a token if enable the Telegram platforms in config file'); 
            Server.sendLogs('(Telegram): Platform Status \x1b[91mDisabled\x1b[0m');

            api.telegram.isEnable = false;

        }

    } else {

        Server.sendLogs('(Telegram): Platform Status \x1b[91mDisabled\x1b[0m');

    }
    
    if(api.twitter.isEnable === true) {

        if(api.twitter['api-key'] !== '' && api.twitter['api-secret'] !== '' && api.twitter['access-token'] !== '' && api.twitter['access-secret'] !== '') {

            Server.twitter = {
    
                App: new Twitter(Server),
                
                data: {}
            
            }
    
        } else {

            Server.sendLogs('(Twitter) \x1b[91mERROR:\x1b[0m You must input api-key, api-secret, access-token, and access-secret if enable the Twitter platforms in config file');
            Server.sendLogs('(Twitter): Platform Status \x1b[91mDisabled\x1b[0m');

            api.twitter.isEnable = false;

        }

    } else {

        Server.sendLogs('(Twitter): Platform Status \x1b[91mDisabled\x1b[0m');

    }
    

    if(api.instagram.isEnable === true) {

        if(api.instagram.username !== '' && api.instagram.password !== '') {
        
            Server.instagram = {

                App: new Instagram(Server),
                
                data: {}
            
            }
    
            await Server.instagram.App.run();
        
        } else {

            Server.sendLogs('(Instagram) \x1b[91mERROR:\x1b[0m You must input username & password if enable the Telegram platforms in config file');
            Server.sendLogs('(Instagram): Platform Status \x1b[91mDisabled\x1b[0m');

            api.insagram.isEnable = false;

        }

    } else {

        Server.sendLogs('(Instagram): Platform Status \x1b[91mDisabled\x1b[0m');

    }

    return;
}



const broadcaster = async (latest) => {

    const api = Server.data.config.platforms;

    if(api.telegram.isEnable) await Server.telegram.App.broadCastQuake(latest);
    if(api.twitter.isEnable) await Server.twitter.App.broadCastQuake(latest);
    if(api.instagram.isEnable) await Server.instagram.App.broadCastQuake(latest);
    

    return;
}


main();