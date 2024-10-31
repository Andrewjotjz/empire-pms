//import modules
const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1].trim();
  }

  if (token) {
    jwt.verify(token, 'empirepms2024 secret', (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        return res.json({ tokenError: err.message });
      } else {
        console.log("Token has been verified:", decodedToken);
        req.user = decodedToken; // Optional for further use
        next();
      }
    });
  } else {
    res.json({ tokenError: "Session expired. Please login again." });
  }
};



module.exports = { requireAuth };