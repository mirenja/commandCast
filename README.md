# commandCast
## Description

**commandcast** is a simple command broadcast tool for remote device management built with node.js,Express and Mongodb.authenticated users can login , view conncted clients and executed whitelisted system commands over ssh.
it implements user authentication, authorisation, sessioninformation tracking, command and response logging.

## Tech Stack
- Backend: Express.js 
- Database: Mongodb
- ORM: Mongoose
- Authentication: JWt
- Templating: Ejs
- Exception Logging: sentry
- Deployment: Google cloud
- Unit Testing: Jest
- Utilities: FAker(seeding)



## Get started.
### first things first:
- Node.js version18
- Mongodb
- SSH device 

### Installation
- clone the repository
- cd commandCast
- npm install
- create a .env file and add
 - MONGODB_URI=<add your URI>
 - PORT = 3000
 -TOKEN_SECRET=
- seed the database
    - npm run seed

## run 
- npm run dev
- view the site on http://localhost:3000
- signup and explore.

##architecture diagram: 






