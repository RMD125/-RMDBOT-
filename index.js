const { Client, LocalAuth } = require('whatsapp-web.js');
const { logInfo, logError, logSuccess } = require('./utils/logger');
const { sendMessageToOwner, generateAlphaNumericCode } = require('./utils/helpers');
const adminCommands = require('./commands/admin');
const aiCommands = require('./commands/ai');
const downloaderCommands = require('./commands/downloader');
const funCommands = require('./commands/fun');
const groupCommands = require('./commands/group');
const toolsCommands = require('./commands/tools');
const videoCommands = require('./commands/video');

// Configuration
const config = require('./config/settings.json');
const ownerNumber = config.ownerNumber;
const adminNumbers = config.adminNumbers;
const authCodeLength = 8;

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "RMDBOT"
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// Variables pour la connexion par code
let authCode = null;
let isWaitingForCode = false;
let authAttempts = 0;
const maxAuthAttempts = 3;

client.on('qr', (qr) => {
    authCode = generateAlphaNumericCode(authCodeLength);
    logInfo(`Code de connexion: ${authCode}`);
    isWaitingForCode = true;
    authAttempts = 0;
    
    sendMessageToOwner(client, ownerNumber, 
        `☬ˢRMDBOT☬\n\n🔐 *Code de connexion:* ${authCode}\n\nEnvoyez \`.connect ${authCode}\` pour connecter le bot.`
    );
});

client.on('authenticated', () => {
    logSuccess('Authentification réussie!');
});

client.on('auth_failure', (msg) => {
    logError(`Échec de l'authentification: ${msg}`);
    sendMessageToOwner(client, ownerNumber, '☬ˢRMDBOT☬\n\n❌ Échec de l\'authentification. Redémarrage nécessaire.');
});

client.on('ready', () => {
    logSuccess('Bot connecté avec succès!');
    sendMessageToOwner(client, ownerNumber, 
        '☬ˢRMDBOT☬\n\n✅ Bot connecté avec succès!\n\nTapez .menu pour voir les commandes disponibles.'
    );
});

client.on('disconnected', (reason) => {
    logError(`Bot déconnecté: ${reason}`);
    sendMessageToOwner(client, ownerNumber, 
        `☬ˢRMDBOT☬\n\n❌ Bot déconnecté: ${reason}\n\nRedémarrage en cours...`
    );
    client.initialize();
});

