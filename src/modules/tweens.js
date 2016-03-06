var elmKey = "elm";
function stopTweens(elm){
  if(elm.vptweens){
    elm.vptweens.forEach(x => x.stop());
  }
}
function createTween(elm, td){
  stopTweens(elm);
  var props = getPropsToTween(td);
  elm.vptweens = [];
  var first = true;
  for(var key in props){
    var tween = createKeyTween(elm, props[key], td.duration, key);
    elm.vptweens.push(tween);
    if(first){
      function onComplete(){
        delete elm.vptweens;
        if(td.onComplete) td.onComplete();
      }
      tween.onComplete(onComplete);
      tween.onStop(onComplete);
      first = false;
    }
  }
  elm.vptweens.forEach(x => x.start());
}

function createKeyTween(elm, obj, duration, key){
  var tween = new TWEEN.Tween(obj.from);
  tween.to(obj.to, duration);
  tween.onUpdate(function(){
    updateProps(key == elmKey ? elm : elm[key], this);
  });
  return tween;
}

function isObject(obj) {
  return obj === Object(obj);
}

function getPropsToTween(tween){
  var from = tween.from;
  var to = tween.to;
  var props = {};
  for(var key in from){
    var v = from[key];
    if(isObject(v)){
      props[key] = {from: v, to: to[key]};
      delete from[key];
      delete to[key];
    }
  }
  if(!isEmpty(from)){
    props[elmKey] = {from: from, to: to};
  }
  return props;
}

function cloneObject(obj){
  if (!isObject(obj)) return obj;
    var result = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) result[key] = cloneObject(obj[key]);
    }
    return result;
}

function getPropsFromObject(obj, props){
  var result = {};
  var keys = Array.isArray(props) ? props : Object.keys(props);
  keys.forEach(key => {
    result[key] = cloneObject(obj[key]);
  });
  return result;
}

function updateProps(elm, props){
  for(var key in props){
    elm[key] = cloneObject(props[key]);
  }
}

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
      return false;
  }
  return true;
}


function updateTweenProps(tween, vnode, oldVnode){
  tween = cloneObject(tween);
  var elm = vnode.elm;
  var toIsEmpty = isEmpty(tween.to);
  var fromIsEmpty = isEmpty(tween.from);
  if(toIsEmpty && fromIsEmpty){
    throw "both to and from are undefined";
  }else{
    if(!toIsEmpty && !fromIsEmpty){
      return tween;
    }
    if(toIsEmpty){
      tween.to = getPropsFromObject(elm, tween.from);
      updateProps(elm, tween.from);
    }
    if(fromIsEmpty){
      tween.from = getPropsFromObject(elm, tween.to);
    }
  }
  return tween;

}

function update(oldVnode, vnode) {
  if(!oldVnode.sel || !vnode.data.tween) return;
  var elm = vnode.elm;
  var tween = vnode.data.tween.update;
  if(tween){
    tween = updateTweenProps(tween, vnode, oldVnode);
    createTween(elm, tween);
  }
}

function remove(vnode, cb){
  var elm = vnode.elm;
  var tween = (vnode.data.tween || {}).remove;
  if(!tween){
    stopTweens(elm);
    cb();
  }else{
    tween = updateTweenProps(tween, vnode);
    var tweenOnComplete = tween.onComplete;
    tween.onComplete = () => {
      cb();
      if(tweenOnComplete) tweenOnComplete();
    };
    createTween(elm, tween);
  }
}

function create(empty, vnode) {
  if(!vnode.data.tween) return;
  var elm = vnode.elm;
  var tween = vnode.data.tween.create;
  if(tween){
    tween = updateTweenProps(tween, vnode);
    createTween(elm, tween);
  }
}

module.exports = {create: create, update: update, remove: remove};
