<template>
    <div id="app">
        <UserList msg="Welcome to Your Vue.js App" />

    </div>
</template>

<script>
import UserList from './components/UserList.vue'

export default {
    name: 'app',
    components: {
        UserList
    }
}
</script>

<style>
* {
  margin: 0px;
  padding: 0px;
}
html,
body {
  height: 100%;
  min-width: 1110px;
}
#app {
  height: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}
</style>
