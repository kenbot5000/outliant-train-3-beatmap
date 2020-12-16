require('dotenv').config({path: __dirname+'/./../.env'});

const AWSConfig = require('../config/AWSConfig');
const AWS = new AWSConfig('Users');

AWS.params.Item = {
  'username': 'admin',
  'password': '$2y$12$V/UqZgmmUiaBdB8ZNTNp7ut/5NUIxsBuyaPeuNkPElNxK6E4/PFb6'
};

console.log(AWS.params);

AWS.docClient.put(AWS.params, (err, data) => {
  if (err) {
    console.error('Unable to add User', AWS.params.Item.username, '. Error JSON: ', JSON.stringify(err, null, 2));
  } else {
    console.log('PutItem succeeded: ', AWS.params.Item.username);
  }
});

console.log('Populating user table');

