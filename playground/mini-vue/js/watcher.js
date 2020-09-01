import Dep from './dep'

class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm
    // data中的属性名称
    this.key = key
    // 回调函数负责更新视图
    this.cb = cb

    // 把当前的watcher对象记录到Dep的静态属性target中
    Dep.target = this
    // 触发get方法，在get方法中会调用addSub
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