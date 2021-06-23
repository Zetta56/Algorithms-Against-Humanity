<template>
  <Carousel
    :paginationEnabled="false"
    :navigationEnabled="true"
    :centerMode="true"
    :mouseDrag="false"
    :touchDrag="false"
    :perPageCustom="[[1200, 4], [991, 3], [580, 2], [0, 1]]"
    :speed="250"
    class="shared-cards"
  >
    <slide>
      <div class="dark card">{{ room.prompt }}</div>
    </slide>
    <slide v-for="card, index in this.room.submitted" :key="index">
      <div v-if="room.phase === 'results'">
        <div class="results card" :style="getResultColor(card)">
          {{ card.text }}
        </div>
        <div class="username">
          {{ players.find(player => player.id === card.id).username }}'s Card
        </div>
      </div>
      <div v-else-if="room.phase === 'picking'" class="gray picking card" @click="pickCard(card.id)">
        {{ card.text }}
      </div>
      <div v-else class="gray card">
        {{ card.id === user.id ? card.text : '' }}
      </div>
    </slide>
  </Carousel>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { Carousel, Slide } from 'vue-carousel'

export default {
  components: {
    Carousel,
    Slide
  },
  computed: {
    ...mapState(['websocket', 'user', 'room', 'players']),
    ...mapGetters(['userPlayer', 'winner'])
  },
  methods: {
    pickCard: function (id) {
      if (this.userPlayer.isCzar) {
        this.websocket.send(JSON.stringify({
          type: 'pickCard',
          roomId: this.room.id,
          winnerId: id
        }))
      }
    },
    getResultColor: function (card) {
      if (this.winner && this.winner.id === card.id) {
        return { backgroundColor: '#bbedbd' }
      } else {
        return { border: '1px solid #222222' }
      }
    }
  }
}
</script>

<style scoped>
.shared-cards {
  margin: 1rem auto;
}

.shared-cards .username {
  text-align: center;
  padding: 0.5rem 0;
}

.dark.card {
  background-color: #222222;
  color: white;
}

.gray.card {
  background-color: #dddddd;
  border: none;
}

.gray.picking.card {
  cursor: pointer;
}

.card {
  width: calc(100% - 1rem);
  height: 275px;
  padding: 1rem;
  margin: auto;
}
</style>
