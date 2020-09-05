import {h, init} from 'snabbdom'

let patch = init([])

// 首次渲染
let vnode = h('ul', [
  h('li', '首页'),
  h('li', '视频'),
  h('li', '微博'),
])
let app = document.querySelector('#app')
let oldVnode = patch(app, vnode)

// patchVnode 的执行过程
vnode = vnode = h('ul', [
  h('li', '首页'),
  h('li', '微博'),  // 调换顺序
  h('li', '视频'),
])
patch(oldVnode, vnode)