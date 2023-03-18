/**
 * @class Abstract algorithm
 * @author Jakub Melezinek
 * 
 * @constructor
 * @abstract
 * @protected
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {Boolean} [isSubalgorithm] Set true if this algorithm is part of another algorithm.
 */
btv.AbstractAlgorithm = function(tree, visualiser, isSubalgorithm) {
    /**
     * @protected
     * @type {btv.BinaryTree}
     */
    this.tree = tree;
    
    /**
     * @protected
     * @type {btv.BinaryTree}
     */
    this.treeCopy = btv.AbstractAlgorithm.copyTree(this.tree);
    // assistant variables; reset for new call
    this.tree.selectedNode = undefined;

    /**
     * @protected
     * @type {btv.Visualiser}
     */
    this.visualiser = visualiser;

    /**
     * True if algorithm is called from another algorithm.
     *
     * @protected
     * @type {Boolean}
     */
    this.isSubalgorithm = Boolean(isSubalgorithm);
    
    /**
     * Listeners that are invoked at the start of animation chain.
     *
     * @protected
     * @type {jsgl.util.ArrayList}
     */
    this.startAnimationListeners = new jsgl.util.ArrayList();
    
    /**
     * Listeners that are invoked at the end of animation chain.
     *
     * @protected
     * @type {jsgl.util.ArrayList}
     */
    this.endAnimationListeners = new jsgl.util.ArrayList();
    
    /**
     * @private
     * @type {Number}
     */
    this.redoCalls = 0;
}
//btv.AbstractAlgorithm.prototype.redoCalls = 0;

/**
 * Create a copy of given tree.
 * 
 * @protected
 * @param {btv.BinaryTree} tree
 * @returns {btv.BinaryTree}
 */
btv.AbstractAlgorithm.copyTree = function(tree) {
    if(tree == null) {
        return null;
    }
    
    var treeCopy = new btv.BinaryTree("copy");
    
    if(tree.getRoot() !== null) { // not null => not an empty tree
    
        // copy of a root node
        treeCopy.setRoot(new btv.BinaryTreeNode(tree.getRoot().getValue())); 
    
        // recursively copy the rest of tree - preorder
        btv.AbstractAlgorithm.copyNodeRec(tree.getRoot().getLeft(), tree.getRoot().getRight(), treeCopy.getRoot());
    }
    
    /*   
    // copy of an inserted node
    if(tree.insertedNode != null) { // undefined or null
        treeCopy.insertedNode = new btv.BinaryTreeNode(tree.insertedNode.getValue()); 
    } else {
        treeCopy.insertedNode = null;
    }
    */  
    
    // copy of reference to selected node
    if(tree.selectedNode != null) { // null or undefined
        var index = tree.selectedNode.getIndex();
        treeCopy.selectedNode = treeCopy.getNode(index);
    } else {
        treeCopy.selectedNode = null;
    }
    
    return treeCopy;
}

/**
 * Copy given node recursively.
 * 
 * @protected
 * @param {btv.BinaryTreeNode} leftChildSource
 * @param {btv.BinaryTreeNode} rightChildSource
 * @param {btv.BinaryTreeNOde} parentCopy
 */
btv.AbstractAlgorithm.copyNodeRec = function(leftChildSource, rightChildSource, parentCopy) {
    
    if(leftChildSource != null) {
        // clone/copy
        parentCopy.setLeft(new btv.BinaryTreeNode(leftChildSource.getValue()));
        // recurse
        btv.AbstractAlgorithm.copyNodeRec(leftChildSource.getLeft(), leftChildSource.getRight(), parentCopy.getLeft());
    }
    
    if(rightChildSource != null) {
        // clone/copy
        parentCopy.setRight(new btv.BinaryTreeNode(rightChildSource.getValue()));
        // recurse
        btv.AbstractAlgorithm.copyNodeRec(rightChildSource.getLeft(), rightChildSource.getRight(), parentCopy.getRight());
    }
}

/**
 * Routine at start of each redo function.
 *
 * @protected
 */
btv.AbstractAlgorithm.prototype.redoStart = function() {
    
    this.redoCalls++;
    
    // fire start animation listeners
    this.visualiser.animateStart(this);
    
    if(!this.isSubalgorithm) {
        // remove arrayElement
        this.visualiser.animateRemoveArrayElem();
    }

    if(this.treeCopy.selectedNode != null) { // select selected node
        // get index of selected node
        var selectedIndex = this.treeCopy.selectedNode.getIndex();
        
        // get selected node
        var selectedNode = this.tree.getNode(selectedIndex);
        
        // if not selected select and show tree, othervise no selection nor showing is needed
        if(this.visualiser.selectedNode !== selectedNode) {
            this.visualiser.animateShowSelectNode(selectedNode);
        }
        
        this.node = selectedNode;
    } else { // this algorithm does not have a node as input value
        
        this.visualiser.animateSelectNode(null);
        this.node = null;
    }
}

/**
 * Routine at end of each redo function.
 *
 * @protected
 * @param {Boolean} [show]
 */
btv.AbstractAlgorithm.prototype.redoEnd = function(show) {
    
    if(show == null || show == true) {
        // show resultant tree
        this.visualiser.animateShowTree();
    }
    
    // add animator that fire end animation listeners
    this.visualiser.animateEnd(this); 
}

/**
 * Adds a listener function to be invoked when the chain of animations starts.
 *
 * @public
 * @param {Function}
 */
btv.AbstractAlgorithm.prototype.addStartAnimationListener = function(listener) {
    this.startAnimationListeners.add(listener);
}

/**
 * Removes a listener function.
 *
 * @public
 * @param {Function}
 */
btv.AbstractAlgorithm.prototype.removeStartAnimationListener = function(listener) {
    this.startAnimationListeners.remove(listener);
}

/**
 * Invokes all registered listener functions.
 *
 * @protected
 */
btv.AbstractAlgorithm.prototype.fireStartAnimationListeners = function() {
    
    var count = this.startAnimationListeners.getCount();
    for(var i = 0; i < count; i++) {
        this.startAnimationListeners.get(i)();
    }
}

/**
 * Adds a listener function to be invoked when the chain of animations ends.
 *
 * @public
 * @param {Function}
 */
btv.AbstractAlgorithm.prototype.addEndAnimationListener = function(listener) {
    this.endAnimationListeners.add(listener);
}

/**
 * Removes a listener function.
 *
 * @public
 * @param {Function}
 */
btv.AbstractAlgorithm.prototype.removeEndAnimationListener = function(listener) {
    this.endAnimationListeners.remove(listener);
}

/**
 * Invokes all registered listener functions.
 *
 * @protected
 */
btv.AbstractAlgorithm.prototype.fireEndAnimationListeners = function() {
    
    var count = this.endAnimationListeners.getCount();
    for(var i = 0; i < count; i++) {
        this.endAnimationListeners.get(i)();
    }
}

/**
 * Makes changes on the tree (do the algoritm) and fill the animatorsArray.
 * 
 * @abstract
 * @protected
 */
btv.AbstractAlgorithm.prototype.redo = function() {
    throw new btv.AlgorithmException("Abstract function");
}

/**
 * Makes changes on the tree (undo the algoritm) - set the tree to state before this algorithm was done (executed).
 * 
 * @protected
 */
