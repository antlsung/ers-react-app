
const express = require('express');
const http = require('http');
// const https = require('https');
const fs = require("fs");
const socketIO = require('socket.io');

// const options = {
//   key: fs.readFileSync("./server-key.pem"),
//   cert: fs.readFileSync("./server-cert.pem")
// };

const port = 4001;
const app = express();
const server = http.createServer(options, app);

const io = socketIO.listen(server);

var cardUtils = require('./helpers').Card;
var slapLogic = require('./helpers').Slap;

io.on('connection', socket => {
  console.log('User connected');

  // socket.on('newPlayer', (name) => {
  //   socket.player = {
  //     id: name,
  //     socketId: socket.id,
  //   };
  //   socket.broadcast.emit('newPlayer', socket.player.id);
  //   console.log('SERVER: sent new player', socket.player);
  // });

  socket.on('put', (user, lobby, players, pot) => {
    console.log('SERVER: ', user, 'has put in lobby: ', lobby, '. Card: ');
    socket.broadcast.to(lobby).emit('put', user, players, pot);
    // io.in(lobby).emit('put', user, card);
    //  socket.broadcast.to('game').emit('message', 'nice game');
    // io.to(players[player].socketId).emit('put', splitDeck[players[player].id], players[player]);
  });

  socket.on('slap', (user, lobby, pot) => {
    /**
     * CARD LOGIC COMBOS
     */
    const doublePromise = slapLogic.double(pot);
    const sandwichPromise = slapLogic.sandwich(pot);

    // const doublePromise = slapLogic.double(pot);
    Promise.all([doublePromise, sandwichPromise]).then(success => {
      console.log('----failed', success, user);
      io.in(lobby).emit('slap', user, []);
    }, failed => {
      console.log('----worked', failed);
      io.in(lobby).emit('slap', user, pot);
    });
    console.log('SERVER: ', user, 'has slapped in lobby: ', lobby);
    // socket.broadcast.to(lobby).emit('slap', players);
  });

  socket.on('joinLobby', (name, lobby) => {
    socket.player = {
      id: name,
      socketId: socket.id,
    };
    socket.join(lobby);
    console.log('SERVER: ',name, 'joined lobby: ', lobby, socket.player);
    // const clients = io.sockets.clients(lobby);
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
    // socket.broadcast.emit('slap', user);
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
