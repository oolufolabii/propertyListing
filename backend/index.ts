import { Hono } from "https://esm.sh/hono@3.11.7";
import { cors } from "https://esm.sh/hono@3.11.7/middleware";
import { readFile, serveFile } from "https://esm.town/v/std/utils/index.ts";
import { runMigrations } from "./database/migrations.ts";
import propertiesRoutes from "./routes/properties.ts";
import adminRoutes from "./routes/admin.ts";

// Initialize the app
const app = new Hono();

// Unwrap Hono errors to see original error details
app.onError((err, c) => {
  throw err;
});

// Apply CORS middleware
app.use("/*", cors());

// Run database migrations
app.use("/*", async (c, next) => {
  try {
    await runMigrations();
  } catch (error) {
    console.error("Migration error:", error);
  }
  await next();
});

// API routes
app.route("/api/properties", propertiesRoutes);
app.route("/api/admin", adminRoutes);

// Serve static files
app.get("/frontend/*", c => serveFile(c.req.path, import.meta.url));
app.get("/shared/*", c => serveFile(c.req.path, import.meta.url));

// Serve index.html for the main page and admin page
app.get("/", async c => {
  let html = await readFile("/frontend/index.html", import.meta.url);
  return c.html(html);
});

app.get("/admin", async c => {
  let html = await readFile("/frontend/admin.html", import.meta.url);
  return c.html(html);
});

// Serve property detail page
app.get("/property/:id", async c => {
  let html = await readFile("/frontend/index.html", import.meta.url);
  return c.html(html);
});

// Handle 404
app.notFound(c => {
  return c.json({
    success: false,
    error: "Not Found"
  }, 404);
});

// Export the app
export default app.fetch;
