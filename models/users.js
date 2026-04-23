import connection from "../db/connection.js";

export async function createUser(username, password, email) {
    await connection.execute(
        "INSERT INTO users(username, password, email, photo) VALUES(?,?,?,?)",
        [username, password, email, '/default-avatar.jpg']
    );
}

export async function getUserByUsername(username) {
    const [rows] = await connection.execute(
        "SELECT * FROM users WHERE username=?",
        [username]
    );
    return rows[0];
}

export async function getUserById(id) {
    const [rows] = await connection.execute(
        "SELECT * FROM users WHERE id=?",
        [id]
    );
    return rows[0];
}

export async function getAllUsers() {
    const [rows] = await connection.execute(
        "SELECT id, username, bio, photo, email FROM users"
    );
    return rows;
}

export async function updateUser(id, bio, email, photo) {
    const currentUser = await getUserById(id);
    const newPhoto = photo || currentUser.photo;
    
    await connection.execute(
        "UPDATE users SET bio=?, email=?, photo=? WHERE id=?",
        [bio || null, email, newPhoto, id]
    );
}   
