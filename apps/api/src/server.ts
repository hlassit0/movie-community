import "dotenv/config";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { getRecommendations } from "./recommendations.js";

const app = Fastify({ logger: true });
await app.register(cors, { origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" });

app.get("/health", async () => ({ status: "ok" }));
app.get("/api/recommendations", async () => getRecommendations());

app.listen({ port: Number(process.env.PORT ?? 4000), host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
