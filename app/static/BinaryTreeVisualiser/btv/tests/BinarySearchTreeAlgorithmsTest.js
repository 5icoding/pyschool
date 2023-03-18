function checkSearchTreeProperty(tree) {
    if(tree == null) {
        return true;
    }
    
    var root = tree.getRoot();
    
    if(root == null) {
        return true;
    }
    
    return checkSearchTreePropertyRec(root);
}

function checkSearchTreePropertyRec(node) {
    
    if(node.getLeft() != null && node.getRight() != null) { // both children
        if(node.getLeft().getValue() >= node.getValue()) {
            alert("left: " + node.getLeft() + " >= " + node);
            return false;
        }
        if(node.getRight().getValue() < node.getValue()) {
            alert("right: " + node.getRight() + " < " + node);
            return false;
        }
        return checkSearchTreePropertyRec(node.getLeft()) && checkSearchTreePropertyRec(node.getRight());
    }
    
    if(node.getLeft() != null) {
        if(node.getLeft().getValue() >= node.getValue()) {
            alert("left: " + node.getLeft() + " >= " + node);
            return false;
        }
        return checkSearchTreePropertyRec(node.getLeft());
    }
    
    if(node.getRight() != null) {
        if(node.getRight().getValue() < node.getValue()) {
            alert("right: " + node.getRight() + " < " + node);
            return false;
        }
        return checkSearchTreePropertyRec(node.getRight());
    }
    
    return true; // no child
}

function getValueArray(array) {
    
    var valueArray = new Array();
    for(var i = 0; i < array.length; i++) {
        if(array[i] != null) {
            valueArray[i] = array[i].getValue();
        } else {
            valueArray[i] = "__";
        }
    }
    
    return valueArray;
}


var tree = controller.tree;
var visualiser = controller.visualiser;
var alg;
var n = 1; // number of test repetition
var multiplier = new Array(); // number of operation in appropriate test
multiplier.count = 0; // sum of test
for(var c = 0; c < n; c++) {
    multiplier[c] = btv.getRandomInt(5, 30);
    multiplier.count += multiplier[c];
}


///////////////////////////////////////////////////////////
module("RandomBSTreeAlg:");
///////////////////////////////////////////////////////////

test("normal interval (min = -50, max = 50)", function() {
    expect(multiplier.count); // Synchronous Callbacks, expect(number of expected assertions)
    for(var i = 0; i < n; i++) { // test
        for(var j = 0; j < multiplier[i]; j++) {
            alg = new btv.bst.RandomBSTreeAlg(tree, visualiser, -50, 50, false);
            alg.redo();
            ok(checkSearchTreeProperty(tree), "generate -> " + getValueArray(tree.toArray()));
        }
    }
});

test("small interval (min = -2, max = 2) ", function() {
    expect(multiplier[0]);
    
    // just one test
    for(var i = 0; i < multiplier[0]; i++) { // operation
        alg = new btv.bst.RandomBSTreeAlg(tree, visualiser, -2, 2, false);
        alg.redo();
        ok(checkSearchTreeProperty(tree), "generate -> " + getValueArray(tree.toArray()));
    }
});



///////////////////////////////////////////////////////////
module("InsertAlg:");
///////////////////////////////////////////////////////////

test("random values to empty tree", function() {
    expect(n);
    
    for(var i = 0; i < n; i++) { // test
        tree.setRoot(null);
        
        var values = new Array();
        for(var j = 0; j < multiplier[i]; j++) { // operation
            
            values[j] = btv.getRandomInt(-50, 50);
            alg = new btv.bst.InsertAlg(tree, visualiser, values[j], false);
            alg.redo();
        }
        
        ok(checkSearchTreeProperty(tree), "insert: " + values + " -> " + getValueArray(tree.toArray()));
    }
});

///////////////////////////////////////////////////////////
module("FindAlg:");
///////////////////////////////////////////////////////////

test("random values in random tree", function() {
    expect(n + multiplier.count);
    
    for(var i = 0; i < n; i++) { // test
        alg = new btv.bst.RandomBSTreeAlg(tree, visualiser, -50, 50, false);
        alg.redo();
        for(var j = 0; j < multiplier[i]; j++) { // insert additional values, values can repeat
            alg = new btv.bst.InsertAlg(tree, visualiser, btv.getRandomInt(-50, 50), false);
            alg.redo();
        }        
        
        var va = getValueArray(tree.toArray());
        
        var values = new Array();
        var returnValues = new Array();
        for(j = 0; j < multiplier[i]; j++) { // operation
            
            values[j] = btv.getRandomInt(-50, 50);
            alg = new btv.bst.FindAlg(tree, visualiser, values[j], false);
            returnValues[j] = alg.redo();
        }
        
        ok(checkSearchTreeProperty(tree), va + " -> find: " + values + " -> " + getValueArray(tree.toArray()));
        for(j = 0; j < values.length; j++) {
            var index = va.indexOf(values[j]);
            strictEqual(returnValues[j] != null ? returnValues[j].getValue() : null, index != -1 ? va[index] : null, 
                values[j] + (returnValues[j] == null ? " not found" : " found"));
        }
    }
});

