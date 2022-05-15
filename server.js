// openssl genrsa -out key.pem
// openssl req -new -key key.pem -out csr.pem
// openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem

// npm install http --save
// npm install socket.io --save
// npm install @google-cloud/speech
// npm install @google-cloud/dialogflow
// https://cloud.google.com/speech-to-text/docs/libraries
// https://cloud.google.com/dialogflow/es/docs/reference/libraries/nodejs
// https://dialogflow.cloud.google.com/

// git init
// git remote -v
// git remote rm heroku
// heroku git:remote -a ttkl
// git add .
// git commit -am "final"
// git push -f heroku master
// heroku logs --tail

// node server.js

'use strict';

const PORT = process.env.PORT || 443;
// require('dotenv').config();
// console.log(process.env);

const fs = require('fs');
const http = require('http');
const express = require('express');
const request = require('request');
const path = require('path');
const webApp = express();

const options = {
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
};

const uuid = require('uuid');
const server = http.createServer(options, webApp);
const io = require('socket.io')(server, {
	path: '/socket/'
});
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
webApp.use(express.static(path.join(__dirname, 'public')));
webApp.set('views', path.join(__dirname, 'views'));
webApp.set('view engine', 'ejs');

webApp.get('/', (req, res) => res.render('index', {
	value: null
}));
webApp.get('/class', (req, res) => res.render('class', {
	value: null
}));

// A unique identifier for the given session
// const sessionId = uuid.v4();

let activeSockets = [];

io.on('connection', socket => {
	console.log('Client connected');
	
	const existingSocket = activeSockets.find(existingSocket => existingSocket === socket.id);

	if (!existingSocket) {
		activeSockets.push(socket.id);

		socket.emit("update-user-list", {
			users: activeSockets.filter(existingSocket => existingSocket !== socket.id)
		});

		socket.broadcast.emit("update-user-list", {
			users: [socket.id]
		});
	}

	socket.on("call-user", data => {
		socket.to(data.to).emit("call-made", {
			offer: data.offer,
			socket: socket.id
		});
	});

	socket.on("make-answer", data => {
		socket.to(data.to).emit("answer-made", {
			socket: socket.id,
			answer: data.answer
		});
	});

	socket.on("reject-call", data => {
		socket.to(data.from).emit("call-rejected", {
			socket: socket.id
		});
	});

	socket.on("disconnect", () => {
		activeSockets = activeSockets.filter(
			existingSocket => existingSocket !== socket.id
		);
		socket.broadcast.emit("remove-user", {
			socketId: socket.id
		});
	});
});