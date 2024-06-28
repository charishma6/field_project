const jwt= require('jsonwebtoken')
require('dotenv').config()

const blacklist = new Set();

// Middleware to verify token and check blacklist
function verifytoken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token required' });
  }

  if (blacklist.has(token)) {
    return res.status(401).json({ message: 'Token invalidated' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

/* function verifytoken(req,res,next){
    //get bearer token from headers of req
    const bearerToken=req.headers.authorization;
    //if bearer token not available
    if(!bearerToken){
        return res.send({message:"Unauthorized access. Plz login to continue"})
    }
    //extract token from bearer token
    const token=bearerToken.split(' ')[1]
    try{
        const decoded=jwt.verify(token,process.env.SECRET_KEY);
        req.user=decoded;
        next();
    }catch(err){
        res.status(401).json({ message: "Invalid token" });
    }
}
 */




module.exports= verifytoken;