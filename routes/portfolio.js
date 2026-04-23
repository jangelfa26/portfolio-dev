import express from "express";
import connection from "../db/connection.js";
import { getAllUsers } from "../models/users.js";
import { getNavbarHTML } from "../utils/navbar.js";

const router = express.Router();

router.get("/all", async (req, res) => {
    const users = await getAllUsers();
    const navbar = getNavbarHTML(req, 'all-portfolios');
    
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>All Portfolios - DevPortfolio</title><link rel="stylesheet" href="/css/style.css"></head>
    <body>
        ${navbar}
        <div class="container">
            <h1>Todos los Portfolios (${users.length})</h1>
            <div class="portfolios-grid">
                ${users.map(u => `
                    <div class="portfolio-card-large">
                        <img src="${u.photo}" alt="${u.username}" class="profile-img-round-large">
                        <div>
                            <h3><a href="/portfolio/${u.username}">${u.username}</a></h3>
                            <p>${u.bio || 'Sin descripción'}</p>
                            <span class="email">${u.email}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <footer>© 2026 DevPortfolio</footer>
    </body>
    </html>`);
});


router.get("/:username", async (req, res) => {
    const username = req.params.username;
    
    const [users] = await connection.execute(
        "SELECT id, username, bio, email, photo FROM users WHERE username=?", [username]
    );
    
    if (users.length === 0) {
        return res.status(404).send("Usuario no encontrado");
    }
    
    const user = users[0];
    const [projects] = await connection.execute("SELECT * FROM projects WHERE user_id=?", [user.id]);
    const [links] = await connection.execute("SELECT * FROM social_links WHERE user_id=?", [user.id]);
    const navbar = getNavbarHTML(req, 'portfolio');
    
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>${user.username} - Portfolio</title><link rel="stylesheet" href="/css/style.css"></head>
    <body>
        ${navbar}
        <div class="container">
            <div class="profile-header">
                <img src="${user.photo}" alt="${user.username}" class="profile-img-round-large">
                <div>
                    <h1>${user.username}</h1>
                    <p class="bio">${user.bio || 'Sin biografía'}</p>
                    <p class="email">${user.email}</p>
                </div>
            </div>

            <div class="section">
                <h2>Social Links</h2>
                <ul class="social-list">
                    ${links.map(l => `<li><a href="${l.url}" target="_blank">${l.platform}</a></li>`).join('') || '<li>No hay enlaces sociales</li>'}
                </ul>
            </div>

            <div class="section">
                <h2>Projects</h2>
                <ul class="projects-list">
                    ${projects.map(p => `
                        <li class="project-card">
                            <h3>${p.title}</h3>
                            <p>${p.description}</p>
                            ${p.repo_url ? `<a href="${p.repo_url}" target="_blank">Repo</a>` : ''}
                            ${p.live_url ? `<a href="${p.live_url}" target="_blank">Live</a>` : ''}
                        </li>
                    `).join('') || '<li>No hay proyectos</li>'}
                </ul>
            </div>
        </div>
        <footer>© 2026 DevPortfolio</footer>
    </body>
    </html>`);
});

export default router;
