import crypto from "crypto";
import { Session } from "../models/session.js";
import { getBerlinTime } from "./berlinTime.js"; 


export async function ensureSessionCookie(req, res, user) {
let sessionCookie = req.cookies.sessionCookie;
if (!sessionCookie) {
const session = new Session({
session_id: crypto.randomBytes(8).toString("hex"),
started_by: user._id,
});
await session.save();


const { date, time } = getBerlinTime(session.createdAt);


sessionCookie = { id: session.id, session_id: session.session_id, date, time };



res.cookie("sessionCookie", sessionCookie, {
httpOnly: true,
secure: true,
sameSite: "Strict",
maxAge: 3600000, 
});
}
return sessionCookie;
}