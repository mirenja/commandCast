import { v4 as uuidv4 } from "uuid" 
import { User } from "../models/user.js" 


export async function ensureUserFromOIDC(oidcUser) {
if (!oidcUser || !oidcUser.email) {
throw new Error("OIDC user missing email") 
}


let user = await User.findOne({ email: oidcUser.email }) 
if (!user) {
user = await User.create({
id: uuidv4(),
auth0_user_id: oidcUser.sub,
email: oidcUser.email,
name: oidcUser.name,
isAdmin: false,
})
}
return user
}