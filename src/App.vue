<template>
  <div id="app">
    <router-view></router-view>
    
  </div>
</template>

<script>
import chat from './components/chat.vue'
import { islogin } from '../store.js';
export default {
  name: 'App',
  components: {
    chat
  }
}
</script>

<style lang="scss">
body,
html {
  width: 100%;
  height: 100px;
  margin: 0;
}

#app {
  width: 100%;
  height: 100px;
}
</style>
