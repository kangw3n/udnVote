var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
// var _ = require("underscore");
var XMLHttpRequest = require('xhr2');
var jsonLink = 'http://localhost:3000/data/president.json';
// var jsonLink = express.static(__dirname + '/public/data/president.json');

var getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var getJson = function() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', jsonLink);
  xhr.send(null);
  xhr.onreadystatechange = function() {
    var DONE = 4; // readyState 4 means the request is done.
    var OK = 200; // status 200 is a successful return.
    if (xhr.readyState === DONE) {
      if (xhr.status === OK)
      // console.log(xhr.responseText); // 'This is the returned text.'
      io.emit('receiveChange', JSON.parse(xhr.responseText));
    } else {
      console.log('Error: ' + xhr.status); // An error occurred during the request.
    }
  };
};

var test = function() {
  var random1 = getRandomInt(2000, 500000);
  var random2 = getRandomInt(2000, 500000);
  var random3 = getRandomInt(2000, 500000);
  io.emit('textChange', [random1, random2, random3] );
};


app.use(express.static(__dirname + '/public'));
app.get("/", function(req, res) {
  res.redirect("/index.html");
});

io.on('connection', function(socket) {
  console.log('connection OK!');

  setInterval(test, 5000);
  socket.broadcast.emit('user connected');

  getJson();


  //calling json - another script to be trigger
  socket.on('jsonChange', function(msg) {
    console.log(msg);
    getJson();
  });
});


http.listen(3000, function() {
  console.log('listening on *:3000');
});
