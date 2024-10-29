//import modules
const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  //retrieve json web token by using request's cookie which will be sent to the server
  const token = req.cookies.jwt;

  //check if json web token exists & is verified
  if (token) {
    //if there's token, use jwt's verify(), which takes in a few argument similar to: jwt.sign({ id }, 'empirepms2024 secret', { expiresIn: maxAge })
    jwt.verify(token, 'empirepms2024 secret', (err, decodedToken) => {
      //if we have a token, but it's not valid
      if (err) {
        //print tokenError message
        console.log(err.message);
        //redirect user to login page
        // res.redirect('/login');
        res.json({tokenError: err.message})
      } else {
        console.log("Token has been verified. Please see details below:", "\n", decodedToken);
        // res.json({decodedToken})
        next();
      }
    });
  } else {
    //if there's no json web token, redirect user to login page
    // res.redirect('/EmpirePMS/login');
    res.json({tokenError: "Session expired. Please login again."})
  }
};


module.exports = { requireAuth };