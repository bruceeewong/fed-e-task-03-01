# 拉勾训练营 Part3-Module1 模块

> 作者：bruski
>
> 时间：2020/08/24

## 一、简答题

### 1、当我们点击按钮的时候动态给 data 增加的成员是否是响应式数据，如果不是的话，如何把新增成员设置成响应式数据，它的内部原理是什么。

```js
let vm = new Vue({
 el: '#el',
 data: {
  o: 'object',
  dog: {}
 },
 method: {
  clickHandler () {
   // 该 name 属性是否是响应式的
   this.dog.name = 'Trump'
  }
 }
})
```

答：不是，应该使用 Vue set API：`this.$set(this.dog, 'name', 'Trump')` 将对象添加响应式属性。

原理是：

Vue在初始化实例时会遍历`data`中的所有属性，当属性值为对象时，会递归遍历属性值，通过`Object.defineProperty`设置属性的`getter`与`setter`，在`getter`处收集依赖，将该属性所有的观察者添加到该属性对应的Dep发布者中；在`setter`中调用`dep.notify()`通知该属性所有的观察者，执行各自的update方法，以此实现数据与视图的响应式。

而直接给对象添加新属性，缺少数据劫持即定义getter/setter部分，所以数据无法成为被观察者订阅的属性；

通过调用 Vue.set API就可以显示对数据进行劫持进而转换为响应式数据。

### 2、请简述 Diff 算法的执行过程

Diff算法的目的是：对比新旧vnode，找到节点和子节点的差异，并将差异更新到现有的DOM上；

主要过程：

1. patch判断新旧节点是否相同（判断选择器和key都相同），如果相同，调用 patchVnode对比两节点的差异并更新到DOM上；否则，直接用新的vnode创建DOM，替换原有的DOM。 
2. patchVnode对比两节点差异的过程中，如果新旧节点都有子节点数组，则调用updateChildren进行同层级的差异比较；
3. updateChildren会一次对新旧子节点数组进行4种组合的判断是否相同：
   1. 旧开始节点、新开始节点
   2. 旧结束节点、新结束节点
   3. 旧开始节点、新结束节点
   4. 旧结束节点、新开始节点

4. 如果1，2条件满足，则直接进行差异的对比、更新到DOM上
5. 如果3条件满足，差异的对比、更新到DOM上，然后将DOM中的 旧的开始节点  移动到  旧结束节点的后面
6. 如果4条件满足，差异的对比、更新到DOM上，然后将DOM中的 旧的结束节点 移动到 旧开始节点的后面
7. 如果都不满足，则用新vnode的key去查找旧数组中是否有相同的key的节点:
   1. 如果没有
      1. 说明新vnode是全新的节点，创建DOM后插入旧开始节点DOM之前
   2. 如果有：
      1. 如果选择器不相同，说明新vnode是全新的节点，创建DOM后插入旧开始节点DOM之前
      2. 如果选择器相同，说明新vnode可以复用该节点，更新差异到DOM上，将旧vnode数组中的该节点位置空，然后移动该vnode的DOM至旧开始节点DOM之前

## 二、编程题

### 1、模拟 VueRouter 的 hash 模式的实现，实现思路和 History 模式类似，把 URL 中的 # 后面的内容作为路由的地址，可以通过 hashchange 事件监听路由地址的变化。

代码位置：https://github.com/bruceeewong/fed-e-task-03-01/blob/master/codes/vue-router-hash-demo/src/vue-router/index.js

> 疑惑：页面load时如果已经有hash，如 /#/about, 会触发两次render造成页面闪屏，如何解决?

### 2、在模拟 Vue.js 响应式源码的基础上实现 v-html 指令，以及 v-on 指令。

代码位置：

### 3、参考 Snabbdom 提供的电影列表的示例，利用Snabbdom 实现类似的效果，如图：

代码位置：

