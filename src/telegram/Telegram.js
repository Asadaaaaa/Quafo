import saveFileData from '../utils/SaveFileData.js';
import getFileData from '../utils/GetFileData.js';

import { Telegraf } from 'telegraf';
import FS from 'fs-extra';

class Telegram {

    constructor(server) {
        
        this.server = server;
        this.client = new Telegraf(this.server.data.config.token.telegram);

    }

    async run() {

        await this.loadData();

        this.client.on('message', async (messageData) => {

            let messageTxt = messageData.message.text.split(' ');
            let username = messageData.chat.username;

            this.server.sendLogs('(Telegram) ' + username + ' Sent a message: ' + messageTxt)

            if(messageTxt[0] !== '/start' && this.server.telegram.data.users[username] == undefined) {

                messageData.reply('❗Username kamu belum terdaftar, harap daftar dengan ketik /start.');

                return;
            }

            switch(messageTxt[0]) {

                case '/start': {

                    if(this.server.telegram.data.users[username] == undefined) {

                        Object.assign(this.server.telegram.data.users, {

                            [username]: {

                                userID: messageData.chat.id,

                                warn: true
                            
                            }

                        });
                        
                        await saveFileData({users: this.server.telegram.data.users}, 'telegram_data/users_data.json', 'JSON');
                        
                        
                        messageData.reply(
                            'Selamat Datang @' + username + ' 👋\n' +
                            'Username kamu telah terdaftar di Geboom !, kamu akan menerima peringatan gempa secara berkala\n' + 
                            '\n' +
                            '\n' +
                            '*Apa itu Geboom*❔\n' +
                            '    Geboom adalah program peringatan siaga bencana gempa menggunakan data resmi dari BMKG secara Realtime. Geboom tersedia di berbagai platform seperti:\n' +
                            '\n' +
                            ' • Telegram: https://t.me/GeboomBot\n' +
                            ' • Instagram: (Segera Hadir)\n' +
                            ' • Discord: (Segera Hadir)\n' +
                            '\n' +
                            'Author: https://linktr.ee/mikailasada\n'+
                            '\n' +
                            'ketik /help untuk melihat daftar perintah'
                        , {parse_mode: 'Markdown', disable_web_page_preview: true});

                        break;
                    } else {

                        messageData.reply('❗Kamu sudah pernah mendaftar, ketik /help untuk melihat daftar perintah.' );

                        break;
                    }

                }

                case '/help': {

                    messageData.reply(
                        'Kamu dapat memerintahkan bot dengan menggunakan kode perintah dibawah ini:\n' +
                        '\n' +
                        '/start - Registrasi User\n' +
                        '/stop - Hapus User\n' +
                        '\n' +
                        '/warn - Toggle notifikasi peringatan otomatis\n' +
                        '/latest - Melihat gempa terkini\n' +
                        '/history [parameter 2-15] - Melihat beberapa gempa terakhir\n' +
                        '\n' +
                        '/infoGeboom'
                    );
                    
                    break;
                }

                case '/stop': {

                    delete this.server.telegram.data.users[username];

                    await saveFileData({users: this.server.telegram.data.users}, 'telegram_data/users_data.json', 'JSON');
                    
                    messageData.reply(
                        '❕Username kamu telah dihapus dari data Geboom. Selamat tinggal @' + username 
                    );
                    
                    break;
                }

                case '/warn': {

                    if(this.server.telegram.data.users[username].warn === true) {

                        this.server.telegram.data.users[username].warn = false;

                        await saveFileData({users: this.server.telegram.data.users}, 'telegram_data/users_data.json', 'JSON');

                        messageData.reply(
                            '❕Notifikasi peringatan gempa otomatis telah dimatikan.'
                        );
                        
                    } else if(this.server.telegram.data.users[username].warn === false) {

                        this.server.telegram.data.users[username].warn = true;

                        await saveFileData({users: this.server.telegram.data.users}, 'telegram_data/users_data.json', 'JSON');

                        messageData.reply(
                            '❕Notifikasi peringatan gempa otomatis telah dinyalakan, kamu akan menerima peringatan gempa secara berkala.'
                        );
                        
                    }

                    break;
                }

                case '/latest': {
                    let latestQuake = this.server.quake.latestQuake;

                    let sendMessageText = '*Gempa Terkini!*\n' + 
                    '\n' + 
                    latestQuake.Wilayah + '\n' +
                    '\n' +
                    '*Details:*\n' +
                    'Tanggal: ' + latestQuake.Tanggal + '\n' +
                    'Jam: ' + latestQuake.Jam + '\n' + 
                    'Koordinat: ' + latestQuake.Coordinates + '\n' +
                    'Lintang: ' + latestQuake.Lintang + '\n' + 
                    'Bujur: ' + latestQuake.Bujur + '\n' +
                    'Magnitude: ' + latestQuake.Magnitude + '\n' +
                    'Kedalaman: ' + latestQuake.Kedalaman + '\n' +
                    'Lintang: ' + latestQuake.Lintang + '\n' +
                    '\n' + 
                    latestQuake.Potensi;

                    messageData.replyWithPhoto('https://data.bmkg.go.id/DataMKG/TEWS/' + latestQuake.Shakemap, {caption: sendMessageText, parse_mode: 'Markdown'})
                
                    break;
                }

                case '/history': {

                    let totalData = this.server.quake.historyQuake.data.length;

                    if(isNaN(messageTxt[1])) {

                        messageData.reply('❗Parameter harus berupa angka | Perintah: /history [2-15].' );

                        break;
                    }

                    if(messageTxt[1] < 2) {

                        messageData.reply('❗Angka pada parameter minimal 2 | Perintah: /history [2-15].' );

                        break;
                    }

                    if(messageTxt[1] > totalData) {
                        messageTxt[1] = totalData;
                        await messageData.reply('❗Maaf, saat ini kami hanya dapat menampilkan ' + totalData + ' data');
                    }
                    
                    for(let i = 0; i < messageTxt[1]; i++) {
                        let curQuakeData = this.server.quake.historyQuake.data[i];

                        let sendMessageText = '*Data Gempa ke ' + (i + 1) + '*\n' + 
                        '\n' + 
                        curQuakeData.Wilayah + '\n' +
                        '\n' +
                        '*Details:*\n' +
                        'Tanggal: ' + curQuakeData.Tanggal + '\n' +
                        'Jam: ' + curQuakeData.Jam + '\n' + 
                        'Koordinat: ' + curQuakeData.Coordinates + '\n' +
                        'Lintang: ' + curQuakeData.Lintang + '\n' + 
                        'Bujur: ' + curQuakeData.Bujur + '\n' +
                        'Magnitude: ' + curQuakeData.Magnitude + '\n' +
                        'Kedalaman: ' + curQuakeData.Kedalaman + '\n' +
                        'Lintang: ' + curQuakeData.Lintang + '\n' +
                        '\n' + 
                        curQuakeData.Potensi;

                        await messageData.replyWithPhoto('https://data.bmkg.go.id/DataMKG/TEWS/' + curQuakeData.Shakemap, {caption: sendMessageText, parse_mode: 'Markdown'})
                    
                    }

                    break;
                }

                case '/infoGeboom': {

                    messageData.reply(
                        '*Apa itu Geboom*❔\n' +
                        '    Geboom adalah program peringatan siaga bencana gempa menggunakan data resmi dari BMKG secara Realtime. Geboom tersedia di berbagai platform seperti:\n' +
                        '\n' +
                        ' • Telegram: https://t.me/GeboomBot\n' +
                        ' • Instagram: (Segera Hadir)\n' +
                        ' • Discord: (Segera Hadir)\n' +
                        '\n' +
                        'Author: https://linktr.ee/mikailasada\n'+
                        '\n' +
                        'ketik /help untuk melihat daftar perintah'
                    , {parse_mode: 'Markdown', disable_web_page_preview: true});

                    break;
                }

                default: {

                    messageData.reply('❗Perintah tidak tersedia!, ketik /help untuk melihat daftar perintah.', {parse_mode: 'Markdown'});
                    
                    break;
                }
                
            }

        });

        this.client.launch().then(() => {

            this.server.sendLogs('Telegram Bot started | Login as ' + this.client.botInfo.username);

        }).catch((err) => {

            this.server.sendLogs('Telegram Launch Error | ' + err);

        });

        return;
    }

