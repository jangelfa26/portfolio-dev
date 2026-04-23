import "./config/env.js";
import cookieParser from "cookie-parser";

import { requireAuth } from "./middleware/auth.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { getAllUsers } from "./models/users.js";
import { getNavbarHTML } from "./utils/navbar.js";

import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import portfolioRoutes from "./routes/portfolio.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.use("/", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/portfolio", portfolioRoutes);

app.get("/", async (req, res) => {

    let users = [];
    try {
        users = await getAllUsers();    
    } catch (error) {
        console.error(error);
    }
    

    let user = null;

const token = req.cookies.token;

if (token) {
    try {
        const payload = JSON.parse(
            Buffer.from(token.split(".")[1], "base64").toString()
        );
        user = payload;
    } catch (err) {
        user = null;
    }
}

    const profileSection = user ? `
        <div class="section">
            <h2>Mi Perfil</h2>
            <div class="profile-preview">
                <img src="${user.photo || '/default-avatar.jpg'}" alt="${user.username}" class="profile-img-round">
                <div>
                    <h3>${user.username}</h3>
                    <p>${user.bio || 'Sin biografía'}</p>
                    <br>
                    <a href="/portfolio/${user.username}" class="btn-primary">Ver Perfil →</a>
                </div>
            </div>
        </div>
    ` : `
        <div class="section">
            <div class="hero-cta">
                <h2> ¡Crea tu portfolio GRATIS!</h2>
                <p>Inicia sesión para mostrar tus proyectos al mundo</p>
                <br>
                <div class="cta-buttons">
                    <a href="/login" class="btn-primary">Empezar Ahora</a>
                    <a href="/register" class="btn-secondary">Crear Cuenta</a>
                </div>
            </div>
        </div>
    `;

    const navbar = getNavbarHTML(req);

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>DevPortfolio</title>
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        ${navbar}
        <div class="container">
        
            <div class="hero">
                <h1>DevPortfolio</h1>
                <p>La plataforma para mostrar tus proyectos de desarrollo</p>
                <br>
                <a href="/portfolio/all" class="cta-btn">Ver Todos los Portfolios →</a>
            </div>

            ${profileSection}

            <div class="section">
                <h2>Últimos Portfolios</h2>
                <div class="portfolios-grid">
                    ${users.slice(0, 6).map(u => `
                        <a href="/portfolio/${u.username}" class="portfolio-card">
                            <img src="${u.photo}" alt="${u.username}" class="profile-img-round-small">
                            <h3>${u.username}</h3>
                            <p>${u.bio?.substring(0, 80) || 'Sin bio'}...</p>
                        </a>
                    `).join('')}
                </div>
            </div>

        </div>
        <footer>© 2026 DevPortfolio</footer>
    </body>
    </html>`);
});


export default app;

if (process.env.NODE_ENV !== "production") {
    app.listen(3000, () => {
        console.log("Servidor en http://localhost:3000");
    });
}