btv.AbstractAlgorithm.prototype.undo = function() {

    // create copy of treeCopy to set as the tree
    var copy = btv.AbstractAlgorithm.copyTree(this.treeCopy);
    
    // set copy of treeCopy as the tree
    this.tree.setRoot(copy.getRoot());
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @private
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {Number} min
 * @param {Number} max
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bst.RandomBSTreeAlg = function(tree, visualiser, min, max, isSubalgorithm) {
    
    /*
     * @private
     * @type {Number}
     */
    this.min = min;
    
    /*
     * @private
     * @type {Number}
     */
    this.max = max;

    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);
}
btv.bst.RandomBSTreeAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 */
btv.bst.RandomBSTreeAlg.prototype.redo = function() {

    // routine
    this.redoStart();

    if(this.redoCalls > 1) { // repeated call - dont generate new random tree
        
        var copy = btv.AbstractAlgorithm.copyTree(this.randomtreeCopy);
        this.tree.setRoot(copy.getRoot());
        
    } else { // first call

        var epsilon = (this.max - this.min)/4;
        this.tree.setRoot(new btv.BinaryTreeNode(btv.getRandomInt(Math.floor(this.min+epsilon), Math.ceil(this.max-epsilon))));
    
        this.rec(this.tree.getRoot(), 1, this.min, this.max);
        
        this.randomtreeCopy = btv.AbstractAlgorithm.copyTree(this.tree);

    }
    
    this.visualiser.redrawTree(this.tree);
                
    // routine
    this.redoEnd();    
}   

/**
 * @private
 */
btv.bst.RandomBSTreeAlg.prototype.rec = function(node, level, min, max) {

    if(min >= node.getValue() - 1 || node.getValue() + 1 >= max) { // safety
        return;
    }
    
    var chance;
    
    if(level <= 3 && Math.random() < 0.5) { // make both child - generated tree is fuller
        chance = 1.0;
    } else {
        switch(level) {
            case 1:
                chance = 0.95;
                break;
            case 2:
                chance = 0.7;
                break; 
            case 3:
                chance = 0.4;
                break;
            case 4:
                chance = 0.2;
                break;            
            default:
                chance = 0.0; // no node at higher levels
                break;            
        }
    }

    var epsilon;

    // left child
    if(chance > Math.random()) {
        //node.setLeft(new btv.BinaryTreeNode(btv.getRandomInt(Math.floor(min + epsilon), Math.ceil(node.getValue() - epsilon))));
        epsilon = Math.round((node.getValue() - min)/2);
        node.setLeft(new btv.BinaryTreeNode(btv.getRandomInt(min + epsilon, node.getValue() - 1)));
        if(node.getLeft().getValue() == min) {
            min += 1;
        }
        this.rec(node.getLeft(), level + 1, min, node.getValue() - 1);
    }
    
    // right child
    if(chance > Math.random()) {
        //node.setRight(new btv.BinaryTreeNode(btv.getRandomInt(Math.floor(node.getValue() + epsilon), Math.ceil(max - epsilon))));
        epsilon = Math.round((max - node.getValue())/2);
        node.setRight(new btv.BinaryTreeNode(btv.getRandomInt(node.getValue() + 1, max - epsilon )));
        if(node.getRight().getValue() == max) {
            max -= 1;
        }
        this.rec(node.getRight(), level + 1, node.getValue() + 1, max);
    }
}

/**
 * @override
 * @public
 */
btv.bst.RandomBSTreeAlg.prototype.toString = function() {
    var array = this.tree.toArray();
    var str = "randomBSTree(";
    
    for(var i = 0; i < array.length; i++) {
        if(i != 0) {
            str += ", ";
        }
        if(array[i] == null) {
            str += "n";
        } else {
            str += array[i].getValue();
        }
    }
    str += ")"
        
    return str;
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @public
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {Number} value
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bst.InsertAlg = function(tree, visualiser, value, isSubalgorithm) {
   
    /**
     * @private
     * @type {Number}
     */
    this.value = value;
    
    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);    
}
btv.bst.InsertAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 */
btv.bst.InsertAlg.prototype.redo = function() {
    
    // routine
    this.redoStart();   

    // remove grapgic node - necessary if skip backward and the graphic was already added
    this.visualiser.animateRemoveNode(this.node);

    this.node = new btv.BinaryTreeNode(this.value);

    // show the new graphic node
    this.visualiser.animateShowNodeElemNextTo(this.node, 0);
    
    var node = this.tree.getRoot();
    if(node === null) { // root is null -> empty tree -> insert root
        // logic
        this.tree.setRoot(this.node);
        
        // move the graphic node
        // has no parent, not needed edgeElement
        this.visualiser.animateMoveTo(this.node, 0);
    } else {
        while(true) {
            if(this.node.getValue() >= node.getValue()) { // right
                // visualisation of comparison
                this.visualiser.animateShowComparSign(this.node, true, node);
                
                if(node.getRight() === null) { // insert
                    node.setRight(this.node);
                    // move the graphic node
                    this.visualiser.animateMoveTo(this.node, 2*node.getIndex() + 2);
                    // show the graphic node parent edge 
                    this.visualiser.animateAddEdgeElem(this.node);
                    break;
                } else { // next comparison
                    node = node.getRight();
                    // move the graphic node
                    this.visualiser.animateMoveNextTo(this.node, node);
                }
            } else { // left
                // visualisation of comparison
                this.visualiser.animateShowComparSign(this.node, false, node);
                
                if(node.getLeft() === null) { // insert
                    node.setLeft(this.node);
                    // move the graphic node
                    this.visualiser.animateMoveTo(this.node, 2*node.getIndex() + 1);
                    // show the graphic node parent edge
                    this.visualiser.animateAddEdgeElem(this.node);                    
                    break;
                } else { // next comparison
                    node = node.getLeft();
                    // move the graphic node
                    this.visualiser.animateMoveNextTo(this.node, node);
                }
            }
        }
    }
    
    this.visualiser.animateSelectNode(null);
    
    // routine
    this.redoEnd();   
}

/**
 * @override
 * @public
 */
btv.bst.InsertAlg.prototype.toString = function() {
    return "insert(value: " + this.value + ")";
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @throws {btv.AlgorithmException} Throws an exception if BinaryTreeNode wasn't created - invalid value.
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {Number} value
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bst.FindAlg = function(tree, visualiser, value, isSubalgorithm) {

    /**
     * @private
     * @type {Number}
     */
    this.value = value;
    
    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);
}
btv.bst.FindAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 */
btv.bst.FindAlg.prototype.redo = function() {
    
    // routine
    this.redoStart();   
    
    // remove grapgic node - necessary if skip backward and the graphic was already added
    this.visualiser.animateRemoveNode(this.node);

    this.node = new btv.BinaryTreeNode(this.value);    
    
    // show the new graphic node
    //this.visualiser.animateShowAssistNodeElemNextTo(this.node, 0);
    this.node.selectable = false;
    this.visualiser.animateShowNodeElemNextTo(this.node, 0);
    
    var node = this.tree.getRoot();
    if(node === null) { // root is null -> empty tree -> not found
        
        this.visualiser.animateShowRemoveNode(this.node);
        this.visualiser.animateSelectNode(null); // deselect all
                
        // routine
        this.redoEnd();                  
                
        return null;
    } else {
        
        while(true) {
            if(this.node.getValue() == node.getValue()) { // found
                this.visualiser.animateShowComparSign(this.node, 0, node);
                this.visualiser.animateMoveTo(this.node, node.getIndex());
                this.visualiser.animateRemoveNode(this.node);
                this.visualiser.animateSelectNode(node); // select founded
                
                // routine
                this.redoEnd();   
                
                return node; 
            }
            
            if(this.node.getValue() > node.getValue()) { // right
                // visualisation of comparison
                this.visualiser.animateShowComparSign(this.node, 1, node);
                
                if(node.getRight() === null) { // not found
                    this.visualiser.animateMoveNextTo(this.node, node.getIndex()*2 + 2);
                    
                    break;
                } else { // next comparison
                    node = node.getRight();
                    // move the graphic node
                    this.visualiser.animateMoveNextTo(this.node, node);
                }
            } else { // left
                // visualisation of comparison
                this.visualiser.animateShowComparSign(this.node, -1, node);
                
                if(node.getLeft() === null) { // not found
                    this.visualiser.animateMoveNextTo(this.node, node.getIndex()*2 + 1);

                    break;
                } else { // next comparison
                    node = node.getLeft();
                    // move the graphic node
                    this.visualiser.animateMoveNextTo(this.node, node);
                }
            }
        }   
    
        // after break - not found
        this.visualiser.animateShowRemoveNode(this.node);
        this.visualiser.animateSelectNode(null); // deselect all
        
        // routine
        this.redoEnd();   
        
        return null;
    }
}

