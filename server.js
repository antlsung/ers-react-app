
const express = require('express');
const http = require('http');
const fs = require("fs");
const socketIO = require('socket.io');

const port = 3000;
const app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
const server = http.createServer(app);

const io = socketIO.listen(server,{ path: '/socket.io'});

var cardUtils = require('./helpers').Card;
var slapLogic = require('./helpers').Slap;

io.on('connection', socket => {
  console.log('User connected');


  socket.on('put', (user, lobby, players, pot) => {
    console.log('SERVER: ', user, 'has put in lobby: ', lobby, '. Card: ');
    socket.broadcast.to(lobby).emit('put', user, players, pot);
  });

  socket.on('slap', (user, lobby, pot) => {
    /**
     * CARD LOGIC COMBOS
     */
    const doublePromise = slapLogic.double(pot);
    const sandwichPromise = slapLogic.sandwich(pot);

    Promise.all([doublePromise, sandwichPromise]).then(success => {
      console.log('----failed', success, user);
      io.in(lobby).emit('slap', user, []);
    }, failed => {
      console.log('----worked', failed);
      io.in(lobby).emit('slap', user, pot);
    });
    console.log('SERVER: ', user, 'has slapped in lobby: ', lobby);
  });

  socket.on('joinLobby', (name, lobby) => {
    socket.player = {
      id: name,
      socketId: socket.id,
    };
    socket.join(lobby);
    console.log('SERVER: ',name, 'joined lobby: ', lobby, socket.player);
    socket.emit('joinLobby', lobby, getAllPlayers(lobby));
  });

  socket.on('startGame', (lobby, players) => {
    console.log('SERVER: ', 'Starting game in lobby', players);
    const deck = cardUtils.makeDeck();
    const splitDeck = cardUtils.splitDeck(deck,players);
    for (const player in players) {
      io.to(players[player].socketId).emit('startGame', splitDeck[players[player].id], players, 0);
      console.log('----------', players[player].id, players[player].socketId, players[player].turn);
    }
  });

  socket.on('playerOut', (players) => {
    console.log('SERVER: ', user, 'has slapped in lobby: ', lobby);
    socket.broadcast.to(lobby).emit('playerOut', players);
  });

  socket.on('disconnect', () => {
    io.emit('remove', socket.player);
    console.log('SERVER: User disconnected');
  });
});

function getAllPlayers(lobby) {
  let players = [];
  const clients = io.sockets.adapter.rooms[lobby].sockets;  
  Object.keys(clients).forEach(function(socketID) {
    let player = io.sockets.connected[socketID].player;
    if (player) {
      players.push(player);
    }
  });
  return players;
}


server.listen(port, () => console.log(`Listening on port ${port}`));
