class Dep {
  constructor() {
    this.subs = []
  }

  addSub(sub) {
    // 
    if (Dep.isSub(sub)) {
      this.subs.push(sub)
    }
  }

  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }

  static isSub(sub) {
    return sub && sub.update
  }
}

class Watcher {
  update() {
    console.log('update')
  }
}

(function() {
  let dep = new Dep()
  let watcher = new Watcher()

  dep.addSub(watcher)
  dep.notify()
})();