require('dotenv').config();

module.exports = {
  serverIp: process.env.SERVER_IP || 'localhost',
  serverPort: parseInt(process.env.SERVER_PORT) || 25565,
  botUsername: process.env.BOT_USERNAME || 'MinecraftBot',
  renderUrl: process.env.RENDER_URL || null,
  port: parseInt(process.env.PORT) || 3000,
};