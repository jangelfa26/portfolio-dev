import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { createUser, getUserByUsername } from "../models/users.js";
import { getNavbarHTML } from "../utils/navbar.js";

const router = express.Router();

router.get("/login", (req, res) => {
    const navbar = getNavbarHTML(req, 'login');
    res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Login</title>
<link rel="stylesheet" href="/css/style.css">
</head>
<body>

${navbar}

<div class="container">
    <div class="section" style="max-width: 500px; margin: 0 auto;">
        <h1>Login</h1>

        <form method="POST" action="/login" class="add-form" style="grid-template-columns: 1fr;">
            <input name="username" placeholder="Usuario" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit">Login</button>
        </form>
    </div>
</div>

</body>
</html>
    `);
});


router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await getUserByUsername(username);

    if (!user) return res.redirect("/login");

    const hash = crypto.createHash("md5").update(password).digest("hex");

    if (hash !== user.password) return res.redirect("/login");

    const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
    );

    res.cookie("token", token, {
        httpOnly: true
    });

    res.redirect("/dashboard");
});

router.get("/register", (req, res) => {
    const navbar = getNavbarHTML(req, 'register');
    res.send(`
 <!DOCTYPE html>
<html>
<head>
<title>Registro</title>
<link rel="stylesheet" href="/css/style.css">
</head>
<body>

${navbar}

<div class="container">
    <div class="section" style="max-width: 500px; margin: 0 auto;">
        <h1>Registro</h1>

        <form method="POST" action="/register" class="profile-form">
            <input name="username" placeholder="Usuario" required />
            <input name="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit">Register</button>
        </form>
    </div>
</div>

</body>
</html>
    `);
});


router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    const hash = crypto.createHash("md5").update(password).digest("hex");

    await createUser(username, hash, email);

    res.redirect("/login");
});

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});
export default router;