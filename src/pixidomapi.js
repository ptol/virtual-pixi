var px = PIXI;
var nodeTypes = {};
nodeTypes.text = () => new px.Text("", {font: "14px Verdana", fill: "silver"});
nodeTypes.group = () => new px.Container();
nodeTypes.sprite = () => new px.Sprite(px.Texture.EMPTY);


function createElement(tagName){
  var nodeType = nodeTypes[tagName];
  if(nodeType){
    var node = nodeType();
    node.tagName = tagName;
    return node;
  }
  return null;
}

function insertBefore(parentNode, newNode, referenceNode){
    if(referenceNode){
      var i = parentNode.getChildIndex(referenceNode);
      parentNode.addChildAt(newNode,i);
    }else{
      parentNode.addChild(newNode);
    }
}

function removeChild(node, child){
  node.removeChild(child);
  child.destroy();
}

function appendChild(node, child){
  node.addChild(child);
}

function parentNode(node){
  return node.parent;
}

function nextSibling(node){
  var parent = node.parent;
  var i = parent.getChildIndex(node);
  var sublingIndex = i + 1;
  if(parent.children.length <= sublingIndex) return null;
  return parent.getChildAt(sublingIndex);
}

function tagName(node){
  return node.tagName;
}

module.exports = {
  createElement: createElement,
  appendChild: appendChild,
  removeChild: removeChild,
  insertBefore: insertBefore,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  nodeTypes: nodeTypes
};