/**
 * @override
 * @public
 */
btv.bst.FindAlg.prototype.toString = function() {
    return "find(value: " + this.value + ")";
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {btv.BinaryTreeNode} node
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bst.DeleteAlg = function(tree, visualiser, node, isSubalgorithm) {
    
    /**
     * @private
     * @type {btv.BinaryTreeNode}
     */
    this.node = node;
    
    // copy of this reference will be created in the parent constructor - copy of given tree
    tree.selectedNode = this.node;
    
    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);
}
btv.bst.DeleteAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 */
btv.bst.DeleteAlg.prototype.redo = function() {

    // routine
    this.redoStart();   

    if(this.node.getLeft() !== null  && this.node.getRight() !== null) { // both children
        
        // use getSuccessor() algorithm
        var getSuccessorAlg = new btv.bst.GetSuccessorAlg(this.tree, this.visualiser, this.node, true);
        var successor = getSuccessorAlg.redo();

        // swap this.node with successor
        this.tree.swapNodes(this.node, successor);
        this.visualiser.animateSwapNodeElems(this.node, successor);

    } // continue normally - delete node
    
    // now just one or no child
    if(this.node.getLeft() !== null) { // just left child

        var leftSubtreeRoot = this.node.getLeft();
    
        // grapgic - delete
        this.visualiser.animateShowRemoveNode(this.node);
        this.visualiser.animateRemoveElement(leftSubtreeRoot.edgeElement);
        
        if(this.node.isRoot()) {
            // logic
            this.node.setLeft(null);
            this.tree.setRoot(leftSubtreeRoot);
        } else {
            
            if(this.node.getParent().getLeft() == this.node) { // left child
                // logic
                this.node.getParent().setLeft(leftSubtreeRoot);
            } else { // right child
                // logic
                this.node.getParent().setRight(leftSubtreeRoot); 
            }
        }
        var leftSubtreePreorderArray = btv.BinaryTree.toInorderArrayRec(leftSubtreeRoot);
            
        // grapgic - move subtree
        this.visualiser.animateMoveToIndexLoc(leftSubtreePreorderArray);
            
        // graphic - add edge
        this.visualiser.animateAddEdgeElem(leftSubtreeRoot, leftSubtreeRoot.getParent());
    }
    
    else if(this.node.getRight() !== null) { // just right child
        
        var rightSubtreeRoot = this.node.getRight();
        
        // grapgic - delete
        this.visualiser.animateShowRemoveNode(this.node);
        this.visualiser.animateRemoveElement(rightSubtreeRoot.edgeElement);
        
        if(this.node.isRoot()) {
            // logic
            this.node.setRight(null);
            this.tree.setRoot(rightSubtreeRoot);
        } else {
            
            if(this.node.getParent().getLeft() == this.node) { // left child
                // logic
                this.node.getParent().setLeft(rightSubtreeRoot);
            } else { // right child
                // logic
                this.node.getParent().setRight(rightSubtreeRoot); 
            }
        }
        var rightSubtreePreorderArray = btv.BinaryTree.toInorderArrayRec(rightSubtreeRoot);
            
        // grapgic - move subtree
        this.visualiser.animateMoveToIndexLoc(rightSubtreePreorderArray);
            
        // graphic - add edge
        this.visualiser.animateAddEdgeElem(rightSubtreeRoot, rightSubtreeRoot.getParent());
    }
    
    else { // no child
        if(this.node.isRoot()) {
            // logic
            this.tree.setRoot(null);
        } else {
            // logic
            if(this.node.getParent().getLeft() === this.node) { // left child
                this.node.getParent().setLeft(null);
            } else { // right child
                this.node.getParent().setRight(null);
            }
        }
        // graphics
        this.visualiser.animateShowRemoveNode(this.node);
    }
    
    this.visualiser.animateSelectNode(null);
    
    // routine
    this.redoEnd();   
}

/**
 * @override
 * @public
 */
btv.bst.DeleteAlg.prototype.toString = function() {
    return "delete(value: " + this.treeCopy.selectedNode.getValue() + ", index: " + this.treeCopy.selectedNode.getIndex() + ")";
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////




/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {btv.BinaryTreeNode} node
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bst.GetMaxAlg = function(tree, visualiser, node, isSubalgorithm) {
    
    /**
     * @private
     * @type {btv.BinaryTreeNode}
     */
    this.node = node;
    
    // copy of this reference will be created in the parent constructor - copy of given tree
    tree.selectedNode = this.node;
    
    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);   
}
btv.bst.GetMaxAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 * 
 * @returns {btv.BinaryTreeNode} maximum
 */
btv.bst.GetMaxAlg.prototype.redo = function() {

    if(!this.isSubalgorithm) {
        // routine
        this.redoStart();  
    } else { // is called from another algorithm
        
        this.redoCalls++;
    
        // add animator that fire start animation listeners
        this.visualiser.animateStart(this);
    
        // select selected node
        // get index of selected node
        var selectedIndex = this.treeCopy.selectedNode.getIndex();
        
        // get selected node
        var selectedNode = this.tree.getNode(selectedIndex);
        
        this.node = selectedNode;
    }  
    
    var node;
    var searchNode;
    
    searchNode = new btv.BinaryTreeNode(String.fromCharCode(8664));
    this.visualiser.animateAddAssistNodeElemNextTo(searchNode, this.node);
                
    // find the most right node - maximum
    node = this.node;
    if(node.getRight() === null) { // to show that I try ro go right
        this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8664), false);
    }
    while(node.getRight() !== null) {
        node = node.getRight();
        this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8664), false);
        this.visualiser.animateMoveNextTo(searchNode, node);
    }
        
    
    // no more right children
    this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8664), false);
    this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8664), true);
    this.visualiser.animateMoveTo(searchNode, node.getIndex());
    this.visualiser.animateRemoveNode(searchNode);
    // select predecessor
    this.visualiser.animateSelectNode(node);
                
    if(!this.isSubalgorithm) {
        // routine
        this.redoEnd();  
    } else {
        // routine, but not show
        this.redoEnd(false);          
    }

    return node; // max found
}

/**
 * @override
 * @public
 */
