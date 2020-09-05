import {h, init} from 'snabbdom'

let patch = init([])

// 首次渲染
let vnode = h('ul', [
  h('li', {key: 'a'}, '首页'),
  h('li', {key: 'b'}, '视频'),
  h('li', {key: 'c'}, '微博'),
])
let app = document.querySelector('#app')
let oldVnode = patch(app, vnode)

// patchVnode 的执行过程
vnode = vnode = h('ul', [
  h('li', {key: 'a'}, '首页'),
  h('li', {key: 'c'}, '微博'),
  h('li', {key: 'b'}, '视频'),
  h('li', {key: 'd'}, '新增'),
])
patch(oldVnode, vnode)