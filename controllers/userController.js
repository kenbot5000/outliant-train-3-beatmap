require('dotenv').config();

const AWSConfig = require('../config/AWSConfig');
let db = new AWSConfig('Users');

const bcrypt = require('bcryptjs');
const saltRounds = parseInt(process.env.SALT_ROUNDS);

const resetClient = (req, res, next) => {
  db.resetClient();
  next();
};
const createUser = async (req, res) => {
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
};
const getAllUsers = async (req, res) => {
  const items = await db.docClient.scan(db.params).promise();
  res.json({res: items.Items});
};
const getUser = async (req, res) => {
  if (req.query.username) {
    db.params.KeyConditionExpression = 'username = :u';
    db.params.ExpressionAttributeValues = {
      ':u': req.query.username
    };
    db.docClient.scan(db.params, (err, data) => {
      if (err) console.log(err);
      res.json({res: data.Items});
    });
    resetClient();
  // Get all users
  } else {
    res.status(400).json({res: 'User does not exist.'});
  }
};
const updateUser = async (req, res) => {
  if(!req.body.username) {
    res.status(400).json({res: 'Username must be supplied.'});
  } else {
    db.params.Key = {
      'username': req.body.username
    };
    db.params.ConditionExpression = 'username = :u';
    db.params.UpdateExpression = 'set password = :p',
    db.params.ExpressionAttributeValues = {
      ':u': req.body.username,
      ':p': req.body.password
    },
    db.params.ReturnValues = 'UPDATED_NEW';
    db.docClient.update(db.params, (err, data) => {
      if (err) {
        if (err.code === 'ConditionalCheckFailedException') res.status(400).json({res: 'The requested resource does not exist!'});
        else {
          console.error(err);
        }
      } else {
        res.json({res: data.Attributes});
      }
    });
  }
};
const deleteUser = async (req, res) => {
  if (req.query.username) {
    db.params.Key = {
      'username': req.query.username
    };
    db.params.ConditionExpression = 'username = :u';
    db.params.ExpressionAttributeValues = {
      ':u': req.query.username
    };
    try {
      await db.docClient.delete(db.params).promise();
      res.json({res: 'User deleted.'});
      resetClient();
    } catch (err) {
      if(err.code == 'ConditionalCheckFailedException') res.status(400).json({res: 'User does not exist.'});
      resetClient();
    }
  } else {
    res.status(400).json({res: 'User does not exist.'});
  }
};
const deleteAllUsers = async (req, res) => {
  const items = await (await db.docClient.scan(db.params).promise()).Items;
  if(items.length < 1) {
    res.json({res: 'Database already empty.'});
  } else {
    for (let item of items) {
      db.params.Key = {
        'username': item.username
      };
      await db.docClient.delete(db.params).promise();
      res.json({res: 'Database cleared.'});
      resetClient();
    }
  } 
};

module.exports = {
  createUser,
  resetClient,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  deleteAllUsers
};