import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import propertyRoutes from "./routes/propertyRoutes";
import brokerRoutes from "./routes/brokerRoutes";
import requirementRoutes from "./routes/requirementRoutes";
import emailRoutes from "./routes/emailRoutes"; 
import redevelopmentRoutes from "./routes/redevelopmentRoutes";
import commercialRoutes from "./routes/commercialRoutes";
import aiRoutes from "./routes/aiRoutes";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use("/api/v1", propertyRoutes);
app.use("/api/v1", brokerRoutes);
app.use("/api/v1", requirementRoutes);
app.use("/api/v1", emailRoutes);
app.use("/api/v1", redevelopmentRoutes);
app.use("/api/v1", commercialRoutes);
app.use("/api/v1/ai", aiRoutes);


app.get("/", (_req, res) => {
  res.send("Backend Running 🚀");
});

export default app;