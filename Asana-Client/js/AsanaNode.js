
var asana = require('asana');
var personalAccessToken = "0/7b572517147f260239215de94fba8a30";
var client = asana.Client.create().useAccessToken(personalAccessToken);

// Get your user info
client.users.me()
.then(function(user) {
  // Print out your information
  console.log('My name is ' + user.name + '!');
});
