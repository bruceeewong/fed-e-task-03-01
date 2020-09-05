/** 实现hash模式的VueRouter
 * 功能点：
 *  1. 作为Vue的插件，在实例化vue时如果传入了router实例，初始化该router，并通过混入注入到Vue的原型中
 *  2. 构造函数：接收路由配置，创建vue响应式数据，用于更新router-view的渲染函数
 *  3. 初始化路由配置：解析路径和组件的映射map
 *  4. 初始化组件：注册 router-link, router-view
 *  5. 初始化事件：监听浏览器 onhashchange 事件，触发视图更新
 * 
 * 疑惑：
 *  1. 页面load时如果已经有hash，如 /#/about, 会触发两次render造成页面闪屏，如何解决?
 *  */

 let _Vue = null

 class VueRouter {
  /**
   * Vue插件安装函数
   *
   * @static
   * @param {*} Vue
   * @memberof VueRouter
   */
  static install(Vue) {
    // 1. 判断插件是否已经安装
    if (VueRouter.install.installed) return
    VueRouter.install.installed = true
    // 2. 将Vue构造函数记录到全局变量
    _Vue = Vue
    // 3. 将实例化Vue时传入的router实例，注入到Vue原型对象上
    // 须通过混入实现，因为是要在各个Vue实例创建之前完成注入
    _Vue.mixin({
      beforeCreate() {
        // 如果传了router，才执行
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router
          this.$options.router.init()
        }
      }
    })
  }

  /**
   * 构造函数，接收配置，创建响应式对象
   * @param {*} options
   * @memberof VueRouter
   */
  constructor(options) {
    this.options = options
    this.routeMap = {}
    // 创建响应式对象，可触发render函数和计算属性
    this.data = _Vue.observable({
      current: '/'
    })
  }

  init() {
    this.initRouteMap()
    this.initComponents(_Vue)
    this.initEvents()
  }

  
  /**
   * 解析传入的路由配置，提取 路径->组件 的映射关系
   *
   * @memberof VueRouter
   */
  initRouteMap() {
    this.options.routes.forEach(route => {
      this.routeMap[route.path] = route.component
    })
  }

  initComponents(Vue) {
    const self = this

    // 注册 router-link 
    Vue.component('router-link', {
      props: {
        to: String
      },
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
          // 改变浏览器hash
          window.location.hash = this.to
        }
      }
    })

    // 注册 router-view
    Vue.component('router-view', {
      render(h) {
        const component = self.routeMap[self.data.current]
        console.log('current: ', self.data.current)
        console.log('component: ', component)
        return h(component)
      }
    })
  }

  /**
   * 监听Load,hashchange事件
   *
   * @memberof VueRouter
   */
  initEvents() {
    // 监听页面加载
    window.addEventListener('load', () => {
      this.updateByHash()
    })
    // 监听输入/前进/后退 引起的hash变化
    window.addEventListener('hashchange', () => {
      this.updateByHash()
    })
  }

  /**
   * 根据当前路径hash设置data
   *
   * @memberof VueRouter
   */
  updateByHash() {
    const hash = window.location.hash
    if (hash === '') {
      this.data.current = '/'
    } else {
      this.data.current = hash.slice(1) // 移除#前缀
    }
  }
 }

 export default VueRouter