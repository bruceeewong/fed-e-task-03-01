import Vue from 'vue'
import VueRouter from '../vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import About from '../components/About.vue'


Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    { path: '/', component: HelloWorld },
    { path: '/about', component: About }
  ]
})