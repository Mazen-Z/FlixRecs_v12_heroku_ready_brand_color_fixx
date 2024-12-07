// JWT Authentication Middleware
function authenticateJWT(req, res, next) {
  // Get token from Authorization header, ensuring it’s in the 'Bearer <token>' format
  const token = req.header('Authorization')?.split(' ')[1]; 

  // If no token is provided, send a 403 response
  if (!token) {
    return res.status(403).json({ success: false, error: 'Access denied. No token provided.' });
  }

  // Verify the JWT token
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    // If there’s an error in token verification, send a 403 response
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token.' });
    }

    // Attach the decoded user object to the request for use in the next middleware or route handler
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  });
}
