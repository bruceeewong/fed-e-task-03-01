class Vue {
  constructor(options) {
    // 1. 通过属性保存选项的数据
    this.$options = options || {}
    this.$data = options.data || {}
    this.$data = options.data || {}
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el

    // 2. 把data中的成员转换为 getter / setter，
    // 注入到vue实例中作为代理，直接操作data中的值
    this._proxyData(this.$data)

    // 3. 调用observer对象，将data属性递归转为响应式数据
    new Observer(this.$data)

    // 4. 调用 compiler 对象，编译模板
    new Compiler(this)
  }

  _proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return data[key]
        },
        set (newValue) {
          if (newValue === data[key]) {
            return
          }
          data[key] = newValue
        }
      })
    })
  }
}