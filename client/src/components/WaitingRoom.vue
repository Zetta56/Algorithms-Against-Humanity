<template>
  <div class="waiting-room-container">
    <div class="players">
      <div class="header">Players</div>
      <div v-for="player in this.players" :key="player.id" class="username">
        {{ player.username }}
        <span class="delete" @click="deleteBot(player.id)" v-if="player.isBot">&times;</span>
      </div>
      <div v-if="this.players.length < 4">
        <b-button class="add" @click="addBot">Add Bot +</b-button>
      </div>
    </div>
    <div class="settings">
      <div class="header">Settings</div>
      <b-form-group label="Points to Win" label-for="points" label-cols="4">
        <b-form-input type="number" :value="room.settings.points" id="points" @update="updateSettings('points', $event)" debounce="500" />
      </b-form-group>
      <b-form-group label="Write-in Chance" label-for="writeIn" label-cols="4">
        <b-form-input type="number" step="0.01" :value="room.settings.writeIn" id="write-in" @update="updateSettings('writeIn', $event)" debounce="500" />
      </b-form-group>
    </div>
    <b-button variant="dark" :disabled="this.players.length < 3" @click="startGame">
      Start Game
    </b-button>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: function () {
    return {
      bots: []
    }
  },
  computed: {
    ...mapState(['websocket', 'room', 'players'])
  },
  methods: {
    addBot: function () {
      this.websocket.send(JSON.stringify({
        type: 'addBot',
        roomId: this.room.id,
        name: 'Bot'
      }))
    },
    deleteBot: function (id) {
      this.websocket.send(JSON.stringify({
        type: 'deleteBot',
        roomId: this.room.id,
        botId: id
      }))
    },
    updateSettings: function (key, rawValue) {
      let value
      if (key === 'points' && parseFloat(rawValue) > 0) {
        value = parseFloat(rawValue)
      }
      if (key === 'writeIn' && parseFloat(rawValue) > 0 && parseFloat(rawValue) < 1) {
        value = parseFloat(rawValue)
      }
      if (value) {
        this.websocket.send(JSON.stringify({
          type: 'updateSettings',
          roomId: this.room.id,
          key: key,
          value: value
        }))
      }
    },
    startGame: function () {
      this.websocket.send(JSON.stringify({
        type: 'startRound',
        roomId: this.room.id,
        settings: this.settings
      }))
    }
  }
}
</script>

<style scoped>
.waiting-room-container {
  margin: 1rem auto;
  width: min(90%, 500px);
}

.players {
  height: 350px;
}

.header {
  font-size: 36px;
  border-bottom: 1px solid gray;
}

.username {
  font-size: 28px;
  padding: 1rem;
}

.add {
  background-color: #333333;
}

.delete {
  cursor: pointer;
}

>>> .btn-dark {
  width: 100%;
}
>>> .form-group {
  margin: 0.5rem auto;
}
>>> label {
  line-height: 2.4rem;
}
>>> .form-control {
  margin: 0.5rem 0;
}
</style>
