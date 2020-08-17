<template>
  <div>
    <!-- 不好, 强依赖 vue-router -->
    <h1>Route param: {{$route.params.id}}</h1>
    <h1>Route param by props: {{id}}</h1>
  </div>
</template>

<script>
export default {
  name: 'Detail',
  props: ['id']
}
</script>

<style>

</style>