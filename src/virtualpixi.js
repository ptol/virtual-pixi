var px = PIXI;
var snabbdom = require('../bower_components/snabbdom/snabbdom');
var h = require('../bower_components/snabbdom/h');
var api = require('./pixidomapi');

function patchPixi(){
  Object.defineProperty(px.Sprite.prototype, "src", {
    get: function() { return this.baseTexture.imageUrl;},
    set: function(v){
      this.texture = v ? px.Texture.fromImage(v) : px.Texture.EMPTY;
    }});
}

patchPixi();


var patch = snabbdom.init([
  require('./modules/props'),
  require('./modules/events'),
  require('./modules/tweens')
], api);

global.virtualPixi = {h: h, patch: patch, api: api};
exports.h = h;
exports.api = api;
exports.patch = patch;