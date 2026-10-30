import { config } from "dotenv";
import { resolve } from "node:path";
import mongoose from "mongoose";
import { app } from "./app.js";
config({ path: resolve(process.cwd(), "../.env"), quiet: true });
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .catch(() =>
      console.error(
        "MongoDB unavailable. Contact requests will return a retry message until connected.",
      ),
    );
}
const server = app.listen(Number(process.env.PORT || 3001), "127.0.0.1", () =>
  console.log(`TSI API: http://127.0.0.1:${process.env.PORT || 3001}`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(() => {
      void mongoose.disconnect().then(() => process.exit(0));
    }),
  );
