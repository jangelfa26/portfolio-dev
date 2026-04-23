import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getProjects, createProject, deleteProject } from "../models/projects.js";
import { getLinks, createLink, deleteLink } from "../models/socialLinks.js";
import { getUserById, updateUser } from "../models/users.js";
import { getNavbarHTML } from "../utils/navbar.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
    const user = await getUserById(req.user.id);
    const projects = await getProjects(req.user.id);
    const links = await getLinks(req.user.id);
    const navbar = getNavbarHTML(req, 'dashboard');

    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Dashboard - ${user.username}</title><link rel="stylesheet" href="/css/style.css"></head>
    <body>
        ${navbar}
        <div class="container">
            <h1>Dashboard for ${user.username}</h1>
            
            <div class="section profile-section">
                <h2>Edit Profile</h2>
                <div class="profile-card">
                    <img src="${user.photo}" alt="Profile" class="profile-img-round">
                    <form method="POST" action="/dashboard/profile" class="profile-form">
                        <input type="email" name="email" value="${user.email}" placeholder="Email" required>
                        <textarea name="bio" placeholder="Bio">${user.bio || ''}</textarea>
                        <input type="url" name="photo" placeholder="Photo URL">
                        <button type="submit">Update Profile</button>
                    </form>
                </div>
            </div>

            <div class="section">
                <h2>Manage Social Links</h2>
                <form method="POST" action="/dashboard/link" class="add-form">
                    <input name="platform" placeholder="Platform (GitHub, LinkedIn)" required>
                    <input name="url" placeholder="https://github.com/user" required>
                    <button>Add</button>
                </form>
                <ul class="list">
                    ${links.map(l => `
                        <li class="list-item">
                            <span><strong>${l.platform}:</strong> <a href="${l.url}" target="_blank">${l.url}</a></span>
                            <form method="POST" action="/dashboard/link/delete/${l.id}" class="delete-form">
                                <button type="submit">Delete</button>
                            </form>
                        </li>
                    `).join('') || '<li class="empty">No social links yet</li>'}
                </ul>
            </div>

            <div class="section">
                <h2>Manage Projects</h2>
                <form method="POST" action="/dashboard/project" class="add-form">
                    <input name="title" placeholder="Project Title" required>
                    <textarea name="description" placeholder="Description" required></textarea>
                    <input name="repo_url" placeholder="Repo URL">
                    <input name="live_url" placeholder="Live Demo URL">
                    <button>Add</button>
                </form>
                <ul class="list">
                    ${projects.map(p => `
                        <li class="list-item project-item">
                            <div>
                                <strong>${p.title}</strong>
                                <p>${p.description}</p>
                                ${p.repo_url ? `<a href="${p.repo_url}" target="_blank">Repo</a>` : ''}
                                ${p.live_url ? `<a href="${p.live_url}" target="_blank">Live</a>` : ''}
                            </div>
                            <form method="POST" action="/dashboard/project/delete/${p.id}" class="delete-form">
                                <button type="submit">Delete</button>
                            </form>
                        </li>
                    `).join('') || '<li class="empty">No projects yet</li>'}
                </ul>
            </div>
        </div>
        <footer>© 2026 DevPortfolio</footer>
    </body>
    </html>`);
});

router.post("/profile", requireAuth, async (req, res) => {
    await updateUser(req.user.id, req.body.bio, req.body.email, req.body.photo);
    res.redirect("/dashboard");
});

router.post("/project", requireAuth, async (req, res) => {
    await createProject(req.body.title, req.body.description, req.body.repo_url, req.body.live_url, req.user.id);
    res.redirect("/dashboard");
});

router.post("/project/delete/:id", requireAuth, async (req, res) => {
    await deleteProject(req.params.id, req.user.id);
    res.redirect("/dashboard");
});

router.post("/link", requireAuth, async (req, res) => {
    await createLink(req.body.platform, req.body.url, req.user.id);
    res.redirect("/dashboard");
});

router.post("/link/delete/:id", requireAuth, async (req, res) => {
    await deleteLink(req.params.id, req.user.id);
    res.redirect("/dashboard");
});

export default router;
