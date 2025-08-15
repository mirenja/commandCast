import dotenv from 'dotenv';
dotenv.config()

export const config = {
  authRequired: false,         
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET, 
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  routes: {
    callback: '/callback' 
  }
};