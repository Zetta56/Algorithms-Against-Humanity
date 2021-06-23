const Player = require('./Player');
const markov = require('./Markov');

class Bot extends Player {
  constructor(id, username) {
    super(id, username, true);
  }

  submitCard(room) {
    const index = Math.round(Math.random() * room.submitted.length)
    room.submitted.splice(index, 0, {
      text: markov.generate(1, 3),
      id: this.id
    })
    room.broadcast('updatePlayers', { players: room.players });
  }

  pickWinner(room) {
    let winner;
    do {
      winner = room.players[Math.floor(Math.random() * room.players.length)];
    } while(winner.isCzar && room.players.length > 1);
    super.pickWinner(room, winner);
  }
}

module.exports = Bot;