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

module.exports = function(name, fn, arg, compare) {
  return h('thunk-' + name, {
    hook: {init: init, prepatch: prepatch},
    fn: fn,
    arg: arg,
    compare: compare
  });
};
