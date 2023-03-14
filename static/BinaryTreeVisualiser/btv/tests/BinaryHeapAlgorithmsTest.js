function checkHeapProperty(tree) {
    if(tree == null) {
        return true;
    }
    
    var root = tree.getRoot();
    
    if(root == null) {
        return true;
    }
    
    if(tree.getCount() != tree.toArray().length) { // check heap shape
        return false;
    }
    
    return checkHeapPropertyRec(root);
}

function checkHeapPropertyRec(node) {
    
    if(node.getLeft() != null && node.getRight() != null) { // both children
        if(node.getValue() < node.getLeft().getValue()) {
            alert(node + " < left: " + node.getLeft());
            return false;
        }
        if(node.getValue() < node.getRight().getValue()) {
            alert(node + " < right: " + node.getRight());
            return false;
        }
        return checkHeapPropertyRec(node.getLeft()) && checkHeapPropertyRec(node.getRight());
    }
    
    if(node.getLeft() != null) {
        if(node.getValue() < node.getLeft().getValue()) {
            alert(node + " < left: " + node.getLeft());
            return false;
        }
        return checkHeapPropertyRec(node.getLeft());
    }
    
    if(node.getRight() != null) {
        if(node.getValue() < node.getRight().getValue()) {
            alert(node + " < right: " + node.getRight());
            return false;
        }
        return returncheckHeapPropertyRec(node.getRight());
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

function randomArray(length) {
    if(length == null) {
        length = btv.getRandomInt(10, 40);
    } 
    
    var array = new Array();
    for(var i = 0; i < length; i++) {
        array.push(btv.getRandomInt(-50, 50));
    }
    
    return array;
}

function randomSortedArray(length) {

    var array = randomArray(length);
    array.sort(function(a, b) {
        return a - b;
    });
        
    return array;
}

function randomReversedSortedArray(length) {
    var array = randomSortedArray(length);
    array.reverse();
    
    return array;
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
module("RandomBHeapAlg:");
///////////////////////////////////////////////////////////

test("normal interval (min = -50, max = 50)", function() {
    expect(multiplier.count); // Synchronous Callbacks, expect(number of expected assertions)

    for(var i = 0; i < n; i++) { // test
        for(var j = 0; j < multiplier[i]; j++) { // operation
            alg = new btv.bh.RandomBHeapAlg(tree, visualiser, -50, 50, false);
            alg.redo();
            ok(checkHeapProperty(tree), "generate -> " + getValueArray(tree.toArray()));
        }
    }
});

test("small interval (min = -2, max = 2) ", function() {
    expect(multiplier[0]);

    // just one test
    for(var i = 0; i < multiplier[0]; i++) { // operation
        alg = new btv.bh.RandomBHeapAlg(tree, visualiser, -2, 2, false);
        alg.redo();
        ok(checkHeapProperty(tree), "generate -> " + getValueArray(tree.toArray()));
    }
});



///////////////////////////////////////////////////////////
module("BuildHeapAlg:");
///////////////////////////////////////////////////////////

test("from random array", function() {
    expect(multiplier.count);
    
    for(var i = 0; i < n; i++) { // test
        for(var j = 0; j < multiplier[i]; j++) { // operation
            var ra = randomArray();
            alg = new btv.bh.BuildHeapAlg(tree, visualiser, ra, false);
            alg.redo();
            ok(checkHeapProperty(tree), ra + " -> build -> " + getValueArray(tree.toArray()));
        }
    }
});

test("from sorted array - ascending order", function() {
    expect(multiplier[0]);

    // just one test
    for(var i = 0; i < multiplier[0]; i++) { // operation
        var rsa = randomSortedArray()
        alg = new btv.bh.BuildHeapAlg(tree, visualiser, rsa, false);
        alg.redo();
        ok(checkHeapProperty(tree), rsa + " -> build -> " + getValueArray(tree.toArray()));
    }
});

test("from sorted array - descending order", function() {
    expect(multiplier[0]);

    // just one test
    for(var i = 0; i < multiplier[0]; i++) { // operation
        var rrsa = randomReversedSortedArray();
        alg = new btv.bh.BuildHeapAlg(tree, visualiser, rrsa, false);
        alg.redo();
        ok(checkHeapProperty(tree), rrsa + " -> build -> " + getValueArray(tree.toArray()));
    }
});



///////////////////////////////////////////////////////////
module("InsertAlg:");
///////////////////////////////////////////////////////////

test("random values to empty heap", function() {
    expect(n);

    for(var i = 0; i < n; i++) { // test
        tree.setRoot(null);

        var values = new Array();
        for(var j = 0; j < multiplier[i]; j++) { // operation
            
            values[j] = btv.getRandomInt(-50, 50);
            alg = new btv.bh.InsertAlg(tree, visualiser, values[j], false);
            alg.redo();
        }
       
        ok(checkHeapProperty(tree), "insert: " + values + " -> " + getValueArray(tree.toArray()));
    }
});



///////////////////////////////////////////////////////////
module("DeleteAlg:");
///////////////////////////////////////////////////////////

test("random nodes from random heap", function() {
    expect(n + multiplier.count);

    for(var i = 0; i < n; i++) { // test
        alg = new btv.bh.RandomBHeapAlg(tree, visualiser, -50, 50, false);
        alg.redo();
        for(var j = 0; j < multiplier[i]; j++) { // insert additional values, provide enought nodes to deletion
            alg = new btv.bh.InsertAlg(tree, visualiser, btv.getRandomInt(-50, 50), false);
            alg.redo();
        }
        
        var va = getValueArray(tree.toArray());
        
        var nodes = new Array();
        for(j = 0; j < multiplier[i]; j++) { // operation
            nodes[j] = tree.getNode(btv.getRandomInt(0, tree.getCount() - 1));
            alg = new btv.bh.DeleteAlg(tree, visualiser, nodes[j], false);
            alg.redo();
        }
        
        var nva = getValueArray(tree.toArray());
        
        ok(checkHeapProperty(tree), va + " -> delete: " + getValueArray(nodes) + " -> " + nva);
        for(j = 0; j < nodes.length; j++) {
            ok(nva.indexOf(nodes[j].getValue() == -1), nodes[j].getValue() + " deleted");
        }
    }
});



///////////////////////////////////////////////////////////
module("HeapSortAlg:");
///////////////////////////////////////////////////////////

test("random heap", function() {
    expect(2*multiplier.count);

    for(var i = 0; i < n; i++) { // test
        for(var j = 0; j < multiplier[i]; j++) { // operation
            alg = new btv.bh.RandomBHeapAlg(tree, visualiser, -50, 50, false);
            alg.redo();
            for(var k = 0; k < multiplier[i]; k++) { // insert additional values, values can repeat
                alg = new btv.bh.InsertAlg(tree, visualiser, btv.getRandomInt(-50, 50), false);
                alg.redo();
            }            
        
            var va = getValueArray(tree.toArray());
            var sva = getValueArray(tree.toInorderArray()).sort(function(a, b)  {
                return a - b;
            });
        
            alg = new btv.bh.HeapSortAlg(tree, visualiser, false);
            var array = alg.redo();
        
            ok(checkHeapProperty(tree), va + " -> heap sort -> " + getValueArray(tree.toArray()));
            strictEqual(getValueArray(array).toString(), sva.toString(), "sorted = " + getValueArray(array)); // @TODO why theese array are different if not converted to string
        }
    }
});
