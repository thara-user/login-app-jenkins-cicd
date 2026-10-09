
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect Node.js to PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "login_app",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
});

// Log database connection errors without exposing credentials
pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL connection error:", err.message);
});

// Parse JSON request bodies
app.use(express.json({ limit: "10kb" }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "../../frontend")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "Login application backend is running",
  });
});

// Register a new user
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Username, email, and password are required.",
      });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (
      cleanUsername.length < 3 ||
      cleanUsername.length > 50 ||
      !/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)
    ) {
      return res.status(400).json({
        message:
          "Username must be 3–50 characters and use letters, numbers, dots, underscores, or hyphens.",
      });
    }

    if (
      cleanEmail.length > 255 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({
        message: "Enter a valid email address.",
      });
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and at most 72 bytes.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)`,
      [cleanUsername, cleanEmail, passwordHash]
    );

    return res.status(201).json({
      message: "Registration successful. You can now log in.",
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        message: "That username or email is already registered.",
      });
    }

    console.error("Registration error:", err.message);
    return res.status(500).json({
      message: "Registration failed. Please try again later.",
    });
  }
});

// Log in using email or username and password
app.post("/api/login", async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;
    const loginName = identifier || email || username;

    if (
      typeof loginName !== "string" ||
      typeof password !== "string" ||
      !loginName.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Username/email and password are required.",
      });
    }

    const value = loginName.trim();
    const isEmail = value.includes("@");

    const result = await pool.query(
      `SELECT id, username, email, password_hash
       FROM users
       WHERE ${isEmail ? "email = $1" : "username = $1"}
       LIMIT 1`,
      [isEmail ? value.toLowerCase() : value]
    );

    // Use the same message for unknown users and incorrect passwords
    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid username/email or password.",
      });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid username/email or password.",
      });
    }

    return res.json({
      message: "Login successful.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({
      message: "Login failed. Please try again later.",
    });
  }
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Handle malformed JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON request." });
  }

  next(err);
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Close database connections cleanly when stopping the server
async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);