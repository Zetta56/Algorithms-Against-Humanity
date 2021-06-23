<template>
  <span>
    <b-button variant="dark" class="toggle" v-b-modal.scoreboard>
      Scoreboard
    </b-button>
    <b-modal
      id="scoreboard"
      ref="scoreboard"
      title="Scoreboard"
      :hide-footer="true"
      centered
    >
      <div v-for="player, index in players" :key="index" class="row">
        <span class="username">{{ player.username }}</span>
        <span class="score">{{ player.score }}</span>
      </div>
    </b-modal>
  </span>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['players'])
  },
  watch: {
    '$store.getters.finished': function () {
      this.$refs.scoreboard.show()
    }
  }
}
</script>

<style scoped>
>>> #scoreboard {
  font-size: 20px;
  align-items: center;
}

>>> #scoreboard .modal-dialog {
  width: 350px;
}

>>> #scoreboard .row {
  padding: 0.5rem 1rem;
}

>>> #scoreboard .score {
  margin-left: auto;
}
</style>
