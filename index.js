const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const config = require('./config');
const { startMovement } = require('./movement');
const { startAntiAfk } = require('./antiAfk');
const { startSelfPing } = require('./selfPing');
const http = require('http');

let bot = null;
let reconnectTimeout = null;
let reconnectAttempts = 0;
const BASE_RECONNECT_DELAY = 3000; // 3 seconds
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

function startBot() {
  // Clear any existing reconnect timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  bot = mineflayer.createBot({
    host: config.serverIp,
    port: config.serverPort,
    username: config.botUsername,
    version: '1.18.2',
  });

  bot.loadPlugin(pathfinder);

  // Log events
  bot.on('spawn', () => {
    console.log(`Spawned as ${bot.username}`);
    resetReconnectAttempts(); // Reset on successful spawn
    startMovement(bot);
    startAntiAfk(bot);
    if (config.renderUrl) {
      startSelfPing(bot, config.renderUrl);
    }
  });

  bot.on('login', () => {
    console.log(`Logged in as ${bot.username}`);
  });

  bot.on('end', (reason) => {
    console.log(`Disconnected: ${reason}`);
    // Clear intervals from movement, antiAfk, selfPing (they listen to 'end' themselves)
    // Schedule reconnect
    scheduleReconnect();
  });

  bot.on('error', (err) => {
    console.error(`Bot error: ${err}`);
    // If it's a connection error, end will be emitted
  });

  return bot;
}

function scheduleReconnect() {
  if (reconnectAttempts >= 10) {
    console.log('Max reconnect attempts reached. Stopping.');
    return;
  }
  const delay = Math.min(
    BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts) + Math.random() * 1000,
    MAX_RECONNECT_DELAY
  );
  reconnectAttempts++;
  console.log(`Reconnecting in ${Math.round(delay / 1000)} seconds... (attempt ${reconnectAttempts})`);
  reconnectTimeout = setTimeout(startBot, delay);
}

function resetReconnectAttempts() {
  reconnectAttempts = 0;
}

// Start the bot initially
startBot();

// Health check endpoint for Render.com
if (process.env.PORT) {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Minecraft bot is running\n');
  });

  const port = process.env.PORT;
  server.listen(port, () => {
    console.log(`Health check server listening on port ${port}`);
  });
}