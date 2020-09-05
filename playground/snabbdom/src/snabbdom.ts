/* global module, document, Node */
import {Module} from './modules/module';
import {Hooks} from './hooks';
import vnode, {VNode, VNodeData, Key} from './vnode';
import * as is from './is';
import htmlDomApi, {DOMAPI} from './htmldomapi';

function isUndef(s: any): boolean { return s === undefined; }
function isDef(s: any): boolean { return s !== undefined; }

type VNodeQueue = Array<VNode>;

const emptyNode = vnode('', {}, [], undefined, undefined);

function sameVnode(vnode1: VNode, vnode2: VNode): boolean {
  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}

function isVnode(vnode: any): vnode is VNode {
  return vnode.sel !== undefined;
}

type KeyToIndexMap = {[key: string]: number};

type ArraysOf<T> = {
  [K in keyof T]: (T[K])[];
}

type ModuleHooks = ArraysOf<Module>;

function createKeyToOldIdx(children: Array<VNode>, beginIdx: number, endIdx: number): KeyToIndexMap {
  let i: number, map: KeyToIndexMap = {}, key: Key | undefined, ch;
  for (i = beginIdx; i <= endIdx; ++i) {
    ch = children[i];
    if (ch != null) {
      key = ch.key;
      if (key !== undefined) map[key] = i;
    }
  }
  // 生成节点数组中 key -> index 的映射
  return map;
}

const hooks: (keyof Module)[] = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];

export {h} from './h';
export {thunk} from './thunk';