///////////////////////////////////////////////////////////
module("DeleteAlg:");
///////////////////////////////////////////////////////////

test("random nodes from random tree", function() {
    expect(n + multiplier.count);
    
    for(var i = 0; i < n; i++) {
        alg = new btv.bst.RandomBSTreeAlg(tree, visualiser, -50, 50, false);
        alg.redo();
        for(var j = 0; j < multiplier[i]; j++) { // insert additional values, provide enought nodes to deletion, values can repeat
            alg = new btv.bst.InsertAlg(tree, visualiser, btv.getRandomInt(-50, 50), false);
            alg.redo();
        }        
        
        var va = getValueArray(tree.toArray());
        
        var nodes = new Array();
        for(j = 0; j < multiplier[i]; j++) {
            do {
                nodes[j] = tree.getNode(btv.getRandomInt(0, tree.getCount() - 1));
            } while(nodes[j] == null);
            alg = new btv.bst.DeleteAlg(tree, visualiser, nodes[j], false);
            alg.redo();
        }
        
        var nva = getValueArray(tree.toArray());
        
        ok(checkSearchTreeProperty(tree), va + " -> delete: " + getValueArray(nodes) + " -> " + getValueArray(tree.toArray()));
        for(j = 0; j < nodes.length; j++) {
            ok(nva.indexOf(nodes[j].getValue() == -1), nodes[j].getValue() + " deleted");
        }        
    }
});



///////////////////////////////////////////////////////////
module("GetMaxAlg:");
///////////////////////////////////////////////////////////

test("of random tree", function() {
    expect(2*multiplier.count);
    
    for(var i = 0; i < n; i++) { // test
        for(var j = 0; j < multiplier[i]; j++) { // operation
            alg = new btv.bst.RandomBSTreeAlg(tree, visualiser, -50, 50, false);
            alg.redo();
            for(var k = 0; k < multiplier[i]; k++) { // insert additional values, values can repeat
                alg = new btv.bst.InsertAlg(tree, visualiser, btv.getRandomInt(-50, 50), false);
                alg.redo();
            }              
            
            var va = getValueArray(tree.toArray());
            var sva = getValueArray(tree.toInorderArray());
            
            alg = new btv.bst.GetMaxAlg(tree, visualiser, tree.getRoot(), false);
            var returnValue = alg.redo();
            
            ok(checkSearchTreeProperty(tree), va + " -> get max -> " + getValueArray(tree.toArray()));
            strictEqual(returnValue.getValue(), sva[sva.length-1], "max = " + sva[sva.length-1] + " (sorted: " + sva + ")");
        }
    }    
});



///////////////////////////////////////////////////////////
module("GetMinAlg:");
///////////////////////////////////////////////////////////

test("of random tree", function() {
    expect(2*multiplier.count);
    
    for(var i = 0; i < n; i++) { // test
        for(var j = 0; j < multiplier[i]; j++) { // operation
            alg = new btv.bst.RandomBSTreeAlg(tree, visualiser, -50, 50, false);
            alg.redo();
            for(var k = 0; k < multiplier[i]; k++) { // insert additional values, values can repeat
                alg = new btv.bst.InsertAlg(tree, visualiser, btv.getRandomInt(-50, 50), false);
                alg.redo();
            }              
            
            var va = getValueArray(tree.toArray());
            var sva = getValueArray(tree.toInorderArray());       
            
            alg = new btv.bst.GetMinAlg(tree, visualiser, tree.getRoot(), false);
            var returnValue = alg.redo();
            
            ok(checkSearchTreeProperty(tree), va + " -> get min -> " + getValueArray(tree.toArray()));
            strictEqual(returnValue.getValue(), sva[0], "min = " + sva[0] + " (sorted: " + sva + ")");
        }
    }
});



///////////////////////////////////////////////////////////
module("GetPredecessorAlg:");
///////////////////////////////////////////////////////////

function checkPredecessor(srcV, predV, sva) { // sourceValue, predecessorValue, sortedValueArray
    var fi = sva.indexOf(srcV); // firstIndex
        
    if(predV == null) {
        return (fi == 0 ? true : false);
    }
        
    if(fi != sva.lastIndexOf(srcV)) { // srcV multiple times in sva
        if(predV == sva[fi]) {
            return true;
        }
    }
    
    if(predV == sva[fi-1]) {
        return true;
    }
    
    return false;
}

