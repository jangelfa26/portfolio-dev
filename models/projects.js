import connection from "../db/connection.js";

export async function getProjects(userId) {
  const [rows] = await connection.execute(
    "SELECT * FROM projects WHERE user_id=?",
    [userId]
  );
  return rows;
}

export async function createProject(title, description, repo, live, userId) {
  await connection.execute(
    "INSERT INTO projects(title,description,repo_url,live_url,user_id) VALUES(?,?,?,?,?)",
    [title, description, repo, live, userId]
  );
}

export async function deleteProject(id, userId) {
  const [result] = await connection.execute(
    "DELETE FROM projects WHERE id=? AND user_id=?",
    [id, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error("No autorizado o recurso inexistente");
  }
}
