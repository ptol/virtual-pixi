function updateEventListeners(oldVnode, vnode) {
  var elm = vnode.elm;
  var on = vnode.data.on || {};
  elm.removeAllListeners();
	elm.interactive = false;
  Object.keys(on).forEach(name => {
		elm.interactive = true;
    elm.on(name, function(event){
      event.stopPropagation();
      on[name]();
    });
  });
}

module.exports = {create: updateEventListeners, update: updateEventListeners};
