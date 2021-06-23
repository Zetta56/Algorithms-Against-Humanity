export default {
  updateUser (state, user) {
    state.user = user
  },
  updateLoginStatus (state, loginStatus) {
    state.isLoggedIn = loginStatus
  },
  updateWebsocket (state, websocket) {
    state.websocket = websocket
  },
  updateLoading (state, loading) {
    state.loading = loading
  },
  updateError (state, error) {
    state.error = error
  },
  updateRooms (state, rooms) {
    state.rooms = rooms
  },
  updateRoom (state, room) {
    state.room = room
  },
  updatePhase (state, phase) {
    state.room.phase = phase
  },
  updatePlayers (state, players) {
    state.players = players
  },
  updateChat (state, chat) {
    state.chat = chat
  },
  addChat (state, message) {
    state.chat.push(message)
    if (state.chat.length > 10) {
      state.chat.splice(0, 1)
    }
  }
}
