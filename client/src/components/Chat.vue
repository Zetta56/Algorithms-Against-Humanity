<template>
  <span>
    <b-button variant="dark" class="toggle" @click="toggleModal">
      <span class="circle-container" v-if="notification">
        <b-icon-circle-fill />
      </span>
      <b-icon-chat-left-text-fill />
    </b-button>
    <b-modal id="chat" ref="chat" title="Chat" :hide-footer="true" centered>
      <div class="chatbox">
        <div
          class="message"
          :class="{ green: !message.username }"
          v-for="message, index in chat"
          :key="index"
        >
          <span class="username" v-if="message.username">{{ message.username }}: </span>
          <span class="text">{{ message.text }}</span>
        </div>
      </div>
      <TextInput
        :onSubmit="onSubmit"
        :text.sync="message"
        placeholder="Type your message here..."
      />
    </b-modal>
  </span>
</template>

<script>
import { mapState } from 'vuex'
import TextInput from './TextInput'

export default {
  components: {
    TextInput
  },
  data: function () {
    return {
      message: '',
      notification: false
    }
  },
  computed: {
    ...mapState(['websocket', 'user', 'chat'])
  },
  methods: {
    onSubmit: function () {
      this.websocket.send(JSON.stringify({
        type: 'sendChat',
        text: this.message,
        username: this.user.username
      }))
      this.message = ''
    },
    toggleModal: function () {
      this.$refs.chat.show()
      this.notification = false
    }
  },
  watch: {
    '$store.state.chat': function () {
      if (!this.$refs.chat.isShow) {
        this.notification = true
      }
    }
  }
}
</script>

<style scoped>
>>> .modal-body {
  padding-top: 0;
}
.chatbox {
  font-size: 20px;
  height: 300px;
  padding-right: 1rem;
  overflow-y: scroll;
  word-wrap: break-word;
  word-break: break-all; /* breaks overflowing text in each line */
}
.message {
  margin: 0.75rem 0;
}
.circle-container {
  position: relative;
  width: 0;
  height: 0;
}
>>> .bi-circle-fill {
  color: red;
  position: absolute;
  left: 1rem;
  top: -1.5rem;
  width: 0.75rem;
  z-index: 1;
}
.username {
  font-weight: 700;
}
.green {
  color: green;
}
</style>
