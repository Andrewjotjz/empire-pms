//import modules
const jwt = require('jsonwebtoken');
const employeeModel = require('../models/employeeModel');

const requireAuth = (req, res, next) => {
  //retrieve json web token by using request's cookie which will be sent to the server
  const token = req.cookies.jwt;

  //check if json web token exists & is verified
  if (token) {
    //if there's token, use jwt's verify(), which takes in a few argument similar to: jwt.sign({ id }, 'empirepms2024 secret', { expiresIn: maxAge })
    jwt.verify(token, 'empirepms2024 secret', (err, decodedToken) => {
      //if we have a token, but it's not valid
      if (err) {
        //print error message
        console.log(err.message);
        //redirect user to login page
        // res.redirect('/login');
        res.json({msg: err.message})
      } else {
        console.log("Token has been verified. Please see details below:", "\n", decodedToken);
        // res.json({decodedToken})
        next();
      }
    });
  } else {
    //if there's no json web token, redirect user to login page
    // res.redirect('/login');
    res.json({msg: "Session expired. Please login again."})
  }
};

// check current user
const checkUser = (req, res, next) => {
  //retrieve json web token by using request's cookie which will be sent to the server
  const token = req.cookies.jwt;
  //check if json web token exists & is verified
  if (token) {
    //if there's token, use jwt's verify(), which takes in a few argument similar to: jwt.sign({ id }, 'empirepms2024 secret', { expiresIn: maxAge })
    jwt.verify(token, 'empirepms2024 secret', async (err, decodedToken) => {
      //if we have a token, but it's not valid
      if (err) {
        //if the 'user' doesn't exists in the 'locals', it will throw error. Hence, we can check the value in the view.
        res.locals.user = null;
        next();
        //if there is no error
      } else {
        //find the user in the database using employee's id through the 'encoded' but now 'decoded' token.
        let user = await employeeModel.findById(decodedToken.id);
        //inject the user to our view. Use 'response's 'locals', and whatever 'attribute' you want to name your view. 
        res.locals.user = user;
        next();
      }
    });
  } else {
    //if the 'user' doesn't exists in the 'locals', it will throw error. Hence, we can check the value in the view.
    res.locals.user = null;
    next();
  }
};


module.exports = { requireAuth, checkUser };