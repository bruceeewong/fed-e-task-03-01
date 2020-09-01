import Dep from './dep'

class Observer {
  constructor(data) {
    this.walk(data)
  }

  walk(data) {
    // 1. 判断data是否为对象
    if (!data || typeof data !== 'object') {
      return
    }
    // 2. 遍历data对象的所有属性
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }

  defineReactive(obj, key, val) {
    let that = this
    // 创建dep对象，负责收集依赖
    let dep = new Dep()
    // 如果val是对象，把val内部的属性转换为响应式数据
    // 如果属性值还是对象，要递归遍历
    this.walk(val)

    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 收集依赖
        Dep.target && dep.addSub(Dep.target)
        return val
      },
      set(newValue) {
        if (newValue === val) {
          return
        }
        val = newValue

        that.walk(newValue)

        // 发送通知所有观察者，去更新视图
        dep.notify()
      }
    })
  }
}