btv.bst.GetMaxAlg.prototype.toString = function() {
    return "getMax(value: " + this.treeCopy.selectedNode.getValue() + ", index: " + this.treeCopy.selectedNode.getIndex() + ")";
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {btv.BinaryTreeNode} node
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bst.GetMinAlg = function(tree, visualiser, node, isSubalgorithm) {
    
    /**
     * @private
     * @type {btv.BinaryTreeNode}
     */
    this.node = node;
    
    // copy of this reference will be created in the parent constructor - copy of given tree
    tree.selectedNode = this.node;
    
    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);  
}
btv.bst.GetMinAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 * 
 * @returns {btv.BinaryTreeNode} minimum
 */
btv.bst.GetMinAlg.prototype.redo = function() {
    
    if(!this.isSubalgorithm) {
        // routine
        this.redoStart();  
    } else { // is called from another algorithm
            
        this.redoCalls++;
    
        // add animator that fire start animation listeners
        this.visualiser.animateStart(this);
    
        // select selected node
        // get index of selected node
        var selectedIndex = this.treeCopy.selectedNode.getIndex();
        
        // get selected node
        var selectedNode = this.tree.getNode(selectedIndex);
        
        this.node = selectedNode;
    }
   
    var node;
    var searchNode;
    
    searchNode = new btv.BinaryTreeNode(String.fromCharCode(8665));
    this.visualiser.animateAddAssistNodeElemNextTo(searchNode, this.node);
    
    node = this.node;
    if(node.getLeft() === null) { // to show that I try ro go left
        this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8665), false);
    }
    while(node.getLeft() !== null) {
        node = node.getLeft();
        this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8665), false);
        this.visualiser.animateMoveNextTo(searchNode, node);
    }
        
    // no more left children
    this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8665), false);
    this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8665), true);
    this.visualiser.animateMoveTo(searchNode, node.getIndex());
    this.visualiser.animateRemoveNode(searchNode);
    // select predecessor
    this.visualiser.animateSelectNode(node);
                
    // this.redoEnd(!this.isSubalgorithm); 
    if(!this.isSubalgorithm) {                
        // routine
        this.redoEnd();       
    } else {
        // routine but not show
        this.redoEnd(false);       
    }
                
    return node; // founded min    
}   

/**
 * @override
 * @public
 */
btv.bst.GetMinAlg.prototype.toString = function() {
    return "getMin(value: " + this.treeCopy.selectedNode.getValue() + ", index: " + this.treeCopy.selectedNode.getIndex() + ")";
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {btv.BinaryTreeNode} node
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bst.GetPredecessorAlg = function(tree, visualiser, node, isSubalgorithm) {
    
    /**
     * @private
     * @type {btv.BinaryTreeNode}
     */
    this.node = node;
    
    // copy of this reference will be created in the parent constructor - copy of given tree
    tree.selectedNode = this.node;
    
    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);  
}
btv.bst.GetPredecessorAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 * 
 * @returns {btv.BinaryTreeNode} predecessor
 */
btv.bst.GetPredecessorAlg.prototype.redo = function() {
   
    // routine
    this.redoStart();   
   
    var parent;
    var node;

    var searchNode = new btv.BinaryTreeNode(String.fromCharCode(8665));
    this.visualiser.animateShowAssistNodeElemNextTo(searchNode, this.node);

    node = this.node.getLeft();
    if(node !== null) { // has left subtree

        // move next to left child
        this.visualiser.animateMoveNextTo(searchNode, node);
        this.visualiser.animateRemoveNode(searchNode);
               
        // use getMax algoritm as part of that algorithm
        var getMaxAlg = new btv.bst.GetMaxAlg(this.tree, this.visualiser, node, true);
        var returnedValue = getMaxAlg.redo();
        
        // routine
        this.redoEnd();
        
        return returnedValue;
        
    }
    else {
        // no left subtree
        this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8665), true);
        
        // for first parent to that arrives from right
        node = this.node;
        parent = this.node.getParent();
        while(true) {
            
            if(parent === null) { // no predecessor
                // try to go to the top
                this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8657), false);
                this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8657), true);
                // hide searchNode
                this.visualiser.animateShowRemoveNode(searchNode);
                // unselect all
                this.visualiser.animateSelectNode(null);
                
                // routine
                this.redoEnd();  
                
                return null; // no predecessor found
            }
            
            // have to search at the top
            this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8657), false);
            
            // move nextTo parent if exists
            this.visualiser.animateMoveNextTo(searchNode, parent);

            if(parent.getRight() === node) { // arrived from right
                // from right
                this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8598), false);        
                // moveTo
                this.visualiser.animateMoveTo(searchNode, parent.getIndex());
                this.visualiser.animateRemoveNode(searchNode);
                // select predecessor
                this.visualiser.animateSelectNode(parent);
                
                // routine
                this.redoEnd();  
                
                return parent; // predecessor found
            } else {
                // not from right
                this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8598), true);
            }
            
            // next loop
            node = parent;
            parent = parent.getParent();
        }
    }
}   

/**
 * @override
 * @public
 */
btv.bst.GetPredecessorAlg.prototype.toString = function() {
    return "getPredecessor(value: " + this.treeCopy.selectedNode.getValue() + ", index: " + this.treeCopy.selectedNode.getIndex() + ")";
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {btv.BinaryTreeNode} node
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bst.GetSuccessorAlg = function(tree, visualiser, node, isSubalgorithm) {
    
    /**
     * @private
     * @type {btv.BinaryTreeNode}
     */
    this.node = node;
    
    // copy of this reference will be created in the parent constructor - copy of given tree
    tree.selectedNode = this.node;
    
    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);
}
btv.bst.GetSuccessorAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 * 
 * @returns {btv.BinaryTreeNode} successor
 */
btv.bst.GetSuccessorAlg.prototype.redo = function() {
   
    // routine
    this.redoStart();  
   
    var parent;
    var node;

    var searchNode = new btv.BinaryTreeNode(String.fromCharCode(8664));
    this.visualiser.animateShowAssistNodeElemNextTo(searchNode, this.node);

    node = this.node.getRight();
    if(node !== null) { // has right subtree
        
        // move next to left child
        this.visualiser.animateMoveNextTo(searchNode, node);
        this.visualiser.animateRemoveNode(searchNode);
               
        // use getMin algoritm as part of that algorithm
        var getMinAlg = new btv.bst.GetMinAlg(this.tree, this.visualiser, node, true);
       
        // and do it // add EndAnimator
        var returnedValue = getMinAlg.redo();
        
        // routine
        this.redoEnd();
        
        return returnedValue;
        
    } else {
        // no rigt subtree
        this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8664), true);
       
        // for first parent to that arrives from left
        node = this.node;
        parent = this.node.getParent();
        while (true) {
            if(parent === null) { // no parent
                // no node at the top
                this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8657), false);            
                this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8657), true);
                // hide searchNode
                this.visualiser.animateShowRemoveNode(searchNode);
                // unselect all
                this.visualiser.animateSelectNode(null);
                
                // routine
                this.redoEnd();  
                
                return null; // no successor found
            }
            
            // have to search at the top
            this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8657), false);
            
            // move nextTo parent if exists
            this.visualiser.animateMoveNextTo(searchNode, parent);

            if(parent.getLeft() === node) { // arrived from left
                // from left
                this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8599), false);        
                // moveTo
                this.visualiser.animateMoveTo(searchNode, parent.getIndex());
                this.visualiser.animateRemoveNode(searchNode);
                // select successor
                this.visualiser.animateSelectNode(parent);
                
                // routine
                this.redoEnd();  
                
                return parent; // successor found
            } else {
                // not from right
                this.visualiser.animateShowChangeAssistNode(searchNode, String.fromCharCode(8599), true);
            }
            
            // next loop
            node = parent;
            parent = parent.getParent();
        }
    }
}   

