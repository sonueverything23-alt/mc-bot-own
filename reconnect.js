// Reconnect logic with exponential backoff
let reconnectInterval = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 3000; // 3 seconds
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

function setupReconnect(bot, config) {
  bot.on('end', (reason) => {
    console.log(`Bot disconnected: ${reason}. Attempting to reconnect...`);
    // Clear any existing interval
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
    reconnectAttempts = 0;
    scheduleReconnect();
  });

  bot.on('error', (err) => {
    console.error(`Bot error: ${err}`);
    // If it's a connection error, we might want to reconnect
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      bot.end(); // Trigger end event to start reconnect
    }
  });

  function scheduleReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log('Max reconnect attempts reached. Stopping.');
      return;
    }
    // Exponential backoff with jitter
    const delay = Math.min(
      BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts) + Math.random() * 1000,
      MAX_RECONNECT_DELAY
    );
    reconnectAttempts++;
    console.log(`Reconnecting in ${Math.round(delay / 1000)} seconds... (attempt ${reconnectAttempts})`);
    reconnectInterval = setTimeout(() => {
      reconnectInterval = null;
      // Attempt to reconnect by creating a new bot instance? Actually, we can't reconnect the same bot.
      // Instead, we'll emit a 'reconnect' event that index.js can listen to, or we just let the bot try to reconnect internally?
      // mineflayer does not automatically reconnect; we need to create a new bot.
      // However, the bot object we have is the one that ended. We'll need to create a new bot and replace it?
      // For simplicity, we'll just try to reconnect the same bot by calling bot._client.end? Not straightforward.
      // Better approach: In index.js, we can listen for 'end' and then call mineflayer.createBot again.
      // We'll change strategy: let the reconnect module handle recreation.
      // We'll export a function that returns a promise or creates a new bot.
      // But to keep changes minimal, we'll have the bot emit a 'reconnect' event and let index.js handle it.
      bot.emit('reconnect');
    }, delay);
  }

  // Listen for reconnect attempts from the bot itself? Actually, we'll have index.js handle recreation.
  // We'll just export the scheduling function and let index.js call it on 'end'.
  // But we already set up the listener above. We'll keep it and have it emit 'reconnect'.
  // index.js should listen for 'reconnect' and recreate the bot.
}

// Export a function to create a new bot with the same config (for index.js to use)
function createBot(config) {
  const mineflayer = require('mineflayer');
  const pathfinder = require('mineflayer-pathfinder');
  const bot = mineflayer.createBot({
    host: config.serverIp,
    port: config.serverPort,
    username: config.botUsername,
    // version: '1.18.2',
  });
  bot.loadPlugin(pathfinder.pathfinder);
  return bot;
}

module.exports = { setupReconnect, createBot };