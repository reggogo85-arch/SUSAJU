import app from "./app.js";
import path from "path";
import express from "express";

const PORT = 3000;

async function mountViteMiddleware() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static serving configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[신우사주 Server] online on port ${PORT}`);
  });
}

mountViteMiddleware();