/**
 * @override
 * @public
 */
btv.bst.GetSuccessorAlg.prototype.toString = function() {
    return "getSuccessor(value: " + this.treeCopy.selectedNode.getValue() + ", index: " + this.treeCopy.selectedNode.getIndex() + ")";
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bst.ToPreorderArrayAlg = function(tree, visualiser, isSubalgorithm) {
    
    /**
     * Assistant graphic node acceessable from all functions.
     *
     * @private
     */
    this.moveNode = null;

    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);
}
btv.bst.ToPreorderArrayAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 */
btv.bst.ToPreorderArrayAlg.prototype.redo = function() {
    var array = new Array();

    // routine
    this.redoStart();  

    // add array element
    this.visualiser.animateAddArrayElem(this.tree.getCount());

    // create moveNode
    this.moveNode = new btv.BinaryTreeNode(String.fromCharCode(8659));
    
    
    this.visualiser.animateShowAssistNodeElemNextTo(this.moveNode, 0);

    var node = this.tree.getRoot();
    if(node === null) {
        
        // show struck through move node
        this.visualiser.animateShowChangeAssistNode(this.moveNode, String.fromCharCode(8659), true);
        
        // hide move node
        this.visualiser.animateShowRemoveNode(this.moveNode);
    
        // routine
        this.redoEnd(); 
        
        return array;
    } 
    
    
    this.rec(node, array);
    
    
    // leave tree - change label
    this.visualiser.animateShowChangeAssistNode(this.moveNode, String.fromCharCode(8657));
    
    // remove move node
    this.visualiser.animateRemoveNode(this.moveNode);            
              
    // routine
    this.redoEnd();   
    
    return array;
}

/**
 * @private
 */
btv.bst.ToPreorderArrayAlg.prototype.recLeft = function (node, array) {
    
    // change label
    this.visualiser.animateShowChangeAssistNode(this.moveNode, String.fromCharCode(8665));

    if(node === null) {    
        // change label
        this.visualiser.animateShowChangeAssistNode(this.moveNode, String.fromCharCode(8665), true);
        
        return;
    }
    
    // move
    this.visualiser.animateMoveNextTo(this.moveNode, node);    
    
    this.rec(node, array);
}

/**
 * @private
 */
btv.bst.ToPreorderArrayAlg.prototype.recRight = function (node, array) {
    // change label
    this.visualiser.animateShowChangeAssistNode(this.moveNode, String.fromCharCode(8664));
    
    if(node === null) {
        // change label
        this.visualiser.animateShowChangeAssistNode(this.moveNode, String.fromCharCode(8664), true);
        
        return;
    }

    // move
    this.visualiser.animateMoveNextTo(this.moveNode, node);
    
    this.rec(node, array);
}

/**
 * @private
 */
btv.bst.ToPreorderArrayAlg.prototype.rec = function (node, array) {
    
    // change label
    this.visualiser.animateChangeAssistNode(this.moveNode, "");

    // show index node
    var toArrayNode = new btv.BinaryTreeNode(node.getValue());
    toArrayNode.selectable = false;
    this.visualiser.animateShowNodeElemAt(toArrayNode, node);
    
    // move index node to arrayElem
    this.visualiser.animateMoveNextToArrayElem(toArrayNode);
        
    // hide index node
    this.visualiser.animateShowTree(0.25);
    this.visualiser.animateRemoveNode(toArrayNode);
        
    // show in array
    array.push(node);
    this.visualiser.animateShowInsertToArrayElem(node, array.length - 1);

    
    this.recLeft(node.getLeft(), array);
    
    
    // go up
    if(node.getLeft() !== null) { // only if has left child, otherwise moveNode is still here
        // change label
        this.visualiser.animateShowChangeAssistNode(this.moveNode, String.fromCharCode(8657));
        
        // move
        this.visualiser.animateMoveNextTo(this.moveNode, node);
    }
    
    
    this.recRight(node.getRight(), array);
    
    
    // go up
    if(node.getRight() !== null) { // only if has right child, otherwise moveNode is still here
        // change label
        this.visualiser.animateShowChangeAssistNode(this.moveNode, String.fromCharCode(8657));
        
        // move    
        this.visualiser.animateMoveNextTo(this.moveNode, node);
    }
}

/**
 * @override
 * @public
 */
btv.bst.ToPreorderArrayAlg.prototype.toString = function() {
    return "toPreorderArray()";
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bst.ToInorderArrayAlg = function(tree, visualiser, isSubalgorithm) {
    
    /**
     * Assistant graphic node acceessable from all functions.
     *
     * @private
     */
    this.moveNode = null;

    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);
}
btv.bst.ToInorderArrayAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 */
btv.bst.ToInorderArrayAlg.prototype.redo = function() {
    // reset states if play again etc
    var array = new Array();

    // routine
    this.redoStart();  

    // add array element
    this.visualiser.animateAddArrayElem(this.tree.getCount());

    // create moveNode
    this.moveNode = new btv.BinaryTreeNode(String.fromCharCode(8659));
    this.visualiser.animateShowAssistNodeElemNextTo(this.moveNode, 0);

    var node = this.tree.getRoot();
    if(node === null) {
        
        // show struck through move node
        this.visualiser.animateShowChangeAssistNode(this.moveNode, String.fromCharCode(8659), true);
        
        // hide move node
        this.visualiser.animateShowRemoveNode(this.moveNode);
    
        // routine
        this.redoEnd(); 
        
        return array;
        
    }
    
    
    this.rec(node, array);
    
    
    // leave tree - change label
    this.visualiser.animateShowChangeAssistNode(this.moveNode, String.fromCharCode(8657));
    
    // remove move node
    this.visualiser.animateRemoveNode(this.moveNode);            
              
    // routine
    this.redoEnd();   
    
    return array;
}   

/**
 * @private
 */
btv.bst.ToInorderArrayAlg.prototype.recLeft = function (node, array) {
    
    // change label
    this.visualiser.animateShowChangeAssistNode(this.moveNode, btv.Visualiser.southWestDoubleArrow);

    if(node === null) {    
        // change label
        this.visualiser.animateShowChangeAssistNode(this.moveNode, btv.Visualiser.southWestDoubleArrow, true);
        
        return;
    }
    
    // move
    this.visualiser.animateMoveNextTo(this.moveNode, node);
    
    this.rec(node, array);
}

/**
 * @private
 */
btv.bst.ToInorderArrayAlg.prototype.recRight = function (node, array) {
    // change label
    this.visualiser.animateShowChangeAssistNode(this.moveNode, btv.Visualiser.southEastDoubleArrow);
    
    if(node === null) {
        // change label
        this.visualiser.animateShowChangeAssistNode(this.moveNode, btv.Visualiser.southEastDoubleArrow, true);
        
        return;
    }
    
    // move
    this.visualiser.animateMoveNextTo(this.moveNode, node);
    
    this.rec(node, array);
}

/**
 * @private
 */
