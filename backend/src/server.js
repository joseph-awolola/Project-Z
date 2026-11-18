import express from "express";
import cors from "cors";
import routes from "./routes.js";
import { startScheduler } from "./billing.js";


const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());
app.use(routes);

// Any error thrown in a route ends up here
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.description || err.message || "Server error" });
});

startScheduler();
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));