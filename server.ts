import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import GameService from "@/services/GameService";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost"; // This is fine for local development but will be ignored in production
const port = parseInt(process.env.PORT ?? "3000") || 3000; // Use the PORT from environment variables for production

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const httpServer = createServer(handler);
  const io = new Server(httpServer);
  const gameService = new GameService(io);

  httpServer.on("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  // In production, DigitalOcean will automatically route to the correct port.
  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
