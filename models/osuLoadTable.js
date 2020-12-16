require('dotenv').config({path: __dirname+'/./../.env'});

const AWSConfig = require('../config/AWSConfig');
const AWS = new AWSConfig('OsuBeatmaps');
const fs = require('fs');

console.log('Importing map data into DynamoDB.');

let maps = JSON.parse(fs.readFileSync('sampleMaps.json', 'utf8'));

maps.forEach(function (map) {
  AWS.params.Item = {
    'title': map.title,
    'mapper': map.mapper,
    'artist': map.artist,
    'rating': map.rating,
    'plays': map.plays
  };

  AWS.docClient.put(AWS.params, (err) => {
    if (err) {
      console.error('Unable to add Map', map.title, '. Error JSON: ', JSON.stringify(err, null, 2));
    } else {
      console.log('PutItem succeeded: ', map.title);
    }
  });
});