client.on('message', async (message) => {
    try {
        const contact = await message.getContact();
        const senderId = contact.id._serialized;
        const text = message.body;
        const args = text.split(' ');
        const command = args[0].toLowerCase();
        
        // Vérification admin
        const isAdmin = adminNumbers.includes(senderId);
        
        // Commande de connexion par code
        if (command === '.connect' && isWaitingForCode) {
            const providedCode = args[1];
            
            if (providedCode === authCode) {
                isWaitingForCode = false;
                authAttempts = 0;
                message.reply('✅ Code correct! Connexion en cours...');
            } else {
                authAttempts++;
                if (authAttempts >= maxAuthAttempts) {
                    isWaitingForCode = false;
                    authCode = generateAlphaNumericCode(authCodeLength);
                    message.reply('❌ Trop de tentatives échouées. Un nouveau code a été généré.');
                    sendMessageToOwner(client, ownerNumber, 
                        `☬ˢRMDBOT☬\n\n🔐 *Nouveau code de connexion:* ${authCode}\n\nEnvoyez \`.connect ${authCode}\` pour connecter le bot.`
                    );
                } else {
                    message.reply(`❌ Code incorrect. Il vous reste ${maxAuthAttempts - authAttempts} tentative(s).`);
                }
            }
            return;
        }
        
        if (!isAdmin) return;

        // Commandes Admin
        if (command.startsWith('.purge') || command.startsWith('.kickall') || 
            command.startsWith('.ban') || command.startsWith('.ppbot') ||
            command.startsWith('.autoadmin') || command.startsWith('.kickadmin') ||
            command.startsWith('.spam') || command.startsWith('.god')) {
            adminCommands.handle(message, client, senderId);
        }
        
        // Commandes AI
        else if (command.startsWith('.kango') || command.startsWith('.chatgpt') || 
                 command.startsWith('.gpt2') || command.startsWith('.gpt3') || 
                 command.startsWith('.google')) {
            aiCommands.handle(message, command);
        }
        
        // Commandes Downloader
        else if (command.startsWith('.play') || command.startsWith('.song') || 
                 command.startsWith('.apk') || command.startsWith('.video') || 
                 command.startsWith('.mediafire') || command.startsWith('.shazam') || 
                 command.startsWith('.screenshot') || command.startsWith('.gitclone') || 
                 command.startsWith('.remini') || command.startsWith('.fb') || 
                 command.startsWith('.lyrics') || command.startsWith('.instagram') || 
                 command.startsWith('.generate') || command.startsWith('.ytmp3') || 
                 command.startsWith('.ytmp4') || command.startsWith('.ytaudio') || 
                 command.startsWith('.videodoc') || command.startsWith('.playdoc')) {
            downloaderCommands.handle(message, command, args);
        }
        
        // Commandes Fun
        else if (command.startsWith('.quote') || command.startsWith('.dare') || 
                 command.startsWith('.fact') || command.startsWith('.compliment') || 
                 command.startsWith('.truth') || command.startsWith('.riddle') || 
                 command.startsWith('.trivia') || command.startsWith('.pickupline')) {
            funCommands.handle(message, command);
        }
        
        // Commandes Group
        else if (command.startsWith('.antilink') || command.startsWith('.promote') || 
                 command.startsWith('.kick') || command.startsWith('.welcome') || 
                 command.startsWith('.demote') || command.startsWith('.closetime') || 
                 command.startsWith('.opentime') || command.startsWith('.add') || 
                 command.startsWith('.tagall') || command.startsWith('.hidetag') || 
                 command.startsWith('.revoke') || command.startsWith('.setgppc') || 
                 command.startsWith('.getinfo') || command.startsWith('.totag') || 
                 command.startsWith('.setdesc') || command.startsWith('.listonline')) {
            groupCommands.handle(message, client, command, args);
        }
        
        // Commandes Tools
        else if (command.startsWith('.tovideo') || command.startsWith('.toimage') || 
                 command.startsWith('.toqr') || command.startsWith('.sticker') || 
                 command.startsWith('.togif') || command.startsWith('.fliptext') || 
                 command.startsWith('.tts') || command.startsWith('.text2pdf') || 
                 command.startsWith('.emojimix') || command.startsWith('.take') || 
                 command.startsWith('.time') || command.startsWith('.weather')) {
            toolsCommands.handle(message, command, args);
        }
        
        // Commandes Video
        else if (command.startsWith('.tomp3') || command.startsWith('.toaudio') || 
                 command.startsWith('.tovn')) {
            videoCommands.handle(message, command);
        }
        
        // Menu principal
        else if (command === '.menu') {
            const menuText = `☬ˢRMDBOT☬

👑 *Owner:* RMD125
🧩 *Prefix:* [ . ]

⎾═╼▣ *AI MENU*
︱✗ kango
︱✗ chatgpt
︱✗ gpt2
︱✗ gpt3
︱✗ google
⎿═╼▣

⎾═╼▣ *DOWNLOADER MENU*
︱✗ play
︱✗ play2
︱✗ song
︱✗ apk
︱✗ video
︱✗ video2
︱✗ mediafire
︱✗ shazam
︱✗ screenshot
︱✗ gitclone
︱✗ remini
︱✗ fb
︱✗ lyrics
︱✗ instagram
︱✗ generate
︱✗ ytmp3
︱✗ ytmp4
︱✗ ytaudio
︱✗ videodoc
︱✗ videodoc2
︱✗ playdoc
⎿═╼▣

⎾═╼▣ *FUN MENU*
︱✗ quote
︱✗ dare
︱✗ fact
︱✗ compliment
︱✗ truth
︱✗ riddle
︱✗ trivia
︱✗ pickupline
⎿═╼▣

⎾═╼▣ *GROUP MENU*
︱✗ antilink 
︱✗ promote
︱✗ kick
︱✗ welcome 
︱✗ demote
︱✗ closetime
︱✗ opentime
︱✗ add
︱✗ tagall
︱✗ hidetag
︱✗ revoke
︱✗ setgppc
︱✗ getinfo
︱✗ totag
︱✗ setdesc
︱✗ listonline
⎿═╼▣

⎾═╼▣ *ADMIN MENU*
︱✗ purge
︱✗ kickall
︱✗ ban
︱✗ ppbot
︱✗ autoadmin
︱✗ kickadmin
︱✗ spam
︱✗ god
⎿═╼▣

⎾═╼▣ *TOOLS MENU*
︱✗ tovideo
︱✗ toimage
︱✗ toqr
︱✗ sticker
︱✗ togif
︱✗ fliptext
︱✗ tts
︱✗ text2pdf
︱✗ emojimix
︱✗ take
︱✗ time
︱✗ weather 
⎿═╼▣

⎾═╼▣ *VIDEO MENU*
︱✗ tomp3
︱✗ toaudio
︱✗ tovn
⎿═╼▣`;

            message.reply(menuText);
        }
        
        // Statut du bot
        else if (command === '.status') {
            const used = process.memoryUsage().heapUsed / 1024 / 1024;
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            
            const statusText = `☬ˢRMDBOT☬

✅ *Statut:* En ligne
⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s
📊 *RAM Utilisée:* ${Math.round(used * 100) / 100} MB
👑 *Admin:* RMD125`;

            message.reply(statusText);
        }
        
        // Info du bot
        else if (command === '.info') {
            const infoText = `☬ˢRMDBOT☬

👑 *Owner:* RMD125
🧩 *Prefix:* [ . ]
⚙️ *Mode:* Public
📊 *Version:* 2.0.0
🔧 *Déployé sur:* Katabump
📞 *Support:* ${ownerNumber}`;

            message.reply(infoText);
        }
    } catch (error) {
        logError(`Erreur dans le gestionnaire de messages: ${error}`);
    }
});

// Initialisation du client
client.initialize();

// Gestion propre de la fermeture
process.on('SIGINT', async () => {
    logInfo('Arrêt du bot...');
    try {
        await sendMessageToOwner(client, ownerNumber, '☬ˢRMDBOT☬\n\n🛑 Bot déconnecté.');
    } catch (error) {
        logError('Erreur lors de l\'envoi du message de déconnexion:', error);
    }
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logError(`Erreur non catchée: ${error}`);
});

process.on('unhandledRejection', (reason, promise) => {
    logError(`Promise rejetée non gérée: ${reason}`);
});
