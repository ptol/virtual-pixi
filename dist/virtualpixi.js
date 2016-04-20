"use strict";

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw (f.code = "MODULE_NOT_FOUND", f);
      }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
        var n = t[o][1][e];return s(n ? n : e);
      }, l, l.exports, e, t, n, r);
    }return n[o].exports;
  }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
    s(r[o]);
  }return s;
})({ 1: [function (require, module, exports) {
    var VNode = require('./vnode');
    var is = require('./is');

    function addNS(data, children) {
      data.ns = 'http://www.w3.org/2000/svg';
      if (children !== undefined) {
        for (var i = 0; i < children.length; ++i) {
          addNS(children[i].data, children[i].children);
        }
      }
    }

    module.exports = function h(sel, b, c) {
      var data = {},
          children,
          text,
          i;
      if (arguments.length === 3) {
        data = b;
        if (is.array(c)) {
          children = c;
        } else if (is.primitive(c)) {
          text = c;
        }
      } else if (arguments.length === 2) {
        if (is.array(b)) {
          children = b;
        } else if (is.primitive(b)) {
          text = b;
        } else {
          data = b;
        }
      }
      if (is.array(children)) {
        for (i = 0; i < children.length; ++i) {
          if (is.primitive(children[i])) children[i] = VNode(undefined, undefined, undefined, children[i]);
        }
      }
      if (sel[0] === 's' && sel[1] === 'v' && sel[2] === 'g') {
        addNS(data, children);
      }
      return VNode(sel, data, children, text, undefined);
    };
  }, { "./is": 3, "./vnode": 5 }], 2: [function (require, module, exports) {
    function createElement(tagName) {
      return document.createElement(tagName);
    }

    function createElementNS(namespaceURI, qualifiedName) {
      return document.createElementNS(namespaceURI, qualifiedName);
    }

    function createTextNode(text) {
      return document.createTextNode(text);
    }

    function insertBefore(parentNode, newNode, referenceNode) {
      parentNode.insertBefore(newNode, referenceNode);
    }

    function removeChild(node, child) {
      node.removeChild(child);
    }

    function appendChild(node, child) {
      node.appendChild(child);
    }

    function parentNode(node) {
      return node.parentElement;
    }

    function nextSibling(node) {
      return node.nextSibling;
    }

    function tagName(node) {
      return node.tagName;
    }

    function setTextContent(node, text) {
      node.textContent = text;
    }

    module.exports = {
      createElement: createElement,
      createElementNS: createElementNS,
      createTextNode: createTextNode,
      appendChild: appendChild,
      removeChild: removeChild,
      insertBefore: insertBefore,
      parentNode: parentNode,
      nextSibling: nextSibling,
      tagName: tagName,
      setTextContent: setTextContent
    };
  }, {}], 3: [function (require, module, exports) {
    module.exports = {
      array: Array.isArray,
      primitive: function primitive(s) {
        return typeof s === 'string' || typeof s === 'number';
      }
    };
  }, {}], 4: [function (require, module, exports) {
    // jshint newcap: false
    /* global require, module, document, Node */
    'use strict';

    var VNode = require('./vnode');
    var is = require('./is');
    var domApi = require('./htmldomapi.js');

    function isUndef(s) {
      return s === undefined;
    }
    function isDef(s) {
      return s !== undefined;
    }

    var emptyNode = VNode('', {}, [], undefined, undefined);

    function sameVnode(vnode1, vnode2) {
      return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
    }

    function createKeyToOldIdx(children, beginIdx, endIdx) {
      var i,
          map = {},
          key;
      for (i = beginIdx; i <= endIdx; ++i) {
        key = children[i].key;
        if (isDef(key)) map[key] = i;
      }
      return map;
    }

    var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];

    function init(modules, api) {
      var i,
          j,
          cbs = {};

      if (isUndef(api)) api = domApi;

      for (i = 0; i < hooks.length; ++i) {
        cbs[hooks[i]] = [];
        for (j = 0; j < modules.length; ++j) {
          if (modules[j][hooks[i]] !== undefined) cbs[hooks[i]].push(modules[j][hooks[i]]);
        }
      }

      function emptyNodeAt(elm) {
        return VNode(api.tagName(elm).toLowerCase(), {}, [], undefined, elm);
      }

      function createRmCb(childElm, listeners) {
        return function () {
          if (--listeners === 0) {
            var parent = api.parentNode(childElm);
            api.removeChild(parent, childElm);
          }
        };
      }

      function createElm(vnode, insertedVnodeQueue) {
        var i,
            thunk,
            data = vnode.data;
        if (isDef(data)) {
          if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode);
          if (isDef(i = data.vnode)) {
            thunk = vnode;
            vnode = i;
          }
        }
        var elm,
            children = vnode.children,
            sel = vnode.sel;
        if (isDef(sel)) {
          // Parse selector
          var hashIdx = sel.indexOf('#');
          var dotIdx = sel.indexOf('.', hashIdx);
          var hash = hashIdx > 0 ? hashIdx : sel.length;
          var dot = dotIdx > 0 ? dotIdx : sel.length;
          var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
          elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag) : api.createElement(tag);
          if (hash < dot) elm.id = sel.slice(hash + 1, dot);
          if (dotIdx > 0) elm.className = sel.slice(dot + 1).replace(/\./g, ' ');
          if (is.array(children)) {
            for (i = 0; i < children.length; ++i) {
              api.appendChild(elm, createElm(children[i], insertedVnodeQueue));
            }
          } else if (is.primitive(vnode.text)) {
            api.appendChild(elm, api.createTextNode(vnode.text));
          }
          for (i = 0; i < cbs.create.length; ++i) {
            cbs.create[i](emptyNode, vnode);
          }i = vnode.data.hook; // Reuse variable
          if (isDef(i)) {
            if (i.create) i.create(emptyNode, vnode);
            if (i.insert) insertedVnodeQueue.push(vnode);
          }
        } else {
          elm = vnode.elm = api.createTextNode(vnode.text);
        }
        if (isDef(thunk)) thunk.elm = vnode.elm;
        return vnode.elm;
      }

      function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
        for (; startIdx <= endIdx; ++startIdx) {
          api.insertBefore(parentElm, createElm(vnodes[startIdx], insertedVnodeQueue), before);
        }
      }

      function invokeDestroyHook(vnode) {
        var i,
            j,
            data = vnode.data;
        if (isDef(data)) {
          if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode);
          for (i = 0; i < cbs.destroy.length; ++i) {
            cbs.destroy[i](vnode);
          }if (isDef(i = vnode.children)) {
            for (j = 0; j < vnode.children.length; ++j) {
              invokeDestroyHook(vnode.children[j]);
            }
          }
          if (isDef(i = data.vnode)) invokeDestroyHook(i);
        }
      }

      function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
        for (; startIdx <= endIdx; ++startIdx) {
          var i,
              listeners,
              rm,
              ch = vnodes[startIdx];
          if (isDef(ch)) {
            if (isDef(ch.sel)) {
              invokeDestroyHook(ch);
              listeners = cbs.remove.length + 1;
              rm = createRmCb(ch.elm, listeners);
              for (i = 0; i < cbs.remove.length; ++i) {
                cbs.remove[i](ch, rm);
              }if (isDef(i = ch.data) && isDef(i = i.hook) && isDef(i = i.remove)) {
                i(ch, rm);
              } else {
                rm();
              }
            } else {
              // Text node
              api.removeChild(parentElm, ch.elm);
            }
          }
        }
      }

      function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
        var oldStartIdx = 0,
            newStartIdx = 0;
        var oldEndIdx = oldCh.length - 1;
        var oldStartVnode = oldCh[0];
        var oldEndVnode = oldCh[oldEndIdx];
        var newEndIdx = newCh.length - 1;
        var newStartVnode = newCh[0];
        var newEndVnode = newCh[newEndIdx];
        var oldKeyToIdx, idxInOld, elmToMove, before;

        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
          if (isUndef(oldStartVnode)) {
            oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
          } else if (isUndef(oldEndVnode)) {
              oldEndVnode = oldCh[--oldEndIdx];
            } else if (sameVnode(oldStartVnode, newStartVnode)) {
              patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
              oldStartVnode = oldCh[++oldStartIdx];
              newStartVnode = newCh[++newStartIdx];
            } else if (sameVnode(oldEndVnode, newEndVnode)) {
              patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
              oldEndVnode = oldCh[--oldEndIdx];
              newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldStartVnode, newEndVnode)) {
              // Vnode moved right
              patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
              api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
              oldStartVnode = oldCh[++oldStartIdx];
              newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldEndVnode, newStartVnode)) {
              // Vnode moved left
              patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
              api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
              oldEndVnode = oldCh[--oldEndIdx];
              newStartVnode = newCh[++newStartIdx];
            } else {
              if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
              idxInOld = oldKeyToIdx[newStartVnode.key];
              if (isUndef(idxInOld)) {
                // New element
                api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                newStartVnode = newCh[++newStartIdx];
              } else {
                elmToMove = oldCh[idxInOld];
                patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                oldCh[idxInOld] = undefined;
                api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                newStartVnode = newCh[++newStartIdx];
              }
            }
        }
        if (oldStartIdx > oldEndIdx) {
          before = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
          addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
        } else if (newStartIdx > newEndIdx) {
          removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
        }
      }

      function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
        var i, hook;
        if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
          i(oldVnode, vnode);
        }
        if (isDef(i = oldVnode.data) && isDef(i = i.vnode)) oldVnode = i;
        if (isDef(i = vnode.data) && isDef(i = i.vnode)) {
          patchVnode(oldVnode, i, insertedVnodeQueue);
          vnode.elm = i.elm;
          return;
        }
        var elm = vnode.elm = oldVnode.elm,
            oldCh = oldVnode.children,
            ch = vnode.children;
        if (oldVnode === vnode) return;
        if (!sameVnode(oldVnode, vnode)) {
          var parentElm = api.parentNode(oldVnode.elm);
          elm = createElm(vnode, insertedVnodeQueue);
          api.insertBefore(parentElm, elm, oldVnode.elm);
          removeVnodes(parentElm, [oldVnode], 0, 0);
          return;
        }
        if (isDef(vnode.data)) {
          for (i = 0; i < cbs.update.length; ++i) {
            cbs.update[i](oldVnode, vnode);
          }i = vnode.data.hook;
          if (isDef(i) && isDef(i = i.update)) i(oldVnode, vnode);
        }
        if (isUndef(vnode.text)) {
          if (isDef(oldCh) && isDef(ch)) {
            if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue);
          } else if (isDef(ch)) {
            if (isDef(oldVnode.text)) api.setTextContent(elm, '');
            addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
          } else if (isDef(oldCh)) {
            removeVnodes(elm, oldCh, 0, oldCh.length - 1);
          } else if (isDef(oldVnode.text)) {
            api.setTextContent(elm, '');
          }
        } else if (oldVnode.text !== vnode.text) {
          api.setTextContent(elm, vnode.text);
        }
        if (isDef(hook) && isDef(i = hook.postpatch)) {
          i(oldVnode, vnode);
        }
      }

      return function (oldVnode, vnode) {
        var i, elm, parent;
        var insertedVnodeQueue = [];
        for (i = 0; i < cbs.pre.length; ++i) {
          cbs.pre[i]();
        }if (isUndef(oldVnode.sel)) {
          oldVnode = emptyNodeAt(oldVnode);
        }

        if (sameVnode(oldVnode, vnode)) {
          patchVnode(oldVnode, vnode, insertedVnodeQueue);
        } else {
          elm = oldVnode.elm;
          parent = api.parentNode(elm);

          createElm(vnode, insertedVnodeQueue);

          if (parent !== null) {
            api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
            removeVnodes(parent, [oldVnode], 0, 0);
          }
        }

        for (i = 0; i < insertedVnodeQueue.length; ++i) {
          insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
        }
        for (i = 0; i < cbs.post.length; ++i) {
          cbs.post[i]();
        }return vnode;
      };
    }

    module.exports = { init: init };
  }, { "./htmldomapi.js": 2, "./is": 3, "./vnode": 5 }], 5: [function (require, module, exports) {
    module.exports = function (sel, data, children, text, elm) {
      var key = data === undefined ? undefined : data.key;
      return { sel: sel, data: data, children: children,
        text: text, elm: elm, key: key };
    };
  }, {}], 6: [function (require, module, exports) {
    function updateEventListeners(oldVnode, vnode) {
      var elm = vnode.elm;
      var on = vnode.data.on || {};
      elm.removeAllListeners();
      elm.interactive = false;
      Object.keys(on).forEach(function (name) {
        elm.interactive = true;
        elm.on(name, function (event) {
          event.stopPropagation();
          on[name]();
        });
      });
    }

    module.exports = { create: updateEventListeners, update: updateEventListeners };
  }, {}], 7: [function (require, module, exports) {
    var mt = Mousetrap;

    function updateKeys(oldVnode, vnode) {
      var oldKeyboard = oldVnode.data.keyboard || {};
      var keyboard = vnode.data.keyboard || {};
      var keys = Object.keys(oldKeyboard).concat(Object.keys(keyboard));
      keys.forEach(function (key) {
        var isOld = oldKeyboard[key];
        var isNew = keyboard[key];
        if (!isOld || !isNew) {
          if (isOld) {
            mt.unbind(key);
          }
          if (isNew) {
            mt.bind(key, function (event) {
              isNew.callback();
              return false;
            }, isNew.action);
          }
        }
      });
    }

    module.exports = { create: updateKeys, update: updateKeys };
  }, {}], 8: [function (require, module, exports) {
    function updateProps(oldVnode, vnode) {
      var elm = vnode.elm;
      var oldProps = oldVnode.data.props || {};
      var props = vnode.data.props || {};
      for (key in oldProps) {
        if (!props[key]) {
          if (typeof oldProps[key] == "number") {
            elm[key] = 0;
          } else {
            delete elm[key];
          }
        }
      }
      for (var key in props) {
        var cur = props[key];
        var old = oldProps[key];
        if (old !== cur) {
          elm[key] = cur;
        }
      }
    }

    module.exports = { create: updateProps, update: updateProps };
  }, {}], 9: [function (require, module, exports) {
    var elmKey = "elm";
    function stopTweens(elm) {
      if (elm.vptweens) {
        elm.vptweens.forEach(function (x) {
          return x.stop();
        });
      }
    }
    function createTween(elm, td) {
      stopTweens(elm);
      var props = getPropsToTween(td);
      elm.vptweens = [];
      var first = true;
      for (var key in props) {
        var tween = createKeyTween(elm, props[key], td, key);
        elm.vptweens.push(tween);
        if (first) {
          var onComplete = function onComplete() {
            delete elm.vptweens;
            if (td.onComplete) td.onComplete();
          };

          tween.onComplete(onComplete);
          tween.onStop(onComplete);
          first = false;
        }
      }
      elm.vptweens.forEach(function (x) {
        return x.start();
      });
    }

    function createKeyTween(elm, obj, td, key) {
      var tween = new TWEEN.Tween(obj.from);
      tween.to(obj.to, td.duration);
      if (td.easing) {
        tween.easing(td.easing);
      }
      if (td.repeat) {
        tween.repeat(td.repeat);
      }
      if (td.yoyo) {
        tween.yoyo(td.yoyo);
      }
      tween.onUpdate(function () {
        updateProps(key == elmKey ? elm : elm[key], this);
      });
      return tween;
    }

    function isObject(obj) {
      return (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object";
    }

    function getPropsToTween(tween) {
      var from = tween.from;
      var to = tween.to;
      var props = {};
      for (var key in from) {
        var v = from[key];
        if (isObject(v)) {
          props[key] = { from: v, to: to[key] };
          delete from[key];
          delete to[key];
        }
      }
      if (!isEmpty(from)) {
        props[elmKey] = { from: from, to: to };
      }
      return props;
    }

    function cloneObject(obj) {
      if (!isObject(obj)) return obj;
      var result = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) result[key] = cloneObject(obj[key]);
      }
      return result;
    }

    function getPropsFromObject(obj, props) {
      var result = {};
      var keys = Array.isArray(props) ? props : Object.keys(props);
      keys.forEach(function (key) {
        result[key] = cloneObject(obj[key]);
      });
      return result;
    }

    function updateProps(elm, props) {
      for (var key in props) {
        elm[key] = cloneObject(props[key]);
      }
    }

    function isEmpty(obj) {
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) return false;
      }
      return true;
    }

    function updateTweenProps(tween, vnode, oldVnode) {
      tween = cloneObject(tween);
      var elm = vnode.elm;
      var toIsEmpty = isEmpty(tween.to);
      var fromIsEmpty = isEmpty(tween.from);
      if (toIsEmpty && fromIsEmpty) {
        throw "both to and from are undefined";
      } else {
        if (!toIsEmpty && !fromIsEmpty) {
          return tween;
        }
        if (toIsEmpty) {
          tween.to = getPropsFromObject(elm, tween.from);
          updateProps(elm, tween.from);
        }
        if (fromIsEmpty) {
          tween.from = getPropsFromObject(elm, tween.to);
        }
      }
      return tween;
    }

    function update(oldVnode, vnode) {
      if (!oldVnode.sel || !vnode.data.tween) return;
      var elm = vnode.elm;
      var tween = vnode.data.tween.update;
      if (tween) {
        tween = updateTweenProps(tween, vnode, oldVnode);
        createTween(elm, tween);
      }
    }

    function remove(vnode, cb) {
      var elm = vnode.elm;
      var tween = (vnode.data.tween || {}).remove;
      if (!tween) {
        stopTweens(elm);
        cb();
      } else {
        tween = updateTweenProps(tween, vnode);
        var tweenOnComplete = tween.onComplete;
        tween.onComplete = function () {
          cb();
          if (tweenOnComplete) tweenOnComplete();
        };
        createTween(elm, tween);
      }
    }

    function create(empty, vnode) {
      if (!vnode.data.tween) return;
      var elm = vnode.elm;
      var tween = vnode.data.tween.create;
      if (tween) {
        tween = updateTweenProps(tween, vnode);
        createTween(elm, tween);
      }
    }

    module.exports = { create: create, update: update, remove: remove };
  }, {}], 10: [function (require, module, exports) {
    var px = PIXI;
    var nodeTypes = {};
    nodeTypes.text = function () {
      return new px.Text("", { font: "14px Verdana", fill: "silver" });
    };
    nodeTypes.group = function () {
      return new px.Container();
    };
    nodeTypes.sprite = function () {
      return new px.Sprite(px.Texture.EMPTY);
    };

    function createElement(tagName) {
      var nodeType = nodeTypes[tagName];
      if (nodeType) {
        var node = nodeType();
        node.tagName = tagName;
        return node;
      }
      return null;
    }

    function insertBefore(parentNode, newNode, referenceNode) {
      if (referenceNode) {
        var i = parentNode.getChildIndex(referenceNode);
        parentNode.addChildAt(newNode, i);
      } else {
        parentNode.addChild(newNode);
      }
    }

    function removeChild(node, child) {
      node.removeChild(child);
      child.destroy();
    }

    function appendChild(node, child) {
      node.addChild(child);
    }

    function parentNode(node) {
      return node.parent;
    }

    function nextSibling(node) {
      var parent = node.parent;
      var i = parent.getChildIndex(node);
      var sublingIndex = i + 1;
      if (parent.children.length <= sublingIndex) return null;
      return parent.getChildAt(sublingIndex);
    }

    function tagName(node) {
      return node.tagName;
    }

    module.exports = {
      createElement: createElement,
      appendChild: appendChild,
      removeChild: removeChild,
      insertBefore: insertBefore,
      parentNode: parentNode,
      nextSibling: nextSibling,
      tagName: tagName,
      nodeTypes: nodeTypes
    };
  }, {}], 11: [function (require, module, exports) {
    var h = require('../bower_components/snabbdom/h');
    function init(thunk) {
      var cur = thunk.data;
      cur.vnode = cur.fn.call(undefined, cur.arg);
    }

    function prepatch(oldThunk, thunk) {
      var old = oldThunk.data;
      var cur = thunk.data;
      var oldArg = old.arg;
      var arg = cur.arg;
      cur.vnode = old.vnode;
      var isEqual = cur.compare ? cur.compare(arg, oldArg) : arg === oldArg;
      if (!isEqual) {
        cur.vnode = cur.fn.call(undefined, arg);
        return;
      }
    }

    module.exports = function (name, fn, arg, compare) {
      return h('thunk-' + name, {
        hook: { init: init, prepatch: prepatch },
        fn: fn,
        arg: arg,
        compare: compare
      });
    };
  }, { "../bower_components/snabbdom/h": 1 }], 12: [function (require, module, exports) {
    (function (global) {
      var px = PIXI;
      var snabbdom = require('../bower_components/snabbdom/snabbdom');
      var h = require('../bower_components/snabbdom/h');
      var thunk = require('./thunk');
      var api = require('./pixidomapi');
      var emptyPoint = new px.Point(0, 0);
      function patchPixi() {
        Object.defineProperty(px.Sprite.prototype, "src", {
          get: function get() {
            return this.baseTexture.imageUrl;
          },
          set: function set(v) {
            this.texture = v ? px.utils.TextureCache[v] : px.Texture.EMPTY;
          } });

        Object.defineProperty(px.Container.prototype, "pivotAnchor", {
          get: function get() {
            if (this.anchor) {
              return this.anchor;
            }
            return emptyPoint;
          },
          set: function set(v) {
            if (this.anchor) {
              this.anchor = v;
            } else {
              var bounds = this.getLocalBounds();
              this.pivot.x = bounds.width * v.x;
              this.pivot.y = bounds.height * v.y;
            }
          } });
      }

      patchPixi();

      var patch = snabbdom.init([require('./modules/props'), require('./modules/events'), require('./modules/tweens'), require('./modules/keyboard')], api);

      global.virtualPixi = { h: h, patch: patch, api: api, thunk: thunk };
      exports.h = h;
      exports.thunk = thunk;
      exports.api = api;
      exports.patch = patch;
    }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
  }, { "../bower_components/snabbdom/h": 1, "../bower_components/snabbdom/snabbdom": 4, "./modules/events": 6, "./modules/keyboard": 7, "./modules/props": 8, "./modules/tweens": 9, "./pixidomapi": 10, "./thunk": 11 }] }, {}, [12]);
