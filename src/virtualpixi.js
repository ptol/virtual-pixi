var px = PIXI;
var snabbdom = require('../bower_components/snabbdom/snabbdom');
var h = require('../bower_components/snabbdom/h');
var thunk = require('./thunk');
var api = require('./pixidomapi');
var emptyPoint = new px.Point(0,0);
function patchPixi(){
  Object.defineProperty(px.Sprite.prototype, "src", {
    get: function() { return this.baseTexture.imageUrl;},
    set: function(v){
      this.texture = v ? px.utils.TextureCache[v] : px.Texture.EMPTY;
    }});

  Object.defineProperty(px.Container.prototype, "pivotAnchor", {
    get: function() {
      if(this.anchor){
        return this.anchor;
      }
      return emptyPoint;
    },
    set: function(v){
      if(this.anchor){
        this.anchor = v;
      }else{
        var bounds = this.getLocalBounds();
        this.pivot.x = bounds.width*v.x;
        this.pivot.y = bounds.height*v.y;
      }
    }});

}

patchPixi();


var patch = snabbdom.init([
  require('./modules/props'),
  require('./modules/events'),
  require('./modules/tweens'),
  require('./modules/keyboard')
], api);

global.virtualPixi = {h: h, patch: patch, api: api, thunk: thunk};
exports.h = h;
exports.thunk = thunk;
exports.api = api;
exports.patch = patch;
