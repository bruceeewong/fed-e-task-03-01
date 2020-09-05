import {vnode, VNode, VNodeData} from './vnode';
export type VNodes = Array<VNode>;
export type VNodeChildElement = VNode | string | number | undefined | null;
export type ArrayOrElement<T> = T | T[];
export type VNodeChildren = ArrayOrElement<VNodeChildElement>
import * as is from './is';

function addNS(data: any, children: VNodes | undefined, sel: string | undefined): void {
  data.ns = 'http://www.w3.org/2000/svg';
  if (sel !== 'foreignObject' && children !== undefined) {
    for (let i = 0; i < children.length; ++i) {
      let childData = children[i].data;
      if (childData !== undefined) {
        addNS(childData, (children[i] as VNode).children as VNodes, children[i].sel);
      }
    }
  }
}

// h 函数的重载
export function h(sel: string): VNode;
export function h(sel: string, data: VNodeData): VNode;
export function h(sel: string, children: VNodeChildren): VNode;
export function h(sel: string, data: VNodeData, children: VNodeChildren): VNode;
// 上面只是ts声明，最后一个实现
export function h(sel: any, b?: any, c?: any): VNode {
  var data: VNodeData = {}, children: any, text: any, i: number;
  // 处理参数，实现重载机制
  if (c !== undefined) {
    // 处理3个参数的情况
    // sel, data, children/text
    data = b;
    // 如果是vnode数组
    if (is.array(c)) { children = c; }
    // 如果 c 是字符串或者数字
    else if (is.primitive(c)) { text = c; }
    // 如果 c 是 vnode
    else if (c && c.sel) { children = [c]; }
  } else if (b !== undefined) {
    // 处理2个参数的情况
    if (is.array(b)) { children = b; }
    else if (is.primitive(b)) { text = b; }
    else if (b && b.sel) { children = [b]; }
    else { data = b; }
  }
  if (children !== undefined) {
    // 处理 children 中的原始值 (string, number)
    for (i = 0; i < children.length; ++i) {
      // 如果 child 是 string / number, 创建文本节点
      if (is.primitive(children[i])) children[i] = vnode(undefined, undefined, undefined, children[i], undefined);
    }
  }
  if (
    sel[0] === 's' && sel[1] === 'v' && sel[2] === 'g' &&
    (sel.length === 3 || sel[3] === '.' || sel[3] === '#')
  ) {
    // 如果标签是 svg，需要加命名空间
    addNS(data, children, sel);
  }
  // 返回虚拟节点
  return vnode(sel, data, children, text, undefined);
};
// 导出模块
export default h;
