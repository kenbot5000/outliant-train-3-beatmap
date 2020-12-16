const AWSConfig = require('../config/AWSConfig');
let db = new AWSConfig('OsuBeatmaps');

const resetClient = (req, res, next) => {
  db.resetClient();
  next();
};
const getAllMaps = (req, res) => {
  db.docClient.scan(db.params, (err, data) => {
    if (err) console.error(err);
    res.json({res: data.Items});
  });
};
const getMap = (req, res) => {
  if (req.query.title && req.query.mapper) {
    db.params.KeyConditionExpression = 'title = :t AND mapper = :m';
    db.params.ExpressionAttributeValues = {
      ':t': req.query.title,
      ':m': req.query.mapper,
    };
    db.docClient.query(db.params, (err, data) => {
      if (err) console.log(err);
      res.json({res: data.Items});
    });
  } else {
    res.json({res: 'Title and Mapper must be supplied.'}); 
  }
};
const createMap = async (req, res) => {
  db.params.Item = {
    'title': req.body.title,
    'mapper': req.body.mapper,
    'artist': req.body.artist,
    'rating': req.body.rating,
    'plays': req.body.plays,
  };
  try {
    await db.docClient.put(db.params).promise();
    res.status(201).json({res: req.body});
  } catch (err) {
    console.log(err);
  }
};
const updateMap = (req, res) => {
  if (!req.body.title || !req.body.mapper) {
    res.status(400).json({res: 'Title and Mapper must be given!'});
  } else {
    db.params.Key = {
      'title': req.body.title,
      'mapper': req.body.mapper,
    };
    db.params.ConditionExpression = 'title = :t AND mapper = :m';
    db.params.UpdateExpression = 'set artist = :a, rating = :r, plays = :p',
    db.params.ExpressionAttributeValues = {
      ':t': req.body.title,
      ':m': req.body.mapper,
      ':a': req.body.artist,
      ':r': req.body.rating,
      ':p': req.body.plays,
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
const deleteMap = (req, res) => {
  if (!req.body.title || !req.body.mapper) {
    res.status(400).json({res: 'Title and Mapper must be given!'});
  } else {
    db.params.Key = {
      'title': req.body.title,
      'mapper': req.body.mapper,
    };
    db.params.ConditionExpression = 'title = :t AND mapper = :m';
    db.params.ExpressionAttributeValues = {
      ':t': req.body.title,
      ':m': req.body.mapper,
    };

    db.docClient.delete(db.params, (err, data) => {
      if (err) {
        if (err.code === 'ConditionalCheckFailedException') res.status(400).json({res: 'The requested resource does not exist!'});
        else {
          console.error(err);
        }
      } else {
        res.json({res: data});
      }
    });
  }
};

module.exports = {
  resetClient,
  getAllMaps,
  getMap,
  createMap,
  updateMap,
  deleteMap
};