export function init(modules: Array<Partial<Module>>, domApi?: DOMAPI) {
  let i: number, j: number, cbs = ({} as ModuleHooks);

  const api: DOMAPI = domApi !== undefined ? domApi : htmlDomApi;

  for (i = 0; i < hooks.length; ++i) {
    // 以钩子函数名为key，存储所有传入的模块的钩子函数
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      const hook = modules[j][hooks[i]];
      if (hook !== undefined) {
        // 以 形如 cbs.pre: hook[] 的方式存各钩子对应的回调函数
        (cbs[hooks[i]] as Array<any>).push(hook);
      }
    }
  }

  function emptyNodeAt(elm: Element) {
    const id = elm.id ? '#' + elm.id : '';
    const c = elm.className ? '.' + elm.className.split(' ').join('.') : '';
    return vnode(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
  }

  function createRmCb(childElm: Node, listeners: number) {
    return function rmCb() {
      if (--listeners === 0) {
        const parent = api.parentNode(childElm);
        api.removeChild(parent, childElm);
      }
    };
  }

  function createElm(vnode: VNode, insertedVnodeQueue: VNodeQueue): Node {
    let i: any, data = vnode.data;
    if (data !== undefined) {
      // 执行用户设置的 init 函数
      if (isDef(i = data.hook) && isDef(i = i.init)) {
        i(vnode);
        // 可能在init钩子中改变data，再赋值
        data = vnode.data;
      }
    }
    let children = vnode.children, sel = vnode.sel;
    if (sel === '!') {
      // 创建注释节点
      if (isUndef(vnode.text)) {
        vnode.text = '';
      }
      vnode.elm = api.createComment(vnode.text as string);
    } else if (sel !== undefined) {
      // 创建 DOM 节点
      const hashIdx = sel.indexOf('#');
      const dotIdx = sel.indexOf('.', hashIdx);
      const hash = hashIdx > 0 ? hashIdx : sel.length;
      const dot = dotIdx > 0 ? dotIdx : sel.length;
      const tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
      const elm = vnode.elm = isDef(data) && isDef(i = (data as VNodeData).ns) ? api.createElementNS(i, tag)
                                                                               : api.createElement(tag);
      if (hash < dot) elm.setAttribute('id', sel.slice(hash + 1, dot));
      if (dotIdx > 0) elm.setAttribute('class', sel.slice(dot + 1).replace(/\./g, ' '));
      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode);
      if (is.array(children)) {
        for (i = 0; i < children.length; ++i) {
          const ch = children[i];
          if (ch != null) {
            api.appendChild(elm, createElm(ch as VNode, insertedVnodeQueue));
          }
        }
      } else if (is.primitive(vnode.text)) {
        api.appendChild(elm, api.createTextNode(vnode.text));
      }
      i = (vnode.data as VNodeData).hook; // Reuse variable
      if (isDef(i)) {
        if (i.create) i.create(emptyNode, vnode);
        if (i.insert) insertedVnodeQueue.push(vnode);
      }
    } else {
      // 创建文本节点
      vnode.elm = api.createTextNode(vnode.text as string);
    }
    return vnode.elm;
  }

  function addVnodes(parentElm: Node,
                     before: Node | null,
                     vnodes: Array<VNode>,
                     startIdx: number,
                     endIdx: number,
                     insertedVnodeQueue: VNodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx];
      if (ch != null) {
        api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
      }
    }
  }

  function invokeDestroyHook(vnode: VNode) {
    let i: any, j: number, data = vnode.data;
    if (data !== undefined) {
      // 执行节点的 destory 钩子
      if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode);

      // 执行模块的所有 destory 钩子
      for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode);

      if (vnode.children !== undefined) {
        for (j = 0; j < vnode.children.length; ++j) {
          i = vnode.children[j];
          if (i != null && typeof i !== "string") {
            // 子节点 不是空也不是文本节点，即递归调用 destroy 钩子
            invokeDestroyHook(i);
          }
        }
      }
    }
  }

  function removeVnodes(parentElm: Node,
                        vnodes: Array<VNode>,
                        startIdx: number,
                        endIdx: number): void {
    for (; startIdx <= endIdx; ++startIdx) {
      let i: any, listeners: number, rm: () => void, ch = vnodes[startIdx];
      if (ch != null) {
        if (isDef(ch.sel)) {
          // 如果是标签节点
          // 
          invokeDestroyHook(ch);
          listeners = cbs.remove.length + 1;
          rm = createRmCb(ch.elm as Node, listeners);
          for (i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm);
          if (isDef(i = ch.data) && isDef(i = i.hook) && isDef(i = i.remove)) {
            i(ch, rm);
          } else {
            rm();
          }
        } else { // Text node
          api.removeChild(parentElm, ch.elm as Node);
        }
      }
    }
  }

  function updateChildren(parentElm: Node,
                          oldCh: Array<VNode>,
                          newCh: Array<VNode>,
                          insertedVnodeQueue: VNodeQueue) {
    let oldStartIdx = 0, newStartIdx = 0;

    // 旧子节点
    let oldEndIdx = oldCh.length - 1;
    let oldStartVnode = oldCh[0];
    let oldEndVnode = oldCh[oldEndIdx];

    // 新子节点
    let newEndIdx = newCh.length - 1;
    let newStartVnode = newCh[0];
    let newEndVnode = newCh[newEndIdx];

    let oldKeyToIdx: any;
    let idxInOld: number;
    let elmToMove: VNode;
    let before: any;

    // 新旧节点开始下标 都小于各自的 结束下标时，保持循环
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      // 索引变化后，可能会把节点置空
      if (oldStartVnode == null) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
      } else if (oldEndVnode == null) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (newStartVnode == null) {
        newStartVnode = newCh[++newStartIdx];
      } else if (newEndVnode == null) {
        newEndVnode = newCh[--newEndIdx];

        // 比较开始和结束节点的四种情况
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        // 1. 比较老开始节点和新开始节点, 更新DOM
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        // 移动新旧的开始下标
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        // 2. 比较新旧的结束节点差异，更新DOM
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);

        // 移动新旧的结束下标
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        // 比较旧开始节点与新结束节点
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        // 将旧的开始节点 移动到 旧结束节点的后面
        api.insertBefore(parentElm, oldStartVnode.elm as Node, api.nextSibling(oldEndVnode.elm as Node));

        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        // 比较旧结束节点 和 新开始节点
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        // 将旧的结束节点 移动到 旧的开始节点前
        api.insertBefore(parentElm, oldEndVnode.elm as Node, oldStartVnode.elm as Node);

        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        // 开始节点和结束节点都不相同
        // 使用 newStartNode 的 key 在老节点数组中 找相同节点
        if (oldKeyToIdx === undefined) {
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        }

        // 以新节点的 key 找是否在老节点中有相同 key
        idxInOld = oldKeyToIdx[newStartVnode.key as string];
        if (isUndef(idxInOld)) { // New element
          // 创建新节点DOM，将新节点插入旧开始节点前
          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm as Node);
          newStartVnode = newCh[++newStartIdx];
        } else {
          // 如果新旧节点的 key 相同
          elmToMove = oldCh[idxInOld];
          if (elmToMove.sel !== newStartVnode.sel) {
            // 如果是不同标签，说明是新的节点，则将新节点插入旧开始节点前
            api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm as Node);
          } else {
            // 如果sel和key相同，认为是可复用节点，更新节点差异
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
            // 将原位置的节点置空
            oldCh[idxInOld] = undefined as any;

            // 将复用节点插入旧开始节点前
            api.insertBefore(parentElm, (elmToMove.elm as Node), oldStartVnode.elm as Node);
          }
          // 切到下一个新开始节点
          newStartVnode = newCh[++newStartIdx];
        }
      }
    }

    // 循环结束，新/旧节点未遍历完
    if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
      if (oldStartIdx > oldEndIdx) {
        // 如果老节点先遍历完，说明新节点有剩余
        // 把新节点全部插到新节点末尾（右边）
        before = newCh[newEndIdx+1] == null ? null : newCh[newEndIdx+1].elm;
        addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
      } else {
        // 如果新节点先遍历完，说明老节点有剩余
        // 删除当前开始下标与结束下标之间的节点
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
      }
    }
  }

  function patchVnode(oldVnode: VNode, vnode: VNode, insertedVnodeQueue: VNodeQueue) {
    let i: any, hook: any;
    // 如果新节点有 prepatch 钩子，执行
    if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
      i(oldVnode, vnode);
    }
    const elm = vnode.elm = (oldVnode.elm as Node);
    let oldCh = oldVnode.children;
    let ch = vnode.children;

    // 如果新旧节点相同，直接返回
    if (oldVnode === vnode) return;

    // 如果新节点有数据
    if (vnode.data !== undefined) {
      // 执行 模块的 update 的钩子函数
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode);

      // 执行 新节点的 update 钩子函数
      i = vnode.data.hook;
      if (isDef(i) && isDef(i = i.update)) i(oldVnode, vnode);
    }

    // 如果新节点无文本属性
    if (isUndef(vnode.text)) {
      // 如果新旧节点都有 children 属性
      if (isDef(oldCh) && isDef(ch)) {
        // 如果不同，更新children
        if (oldCh !== ch) updateChildren(elm, oldCh as Array<VNode>, ch as Array<VNode>, insertedVnodeQueue);
      } else if (isDef(ch)) {
        // 如果只有新节点有 children
        // 如果旧节点有 text 属性，清空
        if (isDef(oldVnode.text)) api.setTextContent(elm, '');
        // 将子节点插入当前节点下
        addVnodes(elm, null, ch as Array<VNode>, 0, (ch as Array<VNode>).length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        // 只有老节点有 children, 移除旧节点的子节点
        removeVnodes(elm, oldCh as Array<VNode>, 0, (oldCh as Array<VNode>).length - 1);
      } else if (isDef(oldVnode.text)) {
        // 只有旧节点有 text，则清空dom的文本即可
        api.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      // 如果新节点有 text 属性，且与旧节点的 text 属性不同
      if (isDef(oldCh)) {
        // 如果旧节点有子节点，全部移除
        removeVnodes(elm, oldCh as Array<VNode>, 0, (oldCh as Array<VNode>).length - 1);
      }
      // 设置当前dom为新节点的text
      api.setTextContent(elm, vnode.text as string);
    }

    // 执行模块的 postpatch 钩子
    if (isDef(hook) && isDef(i = hook.postpatch)) {
      i(oldVnode, vnode);
    }
  }

  // 通过闭包访问 modules & domApi 对象
  return function patch(oldVnode: VNode | Element, vnode: VNode): VNode {
    let i: number, elm: Node, parent: Node;
    // 保存新插入节点的队列，为了触发钩子函数
    const insertedVnodeQueue: VNodeQueue = [];
    // 执行模块的 pre 钩子函数
    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]();

    // 判断第一个节点是否为虚拟节点
    if (!isVnode(oldVnode)) {
      // 将真实dom 创建为 vnode
      oldVnode = emptyNodeAt(oldVnode);
    }

    // 判断是否为相同节点(key 和 sel 相同)
    if (sameVnode(oldVnode, vnode)) {
      // 找节点差异并更新dom
      patchVnode(oldVnode, vnode, insertedVnodeQueue);
    } else {
      // 节点不同, vnode 创建对应的 DOM, 新的替换掉老的
      // 获取当前的 DOM 元素
      elm = oldVnode.elm as Node;
      parent = api.parentNode(elm);

      // 创建 vnode 对应的 DOM 元素，并触发 init / create 钩子函数
      createElm(vnode, insertedVnodeQueue);

      if (parent !== null) {
        // 如果父节点不为空，把 vnode 对应的 DOM 插入文档节点中
        api.insertBefore(parent, vnode.elm as Node, api.nextSibling(elm));
        // 移除老节点
        removeVnodes(parent, [oldVnode], 0, 0);
      }
    }

    // 执行用户设置的insert钩子函数
    for (i = 0; i < insertedVnodeQueue.length; ++i) {
      (((insertedVnodeQueue[i].data as VNodeData).hook as Hooks).insert as any)(insertedVnodeQueue[i]);
    }
    // 执行模块的 post 钩子函数
    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]();
    return vnode;
  };
}
