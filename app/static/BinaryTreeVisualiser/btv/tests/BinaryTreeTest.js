
function chceckNodeReferences(testedNode, expectedParent, expectedLeft, expectedRight) {
    if(testedNode.getParent() !== expectedParent
        || testedNode.getLeft() !== expectedLeft
        || testedNode.getRight() !== expectedRight) {
        return false;
    } else {
        return true;
    }
}

nr = new btv.BinaryTreeNode(0);
n1 = new btv.BinaryTreeNode(1);
n2 = new btv.BinaryTreeNode(2);
n3 = new btv.BinaryTreeNode(3);
n4 = new btv.BinaryTreeNode(4);
n5 = new btv.BinaryTreeNode(5);
n6 = new btv.BinaryTreeNode(6);
n7 = new btv.BinaryTreeNode(7);
n8 = new btv.BinaryTreeNode(8);
n9 = new btv.BinaryTreeNode(9);



///////////////////////////////////////////////////////////
module("Set child:");
///////////////////////////////////////////////////////////

test("parent.setLeft(child) - parent has no left child, child has no parent", function() {
    expect(2); // Synchronous Callbacks, expect(number of expected assertions)
    
    nr.setLeft(n1);
    
    ok(chceckNodeReferences(nr, null, n1, null));
    ok(chceckNodeReferences(n1, nr, null, null));
});

test("parent.setRight(child) - parent has no right child, child has no parent", function() {
    expect(3);
    
    nr.setRight(n2);
    
    ok(chceckNodeReferences(nr, null, n1, n2));
    ok(chceckNodeReferences(n1, nr, null, null));
    ok(chceckNodeReferences(n2, nr, null, null));
});

test("parent.setLeft(child) - parent has a left child, child has no parent", function() {
    expect(4);
    
    nr.setLeft(n3);
    
    ok(chceckNodeReferences(nr, null, n3, n2));
    ok(chceckNodeReferences(n1, null, null, null));
    ok(chceckNodeReferences(n2, nr, null, null));
    ok(chceckNodeReferences(n3, nr, null, null));
});

test("parent.setRight(child) - parent has a right child, child has no parent", function() {
    
    expect(5);
    
    nr.setRight(n4);
    
    ok(chceckNodeReferences(nr, null, n3, n4));
    ok(chceckNodeReferences(n1, null, null, null));
    ok(chceckNodeReferences(n2, null, null, null));
    ok(chceckNodeReferences(n3, nr, null, null));
    ok(chceckNodeReferences(n4, nr, null, null));
});

test("parent.setLeft(child) - parent has no left child, child has a parent", function() {
    
    expect(5);
    
    n1.setLeft(n2);
    n3.setLeft(n2);
    
    ok(chceckNodeReferences(nr, null, n3, n4));
    ok(chceckNodeReferences(n1, null, null, null));
    ok(chceckNodeReferences(n2, n3, null, null));
    ok(chceckNodeReferences(n3, nr, n2, null));
    ok(chceckNodeReferences(n4, nr, null, null));
});

test("parent.setRight(child) - parent has no right child, child has a parent", function() {
    
    expect(7);
    
    n5.setRight(n6);
    n4.setRight(n6);
    
    ok(chceckNodeReferences(nr, null, n3, n4));
    ok(chceckNodeReferences(n1, null, null, null));
    ok(chceckNodeReferences(n2, n3, null, null));
    ok(chceckNodeReferences(n3, nr, n2, null));
    ok(chceckNodeReferences(n4, nr, null, n6));
    ok(chceckNodeReferences(n5, null, null, null));
    ok(chceckNodeReferences(n6, n4, null, null));
});

test("parent.setLeft(child) - parent has a left child, child has a parent", function() {
    
    expect(7);
    
    n5.setRight(n1);
    n3.setLeft(n1);
    
    ok(chceckNodeReferences(nr, null, n3, n4));
    ok(chceckNodeReferences(n1, n3, null, null));
    ok(chceckNodeReferences(n2, null, null, null));
    ok(chceckNodeReferences(n3, nr, n1, null));
    ok(chceckNodeReferences(n4, nr, null, n6));
    ok(chceckNodeReferences(n5, null, null, null));
    ok(chceckNodeReferences(n6, n4, null, null));
});

test("parent.setRight(child) - parent has a right child, child has a parent", function() {
    
    expect(7);
    
    n5.setRight(n2);
    n4.setRight(n2);
    
    ok(chceckNodeReferences(nr, null, n3, n4));
    ok(chceckNodeReferences(n1, n3, null, null));
    ok(chceckNodeReferences(n2, n4, null, null));
    ok(chceckNodeReferences(n3, nr, n1, null));
    ok(chceckNodeReferences(n4, nr, null, n2));
    ok(chceckNodeReferences(n5, null, null, null));
    ok(chceckNodeReferences(n6, null, null, null));
});

