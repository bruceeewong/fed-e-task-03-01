let _Vue = null

export default class VueRouter {
  /**
   * 插件注册函数
   * @param {Vue}} Vue 
   */
  static install(Vue) {
    // 1. 判断插件是否已经安装
    if (VueRouter.install.installed) {
      return
    }
    VueRouter.install.installed = true
    // 2. 将Vue构造函数记录到全局变量
    _Vue = Vue
    // 3. 将实例化Vue时传入的router实例注入vue实例中
    // 要在Vue实例化时传入，需依靠混入来实现
    // 同时需要避免Vue组件运行，判断$options是否有router选项来避免
    _Vue.mixin({
      beforeCreate() {
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router
          this.$options.router.init()
        }
      },
    })
  }

  constructor(options) {
    this.options = options
    this.routeMap = {}
    // 创建响应式对象，可用于渲染函数与计算属性
    this.data = _Vue.observable({
      current: '/'
    })
  }

  /**
   * router初始化
   */
  init() {
    this.initRouteMap()
    this.initComponents(_Vue)
    this.initEvents()
  }

  /** 解析路由表，将path与component解析为键值对存在routeMap中 */
  initRouteMap() {
    this.options.routes.forEach(route => {
      this.routeMap[route.path] = route.component
    })
  }

  /**
   * 初始化 router-lnk & router-view
   * @param {Vue} Vue 
   */
  initComponents(Vue) {
    Vue.component('router-link', {
      props: {
        to: String
      },
      // 如要写template, 需开启vue runtimeCompiler, 加载完整版vue(带编译器)
      // template: '<a :href="to"><slot></slot></a>'
      // 直接用render函数, 不必引入完整vue
      render(h) {
        return h('a', {
          attrs: {
            href: this.to
          },
          on: {
            click: this.clickHandler
          }
        }, [this.$slots.default])
      },
      methods: {
        clickHandler(e) {
          e.preventDefault()
          history.pushState({}, '', this.to)
          this.$router.data.current = this.to
        }
      }
    })

    // 因为要渲染当前路由地址对应的组件，要绑定当前的this
    const self = this
    Vue.component('router-view', {
      // 由于self.data是vue响应式数据，data发生变化时，会重新出发这里的render
      // 实现视图的更新
      render(h) {
        const component = self.routeMap[self.data.current]
        return h(component)
      }
    })
  }

  initEvents() {
    window.addEventListener('popstate', () => {
      // 因为此处data是响应式数据，所以改变值会触发render函数重新渲染
      this.data.current = window.location.pathname
    })
  }
}