export function isLoggedIn(request, response, next) {
    if (request.user) {
      next()
    } else {
      response.send(401, "Unauthorized");
    }
  }