<template>
  <div id="app">
    <Navigation />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import Navigation from './components/Navigation.vue'

export default {
  name: 'App',
  components: {
    Navigation
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
}

.main-content {
  padding-top: 80px;
  min-height: calc(100vh - 80px);
}
</style>
