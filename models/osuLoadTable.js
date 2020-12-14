require('dotenv').config({path: __dirname+'/./../.env'})

let AWS = require('aws-sdk');
let fs = require('fs');

AWS.config.update({
  region: 'us-west-2',
  endpoint: process.env.DBLOC
})

let docClient = new AWS.DynamoDB.DocumentClient();

console.log('Importing map data into DynamoDB.');

let maps = JSON.parse(fs.readFileSync('sampleMaps.json', 'utf8'));

maps.forEach(function (map) {
  console.log(map)
  let params = {
    TableName: 'OsuBeatmaps',
    Item: {
      'title': map.title,
      'mapper': map.mapper,
      'artist': map.artist,
      'rating': map.rating,
      'plays': map.plays
    }
  };

  docClient.put(params, (err, data) => {
    if (err) {
      console.error('Unable to add Map', map.title, '. Error JSON: ', JSON.stringify(err, null, 2));
    } else {
      console.log('PutItem succeeded: ', map.title)
    }
  });
});

