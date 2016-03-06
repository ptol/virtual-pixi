var px = PIXI;
var vp = require("../../src/virtualpixi.js");
var h = vp.h;

function createRenderer(){
  var renderer = px.autoDetectRenderer(150, 150);
  renderer.view.style = "margin-right:20px";
  document.body.appendChild(renderer.view);
  return renderer;
}

function cloneObject(obj){
  if (!obj || typeof obj != "object") return obj;
  var result = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) result[key] = obj[key];
  }
  return result;
}


var renders = [];

function example(node1, node2) {
  var renderer = createRenderer();
  var root = vp.api.createElement("group");
  root.hitArea = new px.Rectangle(0, 0, 150, 150);
  var node = h("group", {on:{click: renderSecond}}, node1 ? [cloneObject(node1)] : []);
  var currentNode = vp.patch(root, node);
  renders.push(() => renderer.render(root));
  var second = true;

  renderSecond();
  function renderSecond(){
    var nextNode = second ? node2 : node1;
    var node = h("group", {on:{click: renderSecond}}, nextNode ? [cloneObject(nextNode)] : []);
    currentNode = vp.patch(currentNode, node);
    second = !second;
  }

}


function getSquare(y, color) {
  return {text: "\u25A0", y: y, x: 60, style : {fill: color || "Yellow", font: "40px Verdana"} };
}

var square = getSquare(0);
var bottom = 100;

function create(){
  example(
    null,
    h("text", {props: square, tween:{create:{to:{y: bottom}, duration: 1000}}}));
}


function remove(){
  example(
    h("text", {props: square, tween:{remove:{to:{y: bottom}, duration: 1000}}}),
    null);
}


function update(){
  example(
    h("text", {props: square, tween:{update:{to:{y: 0.0}, duration: 1000}}}),
    h("text", {props: square, tween:{update:{to:{y: bottom}, duration: 1000}}}));
}

function sort(){
  function view(list){
    return list.map((x,i) =>
                    h("text", {key: x.key, props: getSquare(null, x.color), tween:{update:{to: {y: i*bottom/2}, duration: 1000}}})
                   );
  }
  var list = [{key: 3, color: "Orange"}, {key: 1, color: "Yellow"}, {key: 2, color: "Green"}];
  var view1 = view(list);
  list.sort((x,y) => x.key - y.key);
  var view2 = view(list);
  example(
    h("group", {}, view1),
    h("group", {}, view2));
}


function objectProps(){
  example(
    null,
    h("text", {props: getSquare(bottom), tween:{create:{from:{scale: {x:0, y:0}, y:0}, duration: 1000}}}));
}

create();
remove();
update();
sort();
objectProps();

requestAnimationFrame(animate);
function animate(time) {
  requestAnimationFrame(animate);
  TWEEN.update(time);
  renders.forEach(x => x());
}
