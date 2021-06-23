class Player {
  constructor(id, username, isBot) {
    this.id = id,
    this.username = username,
    this.isBot = isBot,
    this.isCzar = false,
    this.isWinner = false,
    this.score = 0,
    this.hand = []
  }

  pickWinner(room, winner) {
    winner.isWinner = true;
    winner.score += 1;
    room.broadcast('updatePlayers', { players: room.players });
    room.broadcast('updatePhase', { phase: `results` });
  }
}

module.exports = Player;