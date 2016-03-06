var px = PIXI;
var vp = require("../../src/virtualpixi.js");
var h = vp.h;

function createRenderer(){
  var renderer = px.autoDetectRenderer(100, 20);
  document.body.appendChild(renderer.view);
  renderer.view.style ="margin-right:10px;";
  return renderer;
}

function example(node1, node2) {
  node1 = h("group", {}, node1 ? [node1] : []);
  var renderer1 = createRenderer();
  var root1 = vp.api.createElement("group");
  vp.patch(root1, node1);
  renderer1.render(root1);

  node2 = h("group", {}, node2 ? [node2] : []);
  var renderer2 = createRenderer();
  var root2 = vp.api.createElement("group");
  var updatedNode = vp.patch(root2, node1);
  vp.patch(updatedNode, node2);
  renderer2.render(root2);
  document.body.appendChild(document.createElement("br"));
}

function propsUpdate(){
  example(
    h("text", {props: {text: "text1"}} ),
    h("text", {props: {text: "text2"}} ));
}

function complexPropsUpdate(){
  example(
    h("text", {props: {text: "text1", style : {fill: "Yellow", font: "12px Verdana"} }} ),
    h("text", {props: {text: "text2", style : {fill: "Green",font: "16px Verdana"} }} ));
}

function remove(){
  example(
    h("text", {props: {text: "text1"}} ),
    null);
}

function eventChange(){
  example(
    h("text", {props : {text: "Click"}, on: {click:() => log("click")}} ),
    h("text", {props : {text: "Click2"}, on: {click:() => log("click2")}} ));
}

function eventRemove(){
  example(
    h("text", {props : {text: "Click"}, on: {click:() => log("click")}} ),
    h("text", {props : {text: "No Clicks"}} ));
}

propsUpdate();
complexPropsUpdate();
eventChange();
eventRemove();
