import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import GameService from "@/services/GameService";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const httpServer = createServer(handler);

  const io = new Server(httpServer);
  new GameService(io);

  httpServer.on("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
