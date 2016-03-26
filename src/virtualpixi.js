var px = PIXI;
var snabbdom = require('../bower_components/snabbdom/snabbdom');
var h = require('../bower_components/snabbdom/h');
var api = require('./pixidomapi');
var emptyPoint = new px.Point(0,0);
function patchPixi(){
  Object.defineProperty(px.Sprite.prototype, "src", {
    get: function() { return this.baseTexture.imageUrl;},
    set: function(v){
      this.texture = v ? px.Texture.fromImage(v) : px.Texture.EMPTY;
    }});

  Object.defineProperty(px.Container.prototype, "pivotAnchor", {
    get: function() {
      return emptyPoint;
    },
    set: function(v){
      var bounds = this.getLocalBounds();
      this.pivot.x = bounds.width*v.x;
      this.pivot.y = bounds.height*v.y;
    }});

  Object.defineProperty(px.Sprite.prototype, "pivotAnchor", {
    get: function() {
      return this.anchor;
    },
    set: function(v){
      this.anchor = v;
    }});

}

patchPixi();


var patch = snabbdom.init([
  require('./modules/props'),
  require('./modules/events'),
  require('./modules/tweens'),
  require('./modules/keyboard')
], api);

global.virtualPixi = {h: h, patch: patch, api: api};
exports.h = h;
exports.api = api;
exports.patch = patch;
