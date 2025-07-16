const jwt = require('jsonwebtoken');
const SECRET = 'your_jwt_secret'; // Same as above

// ✅ Authenticate User
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('No token provided');

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = user;
    next();
  });
}

// ✅ Authorize Role
function authorize(role) {
  return (req, res, next) => {
    if (req.user.role !== role) return res.status(403).send('Forbidden');
    next();
  };
}

// Export both functions as properties of an object
module.exports = { authenticate, authorize };

