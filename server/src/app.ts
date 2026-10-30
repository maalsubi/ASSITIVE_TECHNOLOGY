import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { contactSchema } from "../../shared/contact.js";
import { saveInquiry, notifyInquiry } from "./services/inquiries.js";
export const app = express();
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'"],
        "img-src": ["'self'", "data:"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "connect-src": ["'self'"],
      },
    },
  }),
);
app.use(express.json({ limit: "16kb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.post(
  "/api/contact",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many inquiries. Please try again in 15 minutes." },
  }),
  async (req, res) => {
    const result = contactSchema.safeParse(req.body);
    if (!result.success) {
      res
        .status(400)
        .json({
          message: "Please check your form fields.",
          errors: result.error.flatten().fieldErrors,
        });
      return;
    }
    try {
      const record = await saveInquiry(result.data);
      void notifyInquiry(record).catch(() =>
        console.error("Inquiry saved, but email notification failed."),
      );
      res
        .status(201)
        .json({
          message: "Your inquiry has been received.",
          reference: record.reference,
        });
    } catch {
      res
        .status(503)
        .json({
          message: "We could not save your inquiry. Please try again shortly.",
        });
    }
  },
);
app.use("/api", (_req, res) => {
  res.status(404).json({ message: "API route not found." });
});
const clientDist = fileURLToPath(
  new URL("../../../../client/dist/", import.meta.url),
);
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("/{*path}", (_req, res) => res.sendFile(clientDist + "index.html"));
}
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    res
      .status(err.status === 413 ? 413 : 400)
      .json({
        message:
          err.status === 413 ? "The request is too large." : "Invalid request.",
      });
  },
);
