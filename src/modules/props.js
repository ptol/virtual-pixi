function updateProps(oldVnode, vnode) {
  var elm = vnode.elm;
  var oldProps = oldVnode.data.props || {};
  var props = vnode.data.props || {};
  for (key in oldProps) {
    if (!props[key]) {
      delete elm[key];
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

module.exports = {create: updateProps, update: updateProps};
