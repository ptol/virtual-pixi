var mt = Mousetrap;

function updateKeys(oldVnode, vnode) {
  var oldKeyboard = oldVnode.data.keyboard || {};
  var keyboard = vnode.data.keyboard || {};
  var keys = Object.keys(oldKeyboard).concat(Object.keys(keyboard));
  keys.forEach(key => {
    var isOld = oldKeyboard[key];
    var isNew = keyboard[key];
    if(!isOld || !isNew){
      if(isOld){
        mt.unbind(key);
      }
      if(isNew){
        mt.bind(key, function(event){
          isNew.callback();
        }, isNew.action);
      }
    }
  });
}

module.exports = {create: updateKeys, update: updateKeys};
