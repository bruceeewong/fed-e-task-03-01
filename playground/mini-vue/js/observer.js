/**
 * 数据劫持
 * 将data对象的所有属性转为 getter / setter
 * 
 * @class Observer
 */
class Observer {
  constructor(data) {
    this.walk(data)
  }

  /**
   * 遍历object对象，将所有属性转换为响应式数据
   *
   * @param {*} data
   * @memberof Observer
   */
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

  /**
   * 数据劫持，将对象中的属性生成 getter / setter
   *
   * @param {*} obj
   * @param {*} key
   * @param {*} val
   * @returns
   * @memberof Observer
   */
  defineReactive(obj, key, val) {
    let that = this
    // 为每个属性创建一个dep对象，负责收集依赖，并发送通知
    let dep = new Dep()

    // 如果val是对象，把val内部的属性转换为响应式数据
    // 如果属性值还是对象，要递归遍历
    this.walk(val)

    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 在getter中, 收集依赖
        if (Dep.target) {
          dep.addSub(Dep.target)
        }
        return val // 这里不能返回obj[key], 会栈溢出
      },
      set(newValue) {
        if (newValue === val) return
        val = newValue
        // 新值需要再转换一遍响应式数据
        that.walk(newValue)

        // 发送通知所有观察者，去更新视图
        dep.notify()
      }
    })
  }
}