test("parent.setLeft(node), parent.setRight(node) - node with childs", function() {
    
    expect(10);
    
    n7.setLeft(n8);
    n7.setRight(n9);
    n5.setLeft(n6);
    n5.setRight(n7);
    n4.setLeft(n5);
    
    ok(chceckNodeReferences(nr, null, n3, n4));
    ok(chceckNodeReferences(n1, n3, null, null));
    ok(chceckNodeReferences(n2, n4, null, null));
    ok(chceckNodeReferences(n3, nr, n1, null));
    ok(chceckNodeReferences(n4, nr, n5, n2));
    ok(chceckNodeReferences(n5, n4, n6, n7));
    ok(chceckNodeReferences(n6, n5, null, null));
    ok(chceckNodeReferences(n7, n5, n8, n9));
    ok(chceckNodeReferences(n8, n7, null, null));
    ok(chceckNodeReferences(n9, n7, null, null));
});

test("parent.setLeft(node), parent.setRight(node) - node is null", function() {
    
    expect(10);
    
    n5.setLeft(null);
    n5.setRight(null);
    
    ok(chceckNodeReferences(nr, null, n3, n4));
    ok(chceckNodeReferences(n1, n3, null, null));
    ok(chceckNodeReferences(n2, n4, null, null));
    ok(chceckNodeReferences(n3, nr, n1, null));
    ok(chceckNodeReferences(n4, nr, n5, n2));
    ok(chceckNodeReferences(n5, n4, null, null));
    ok(chceckNodeReferences(n6, null, null, null));
    ok(chceckNodeReferences(n7, null, n8, n9));
    ok(chceckNodeReferences(n8, n7, null, null));
    ok(chceckNodeReferences(n9, n7, null, null));
    
    // set back
    n5.setLeft(n6);
    n5.setRight(n7);
});



///////////////////////////////////////////////////////////////
module("Tree:"); 
/*
                           tree
                            |
                           nr(0)
                         /      \
                      /            \
                    n3(3)         n4(4)
                   /             /    \
                 n1(1)         n5(5)  n2(2)
                              /    \
                           n6(6)  n7(7)
                                 /    \
                              n8(8)   n9(9)
 */

/*
       tree2
         |
       root(-1)
 */

/*
          null
            |
      lonelyNode0(100)
      /
 lonelyNode1(200)
 */
///////////////////////////////////////////////////////////////

test("tree.setRoot(node)", function() {
    expect(5); 
    
    tree = new btv.BinaryTree("myTree");
    tree.setRoot(nr);
    
    tree2 = new btv.BinaryTree();
    root = new btv.BinaryTreeNode(-1);
    tree2.setRoot(root);
    
    lonelyNode0 = new btv.BinaryTreeNode(100);
    lonelyNode1 = new btv.BinaryTreeNode(200);
    lonelyNode0.setLeft(lonelyNode1);
    
    emptyTree = new btv.BinaryTree("empty");
    
    strictEqual(tree.getRoot(), nr);
    ok(chceckNodeReferences(nr, null, n3, n4));
    
    strictEqual(tree2.getRoot(), root);
    ok(chceckNodeReferences(root, null, null, null));   
    
    strictEqual(emptyTree.getRoot(), null);
});




/*
test("tree.getRoot()", function() {
    
    expect(3);
    
    strictEqual(tree.getRoot(), nr, "tree" + " root is " + tree.getRoot());
    strictEqual(tree2.getRoot(), root, "tree2" + " root is " + tree2.getRoot());
    strictEqual(emptyTree.getRoot(), null, "emptyTree" + " root is " + emptyTree.getRoot());
});
*/

test("tree.toArray() - uses tree.getNode(index) function that simulate array implementation", function() {
    
    expect(2);
    
    treeArray = new Array(
        nr, 
        n3, n4, 
        n1, null, n5, n2,
        null, null, null, null, n6, n7, null, null,
        null, null, null, null, null, null, null, null, null, null, n8, n9);
    /// Here I should test each item if it is same (deepStrictEqual),
    /// but deepEqual is good enought in that test.  
    deepEqual(tree.toArray(), treeArray, treeArray.toString());
    deepEqual(tree2.toArray(), new Array(root), "[root]");
});



///////////////////////////////////////////////////////////////
module("Node:"); 
///////////////////////////////////////////////////////////////
/*
test("node.getValue()", function() {
    
    expect(7);
    
    strictEqual(root.getValue(), -1, "root" + " value is " + root.getValue());    
    strictEqual(nr.getValue(), 0, "nr" + " value is " + nr.getValue());    
    strictEqual(n1.getValue(), 1, "n1" + " value is " + n1.getValue());    
    strictEqual(n2.getValue(), 2, "n2" + " value is " + n2.getValue());    
    strictEqual(n5.getValue(), 5, "n5" + " value is " + n5.getValue());    
    strictEqual(lonelyNode0.getValue(), 100, "lonelyNode0" + " value is " + lonelyNode0.getValue());    
    strictEqual(lonelyNode1.getValue(), 200, "lonelyNode1" + " value is " + lonelyNode1.getValue());    
});
*/

