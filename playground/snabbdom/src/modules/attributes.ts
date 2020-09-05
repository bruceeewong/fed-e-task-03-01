import {VNode, VNodeData} from '../vnode';
import {Module} from './module';

// because those in TypeScript are too restrictive: https://github.com/Microsoft/TSJS-lib-generator/pull/237
declare global {
  interface Element {
    setAttribute(name: string, value: string | number | boolean): void;
    setAttributeNS(namespaceURI: string, qualifiedName: string, value: string | number | boolean): void;
  }
}

export type Attrs = Record<string, string | number | boolean>

const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const colonChar = 58;
const xChar = 120;

function updateAttrs(oldVnode: VNode, vnode: VNode): void {
  var key: string, elm: Element = vnode.elm as Element,
      oldAttrs = (oldVnode.data as VNodeData).attrs,
      attrs = (vnode.data as VNodeData).attrs;

  if (!oldAttrs && !attrs) return;
  if (oldAttrs === attrs) return;
  oldAttrs = oldAttrs || {};
  attrs = attrs || {};

  // update modified attributes, add new attributes
  for (key in attrs) {
    const cur = attrs[key];
    const old = oldAttrs[key];
    if (old !== cur) {
      // 布尔类型属性
      if (cur === true) {
        elm.setAttribute(key, "");
      } else if (cur === false) {
        elm.removeAttribute(key);
      } else {
        // 非布尔类型
        if (key.charCodeAt(0) !== xChar) {
          // 不是以x开头，非命名空间
          elm.setAttribute(key, cur);
        } else if (key.charCodeAt(3) === colonChar) {
          // Assume xml namespace
          elm.setAttributeNS(xmlNS, key, cur);
        } else if (key.charCodeAt(5) === colonChar) {
          // Assume xlink namespace
          elm.setAttributeNS(xlinkNS, key, cur);
        } else {
          // 设置属性
          elm.setAttribute(key, cur);
        }
      }
    }
  }
  // remove removed attributes
  // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
  // the other option is to remove all attributes with value == undefined
  for (key in oldAttrs) {
    if (!(key in attrs)) {
      elm.removeAttribute(key);
    }
  }
}

export const attributesModule = {create: updateAttrs, update: updateAttrs} as Module;
export default attributesModule;
