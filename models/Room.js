const { v4: uuid } = require('uuid');
const Store = require('./Store');
const markov = require('./Markov');

class Room {
  constructor(name, access, player) {
    this.id = uuid(),
    this.name = name,
    this.access = access,
    this.phase = 'waiting',
    this.prompt = '',
    this.players = [player]
    this.submitted = [] // Handles random ordering of shown cards
    this.settings = {
      points: 5,
      writeIn: 0.33
    }
  }

  getCzar() {
    return this.players.find(player => player.isCzar);
  }

  getPlayer(userId) {
    return this.players.find(player => player.id === userId);
  }

  removePlayer(playerId) {
    const index = this.players.findIndex(player => player.id === playerId);
    if(index >= 0) {
      this.players.splice(index, 1);
    }
  }

  broadcast(type, message) {
    this.players.forEach(player => {
      if(!player.isBot) {
        Store.getUser(player.id).ws.send(JSON.stringify({
          type: type,
          ...message
        }));
      }
    });
  }

  resetState() {
    this.rotateCzar();
    this.phase = 'playing';
    this.prompt = markov.generate(2, 5, true);
    this.submitted = []
    this.players.forEach(player => {
      player.isWinner = false;
      if(player.isBot && !player.isCzar) {
        player.submitCard(this);
      }
      if(!player.isBot) {
        while(player.hand.length < 5) {
          if(Math.random() <= this.settings.writeIn) {
            player.hand.push({
              text: '',
              custom: true
            })
          } else {
            player.hand.push({
              text: markov.generate(1, 3, false),
              custom: false
            });
          }
        }
      }
    });
    this.checkPlayingFinished();
  }

  rotateCzar() {
    // currentCzar will be -1 on the first call
    const currentCzar = this.players.findIndex(user => user.isCzar);
    const nextCzar = currentCzar + 1 < this.players.length ? currentCzar + 1 : 0;
    this.players.forEach(player => player.isCzar = false);
    this.players[nextCzar].isCzar = true;
  }

  checkPlayingFinished() {
    if(this.submitted.length === this.players.length - 1) {
      this.phase = 'picking';
      this.broadcast('updateRoom', { room: this });
      if(this.getCzar().isBot) {
        this.getCzar().pickWinner(this);
      }
    }
  }

  endGame() {
    this.phase = 'waiting';
    this.players.forEach(player => {
      player.score = 0;
      player.hand = [];
    })
    this.broadcast('updatePhase', { phase: `waiting` });
    Store.updateWaitingRooms(this, true);
  }

  leave(userId) {
    const message = this.getPlayer(userId).username + " has disconnected"
    // If player was the czar, set another player to be the czar
    if(this.getCzar() && this.getCzar().id === userId) {
      this.rotateCzar();
    }
    this.removePlayer(userId);
    Store.getUser(userId).roomId = null;

    // Check if player was the last user in the room
    if(this.players.filter(player => !player.isBot).length === 0) {
      Store.removeRoom(this);
    } else {
      this.broadcast('leaveRoom', {
        players: this.players,
        id: userId,
        message: message
      });
      if(this.phase !== 'waiting') {
        this.checkPlayingFinished();
      }
    }
  }
};

module.exports = Room;