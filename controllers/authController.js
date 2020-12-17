require('dotenv').config();

const AWSConfig = require('../config/AWSConfig');
let db = new AWSConfig('Users');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
let saltRounds = parseInt(process.env.SALT_ROUNDS);

const resetClient = (req, res, next) => {
  db.resetClient();
  next();
};

function generateToken(username, access=true) {
  let time;
  let secret;
  if (access) {
    time = (20 * 60);
    secret = process.env.ACCESS_TOKEN_SECRET;
  } else {
    time = (12 * 60 * 60);
    secret = process.env.REFRESH_TOKEN_SECRET;
  }
  const token = jwt.sign({
    exp: (Date.now()/1000) + time,
    data: username
  }, secret);
  return token;
}

const login = async (req, res) => {
  // Gets user
  db.params.KeyConditionExpression = 'username = :u';
  db.params.ExpressionAttributeValues = {
    ':u':req.body.username
  };
  
  let user = await db.docClient.query(db.params).promise();
  let userExists = (user.Items.length > 0);

  db.resetClient();

  if(!userExists) {
    res.status(404).json({res: 'User does not exist.'});
  } else {
    bcrypt.compare(req.body.password, user.Items[0].password, function(err, result) {
      if(!result) {
        res.json({res: 'Password is incorrect!'});
      } else {
        // Generate access token
        const accessToken = generateToken(req.body.username);
        // Generate refresh token
        const refreshToken = generateToken(req.body.username, false);
        res.json({accessToken: accessToken, refreshToken: refreshToken});
      }
    });
  }
};

const register = async (req, res) => {
  db.params.KeyConditionExpression = 'username = :u';
  db.params.ExpressionAttributeValues = {
    ':u':req.body.username
  };
  
  let userExistsQuery = await db.docClient.query(db.params).promise();
  let userExists = (userExistsQuery.Items.length > 0);

  // Hash password
  if(!userExists) {
    db.resetClient();
    const hash = await bcrypt.hash(req.body.password, saltRounds);
    db.params.Item = {
      'username': req.body.username,
      'password': hash
    };
    db.docClient.put(db.params, (err) => {
      if(err) {
        console.log(err);
      } else {
        res.sendStatus(201);
      }
    });

  } else {
    res.status(403).json({res: 'User already exists!'});
  }
};

const refreshAccess = (req, res) => {
  const authHeader = req.headers['authorization'];
  const refreshToken = authHeader && authHeader.split(' ')[1];
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
    if (err) {
      console.log(err);
      if(err.name === 'TokenExpiredError') {
        return res.status(401).json({res: 'Refresh token expired. Please login again.'});
      }
    }
    const newAccessToken = generateToken(data.data);
    const newRefreshToken = generateToken(data.data, false);
    res.json({accessToken: newAccessToken, refreshToken: newRefreshToken});
  });
};


module.exports = {
  resetClient,
  login,
  register,
  refreshAccess
};