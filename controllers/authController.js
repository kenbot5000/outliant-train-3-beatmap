require('dotenv').config();

const AWSConfig = require('./AWSConfig');
let db = new AWSConfig('Users');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
let saltRounds = parseInt(process.env.SALT_ROUNDS);

const resetClient = (req, res, next) => {
  db.resetClient();
  next();
};

const login = async (req, res) => {
  // Gets user
  db.params.KeyConditionExpression = 'username = :u';
  db.params.ExpressionAttributeValues = {
    ':u':req.body.username
  };
  
  let user = await db.docClient.query(db.params).promise();
  let userExists = (user.Items.length > 0);

  resetClient();

  if(!userExists) {
    res.status(400).json({res: 'User does not exist.'});
  } else {
    bcrypt.compare(req.body.password, user.Items[0].password, function(err, result) {
      if(!result) {
        res.json({res: 'Password is incorrect!'});
      } else {
        // Generate access token
        const token = jwt.sign(req.body.username, process.env.ACCESS_TOKEN_SECRET);
        res.json({token});
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
    resetClient();
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
    res.status(400).json({res: 'User already exists!'});
  }
};


module.exports = {
  resetClient,
  login,
  register
};