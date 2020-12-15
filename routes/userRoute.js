require('dotenv').config();

const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
let saltRounds = parseInt(process.env.SALT_ROUNDS);

const AWS = require('aws-sdk');
AWS.config.update({
  region: process.env.AWS_REGION,
  endpoint: process.env.DBLOC
});

const docClient = new AWS.DynamoDB.DocumentClient();

let params = {TableName: 'Users'};

function resetClient () {
  params = {TableName: 'Users'};
}

router.post('/auth/login', async (req, res) => {
  // Gets user
  params.KeyConditionExpression = 'username = :u';
  params.ExpressionAttributeValues = {
    ':u':req.body.username
  };
  
  let user = await docClient.query(params).promise();
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
});

router.post('/auth/register', async (req, res) => {
  params.KeyConditionExpression = 'username = :u';
  params.ExpressionAttributeValues = {
    ':u':req.body.username
  };
  
  let userExistsQuery = await docClient.query(params).promise();
  let userExists = (userExistsQuery.Items.length > 0);

  // Hash password
  if(!userExists) {
    resetClient();
    const hash = await bcrypt.hash(req.body.password, saltRounds);
    params.Item = {
      'username': req.body.username,
      'password': hash
    };
    docClient.put(params, (err, data) => {
      if(err) {
        console.log(err);
      } else {
        res.sendStatus(201);
      }
    });

  } else {
    res.status(400).json({res: 'User already exists!'});
  }
});

router.get('/', async (req, res) => {
  // Get single user
  if (req.query.username) {
    params.KeyConditionExpression = 'username = :u';
    params.ExpressionAttributeValues = {
      ':u': req.query.username
    };
    docClient.scan(params, (err, data) => {
      if (err) console.log(err);
      res.json({res: data.Items});
    });
    resetClient();
  // Get all users
  } else {
    const items = await docClient.scan(params).promise();
    res.json({res: items.Items});
  }
});

// Add PATCH endpoint

router.delete('/', async (req, res) => {
  if (req.query.username) {
    params.Key = {
      'username': req.query.username
    };
    params.ConditionExpression = 'username = :u';
    params.ExpressionAttributeValues = {
      ':u': req.query.username
    };
    try {
      await docClient.delete(params).promise();
      res.json({res: 'User deleted.'});
      resetClient();
    } catch (err) {
      if(err.code == 'ConditionalCheckFailedException') res.status(400).json({res: 'User does not exist.'});
      resetClient();
    }
  } else {
    const items = await (await docClient.scan(params).promise()).Items;
    if(items.length < 1) {
      res.json({res: 'Database already empty.'});
    } else {
      for (let item of items) {
        params.Key = {
          'username': item.username
        };
        await docClient.delete(params).promise();
        res.json({res: 'Database cleared.'});
        resetClient();
      }
    } 
  }
});

module.exports = router;