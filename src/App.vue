<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  overflow-x: hidden;
  overflow-y: auto;
}

#app {
  width: 100vw;
  min-height: 100vh;
}

/* 手機版確保滾動正常 */
@media (max-width: 768px) {
  html, body {
    height: auto !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
  }
  
  #app {
    height: auto !important;
    min-height: 100vh;
  }
}
</style>