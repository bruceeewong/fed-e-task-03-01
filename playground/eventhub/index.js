const has = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

class EventEmitter {
  constructor() {
    // { 'click': [fn1, fn2], ... }
    this.subs = Object.create(null); // 无原型属性，只存储键值对
  }

  // 注册事件
  $on(eventType, handler) {
    if (!has(this.subs, eventType)) {
      this.subs[eventType] = [];
    }
    this.subs[eventType].push(handler);
  }

  $emit(eventType) {
    if (has(this.subs, eventType)) {
      this.subs[eventType].forEach((handler) => handler());
    }
  }
}
