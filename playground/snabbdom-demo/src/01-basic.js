// var snabbdom = require('snabbdom')
import {h, init} from 'snabbdom'

// 1. 初始化
const patch = init([])

// 2. 生成初始Vnode
let vnode = h('div#container.cls', 'Hello World')

// 3. 选取挂载节点并更新
let root = document.querySelector('#app')
let oldVnode = patch(root, vnode)

// 创建新vnode，通过patch函数更新视图
vnode = h('div', 'Hello Snabbdom')
patch(oldVnode, vnode)
