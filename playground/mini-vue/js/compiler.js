/**
 * 模板编译
 *
 * @class Compiler
 */
class Compiler {
  constructor (vm) {
    this.vm = vm
    this.el = vm.$el

    // 立即编译模板
    this.compile(this.el)
  }

  /**
   * 编译模板
   * 处理文本节点和元素节点
   * 
   * @memberof Compiler
   */
  compile(el) {
    const ch = el.childNodes
    Array.from(ch).forEach(node => {
      if (this.isTextNode(node)) {
        this.compileText(node)
      } else if (this.isElementNode(node)) {
        this.compileElement(node)
      }

      // 递归编译
      if (node.childNodes && node.childNodes.length !== 0) {
        this.compile(node)
      }
    })
  }

  /**
   * 编译元素节点
   * 处理指令
   *
   * @param {*} node
   * @memberof Compiler
   */
  compileElement(node) {
    // console.dir(node.attributes)
    // 遍历所有的属性节点
    Array.from(node.attributes).forEach(attr => {
      let attrName = attr.name
      if (this.isOnDirective(attrName)) {
        // v-on:click -> click
        console.log(attrName)
        let eventType = attrName.split(':')[1]
        let key = attr.value
        this.onUpdater(node, eventType, key)
      } else if (this.isDirective(attrName)) {
        // v-text -> text，用于调用各个指令的updater
        attrName = attrName.substr(2)
        let key = attr.value
        this.update(node, key, attrName)
      }
    })
  }

  /**
   * 根据key调用对应的updater
   *
   * @param {*} node
   * @param {*} key
   * @param {*} attrName
   * @memberof Compiler
   */
  update(node, key, attrName) {
    let updateFn = this[`${attrName}Updater`]
    updateFn && updateFn(node, this.vm[key])
  }

  // 处理 v-text 指令
  textUpdater(node, value) {
    node.textContent = value
  }

  // 处理 v-model 指令
  modelUpdater(node, value) {
    node.value = value
  }

  // 处理 v-html 指令
  htmlUpdater(node, value) {
    node.innerHTML = value
  }

  // 处理 v-on 指令
  onUpdater(node, eventType, key) {
    node.addEventListener(eventType, this.vm.$options.methods[key])
  }

  /**
   * 编译文本节点
   * 处理插值表达式
   *
   * @param {*} node
   * @memberof Compiler
   */
  compileText(node) {
    // 正则匹配插值表达式：{{ msg }}
    let reg = /\{\{(.+?)\}\}/
    let value = node.textContent
    if (reg.test(value)) {
      let key = (RegExp.$1).trim()  // 第一个分组
      node.textContent = value.replace(reg, this.vm[key])
    }
  }

  /**
   * 判断元素属性是否为指令
   *
   * @param {*} attrName
   * @memberof Compiler
   */
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }

  // 判断是否是监听指令
  isOnDirective(attrName) {
    return this.isDirective(attrName) && attrName.includes(':')
  }

  /**
   * 判断元素属性是否是文本节点
   *
   * @param {*} node
   * @memberof Compiler
   */
  isTextNode(node) {
    return node.nodeType === 3
  }

  /**
   * 判断节点是否是元素节点
   *
   * @param {*} node
   * @memberof Compiler
   */
  isElementNode(node) {
    return node.nodeType === 1
  }
}