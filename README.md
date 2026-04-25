# Minecraft Bot for Render.com

A Node.js bot that connects to a Minecraft server (1.18.2), moves around to avoid AFK kicks, automatically reconnects if disconnected, and self-pings to prevent Render.com from sleeping.

## Features
- Connects to Minecraft server using username (offline mode)
- Random movement within configured radius to avoid idle kicks
- Periodic arm swings to prevent AFK kick detection
- Automatic reconnection with exponential backoff
- Self-pinging to keep Render.com service awake
- Health check endpoint for Render.com monitoring

## Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`:
   ```
   SERVER_IP=your_minecraft_server_ip
   SERVER_PORT=25565
   BOT_USERNAME=YourBotName
   RENDER_URL=https://your-service.onrender.com  # Optional, for self-ping
   PORT=3000  # Optional, for health check
   ```
4. Start the bot: `npm start`

## Environment Variables
- `SERVER_IP`: Minecraft server IP address
- `SERVER_PORT`: Minecraft server port (default: 25565)
- `BOT_USERNAME`: Username for the bot to connect with
- `RENDER_URL`: Your Render.com service URL (for self-pinging)
- `PORT`: Port for health check endpoint (default: 3000)

## How It Works
- Uses mineflayer to connect to the Minecraft server
- Upon spawn, starts random movement within a 20-block radius
- Every 45 seconds, swings arm to prevent AFK detection
- On disconnect, attempts reconnection with increasing delay (3s, 6s, 12s, etc. up to 30s)
- If RENDER_URL is provided, makes HTTP GET request every 12 seconds to prevent Render.com sleep
- Exposes HTTP endpoint on PORT for Render.com health checks

## Notes
- This bot uses offline mode (no password authentication). For online mode servers, you would need to implement Microsoft authentication.
- Tested with Minecraft 1.18.2 but should work with similar versions.
- Adjust WALK_RADIUS in movement.js if needed.