test("of random nodes from random tree", function() {
    expect(2*multiplier.count);
    
    for(var i = 0; i < n; i++) { // test
        alg = new btv.bst.RandomBSTreeAlg(tree, visualiser, -50, 50, false);
        alg.redo();
        for(var j = 0; j < multiplier[i]; j++) { // insert additional values, values can repeat
            alg = new btv.bst.InsertAlg(tree, visualiser, btv.getRandomInt(-50, 50), false);
            alg.redo();
        }
        
        var va = getValueArray(tree.toArray());
        var sva = getValueArray(tree.toInorderArray());
        
        var nodes = new Array();
        var returnValues = new Array();
        for(j = 0; j < multiplier[i]; j++) { // operation
            do {
                nodes[j] = tree.getNode(btv.getRandomInt(0, tree.getCount() - 1));
            } while(nodes[j] == null);
            
            alg = new btv.bst.GetPredecessorAlg(tree, visualiser, nodes[j], false);
            returnValues[j] = alg.redo();
            
            ok(checkSearchTreeProperty(tree), va + " -> get predecessor (" + nodes[j].getValue() + ") -> " + getValueArray(tree.toArray()));
            var index = sva.lastIndexOf(nodes[j].getValue());
            //strictEqual(returnValues[j] != null ? returnValues[j].getValue() : null, index >= 1 ? sva[index - 1] : null, "predecessor = " + (returnValues[j] != null ? returnValues[j].getValue() : "null") + " (sorted: " + sva + ")");
            ok(checkPredecessor(nodes[j].getValue(), returnValues[j] != null ? returnValues[j].getValue() : null, sva), "predecessor = " + (returnValues[j] != null ? returnValues[j].getValue() : "null") + " (sorted: " + sva + ")");
        }
    }
});



///////////////////////////////////////////////////////////
module("GetSuccessorAlg:");
///////////////////////////////////////////////////////////

function checkSuccessor(srcV, sucV, sva) { // sourceValue, predecessorValue, sortedValueArray
    var li = sva.lastIndexOf(srcV); // lastIndex
    
    if(sucV == null) {
        return (li == sva.length-1 ? true : false);
    }
        
    if(sva.indexOf(srcV) != li) { // srcV multiple times in sva
        if(sucV == sva[li]) {
            return true;
        }
    }
    
    if(sucV == sva[li+1]) {
        return true;
    }
    
    return false;
}

test("of random nodes from random tree", function() {
    expect(2*multiplier.count);
    
    for(var i = 0; i < n; i++) {
        alg = new btv.bst.RandomBSTreeAlg(tree, visualiser, -50, 50, false);
        alg.redo();
        for(var j = 0; j < multiplier[i]; j++) { // insert additional values, values can repeat
            alg = new btv.bst.InsertAlg(tree, visualiser, btv.getRandomInt(-50, 50), false);
            alg.redo();
        }
        
        var va = getValueArray(tree.toArray());
        var sva = getValueArray(tree.toInorderArray());
        
        var nodes = new Array();
        var returnValues = new Array();
        for(j = 0; j < multiplier[i]; j++) {
            do {
                nodes[j] = tree.getNode(btv.getRandomInt(0, tree.getCount() - 1));
            } while(nodes[j] == null);
            
            alg = new btv.bst.GetSuccessorAlg(tree, visualiser, nodes[j], false);
            returnValues[j] = alg.redo();
            
            ok(checkSearchTreeProperty(tree), va + " -> get predecessor (" + nodes[j].getValue() + ") -> " + getValueArray(tree.toArray()));
            var index = sva.indexOf(nodes[j].getValue());
            //strictEqual(returnValues[j] != null ? returnValues[j].getValue() : null, index < sva.length - 1 ? sva[index + 1] : null, "successor = " + (returnValues[j] != null ? returnValues[j].getValue() : "null") + " (sorted: " + sva + ")");
            ok(checkSuccessor(nodes[j].getValue(), returnValues[j] != null ? returnValues[j].getValue() : null, sva) , "successor = " + (returnValues[j] != null ? returnValues[j].getValue() : "null") + " (sorted: " + sva + ")");
        }
    }
});



///////////////////////////////////////////////////////////
module("ToInorderArrayAlg:");
///////////////////////////////////////////////////////////

test("random tree", function() {
    expect(2*multiplier.count);

    for(var i = 0; i < n; i++) { // test
        for(var j = 0; j < multiplier[i]; j++) { // operation
            alg = new btv.bst.RandomBSTreeAlg(tree, visualiser, -50, 50, false);
            alg.redo();
            for(var k = 0; k < multiplier[i]; k++) { // insert additional values, values can repeat
                alg = new btv.bst.InsertAlg(tree, visualiser, btv.getRandomInt(-50, 50), false);
                alg.redo();
            }            
        
            var va = getValueArray(tree.toArray());
            var sva = getValueArray(tree.toInorderArray());
        
            alg = new btv.bst.ToInorderArrayAlg(tree, visualiser, false);
            var array = alg.redo();
        
            ok(checkSearchTreeProperty(tree), va + " -> to inorder array -> " + getValueArray(tree.toArray()));
            strictEqual(getValueArray(array).toString(), sva.toString(), "sorted = " + getValueArray(array)); // @TODO why theese array are different if not converted to string
        }
    }
});
