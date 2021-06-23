const WebSocket = require('ws'),
      jwt = require('jsonwebtoken'),
      querystring = require('querystring'),
      { v4: uuid } = require('uuid'),
      wss = new WebSocket.Server({ noServer: true }),
      { Store, Room, Player, Bot } = require('./models');

wss.on('connection', function connection(ws, req) {
  // Connection Initialization
  const token = querystring.parse(req.url.substring(2)).token;
  const { username, id } = jwt.verify(token, process.env.JWT_SECRET);
  Store.connectUser(id, ws);
  
  ws.on('message', (payload) => {
    // Parsing request
    const { type, ...body } = JSON.parse(payload);
    const currentRoom = Store.getRoom(Store.getUser(id).roomId);
    
    switch(type) {
      case 'createRoom': {
        // Create and push room to rooms and passwords
        const room = new Room(body.name, body.access, new Player(id, username, false));
        Store.getUser(id).roomId = room.id;
        Store.rooms.push(room);
        if(room.access === 'private') {
          Store.passwords[room.id] = body.password;
        }
        ws.send(JSON.stringify({ type: 'join', room: room }));
        Store.updateWaitingRooms(room, true);
        break;
      }

      case 'joinRoom': {
        const room = Store.getRoom(body.roomId);
        // Stop if room doesn't exist or user entered wrong password
        if(room && (room.access === 'public' || body.password === Store.passwords[room.id])) {
          room.players.push(new Player(id, username, false));
          Store.getUser(id).roomId = room.id;
          room.broadcast('join', { room: room });
        } else {
          ws.send(JSON.stringify({ type: 'deniedRoom', room: body.roomId }))
        };
        break;
      }

      case 'addBot':
        currentRoom.players.push(new Bot(uuid(), body.name));
        currentRoom.broadcast('updatePlayers', {
          players: currentRoom['players']
        });
        break;

      case 'deleteBot':
        currentRoom.removePlayer(body.botId);
        currentRoom.broadcast('updatePlayers', {
          players: currentRoom.players
        });
        break;

      case 'startRound': {
        // Removes room from roomlist if this is the first round
        if(currentRoom.phase === 'waiting') {
          Store.updateWaitingRooms(currentRoom, false);
        }
        currentRoom.resetState();
        currentRoom.broadcast('updateRoom', { room: currentRoom });
        break;
      }

      case 'submitCard': {
        // Move card from hand to played cards
        const foundPlayer = currentRoom.getPlayer(id);
        const index = Math.round(Math.random() * currentRoom.submitted.length)
        currentRoom.submitted.splice(index, 0, {
          text: body.card.text,
          id: foundPlayer.id
        })
        foundPlayer.hand.splice(body.card.index, 1);
        currentRoom.broadcast('updateRoom', { room: currentRoom });
        currentRoom.checkPlayingFinished();
        break;
      }

      case 'writeCard': {
        // Move card from hand to played cards
        const foundPlayer = currentRoom.getPlayer(id);
        foundPlayer.hand[body.index].text = body.text;
        ws.send(JSON.stringify({
          type: 'updatePlayers',
          players: currentRoom.players
        }))
        break;
      }

      case 'pickCard': {
        // Make picked card's owner the winner of the round
        const winner = currentRoom.players.find(player => {
          return player.id === body.winnerId
        });
        currentRoom.getCzar().pickWinner(currentRoom, winner);
        break;
      }

      case 'sendChat':
        currentRoom.broadcast('sendChat', {
          text: body.text,
          username: body.username
        })
        break;

      case 'endGame':
        currentRoom.endGame()
        break;

      case 'leaveRoom': {
        currentRoom.leave(id)
        Store.getUser(id).ws.send(JSON.stringify({
          type: 'leaveRoom',
          id: id
        }));
        break;
      }
    }
  })

  ws.on('close', () => {
    const user = Store.getUser(id);
    const room = Store.getRoom(user.roomId);
    // Remove user from store if they don't reconnect on another websocket
    if(user && user.ws.readyState === WebSocket.CLOSED) {
      user.disconnect = setTimeout(() => {
        console.log('Disconnected')
        if(room) {
          room.leave(id);
        }
        Store.users.splice(Store.users.findIndex(el => el.id === id), 1);
      }, 3000);
    }
  })
})

module.exports = wss;