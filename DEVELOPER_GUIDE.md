# Internal Developer Guide


## 1. Project Structure

- **Models** – Database schemas  
  Example: `Client` → `models/Client.js`

- **Services** – Business logic functions  
  Example: `sessionService.js` → `services/sessionService.js`

- **Controllers** – Request handlers  
  Example: `connectClient` → `controllers/connectionController.js`

- **Views** –  Ui templates
  Example: `dashboard.ejs` -> `views/dashboard.ejs`

---

## 2. Variable Naming Conventions

- **Variables & Functions &Files** → `camelCase`  
  Example : const onlineClients  
  function connectClient() {}
 **Constants** → UPPER_SNAKE_CASE
  example:const SSH_PASSWORD
          file: clientService.js

Use descriptive names,
domain names use client instead of devices.

## 3. Commit Guidelines
Use clear, descriptive messages:
feat: new feature
fix: bug fix
refactor: structural code changes
test: adding or modifying tests
docs: documentation updates

Example: doc: added README

## 4. Internal Review

## 5. Secret & Credential Handling
Never commit secrets (passwords, API keys, tokens) to the repository.
Use environment variables or a secure configuration file.
Example: export const SSH_PASSWORD = process.env.SSH_PASSWORD;
Logs must never contain sensitive data.

For local testing, store credentials in .env and ignore it in .gitignore.
confirm .env is not in git status added files.

## 6. Code Style & Best Practices
Include error handling 
Remove console logs before merging.


## 7. Testing