    async loadData() {

        const serverDataPath = './server_data';
        const telegramDataPath = '/telegram_data';

        if(!FS.existsSync(serverDataPath)) throw new Error("Server Directory doesn't exist");

        if(!FS.existsSync(serverDataPath + telegramDataPath)) {
            const obj = {

                users: {}

            }

            FS.mkdirSync(serverDataPath + telegramDataPath);

            await saveFileData(obj, telegramDataPath + '/users_data.json', 'JSON');

        }

        let usersData = await getFileData(telegramDataPath + '/users_data.json', 'JSON');

        this.server.telegram.data.users = usersData.users;

        return;
    }

    async broadCastQuake(latestQuake) {

        let sendMessageText = '⚠️*Terjadi Gempa!*\n' + 
        '\n' + 
        latestQuake.Wilayah + '\n' +
        '\n' +
        '*Details:*\n' +
        'Tanggal: ' + latestQuake.Tanggal + '\n' +
        'Jam: ' + latestQuake.Jam + '\n' + 
        'Koordinat: ' + latestQuake.Coordinates + '\n' +
        'Lintang: ' + latestQuake.Lintang + '\n' + 
        'Bujur: ' + latestQuake.Bujur + '\n' +
        'Magnitude: ' + latestQuake.Magnitude + '\n' +
        'Kedalaman: ' + latestQuake.Kedalaman + '\n' +
        'Lintang: ' + latestQuake.Lintang + '\n' +
        '\n' + 
        latestQuake.Potensi;

        Object.keys(this.server.telegram.data.users).forEach((value, index, array) => {

            if(this.server.telegram.data.users[value].warn === true) {
                
                this.client.telegram.sendPhoto(this.server.telegram.data.users[value].userID, 'https://data.bmkg.go.id/DataMKG/TEWS/' + latestQuake.Shakemap, {
                
                caption: sendMessageText, 
                
                    parse_mode: 'Markdown'
                
                }).then(() => {

                    this.server.sendLogs('(Telegram) Successfully Sent broadcast to ' + value);
                
                });
            }

        });
    }
}

export default Telegram;