<template>
  <div class="home">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/login">Login</router-link>
      <router-link to="/detail/1">Detail id: 1</router-link>
      <router-link to="/detail/2">Detail id: 2</router-link>
    </div>
    <img alt="Vue logo" src="../assets/logo.png">
    <router-view></router-view>
    <footer>
      Footer
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Layout',
}
</script>

<style scoped>
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}  
</style>
