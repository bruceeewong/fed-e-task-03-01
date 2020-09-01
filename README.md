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