btv.bst.ToInorderArrayAlg.prototype.rec = function (node, array) {

    // recursively
    this.recLeft(node.getLeft(), array);
    
    // go up
    if(node.getLeft() !== null) { // only if has left child, otherwise moveNode is still here
        // change label
        this.visualiser.animateShowChangeAssistNode(this.moveNode, String.fromCharCode(8657));
        
        // move
        this.visualiser.animateMoveNextTo(this.moveNode, node);
    }
    
    
    // change label
    this.visualiser.animateChangeAssistNode(this.moveNode, "");

    // show index node
    var toArrayNode = new btv.BinaryTreeNode(node.getValue());
    toArrayNode.selectable = false;
    this.visualiser.animateShowNodeElemAt(toArrayNode, node);
    
    // move index node to arrayElem
    this.visualiser.animateMoveNextToArrayElem(toArrayNode);
        
    // hide index node
    this.visualiser.animateShowTree(0.25);
    this.visualiser.animateRemoveNode(toArrayNode);

    // show in array
    array.push(node);
    this.visualiser.animateShowInsertToArrayElem(node, array.length - 1);
    
    
    this.recRight(node.getRight(), array);
    
    
    // go up
    if(node.getRight() !== null) { // only if has right child, otherwise moveNode is still here
        // change label
        this.visualiser.animateShowChangeAssistNode(this.moveNode, String.fromCharCode(8657));
        
        // move    
        this.visualiser.animateMoveNextTo(this.moveNode, node);
    }
}

/**
 * @override
 * @public
 */
