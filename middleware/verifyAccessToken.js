const jwt = require('jsonwebtoken');

let verifyToken = function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if(token === null) return res.status(401).json({res: 'You are not authenticated'});
  
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if(err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

module.exports = verifyToken;