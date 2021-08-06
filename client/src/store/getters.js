export default {
  userPlayer: state => {
    if (state.user) {
      return state.players.find(player => player.id === state.user.id)
    } else {
      return null
    }
  },
  winner: state => {
    return state.players.find(player => player.isWinner === true)
  },
  finished: state => {
    return state.players.some(player => player.score >= state.room.settings.points)
  }
}
