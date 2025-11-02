import { openDb, initDb } from "../db.js";
import bcrypt from "bcryptjs";

export default async function handler(event,context) {
  await initDb();

  if (event.httpMethod !== "POST") {
    return {
    status code; 405,
    body: JSON.stringify({ error: "Method Not Allowed" });
  }

  const { username, password, device_id } = JSON.parse(event.body || "{ }");

  if (!username || !password) {
    return {
    status code; 400,
    body: JSON.stringify({ error: "Username dan password wajib diisi!" });
  }

  try {
    const db = await openDb();
    const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return {
    status code; 401, body: JSON.stringify({ error: "Username atau password salah!" });
    }

    const now = new Date();
    const exp = new Date(user.expired_at);
    if (now > exp) {
      return {
    status code; 403,
    body: JSON.stringify({ error: "Akun sudah expired!" });
    }

    let devices = JSON.parse(user.devices || "[]");
    if (!devices.includes(device_id)) {
      if (devices.length >= user.device_limit) {
        return {
    status code; 403,
    body: JSON.stringify({ error: "Device limit penuh!" });
      }
      devices.push(device_id);
      await db.run("UPDATE users SET devices = ? WHERE id = ?", [
        JSON.stringify(devices),
        user.id
      ]);
    }

    const daysLeft = Math.floor((exp - now) / (1000 * 60 * 60 * 24));
    return {
    status code; 200,
    body: JSON.stringify({
      Cliente: username,
      Dias: daysLeft
    });
  } catch (err) {
    console.error(err);
    return {
    status code; 500,
    body: JSON.stringify({ error: "Server error: " + err.message });
  }
  }
      
