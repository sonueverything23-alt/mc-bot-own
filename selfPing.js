// Self-ping to prevent Render.com from sleeping
let selfPingInterval = null;
const SELF_PING_INTERVAL = 12 * 60 * 1000; // 12 minutes (within 15 min free tier sleep)

function startSelfPing(bot, renderUrl) {
  if (!renderUrl) {
    console.log('No render URL provided, skipping self-ping');
    return;
  }
  // Clear any existing interval
  if (selfPingInterval) {
    clearInterval(selfPingInterval);
  }

  selfPingInterval = setInterval(() => {
    const http = require('http');
    const url = require('url');
    const parsed = url.parse(renderUrl);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname + (parsed.search || ''),
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      // console.log(`Self-ping status: ${res.statusCode}`);
    });

    req.on('error', (e) => {
      console.error(`Self-ping error: ${e.message}`);
    });

    req.on('timeout', () => {
      req.destroy();
      console.error('Self-ping timeout');
    });

    req.end();
  }, SELF_PING_INTERVAL);

  // Stop when bot disconnects
  bot.once('end', () => {
    if (selfPingInterval) {
      clearInterval(selfPingInterval);
      selfPingInterval = null;
    }
  });
}

module.exports = { startSelfPing };