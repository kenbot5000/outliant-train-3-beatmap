const AWSConfig = require('./AWSConfig');
let db = new AWSConfig('Users');

const resetClient = (req, res, next) => {
  db.resetClient();
  next();
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
  resetClient,
  getAllUsers,
  getUser,
  deleteUser,
  deleteAllUsers
};