const { v4: uuid } = require('uuid');
const Store = require('./Store');
const markov = require('./Markov');

class Room {
  constructor(name, access, initialPlayer) {
    this.id = uuid(),
    this.name = name,
    this.access = access,
    this.phase = 'waiting',
    this.prompt = '',
    this.players = [initialPlayer]
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
    this.players.forEach(player => {
      player.card = '';
      player.isWinner = false;
      if(player.isBot && !player.isCzar) {
        player.submitCard(this);
      }
      if(!player.isBot) {
        while(player.hand.length < 5) {
          player.hand.push(markov.generate(1, 3, false));
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
    if(this.players.every(player => player.card !== '' || player.isCzar)) {
      this.phase = 'picking';
      this.broadcast('updatePhase', { phase: this.phase });
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
      this.broadcast('leaveRoom', { players: this.players, id: userId });
      this.checkPlayingFinished();
    }
  }
};

module.exports = Room;