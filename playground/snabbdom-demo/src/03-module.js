import {h, init} from 'snabbdom'
import style from 'snabbdom/modules/style'
import eventListeners from 'snabbdom/modules/eventlisteners'

const patch = init([
  style,
  eventListeners
])

let vnode = h('div', {
  style: {
    backgroundColor: 'red'
  },
  on: {
    click: onClick
  }
}, [
  h('h1', 'Hello World'),
  h('p', 'lorem ...')
])

function onClick() {
  console.log('clicked!')
}

const app = document.querySelector('#app')

patch(app, vnode)