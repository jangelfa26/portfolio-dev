import jwt from "jsonwebtoken";

export function getNavbarHTML(req, currentPage = '') {
    let user = null;

    const token = req.cookies?.token;

    if (token) {
        try {
            user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            user = null;
        }
    }

    const isLogged = !!user;

    return `
    <nav class="navbar">
        <div class="nav-left">
            <a href="/" class="nav-link ${currentPage === 'home' ? 'active' : ''}">Home</a>
            <a href="/portfolio/all" class="nav-link ${currentPage === 'all-portfolios' ? 'active' : ''}">All Portfolios</a>
        </div>
        <div class="nav-right">
            ${isLogged ? `
                <a href="/dashboard" class="nav-link ${currentPage === 'dashboard' ? 'active' : ''}">Mi Dashboard</a>
                <a href="/logout" class="nav-link">Logout</a>
                <span class="user-info">
                    (Logged as <a href="/portfolio/${user.username}"><strong>${user.username}</strong></a>)
                </span>
            ` : `
                <a href="/login" class="nav-link">Login</a>
                <a href="/register" class="nav-link">Register</a>
            `}
        </div>
    </nav>`;
}
