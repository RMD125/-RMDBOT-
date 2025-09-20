{
  "name": "rmdbot",
  "version": "2.0.0",
  "description": "☬ˢRMDBOT☬ - Bot WhatsApp avec commandes avancées",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "katabump": "pm2 start ecosystem.config.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "whatsapp-web.js": "^1.25.0",
    "qrcode-terminal": "^0.12.0",
    "pm2": "^5.3.0",
    "axios": "^1.6.0",
    "fluent-ffmpeg": "^2.1.2",
    "qrcode": "^1.5.3",
    "giphy-js-sdk-core": "^1.0.6"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  },
  "keywords": [
    "whatsapp",
    "bot",
    "whatsapp-bot",
    "katabump",
    "rmdbot"
  ],
  "author": "RMD125",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/RMD125/RMDBOT.git"
  }
}
