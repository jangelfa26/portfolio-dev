import connection from "../db/connection.js";

export async function getLinks(userId) {

    const [rows] = await connection.execute(
        "SELECT * FROM social_links WHERE user_id=?",
        [userId]
    );

    return rows;
}

export async function createLink(platform, url, userId) {

    await connection.execute(
        "INSERT INTO social_links(platform,url,user_id) VALUES(?,?,?)",
        [platform, url, userId]
    );

}

export async function deleteLink(id, userId) {

    const [result] = await connection.execute(
       "DELETE FROM social_links WHERE id=? AND user_id=?",
        [id, userId]
    );

    if (result.affectedRows === 0) {
        throw new Error("No autorizado o recurso inexistente");
    }

}