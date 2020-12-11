const jwt = require('jsonwebtoken');


function verifyJWT(req, res, next){
   // Check if the user has token in cookies. If not return the request;
   if(!req.cookies.jwt) return res.json({ error: 'Please Login' });

   const clientToken = req.cookies.jwt;
 
  try {
    const decoded = jwt.verify(clientToken, process.env.JWT_ACCESS_TOKEN);
    req.user = decoded;
    next();
  }
  catch(err){
     return res.json({error: 'Invalid Token'})
  }
}

module.exports = {
    verifyJWT: verifyJWT,
}