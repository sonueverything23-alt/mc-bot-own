// Anti-AFK: perform periodic actions to prevent idle kick
let antiAfkInterval = null;
const ANTI_AFK_INTERVAL = 45000; // 45 seconds

function startAntiAfk(bot) {
  // Clear any existing interval
  if (antiAfkInterval) {
    clearInterval(antiAfkInterval);
  }

  antiAfkInterval = setInterval(() => {
    if (!bot || !bot.entity) {
      return;
    }
    // Swing the arm
    bot.swingArm();
    // Optional: send an empty chat message
    // bot.chat('');
  }, ANTI_AFK_INTERVAL);

  // Stop when bot disconnects
  bot.once('end', () => {
    if (antiAfkInterval) {
      clearInterval(antiAfkInterval);
      antiAfkInterval = null;
    }
  });
}

module.exports = { startAntiAfk };