class Watcher {
  constructor(vm, key, cb) {
    // vue实例
    this.vm = vm
    // 属性名
    this.key = key
    // 回调函数负责更新视图
    this.cb = cb

    // 每次创建，记录自己到Dep的静态属性target中, 为了能注册自己
    Dep.target = this

    // 触发get方法，收集依赖：在get方法中会调用dep 的 addSub，将自己添加到Dep的subs中
    // 即此属性创建了一个观察者，并在创建时将自己添加到发布者中
    this.oldValue = vm[key]

    // 防止重复添加
    Dep.target = null
  }

  // 当数据发生变化时更新视图
  update() {
    let newValue = this.vm[this.key]  // 获取到新值
    if (this.oldValue === newValue) {
      return
    }

    // 不等时，调用回调函数, 传入新值
    this.cb(newValue)
  }
}