btv.bst.ToInorderArrayAlg.prototype.toString = function() {
    return "toInorderArray()";
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {Bolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bst.ToPostorderArrayAlg = function(tree, visualiser, isSubalgorithm) {
    
    /**
     * Assistant graphic node acceessable from all functions.
     *
     * @private
     */
    this.moveNode = null;

    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);
}
btv.bst.ToPostorderArrayAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 */
btv.bst.ToPostorderArrayAlg.prototype.redo = function() {
    var array = new Array();

    // routine
    this.redoStart();  

    // add array element
    this.visualiser.animateAddArrayElem(this.tree.getCount());

    // create moveNode
    this.moveNode = new btv.BinaryTreeNode(String.fromCharCode(8659));
    this.visualiser.animateShowAssistNodeElemNextTo(this.moveNode, 0);

    var node = this.tree.getRoot();
    if(node === null) {
        
        // show struck through move node
        this.visualiser.animateShowChangeAssistNode(this.moveNode, String.fromCharCode(8659), true);
        
        // hide move node
        this.visualiser.animateShowRemoveNode(this.moveNode);
    
        // routine
        this.redoEnd(); 
        
        return array;
        
    }
    
    
    this.rec(node, array);
    
    
    // leave tree - change label
    this.visualiser.animateShowChangeAssistNode(this.moveNode, String.fromCharCode(8657));
    
    // remove move node
    this.visualiser.animateRemoveNode(this.moveNode);            
              
    // routine
    this.redoEnd();   
    
    return array;
}   

/**
 * @private
 */
btv.bst.ToPostorderArrayAlg.prototype.recLeft = function (node, array) {
    
    // change label
    this.visualiser.animateShowChangeAssistNode(this.moveNode, btv.Visualiser.southWestDoubleArrow);

    if(node === null) {    
        // change label
        this.visualiser.animateShowChangeAssistNode(this.moveNode, btv.Visualiser.southWestDoubleArrow, true);
        
        return;
    }
    
    // move
    this.visualiser.animateMoveNextTo(this.moveNode, node);
    
    this.rec(node, array);
}

/**
 * @private
 */
btv.bst.ToPostorderArrayAlg.prototype.recRight = function (node, array) {
    // change label
    this.visualiser.animateShowChangeAssistNode(this.moveNode, btv.Visualiser.southEastDoubleArrow);
    
    if(node === null) {
        // change label
        this.visualiser.animateShowChangeAssistNode(this.moveNode, btv.Visualiser.southEastDoubleArrow, true);
        
        return;
    }
    
    // move
    this.visualiser.animateMoveNextTo(this.moveNode, node);
    
    this.rec(node, array);
}

/**
 * @private
 */
btv.bst.ToPostorderArrayAlg.prototype.rec = function (node, array) {
    
    // recursively
    this.recLeft(node.getLeft(), array);
    
    
    // go up
    if(node.getLeft() !== null) { // only if has left child, otherwise moveNode is still here
        // change label
        this.visualiser.animateShowChangeAssistNode(this.moveNode, String.fromCharCode(8657));
        
        // move
        this.visualiser.animateMoveNextTo(this.moveNode, node);
    }


    this.recRight(node.getRight(), array);


    // go up
    if(node.getRight() !== null) { // only if has right child, otherwise moveNode is still here
        // change label
        this.visualiser.animateShowChangeAssistNode(this.moveNode, String.fromCharCode(8657));
        
        // move    
        this.visualiser.animateMoveNextTo(this.moveNode, node);
    }
    

    // change label
    this.visualiser.animateChangeAssistNode(this.moveNode, "");

    // show index node
    var toArrayNode = new btv.BinaryTreeNode(node.getValue());
    toArrayNode.selectable = false;
    this.visualiser.animateShowNodeElemAt(toArrayNode, node);
    
    // move index node to arrayElem
    this.visualiser.animateMoveNextToArrayElem(toArrayNode);
        
    // hide index node
    this.visualiser.animateShowTree(0.25);
    this.visualiser.animateRemoveNode(toArrayNode);
        
    // show in array
    array.push(node);
    this.visualiser.animateShowInsertToArrayElem(node, array.length - 1);
}

/**
 * @override
 * @public
 */
btv.bst.ToPostorderArrayAlg.prototype.toString = function() {
    return "toPostorderArrayAlg()";
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {btv.BinaryTreeNode} node
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bh.HeapifyUpAlg = function(tree, visualiser, node, isSubalgorithm) {
    
    /**
     * @private
     * @type {btv.BinaryTreeNode}
     */
    this.node = node;
    
    // copy of this reference will be created in the parent constructor - copy of given tree
    tree.selectedNode = this.node;
    
    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);
}
btv.bh.HeapifyUpAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 */
btv.bh.HeapifyUpAlg.prototype.redo = function() {
    
    // routine
    this.redoStart(); // označí node
    
    this.rec(this.node);
            
    this.visualiser.animateSelectNode(null);
    
    // routine
    this.redoEnd(false); // don't show, always part of other alg
}


/**
 * @private
 * 
 * @parama {btv.BinaryTreeNode}
 */
btv.bh.HeapifyUpAlg.prototype.rec = function(node) {
    
    var parent = node.getParent();
    
    if(parent == null) {
        return;
    }
    
    var difference = parent.getValue() - this.node.getValue();
        
    if(parent.getLeft() === this.node) {
        // comparing
        this.visualiser.animateShowComparSign(this.node, -difference, parent);
    } else {
        // comparing
        this.visualiser.animateShowComparSign(parent, difference, this.node);
    }
        
    if(difference >= 0) {
        return;
    } else { // swap
        this.tree.swapNodes(this.node, parent);
        // graphic swap
        this.visualiser.animateSwapNodeElems(this.node, parent);
    }
    
    this.rec(this.node);
}

/**
 * @override
 * @public
 */
btv.bh.HeapifyUpAlg.prototype.toString = function() {
    return "heapify-up(value: " + this.treeCopy.selectedNode.getValue() + ", index: " + this.treeCopy.selectedNode.getIndex() + ")";
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {btv.BinaryTreeNode} node
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bh.HeapifyDownAlg = function(tree, visualiser, node, isSubalgorithm) {
    
    /**
     * @private
     * @type {btv.BinaryTreeNode}
     */
    this.node = node;
    
    // copy of this reference will be created in the parent constructor - copy of given tree
    tree.selectedNode = this.node;
    
    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);
}
btv.bh.HeapifyDownAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 */
btv.bh.HeapifyDownAlg.prototype.redo = function() {
    
    // routine
    this.redoStart();
    
    
    this.rec(this.node);
        
        
    this.visualiser.animateSelectNode(null);
    
    // routine
    this.redoEnd(false); // don't show, always part of other alg
}


/**
 * @private
 * 
 * @parama {btv.BinaryTreeNode}
 */
btv.bh.HeapifyDownAlg.prototype.rec = function(node) {
    var left = node.getLeft();
    var right = node.getRight();
    var greater;
    
    if(node.isLeaf()) { // no child => end
        return;
    }
        
    if(left != null && right != null) { // both child => compare child
        if(left.getValue() >= right.getValue()) {
            greater = left;
            this.visualiser.animateShowComparSign(left, true, right);        
        } else {
            greater = right;
            this.visualiser.animateShowComparSign(left, false, right);        
        }
    } else { // just left child
        greater = left;
    }


    var difference = node.getValue() - greater.getValue();
    
    if(greater === left) { // compare with left
        this.visualiser.animateShowComparSign(greater, -difference, node);
    } else { // compare with right
        this.visualiser.animateShowComparSign(node, difference, greater); 
    }
    
    if(difference < 0) {
        
        this.tree.swapNodes(node, greater);
        this.visualiser.animateSwapNodeElems(node, greater);
        
        // recursion
        this.rec(node);
    }
}

/**
 * @override
 * @public
 */
btv.bh.HeapifyDownAlg.prototype.toString = function() {
    return "heapify-down(value: " + this.treeCopy.selectedNode.getValue() + ", index: " + this.treeCopy.selectedNode.getIndex() + ")";
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {Number} min
 * @param {Number} max
 * @param {Bolean} [isSubalgorithm]
 * @throws {btv.AlgorithmException}
 * @extends btv.AbstractAlgorithm
 */
btv.bh.RandomBHeapAlg = function(tree, visualiser, min, max, isSubalgorithm) {
    
    if(min > max) {
        throw new btv.AlgorithmException("Given minimum is greather than given maximum.");
    }
    
    /*
     * @private
     * @type {Number}
     */
    this.min = min;
    
    /*
     * @private
     * @type {Number}
     */
    this.max = max;

    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);
}
btv.bh.RandomBHeapAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 */
btv.bh.RandomBHeapAlg.prototype.redo = function() {

    // routine
    this.redoStart();

    if(this.redoCalls > 1) { // repeated call - dont generate new random tree
        
        var copy = btv.AbstractAlgorithm.copyTree(this.randomHeapCopy);
        this.tree.setRoot(copy.getRoot());
        
    } else { // first call
           
        var count = btv.getRandomInt(1, Math.min(this.max - this.min + 1, 31));
        
        // generate array of random non identic numbers of scale
        var numbers = new Array(this.max - this.min + 1);
        var array = new Array();
        for(var i = 0; i < count; i++) {
            
            do{
                array[i] = btv.getRandomInt(Math.ceil(this.min), Math.floor(this.max));
            } while (numbers[array[i] - this.min] == true);
            
            numbers[array[i] - this.min] = true;
        }
        
        // build heap from array
        for(i = Math.floor(array.length/2) - 1; i >= 0; i--) {
            this.arrayHeapify(array, i);
        }

        this.tree.build(array);


        this.randomHeapCopy = btv.AbstractAlgorithm.copyTree(this.tree);
    }
    
    this.visualiser.redrawTree(this.tree);
                
    // routine
    this.redoEnd(true);    
}   

/**
 * @private
 * 
 * @param {Number[]} array
 * @param {Number} index
 */
btv.bh.RandomBHeapAlg.prototype.arrayHeapify = function (array, index) {
    var leftIndex = 2*index + 1;
    var rightIndex = 2*index + 2;
    var largestIndex;

    if(leftIndex < array.length && array[leftIndex] > array[index]) {
        largestIndex = leftIndex;
    } else {
        largestIndex = index;
    }
    
    if(rightIndex < array.length && array[rightIndex] > array[largestIndex]) {
        largestIndex = rightIndex;
    }
    
    if(largestIndex != index) {
        var tmp = array[largestIndex];
        array[largestIndex] = array[index];
        array[index] = tmp;
        
        this.arrayHeapify(array, largestIndex);
    }
}

/**
 * @private
 * 
 * @param {Number[]} array
 * @param {Number} index
 */
btv.bh.RandomBHeapAlg.prototype.buildRec = function (array, index) {
    
    }

/**
 * @override
 * @public
 */
btv.bh.RandomBHeapAlg.prototype.toString = function() {
    var array = this.tree.toArray();
    var str = "randomHeap(";
    
    for(var i = 0; i < array.length; i++) {
        if(i != 0) {
            str += ", ";
        }
        str += array[i].getValue();
    }
    str += ")"
        
    return str;
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {Number[]} array
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bh.BuildHeapAlg = function(tree, visualiser, array, isSubalgorithm) {
    
    /*
     * @private
     * @type {Number[]}
     */
    this.array = array;

    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);
}
btv.bh.BuildHeapAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 */
btv.bh.BuildHeapAlg.prototype.redo = function() {

    // routine
    this.redoStart();
    
    var array = this.array.slice();


    this.tree.build(array);
    
    
    this.visualiser.redrawTree(this.tree);
    this.visualiser.animateShowTree();

    // build heap
    for(i = Math.floor(array.length/2) - 1; i >= 0; i--) {
        // use heapify algoritm as part of that algorithm
        var heapifyAlg = new btv.bh.HeapifyDownAlg(this.tree, this.visualiser, this.tree.getNode(i), true);
        heapifyAlg.redo();
    }

    
    this.visualiser.animateSelectNode(null);
                
    // routine
    this.redoEnd(false);    
}   

/**
 * @override
 * @public
 */
btv.bh.BuildHeapAlg.prototype.toString = function() {
    var array = this.array;
    var str = "buildHeap(";
    
    for(var i = 0; i < array.length; i++) {
        if(i != 0) {
            str += ", ";
        }
        str += array[i];
    }
    str += ")"
        
    return str;
}




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @throws {btv.AlgorithmException} Throws an exception if BinaryTreeNode wasn't created - invalid value.
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {Number} value
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bh.InsertAlg = function(tree, visualiser, value, isSubalgorithm) {
    
    /**
     * @private
     * @type {Number}
     */
    this.value = value;
    
    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);    
}
btv.bh.InsertAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 */
btv.bh.InsertAlg.prototype.redo = function() {
    
    // routine
    this.redoStart();  
    
    this.node = new btv.BinaryTreeNode(this.value); 
    
    var index = this.tree.getCount();
    
    if(this.tree.getRoot() == null) {
        this.tree.setRoot(this.node);
        
        // show the new graphic node
        this.visualiser.animateAddNodeElem(this.node);
        this.visualiser.animateShowSelectNode(this.node);
        
        this.visualiser.animateSelectNode(null);
        
        // routine
        this.redoEnd(); 
    
        return;
    }
    
    // show the new graphic node
    this.visualiser.animateAddNodeElemAt(this.node, index);
    this.visualiser.animateShowSelectNode(this.node);
    
    // add node
    var parentIndex = Math.floor((index-1)/2);
    var parent = this.tree.getNode(parentIndex);
    if(index % 2 == 1) { // left
        parent.setLeft(this.node);
    } else { // right
        parent.setRight(this.node);
    }
    
    // add edge element
    this.visualiser.animateAddEdgeElem(this.node);
    this.visualiser.animateShowTree();
    
    
    var alg = new btv.bh.HeapifyUpAlg(this.tree, this.visualiser, this.node, true);
    alg.redo();
    

    this.visualiser.animateSelectNode(null);
                    
    // routine
    this.redoEnd(); 
    
    return;
}

