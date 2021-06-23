<template>
  <div class="hand-container">
    <!-- Mouse/touch drag is a bit buggy, so it's disabled -->
    <Carousel
      :paginationEnabled="false"
      :navigationEnabled="true"
      :mouseDrag="false"
      :touchDrag="false"
      :perPageCustom="[[1200, 4], [991, 3], [580, 2], [0, 1]]"
      :speed="250"
      class="hand"
    >
      <slide v-for="card, index in userPlayer.hand" :key="index">
        <div
          class="light card"
          :class="{ outlined: selected && selected.index === index }"
          @click="pickCard(card, index)"
        >
          <b-icon-pencil-fill v-if="card.custom" class="pencil" />
          {{ card.text }}
        </div>
      </slide>
    </Carousel>
    <b-button
      variant="dark"
      :disabled="!selected"
      v-if="!this.room.submitted.some(card => card.id === userPlayer.id)"
      @click="submitCard"
      class="submit-button"
    >
      Select
    </b-button>
    <b-modal
      id="write"
      ref="write"
      title="Write-In"
      :hide-footer="true"
      centered
    >
      <TextInput
        :onSubmit="writeCustom"
        :text.sync="customText"
        placeholder="Write your card here..."
      />
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { Carousel, Slide } from 'vue-carousel'
import TextInput from './TextInput'

export default {
  components: {
    Carousel,
    Slide,
    TextInput
  },
  data: function () {
    return {
      selected: null,
      customText: ''
    }
  },
  computed: {
    ...mapState(['websocket', 'user', 'room', 'players']),
    ...mapGetters(['userPlayer'])
  },
  methods: {
    ...mapActions(['updateHand']),
    pickCard: function (card, index) {
      if (this.room.phase === 'playing') {
        if (this.selected && this.selected.index === index) {
          this.selected = null
        } else if (card.custom) {
          this.selected = {
            text: this.userPlayer.hand[index].text,
            index: index
          }
          if (this.userPlayer.hand[index].text.length > 0) {
            this.customText = this.userPlayer.hand[index].text
          } else {
            this.customText = ''
          }
          this.$refs.write.show()
        } else {
          this.selected = {
            text: card.text,
            custom: false,
            index: index
          }
        }
      }
    },
    submitCard: function () {
      if (this.selected.text.length > 0) {
        this.websocket.send(JSON.stringify({
          type: 'submitCard',
          roomId: this.room.id,
          card: this.selected
        }))
        this.selected = null
      }
    },
    writeCustom: function () {
      this.selected = {
        text: this.customText,
        index: this.selected.index
      }
      this.websocket.send(JSON.stringify({
        type: 'writeCard',
        text: this.customText,
        index: this.selected.index
      }))
      this.$refs.write.hide()
    }
  }
}
</script>

<style scoped>
.hand-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.hand {
  width: 100%;
}

.submit-button {
  padding: 0.5rem 1rem;
}

.light.card {
  border: 1px solid #222222;
  cursor: pointer;
}

.card {
  width: calc(100% - 1rem);
  height: 275px;
  padding: 1rem;
  margin: 0.5rem auto;
}

.pencil {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
}

.outlined {
  box-shadow: 0 0 10px black;
}
</style>
