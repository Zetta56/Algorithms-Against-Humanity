export default {
  // Methods directly accessible from components
  updateUser (context, user) {
    context.commit('updateUser', user)
  },
  updateLoginStatus (context, loginStatus) {
    context.commit('updateLoginStatus', loginStatus)
  },
  updateRooms (context, rooms) {
    context.commit('updateRooms', rooms)
  },
  updateLoading (context, loading) {
    context.commit('updateLoading', loading)
  },
  updateError (context, error) {
    console.log(error)
    context.commit('updateError', error)
  },
  logout (context) {
    context.commit('updateRoom', null)
    context.commit('updatePlayers', null)
    context.commit('updateUser', null)
    context.commit('updateWebsocket', null)
    context.commit('updateLoginStatus', false)
    context.commit('updateChat', [])
  },
  connectWebsocket (context, { token, callback, error }) {
    if (token) {
      const baseUrl = process.env.VUE_APP_BACKEND_URL || window.location.origin
      const ws = new WebSocket(baseUrl.replace(/^http/, 'ws') + `?token=${token}`)
      ws.onerror = () => {
        context.commit('updateWebsocket', null)
        if (error) {
          error()
        }
      }
      ws.onopen = () => {
        context.commit('updateWebsocket', ws)
        if (callback) {
          callback()
        }
      }
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        // Routes that respond to websocket messages
        switch (data.type) {
          case 'connect': {
            if (data.reconnecting) {
              const { players, ...room } = data.room
              context.commit('updateRoom', room)
              context.commit('updatePlayers', players)
            }
            context.commit('updateLoading', false)
            break
          }
          case 'joinRoom': {
            const { players, ...room } = data.room
            if (!context.state.room) {
              context.commit('updateRoom', room)
            }
            context.commit('updatePlayers', players)
            break
          }
          case 'deniedRoom':
            context.commit('updateError', 'deniedRoom')
            break
          case 'updateRooms': {
            if (data.adding) {
              context.commit('updateRooms', [...context.state.rooms, data.room])
            } else {
              context.commit('updateRooms', context.state.rooms.filter(room => room.id !== data.room.id))
            }
            break
          }
          case 'updateRoom': {
            const { players, ...room } = data.room
            context.commit('updateRoom', room)
            context.commit('updatePlayers', players)
            break
          }
          case 'updatePlayers':
            context.commit('updatePlayers', data.players)
            break
          case 'updatePhase':
            context.commit('updatePhase', data.phase)
            break
          case 'addChat': {
            const message = {
              text: data.text,
              username: data.username
            }
            context.commit('addChat', message)
            break
          }
          case 'leaveRoom':
            // If user is leaving, clear room data
            if (data.id === context.state.user.id) {
              context.commit('updateRoom', null)
              context.commit('updatePlayers', [])
              context.commit('updateChat', [])
            // Otherwise, notify user about another player leaving
            } else {
              context.commit('updatePlayers', data.players)
              context.commit('addChat', { text: data.message })
            }
            break
        }
      }

      ws.onclose = () => {
        if (context.state.user) {
          context.commit('updateError', 'disconnect')
        }
      }
    }
  }
}
