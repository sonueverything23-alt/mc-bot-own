// Random walk movement to avoid AFK kicks
const { pathfinder } = require('mineflayer-pathfinder');
let moveInterval = null;
let targetPosition = null;
const WALK_RADIUS = 20; // blocks
const WALK_INTERVAL = 5000; // ms

function getRandomPosition(center, radius) {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * radius;
  return {
    x: center.x + distance * Math.cos(angle),
    y: center.y, // keep same y (ground level)
    z: center.z + distance * Math.sin(angle),
  };
}

function startMovement(bot) {
  // Clear any existing interval
  if (moveInterval) {
    clearInterval(moveInterval);
  }

  // Set home position when bot spawns (we'll update on first spawn)
  let homePosition = null;

  bot.once('spawn', () => {
    homePosition = bot.entity.position.clone().floor();
  });

  // Update home position if bot respawns
  bot.on('spawn', () => {
    homePosition = bot.entity.position.clone().floor();
  });

  moveInterval = setInterval(() => {
    if (!homePosition || !bot.entity) {
      return;
    }

    // Set a new target position within WALK_RADIUS of home
    targetPosition = getRandomPosition(homePosition, WALK_RADIUS);

    // Move towards target
    bot.pathfinder.setGoal(new pathfinder.GoalBlock(
      targetPosition.x,
      targetPosition.y,
      targetPosition.z
    ));
  }, WALK_INTERVAL);

  // Stop movement when bot dies or disconnects
  bot.once('end', () => {
    if (moveInterval) {
      clearInterval(moveInterval);
      moveInterval = null;
    }
  });
}

module.exports = { startMovement };