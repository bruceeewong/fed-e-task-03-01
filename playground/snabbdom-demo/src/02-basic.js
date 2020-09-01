import {h, init} from 'snabbdom'

const patch = init([])

let vnode = h('div#container', [
  h('h1', 'Hello Snabbdom'),
  h('p', 'lorem ...')
])

const app = document.querySelector('#app')
let oldNode = patch(app, vnode)

setTimeout(() => {
  vnode = h('div#container', [
    h('h1', 'Hello !!!'),
    h('p', 'lorem ...')
  ])
  patch(oldNode, vnode)
}, 2000)