test("node.isRoot()", function() {
    
    expect(7);
    
    ok(root.isRoot(), "is " + "root" + " root? -> " + root.isRoot());
    ok(nr.isRoot(), "is " + "nr" + " root? -> " + nr.isRoot());
    ok(!n1.isRoot(), "is " + "n1" + " root? -> " + n1.isRoot());
    ok(!n2.isRoot(), "is " + "n2" + " root? -> " + n2.isRoot());
    ok(!n5.isRoot(), "is " + "n5" + " root? -> " + n5.isRoot());
    ok(lonelyNode0.isRoot(), "is " + "lonelyNode0" + " root? -> " + lonelyNode0.isRoot());
    ok(!lonelyNode1.isRoot(), "is " + "lonelyNode1" + " root? -> " + lonelyNode1.isRoot());
});

test("node.isLeaf()", function() {
    
    expect(7);
    
    ok(root.isLeaf(), "is " + "root" + " leaf? -> " + root.isLeaf());
    ok(!nr.isLeaf(), "is " + "nr" + " leaf? -> " + nr.isLeaf());
    ok(n2.isLeaf(), "is " + "n2" + " leaf? -> " + n2.isLeaf());    
    ok(!n3.isLeaf(), "is " + "n3" + " leaf? -> " + n3.isLeaf());
    ok(n9.isLeaf(), "is " + "n9" + " leaf? -> " + n9.isLeaf());
    ok(!lonelyNode0.isLeaf(), "is " + "lonelyNode0" + " leaf? -> " + lonelyNode0.isLeaf());
    ok(lonelyNode1.isLeaf(), "is " + "lonelyNode1" + " leaf? -> " + lonelyNode1.isLeaf());
});

test("node.getIndex() uses static BinaryTree.getIndex(BinaryTree node)", function() {
    
    expect(8);
    
    strictEqual(root.getIndex(), 0, "root" + " index is " + root.getIndex());    
    strictEqual(nr.getIndex(), 0, "nr" + " index is " + nr.getIndex());    
    strictEqual(n1.getIndex(), 3, "n1" + " index is " + n1.getIndex());    
    strictEqual(n2.getIndex(), 6, "n2" + " index is " + n2.getIndex());    
    strictEqual(n5.getIndex(), 5, "n5" + " index is " + n5.getIndex());    
    strictEqual(n9.getIndex(), 26, "n9" + " index is " + n9.getIndex());    
    strictEqual(lonelyNode0.getIndex(), 0, "lonelyNode0" + " index is " + lonelyNode0.getIndex() + ", but doesn't belong to any tree, see getTree()");
    strictEqual(lonelyNode1.getIndex(), 1, "lonelyNode1" + " index is " + lonelyNode1.getIndex() + ", but doesn't belong to any tree, see getTree()");
});

////////////////////////////////////////////////////////////
module("Extrems:"); 
////////////////////////////////////////////////////////////

test("BinaryTree: tree.setRoot(node) - node is null", function() {
    
    expect(4);
    
    newTree = new btv.BinaryTree("newTree");
    newTree.setRoot(lonelyNode0);
    strictEqual(newTree.getRoot(), lonelyNode0, "newTree" + " root is  + newTree.getRoot() + ");
    newTree.setRoot(null);
    strictEqual(newTree.getRoot(), null, "newTree" + " root is  + newTree.getRoot() + ");
    ok(chceckNodeReferences(lonelyNode0, null, lonelyNode1, null));
    ok(chceckNodeReferences(lonelyNode1, lonelyNode0, null, null));
});

test("BinaryTree: tree.setRoot(node) - node has a parent", function() {
    
    expect(1);
    
    raises(function() {
        tree.setRoot(n5);
    }, "an exception was thrown");
});

test("BinaryTree: tree.toArray() - tree is empty, root is null", function() {
    
    expect(1);
    
    strictEqual(emptyTree.toArray().length, new Array().length, "Empty tree to array is empty array.");
});

test("BinaryTree: tree.getNode(index) - index is a negative number", function() {
    
    expect(1);
    
    raises(function() {
        tree.getNode(-1);
    }, "an exception was thrown");
});

test("BinaryTreeNode: parent.setLeft(node), parent.setRight(node) - parent equals node, parent of yourself", function() {
    
    expect(2);
    
    raises(function() {
        n2.setLeft(n2);
    }, "an exception was thrown");    
    raises(function() {
        n3.setRight(n3);
    }, "an exception was thrown");
});