/**
 * @override
 * @public
 */
btv.bh.InsertAlg.prototype.toString = function() {
    return "insert(value: " + this.value + ")";
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {btv.BinaryTreeNode} node
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bh.DeleteAlg = function(tree, visualiser, node, isSubalgorithm) {
    
    /**
     * @private
     * @type {btv.BinaryTreeNode}
     */
    this.node = node;
    
    // copy of this reference will be created in the parent constructor - copy of given tree
    tree.selectedNode = this.node;
    
    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);
}
btv.bh.DeleteAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 */
btv.bh.DeleteAlg.prototype.redo = function() {

    // routine
    this.redoStart();  
    
    var length = this.tree.getCount();
    
    if(length == 1) {
        
        this.tree.setRoot(null);
        
        this.visualiser.animateShowRemoveNode(this.node);
        
        // routine
        this.redoEnd(); 
    
        return;
    }

    // swap selected and last
    var last = this.tree.getNode(length - 1);
    
    if(this.node === last) {
        if(this.node.getParent().getLeft() === this.node) {
            this.node.getParent().setLeft(null);
        } else {
            this.node.getParent().setRight(null);
        }
        
        // hide
        this.visualiser.animateShowRemoveNode(this.node);
        
        // routine
        this.redoEnd();   
    
        return;
    }
    
    
    this.tree.swapNodes(this.node, last);
    this.visualiser.animateSwapNodeElems(this.node, last);

    if(this.node.getParent().getLeft() === this.node) {
        this.node.getParent().setLeft(null);
    } else {
        this.node.getParent().setRight(null);
    }
    // hide
    this.visualiser.animateShowRemoveNode(this.node);
    
    
    // heapify up or down (last) 

    var alg = new btv.bh.HeapifyUpAlg(this.tree, this.visualiser, last, true);
    alg.redo();

    alg = new btv.bh.HeapifyDownAlg(this.tree, this.visualiser, last, true);
    alg.redo();


    // routine
    this.redoEnd();   
    
    return;
}

/**
 * @override
 * @public
 */
btv.bh.DeleteAlg.prototype.toString = function() {
    return "delete(value: " + this.treeCopy.selectedNode.getValue() + ", index: " + this.treeCopy.selectedNode.getIndex() + ")";
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bh.ExtractMaxAlg = function(tree, visualiser, isSubalgorithm) {
    
    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);
}
btv.bh.ExtractMaxAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 */
btv.bh.ExtractMaxAlg.prototype.redo = function() {

    var max = this.tree.getRoot();
    
    
        
    // routine
    this.redoStart();    
    
    if(max !== null) {

        // use delete algoritm as part of that algorithm
        var deleteAlg = new btv.bh.DeleteAlg(this.tree, this.visualiser, max, true);
        deleteAlg.redo();
    }

    // routine
    this.redoEnd(false); // dont show, delete alg show
    
    return max;
}

/**
 * @override
 * @public
 */
btv.bh.ExtractMaxAlg.prototype.toString = function() {
    return "extractMax()";
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bh.GetMaxAlg = function(tree, visualiser, isSubalgorithm) {
    
    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);
}
btv.bh.GetMaxAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 */
btv.bh.GetMaxAlg.prototype.redo = function() {

    var max = this.tree.getRoot();
        
    // routine
    this.redoStart();
    
    if(max !== null) {
        this.visualiser.animateSelectNode(max);
    }

    // routine
    this.redoEnd();   
    
    return max;
}

/**
 * @override
 * @public
 */
btv.bh.GetMaxAlg.prototype.toString = function() {
    return "getMax()";
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {btv.BinaryTree} tree
 * @param {btv.Visualiser} visualiser
 * @param {Boolean} [isSubalgorithm]
 * @extends btv.AbstractAlgorithm
 */
btv.bh.HeapSortAlg = function(tree, visualiser, isSubalgorithm) {
        
    // parent constructor
    btv.AbstractAlgorithm.call(this, tree, visualiser, isSubalgorithm);
}
btv.bh.HeapSortAlg.jsglExtend(btv.AbstractAlgorithm);

/**
 * @override
 * @public
 */
btv.bh.HeapSortAlg.prototype.redo = function() {
    
    var array = new Array();
    var length = this.tree.getCount();
    
    // routine
    this.redoStart();

    // add array element
    this.visualiser.animateAddArrayElem(length);

    var root;
    var node;
    for(var i = length - 1; i >= 1; i--) {
        
        root = this.tree.getRoot();
        node = this.tree.getNode(i);
        
        this.visualiser.animateSelectNode(node);
        this.visualiser.animateShowTree();

        
        
        /* also work but the other option is simpler
        this.tree.swapNodes(root, node);
        
        if(root.getParent().getLeft() === node) {
            root.getParent().setLeft(null);
        } else {
            root.getParent().setRight(null);
        }
         */
         
        
        // swap nodes - parent-child
        if(node.getParent() != null) {
            if(node.getParent().getLeft() === node) {
                node.getParent().setLeft(null);
            } else {
                node.getParent().setRight(null);
            }
        }        
        node.setLeft(root.getLeft());
        node.setRight(root.getRight());
        this.tree.setRoot(node);
        

        // graphic swap
        this.visualiser.animateSwapNodeElems(root, node);
        
        
        // add to array element
        // show assisstant node
        var assistant = new btv.BinaryTreeNode(root.getValue());
        assistant.selectable = false;
        this.visualiser.animateAddNodeElemAt(assistant, i);
        
        // remove root
        this.visualiser.animateRemoveNode(root);
        
        // move assistant node to arrayElem
        this.visualiser.animateMoveNextToArrayElem(assistant);
        
        // remove asistant
        this.visualiser.animateShowTree(0.25);
        this.visualiser.animateRemoveNode(assistant);        
        
        // show in array
        this.visualiser.animateShowInsertToArrayElem(root, i);
        array.push(root);
        
        
        
        
        // heapify new root (node)
        // use heapify algoritm as part of that algorithm
        var heapifyAlg = new btv.bh.HeapifyDownAlg(this.tree, this.visualiser, node, true);
        heapifyAlg.redo();
    }
    
    // add last to array element
    // show assisstant node
    var last = new btv.BinaryTreeNode(this.tree.getRoot().getValue());
    last.selectable = false;
    this.visualiser.animateAddNodeElemAt(last, 0);
        
    // remove root
    this.visualiser.animateRemoveNode(this.tree.getRoot());
        
    // move assistant node to arrayElem
    this.visualiser.animateMoveNextToArrayElem(last);
        
    // remove root
    this.visualiser.animateShowTree(0.25);
    this.visualiser.animateRemoveNode(last);        
        
    // show in array
    this.visualiser.animateShowInsertToArrayElem(this.tree.getRoot(), 0);
    array.push(this.tree.getRoot());
    
    
    // back to heap and redraw;
    var copy = btv.AbstractAlgorithm.copyTree(this.treeCopy);
    this.tree.setRoot(copy.getRoot());    
    
    this.visualiser.animateRedrawTree(this.tree);
        
        
    //this.visualiser.animateSelectNode(null);
    
    // routine
    this.redoEnd();
    
    array.reverse();
    return array;
}

/**
 * @override
 * @public
 */
btv.bh.HeapSortAlg.prototype.toString = function() {
    return "heapSort()";
}
