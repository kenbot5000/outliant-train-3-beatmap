require('dotenv').config()

const express = require('express');
const router = express.Router();

// AWS Setup
let AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-west-2',
  endpoint: process.env.DBLOC
});

var docClient = new AWS.DynamoDB.DocumentClient();

// Query parameters. Just adjust as needed.
let params = { TableName: 'OsuBeatmaps' }

// Resets parameters to allow for reusing of docClient.
function resetClient() {
  params = { TableName: 'OsuBeatmaps' }
}

// Routes
// Get route
router.get('/', (req, res) => {
  if (req.query.title || req.query.mapper) {
    params.KeyConditionExpression = 'title = :t AND mapper = :m';
    params.ExpressionAttributeValues = {
      ':t': req.query.title,
      ':m': req.query.mapper
    }
    docClient.query(params, (err, data) => {
      if (err) console.log(err)
      res.json({res: data.Items})
    })
  } else {
    docClient.scan(params, (err, data) => {
      if (err) console.error(err)
      res.json({res: data.Items})
    })
  }
});

router.post('/', (req, res) => {
  params.Item = {
    'title': req.body.title,
    'mapper': req.body.mapper,
    'artist': req.body.artist,
    'rating': req.body.rating,
    'plays': req.body.plays
  };

  docClient.put(params, (err, data) => {
    if (err) {
      console.log(err)
    } else {
      res.status(201).json({res: req.body})
    }
  })
});

router.patch('/', (req, res) => {
  if(!req.body.title || !req.body.mapper) {
    res.status(400).json({res: 'Title and Mapper must be given!'})
  } else {
    params.Key = {
      'title': req.body.title,
      'mapper': req.body.mapper
    }
    params.ConditionExpression = 'title = :t AND mapper = :m';
    params.UpdateExpression = 'set artist = :a, rating = :r, plays = :p',
    params.ExpressionAttributeValues = {
      ':t': req.body.title,
      ':m': req.body.mapper,
      ':a': req.body.artist,
      ':r': req.body.rating,
      ':p': req.body.plays
    },
    params.ReturnValues = 'UPDATED_NEW'

    docClient.update(params, (err, data) => {
      if (err) {
        if (err.code === 'ConditionalCheckFailedException') res.status(400).json({res: 'The requested resource does not exist!'})
        else {console.error(err)}
      } else {
        res.json({res: data.Attributes})
        resetClient()
      }
    })
  }
})

router.delete('/', (req, res) => {
  if(!req.body.title || !req.body.mapper) {
    res.status(400).json({res: 'Title and Mapper must be given!'})
  } else {
    params.Key = {
      'title': req.body.title,
      'mapper': req.body.mapper
    }
    params.ConditionExpression = 'title = :t AND mapper = :m'
    params.ExpressionAttributeValues = {
      ':t': req.body.title,
      ':m': req.body.mapper
    }

    docClient.delete(params, (err, data) => {
      if (err) {
        if (err.code === 'ConditionalCheckFailedException') res.status(400).json({res: 'The requested resource does not exist!'})
        else {console.error(err)}
      } else {
        res.json({res: data})
        resetClient()
      }
    })
  }
})

module.exports = router;