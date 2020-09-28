var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 8080;
var groups = [];
var formatMessage = require('./utils/messages');

// making api calls
const request = require('request');

const options = {
    url: 'http://127.0.0.1:8000/api/v1/group/',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // to be changed to admin auth token
        'Authorization': 'Bearer pdOpd5vwiTZtDFLCdFmEaBf9gAekTZLiHtSRXXEUct8QbAq4rm80POOduwQ3FJPIEukhdXvmWG016u5B'
    }
};

// create namespace for each group
function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        const data = JSON.parse(body);
        data.forEach(group => {
            groups.push(group.name.toString());
        });
        console.log(groups);
        // create group for each 
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            const nsp = io.of('/' + group);
            nsp.on('connection', function (socket) {
                // for counting users
                console.log('new user connected');
                // welcome message to user
                socket.emit('message', 'Welcome to UGCA ' + group + ' group');
                // notification for other users
                // should change to take a function and increate the number of users
                socket.broadcast.emit('message', 'new user has joined');
                // notification for other users
                // should change to take a function and increate the number of users
                socket.on('disconnect', () => {
                    nsp.emit('message', 'a user has disconnected');
                });
                // listen for chat messages
                socket.on('chatMessage', message =>{
                    nsp.emit('message', message);
                    console.log(message);
                })
            });

        }
    }
}

request(options, callback);

app.use(express.static(path.join(__dirname, "public")));

server.listen(port, function () {
    console.log('server running on port ' + port)
});