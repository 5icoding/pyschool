/**
 * @class Visualiser implementation.
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {jsgl.Panel} panel Panel for visualisation.
 */
btv.Visualiser = function(panel) {
    /**
     * @private
     * @type {jsgl.Panel}
     */
    this.panel = panel;
    
    /**
     * @private
     * @type {btv.AnimatorsArrayList}
     */
    this.animation = undefined;

    /**
     * @private
     * @type {btv.BinaryTreeNode}
     */
    this.selectedNode = null;
    
    /**
     * @private
     * @type {btv.Visualiser.ArrayElement}
     */
    this.arrayElem = null;
    
    /**
     * @TODO change if holder element size is changed
     *
     * @private
     * @type {Number}
     */
    this.width = panel.getHolderElement().clientWidth;
    
    /**
     * @TODO change if holder element size is changed
     *
     * @private
     * @type {Number}
     */
    this.height = panel.getHolderElement().clientHeight;
    
    /**
     * @private
     * @type {Number}
     */
    this.verticalSpacing = this.height/6;
    
    /**
     * Speed of moving of graphic nodes in px/ms.
     *
     * @private
     * @type {Number}
     */
    this.moveSpeed = 0.25;
    
    /**
     * Duration of the show in ms.
     *
     * @private
     * @type {Number}
     */
    this.stepDuration = 650;
    
    /**
     * @private
     * @type {Number}
     */
    this.animationFPS = 50;
    
    /**
     * Radius of circles in px.
     *
     * @private
     * @type {Number}
     */    
    this.circleRadius = this.verticalSpacing/4;
    
    /**
     * Clonned stroke objects for nodes (circles).
     * 
     * @private
     * @type {jsgl.stroke.SolidStroke}
     */ 
    this.circleStroke = new jsgl.stroke.SolidStroke();
    this.circleStroke.setColor("#1d1b19");
    this.circleStroke.setWeight(3);

        
    /**
     * Clonned stroke objects for selected node (circle).
     * 
     * @private
     * @type {jsgl.stroke.SolidStroke}
     */ 
    this.selectedCircleStroke = new jsgl.stroke.SolidStroke();
    this.selectedCircleStroke.setColor("#9b251b");
    this.selectedCircleStroke.setWeight(4);
    

    /**
     * Clonned fill objects for nodes (circles).
     * 
     * @private
     * @type {jsgl.fill.SolidFill}
     */
    this.circleFill = new jsgl.fill.SolidFill();
    this.circleFill.setColor('#cdf');
    
    /**
     * Clonned stroke objects for lines.
     * 
     * @private
     * @type {jsgl.stroke.SolidStroke}
     */     
    this.lineStroke = new jsgl.stroke.SolidStroke();
    this.lineStroke.setColor("#1d1b19");
    this.lineStroke.setWeight(2);
}

/**
 * Go to parent arrow - ⇑.
 *
 * @public
 * @static
 * @type {String}
 */
btv.Visualiser.upwardsDoubleArrow = String.fromCharCode(0x21d1);

/**
 * Go to parent arrow - ⇑.
 *
 * @public
 * @static
 * @type {String}
 */
btv.Visualiser.downwardsDoubleArrow = String.fromCharCode(0x21d3);

/**
 * Go to right child arrow - ⇘.
 *
 * @public
 * @static
 * @type {String}
 */
btv.Visualiser.southEastDoubleArrow = String.fromCharCode(0x21d8);
/**
 * Go to left child arrow - ⇙.
 *
 * @public
 * @static
 * @type {String}
 */
btv.Visualiser.southWestDoubleArrow = String.fromCharCode(0x21d9);

/**
 * Came from right child arrow - ↖.
 *
 * @public
 * @static
 * @type {String}
 */
btv.Visualiser.northWestArrow = String.fromCharCode(0x2196);

/**
 * Came from left child arrow - ↗.
 *
 * @public
 * @static
 * @type {String}
 */
btv.Visualiser.northEastArrow = String.fromCharCode(0x2197);

/**
 * @public
 */
btv.Visualiser.prototype.getMoveSpeed = function() {
    return this.moveSpeed;
}
/**
 * @public
 * @param {Number} speed Speed of move of graphic elements in animations in px/ms.
 */
btv.Visualiser.prototype.setMoveSpeed = function(speed) {
    this.moveSpeed = speed;
}

/**
 * @public
 */
btv.Visualiser.prototype.getStepDuration = function() {
    return this.stepDuration;
}

/**
 * @public
 * @param {Number} duration Duration of show animations in ms.
 */
btv.Visualiser.prototype.setStepDuration = function(duration) {
    this.stepDuration = duration;
}

/**
 * Play animation.
 * 
 * @public
 */ 
btv.Visualiser.prototype.playAnimation = function() {
    if(this.animation == null) {
        return false;
    }
    
    this.animation.play();
    
    return true;
}  

/**
 * Pause animation.
 * 
 * @public
 */ 
btv.Visualiser.prototype.pauseAnimation = function() {
    if(this.animation == null) {
        return false;
    }
    
    this.animation.pause();
    
    return true;
} 

/**
 * Skip whole animation.
 *
 * @public
 */
btv.Visualiser.prototype.skipAnimationForward = function() {
    if(this.animation == null) {
        return false;
    }
    
    var stopped = this.animation.stop(); // stop animator
    this.animation.setCurrentAnimatorIndex(this.animation.getCount()); // after the last // stop animation
    //this.redrawTree();
    
    return stopped;
} 

/**
 * Factory method, that create btv.elements.NodeElement.
 * This element represents a node as a group of a circle and a label.
 * @see btv.elements.NodeElement
 *
 * @public
 * @param {btv.BinaryTreeNode} node
 * @param {jsgl.Vector2D} location
 * @returns {btv.elements.NodeElement} Extended jsgl.elements.GroupElement representing a node.
 */
btv.Visualiser.prototype.createNodeElement = function(node, location) {
    
    // @author this part of the code is copy-pasted from JSGL library.
    var domPresenter;  
    if(jsgl.util.BrowserInfo.supportsSvg) {
        domPresenter = new jsgl.elements.SvgGroupDomPresenter(this.panel.ownerDocument);
    }
    else {
        domPresenter = new jsgl.elements.NonSvgGroupDomPresenter(this.panel.ownerDocument);
    }
    var nodeElem = new btv.elements.NodeElement(domPresenter, this, node.getValue(), location);

    if(node.selectable !== false) { // all selectable if not exactly false
        // add click listener
        nodeElem.addClickListener(jsgl.util.delegate(this, this.selectNodeListener));
        
        nodeElem.setCursor(jsgl.Cursor.POINTER);
        
        // all elements in group have to have reference to node because of selectNodeListener function
        nodeElem.circle.node = node;
        nodeElem.label.node = node;
    }
   
    return nodeElem;
}

/**
 * Factory method, that create btv.elements.StepElement.
 * This element represents an assistant node as a group of a circle and a label.
 * @see btv.elements.StepElement
 *
 * @public
 * @param {btv.BinaryTreeNode} node
 * @param {jsgl.Vector2D} location
 * @returns {btv.elements.NodeElement} Extended jsgl.elements.GroupElement representing a node.
 */
btv.Visualiser.prototype.createStepElement = function(node, location) {
    
    // @author this part of the code is copy-pasted from JSGL library.
    var domPresenter;  
    if(jsgl.util.BrowserInfo.supportsSvg) {
        domPresenter = new jsgl.elements.SvgGroupDomPresenter(this.panel.ownerDocument);
    }
    else {
        domPresenter = new jsgl.elements.NonSvgGroupDomPresenter(this.panel.ownerDocument);
    }
    var stepElem = new btv.elements.StepElement(domPresenter, this, node.getValue(), location);
   
    return stepElem;
}

/**
 * Factory method, that create btv.elements.EdgeElement.
 * This element represents an edge from a parent node to a child node as a group of lines.
 * @see btv.elements.EdgeElement
 *
 * @public
 * @param {btv.BinaryTreeNode} from
 * @param {btv.BinaryTreeNode} to
 * @returns {btv.elements.EdgeElement} Extended jsgl.elements.GroupElement representing an edge.
 */
btv.Visualiser.prototype.createEdgeElement = function(from, to) {
    
    // @author this part of the code is copy-pasted from JSGL library.
    var domPresenter;
    if(jsgl.util.BrowserInfo.supportsSvg) {
        domPresenter = new jsgl.elements.SvgGroupDomPresenter(this.panel.ownerDocument);
    }
    else {
        domPresenter = new jsgl.elements.NonSvgGroupDomPresenter(this.panel.ownerDocument);
    }
    var edgeElem = new btv.elements.EdgeElement(domPresenter, this, from, to);
    
    return edgeElem;
}

/**
 * Factory method, that create btv.elements.ComparisonSignElement.
 * This element represents a comparison sign as a group of a rectangle and a label.
 * @see btv.elements.ComparisonSignElement
 *
 * @public
 * @param {String} text
 * @param {jsgl.Vector2D} location
 * @returns {btv.elements.ComparisonSignElement} Extended jsgl.elements.GroupElement representing a comparison sign.
 */
btv.Visualiser.prototype.createComparisonSignElement = function(text, location) {
    
    // @author this part of the code is copy-pasted from JSGL library.
    var domPresenter;
    if(jsgl.util.BrowserInfo.supportsSvg) {
        domPresenter = new jsgl.elements.SvgGroupDomPresenter(this.panel.ownerDocument);
    }
    else {
        domPresenter = new jsgl.elements.NonSvgGroupDomPresenter(this.panel.ownerDocument);
    }
    var ComparisonSignElem = new btv.elements.ComparisonSignElement(domPresenter, this, text, location);
   
    return ComparisonSignElem;
}

/**
 * Factory method, that create btv.elements.ArrayElement.
 * This element represents an array as a group of rectangles and labels.
 * @see btv.elements.ArrayElement
 *
 * @public
 * @param {Number} length
 * @returns {btv.elements.ArrayElement} Extended jsgl.elements.GroupElement representing an array.
 */
btv.Visualiser.prototype.createArrayElement = function(length) {
    // @author JSGL
    var domPresenter;
  
    if(jsgl.util.BrowserInfo.supportsSvg) {
        domPresenter = new jsgl.elements.SvgGroupDomPresenter(this.panel.ownerDocument);
    }
    else {
        domPresenter = new jsgl.elements.NonSvgGroupDomPresenter(this.panel.ownerDocument);
    }
    
    var arrayElem = new btv.elements.ArrayElement(domPresenter, this, length);
    
    return arrayElem;
}

/**
 * Animate (re)creating and adding/showing node's nodeElement at given location.
 *
 * @private
 * @param {btv.BinaryTreeNode} node Which node will be displayed.
 * @param {jsgl.Vector2D} location Where the node will be displayed.
 * @param {Boolean} show True if show - set animation duration, false if just recreate and readd
 */
btv.Visualiser.prototype.animateShowNodeElemAtLoc = function(node, location, show) {
    var visualiser = this; // temporary visualiser reference for anonymous function
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);
    
    animator.addStartListener(function() {       
        if(show == true) {
            animator.setDuration(visualiser.stepDuration);
        } else {
            animator.setDuration(1);
        }
        
        // safely remove old nodeElement from panel if exists
        visualiser.removeElement(node.nodeElement);
   
        // create and add nodeElement
        node.nodeElement = visualiser.createNodeElement(node, location);
        
        visualiser.addElement(node.nodeElement);
    });
}

/**
 * Animate (re)creating and adding/showing stepElement at given location.
 *
 * @private
 * @param {btv.BinaryTreeNode} node Which node will be displayed.
 * @param {jsgl.Vector2D} location Where the node will be displayed.
 * @param {Boolean} show True if show - set animation duration, false if just recreate and readd
 */
btv.Visualiser.prototype.animateShowStepElemAtLoc = function(node, location, show) {
    var visualiser = this; // temporary visualiser reference for anonymous function
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);
    
    animator.addStartListener(function() {       
        if(show == true) {
            animator.setDuration(visualiser.stepDuration);
        } else {
            animator.setDuration(1);
        }
        
        // safely remove old nodeElement from panel if exists
        visualiser.removeElement(node.nodeElement);
   
        // create and add nodeElement
        node.nodeElement = visualiser.createStepElement(node, location);
        
        visualiser.addElement(node.nodeElement);
    });
}

/**
 * Animate (re)creating and adding node's nodeElement his index location.
 *
 * @public
 * @param {btv.BinaryTreeNode} node Which node will be displayed on his normal location.
 */
btv.Visualiser.prototype.animateAddNodeElem = function(node) {
    this.animateShowNodeElemAtLoc(node, this.getNodeIndexLocation(node.getIndex()), false);
}

/**
 * Animate (re)creating and showing node's nodeElement at his index location location.
 *
 * @public
 * @param {btv.BinaryTreeNode} node Which node will be displayed on his normal location.
 */
btv.Visualiser.prototype.animateShowNodeElem = function(node) {
    this.animateShowNodeElemAtLoc(node, this.getNodeIndexLocation(node.getIndex()), true);
}

/**
 * Animate (re)creating and adding node's nodeElement at given node location.
 *
 * @public
 * @param {btv.BinaryTreeNode} node Which node will be displayed on his normal location.
 * @param {btv.BinaryTreeNode|Number} nodeAt
 */
btv.Visualiser.prototype.animateAddNodeElemAt = function(node, nodeAt) {
    this.animateShowNodeElemAtLoc(node, this.getNodeIndexLocation(nodeAt), false);
}

/**
 * Animate (re)creating and showing node's nodeElement at given node location.
 *
 * @public
 * @param {btv.BinaryTreeNode} node Which node will be displayed on his normal location.
 * @param {btv.BinaryTreeNode|Number} nodeAt
 */
btv.Visualiser.prototype.animateShowNodeElemAt = function(node, nodeAt) {
    this.animateShowNodeElemAtLoc(node, this.getNodeIndexLocation(nodeAt), true);
}

/**
 * Animate (re)creating and adding node's nodeElement at given node location.
 *
 * @public
 * @param {btv.BinaryTreeNode} node Which node will be displayed on given location.
 * @param {btv.BinaryTreeNode|Number} nodeAt
 */
btv.Visualiser.prototype.animateAddAssistNodeElemAt = function(node, nodeAt) {
    this.animateShowStepElemAtLoc(node, this.getNodeIndexLocation(nodeAt), false);
}

/**
 * Animate (re)creating and showing node's nodeElement at given node location.
 *
 * @public
 * @param {btv.BinaryTreeNode} node Which node will be displayed on given location.
 * @param {btv.BinaryTreeNode|Number} nodeAt
 */
btv.Visualiser.prototype.animateShowAssistNodeElemAt = function(node, nodeAt) {
    this.animateShowStepElemAtLoc(node, this.getNodeIndexLocation(nodeAt), true);
}

/**
 * Animate (re)creating and adding node's nodeElement next to given node location.
 *
 * @public
 * @param {btv.BinaryTreeNode} node Which node will be displayed.
 * @param {btv.BinaryTreeNode|Number} nodeNextTo The node will be displayed next to this node.
 */
btv.Visualiser.prototype.animateAddNodeElemNextTo = function(node, nodeNextTo) {
    this.animateShowNodeElemAtLoc(node, this.getNextToNodeLocation(nodeNextTo), false);
}

/**
 * Animate (re)creating and showing node's nodeElement next to given node location.
 *
 * @public
 * @param {btv.BinaryTreeNode} node Which node will be displayed.
 * @param {btv.BinaryTreeNode|Number} nodeNextTo A node or an index of a node next to which the first node will be displayed.
 */
btv.Visualiser.prototype.animateShowNodeElemNextTo = function(node, nodeNextTo) {
    this.animateShowNodeElemAtLoc(node, this.getNextToNodeLocation(nodeNextTo), true);
}

/**
 * Animate (re)creating and adding node's nodeElement next to given node location.
 *
 * @public
 * @param {btv.BinaryTreeNode} node Which node will be displayed.
 * @param {btv.BinaryTreeNode|Number} nodeNextTo A node or an index of a node next to which the first node will be displayed.
 */
btv.Visualiser.prototype.animateAddAssistNodeElemNextTo = function(node, nodeNextTo) {
    this.animateShowStepElemAtLoc(node, this.getNextToNodeLocation(nodeNextTo), false);
}

/**
 * Animate (re)creating and showing node's nodeElement next to given node location.
 *
 * @public
 * @param {btv.BinaryTreeNode} node Which node will be displayed.
 * @param {btv.BinaryTreeNode|Number} nodeNextTo A node or an index of a node next to which the first node will be displayed.
 */
btv.Visualiser.prototype.animateShowAssistNodeElemNextTo = function(node, nodeNextTo) {
    this.animateShowStepElemAtLoc(node, this.getNextToNodeLocation(nodeNextTo), true);
}

/**
 * Animate swapping given nodes.
 *
 * @public
 * @param {btv.BinaryTreeNode} node1
 * @param {btv.BinaryTreeNode} node2
 */
btv.Visualiser.prototype.animateSwapNodeElems = function(node1, node2) {
    var visualiser = this; // temporary reference becouse of anonymous functions
    var tmp = {}; // temporary object to hold variables
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);
    
    animator.addStartListener(function() {
        node1.nodeElement.setZIndex(btv.elements.maxZIndex);
        node2.nodeElement.setZIndex(btv.elements.maxZIndex);
        
        tmp.point1 = node1.nodeElement.getLocation();
        tmp.point2 = node2.nodeElement.getLocation();
   
        tmp.direction = tmp.point2.subtract(tmp.point1);
        var time = Math.sqrt(tmp.direction.getX()*tmp.direction.getX() + tmp.direction.getY()*tmp.direction.getY())/visualiser.moveSpeed; 
                
        animator.setFps(visualiser.animationFPS);
        animator.setDuration(time);
    });
    
    animator.addStepListener(function(t) {
        tmp.newLocation1 = new jsgl.Vector2D(tmp.point1.getX() + t*tmp.direction.getX(), tmp.point1.getY() + t*tmp.direction.getY());
        tmp.newLocation2 = new jsgl.Vector2D(tmp.point2.getX() - t*tmp.direction.getX(), tmp.point2.getY() - t*tmp.direction.getY());
            
        node1.nodeElement.setLocation(tmp.newLocation1);
        node2.nodeElement.setLocation(tmp.newLocation2);
    });
    
    animator.addEndListener(function() { // swap edges
        
        var tmp;
        tmp = node1.edgeElement;
        node1.edgeElement = node2.edgeElement;
        node2.edgeElement = tmp;

        node1.nodeElement.setZIndex(btv.elements.NodeElement.zIndex);
        node2.nodeElement.setZIndex(btv.elements.NodeElement.zIndex);
    });
}


/**
 * Animate moving given nodes' nodeElements and edgeElement to their index locations.
 *
 * @public
 * @param {btv.BinaryTreeNode[]} nodes
 */
btv.Visualiser.prototype.animateMoveToIndexLoc = function(nodes) {
    var visualiser = this; // temporary reference becouse of anonymous functions
    var tmp = {}; // temporary object to hold variables
    
    tmp.startPoint = new Array();
    tmp.direction = new Array();
    tmp.time = 0;
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);

    animator.setFps(visualiser.animationFPS);
        
    animator.addStartListener(function() {
        var time;
        for(var i = 0; i < nodes.length; i++) {
            // maximalize z-index
            nodes[i].nodeElement.setZIndex(btv.elements.maxZIndex);
            if(visualiser.panel.containsElement(nodes[i].edgeElement)) {
                nodes[i].edgeElement.setZIndex(btv.elements.maxZIndex);
            }
            
            tmp.startPoint[i] = nodes[i].nodeElement.getLocation();
            tmp.endPoint = visualiser.getNodeIndexLocation(nodes[i].getIndex());
            tmp.direction[i] = tmp.endPoint.subtract(tmp.startPoint[i]);
            
            // same speed -> time of animation depend on distance, t = s/v
            time = Math.sqrt(tmp.direction[i].getX()*tmp.direction[i].getX() + tmp.direction[i].getY()*tmp.direction[i].getY())/visualiser.moveSpeed; 
            tmp.time = Math.max(tmp.time, time);
        }
        animator.setDuration(tmp.time);
    });
        
    animator.addStepListener(function(t) {
        for(var i = 0; i < nodes.length; i++) {
            
            tmp.newLocation = new jsgl.Vector2D(tmp.startPoint[i].getX() + t*tmp.direction[i].getX(), tmp.startPoint[i].getY() + t*tmp.direction[i].getY());
            nodes[i].nodeElement.setLocation(tmp.newLocation);

            if(visualiser.panel.containsElement(nodes[i].edgeElement)) {
                nodes[i].edgeElement.setStartEndNode(nodes[i].getParent(), nodes[i]);
            }
        } 
    });
    
    animator.addEndListener(function() {
        // set z-index to normal
        for(var i = 0; i < nodes.length; i++) {
            nodes[i].nodeElement.setZIndex(btv.elements.EdgeElement.zIndex);
            if(visualiser.panel.containsElement(nodes[i].edgeElement)) {
                nodes[i].edgeElement.setZIndex(btv.elements.EdgeElement.zIndex);    
            }
        }
    });
}

/**
 * Animate moving given node's nodeElement to given location.
 *
 * @private
 * @param {btv.BinaryTreeNode} node
 * @param {jsgl.Vector2D} location
 */
btv.Visualiser.prototype.animateMoveAtLoc = function(node, location) {
    var visualiser = this; // temporary reference becouse of anonymous functions
    var tmp = {}; // temporary object to hold variables
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);
    
    animator.setFps(visualiser.animationFPS);
        
    animator.addStartListener(function() {
        node.nodeElement.setZIndex(btv.elements.maxZIndex);
        
        tmp.startPoint = node.nodeElement.getLocation();
        tmp.endPoint = location;
        tmp.direction = tmp.endPoint.subtract(tmp.startPoint);

        // same speed -> time of animation depend on distance, t = s/v
        var time = Math.sqrt(tmp.direction.getX()*tmp.direction.getX() + tmp.direction.getY()*tmp.direction.getY())/visualiser.moveSpeed; 
        animator.setDuration(time);
    });
        
    animator.addStepListener(function(t) {
        tmp.newLocation = new jsgl.Vector2D(tmp.startPoint.getX() + t*tmp.direction.getX(), tmp.startPoint.getY() + t*tmp.direction.getY());
        node.nodeElement.setLocation(tmp.newLocation);
    });
    
    animator.addEndListener(function() {
        node.nodeElement.setZIndex(btv.elements.NodeElement.zIndex); 
    });
}

/**
 * Animate moving given node's nodeElement to given location.
 *
 * @public
 * @param {btv.BinaryTreeNode} node
 * @param {btv.BinaryTreeNode|Number} nodeNextTo A node or an index of a node
 */
btv.Visualiser.prototype.animateMoveNextTo = function(node, nodeNextTo) {
    this.animateMoveAtLoc(node, this.getNextToNodeLocation(nodeNextTo));
}

/**
 * Animate moving given node's nodeElement next to given node location.
 *
 * @public
 * @param {btv.BinaryTreeNode} node
 * @param {btv.BinaryTreeNode|Number} nodeTo A node or an index of a node
 */
btv.Visualiser.prototype.animateMoveTo = function(node, nodeTo) {
    this.animateMoveAtLoc(node, this.getNodeIndexLocation(nodeTo));
}

/**
 * Animate moving given node's nodeElement next to array location.
 *
 * @public
 * @param {btv.BinaryTreeNode} node
 */
btv.Visualiser.prototype.animateMoveNextToArrayElem = function(node) {
    var visualiser = this; // temporary reference becouse of anonymous functions
    var tmp = {}; // temporary object to hold variables
    
    var animator = new jsgl.util.Animator(); 
    this.animation.add(animator);
    
    animator.setFps(visualiser.animationFPS);
        
    animator.addStartListener(function() {
        node.nodeElement.setZIndex(btv.elements.maxZIndex);
        
        tmp.startPoint = node.nodeElement.getLocation();
        tmp.endPoint = visualiser.arrayElem.getLocation().subtract(new jsgl.Vector2D(0, 2*visualiser.circleRadius));
        tmp.direction = tmp.endPoint.subtract(tmp.startPoint);

        // same speed -> time of animation depend on distance, t = s/v
        var time = Math.sqrt(tmp.direction.getX()*tmp.direction.getX() + tmp.direction.getY()*tmp.direction.getY())/visualiser.moveSpeed; 
        animator.setDuration(time);
    });
        
    animator.addStepListener(function(t) {
        tmp.newLocation = new jsgl.Vector2D(tmp.startPoint.getX() + t*tmp.direction.getX(), tmp.startPoint.getY() + t*tmp.direction.getY());
        node.nodeElement.setLocation(tmp.newLocation);
    });
    
    animator.addEndListener(function() {
        node.nodeElement.setZIndex(btv.elements.NodeElement.zIndex); 
    });
}

/**
 * Animate (re)creating and adding node's edgeElement.
 * 
 * @public
 * @param {btv.BinaryTreeNode} node
 */
btv.Visualiser.prototype.animateAddEdgeElem = function(node) {
    var visualiser = this;
    var tmp = {};

    tmp.parent = node.getParent();
    tmp.isRoot = node.isRoot();
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);
        
    animator.addStartListener(function() {
        animator.setDuration(1);
        
        // remove old edgeElement from panel if exists
        visualiser.removeElement(node.edgeElement);

        if(!tmp.isRoot) { // root has no parent so no edge
            node.edgeElement = visualiser.createEdgeElement(tmp.parent, node);
            visualiser.addElement(node.edgeElement);
        }
    });
}

/**
 * Animate (re)creating and adding an arrayElement.
 * 
 * @public
 * @param {Number} length
 */
btv.Visualiser.prototype.animateAddArrayElem = function(length) {
    var visualiser = this;
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);
    
    animator.addStartListener(function() {
        animator.setDuration(1);
        
        // remove old edgeElement from panel if exists
        visualiser.removeElement(visualiser.arrayElem);
        
        visualiser.arrayElem = visualiser.createArrayElement(length);
        visualiser.addElement(visualiser.arrayElem);
    });
}

/**
 * Animate removing an arrayElement.
 * 
 * @public
 */
btv.Visualiser.prototype.animateRemoveArrayElem = function() {
    var visualiser = this;
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);

    animator.addStartListener(function() {
        animator.setDuration(1);
        
        visualiser.removeElement(visualiser.arrayElem);
        visualiser.arrayElem = null;
    });
}

/**
 * Animate (re)creating and showing a comparisonSignElement.
 *
 * @public
 * @param {btv.BinaryTreeNode} node1 Node on the left/top - the moving one.
 * @param {Boolean|Number} isGreater True if node1 is greater than or equal to node2,  false if is smaller. 1 if is greater, 0 if is equal, -1 if is smaller.
 * @param {btv.BinaryTreeNode} node2 Node on the right/botton - the static one.
 */
btv.Visualiser.prototype.animateShowComparSign = function(node1, isGreater, node2) {
    var visualiser = this;
    var tmp = {};

    var animator = new jsgl.util.Animator();
    this.animation.add(animator);

    animator.addStartListener(function() {
        animator.setDuration(visualiser.stepDuration);
        
        var labelText;
        if(typeof(isGreater) == "boolean") {
            labelText = isGreater ? ">=" : "<";
        }
        else {
            if(isGreater > 0) {
                labelText = ">";
            } else if(isGreater < 0) {
                labelText = "<";
            } else {
                labelText = "=";
            }
        }
        
        var location = new jsgl.Vector2D(           
            (node1.nodeElement.getX() + node2.nodeElement.getX())/2,
            (node1.nodeElement.getY() + node2.nodeElement.getY())/2);
            
        tmp.comparisonSignElem = visualiser.createComparisonSignElement(labelText, location);
        
        visualiser.addElement(tmp.comparisonSignElem);
    });
        
    animator.addEndListener(function() {
        visualiser.removeElement(tmp.comparisonSignElem);
    });
}

/**
 * Animate showing of removing a nodeElement and an edgeElement.
 * 
 * @public
 * @param {btv.BinaryTreeNode} node
 */
btv.Visualiser.prototype.animateShowRemoveNode = function(node) {
    var visualiser = this;
    var tmp = {};
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);
    
    if(node.edgeElement != null) {
        tmp.startParentEdgeOpacity = node.edgeElement.getElementAt(0).getStroke().getOpacity();
    }
    if(node.getLeft() != null) {
        tmp.hadLeft = true;
        tmp.left = node.getLeft();
        tmp.startLeftEdgeOpacity = node.getLeft().edgeElement.getElementAt(0).getStroke().getOpacity();
    }
    if(node.getRight() != null) {
        tmp.hadRight = true;
        tmp.right = node.getRight();
        tmp.startRightEdgeOpacity = node.getRight().edgeElement.getElementAt(0).getStroke().getOpacity();
    }     
       
    animator.addStartListener(function() {
        animator.setDuration(visualiser.stepDuration);
               
        tmp.startStrokeOpacity = node.nodeElement.getElementAt(0).getStroke().getOpacity();
        tmp.startFillOpacity = node.nodeElement.getElementAt(0).getFill().getOpacity();
        tmp.startLabelOpacity = node.nodeElement.label.getOpacity();
    });
        
    animator.addStepListener(function(t) {
        if(node.edgeElement != null) {
            node.edgeElement.getElementAt(0).getStroke().setOpacity((1-t) * tmp.startParentEdgeOpacity);
            node.edgeElement.getElementAt(1).getStroke().setOpacity((1-t) * tmp.startParentEdgeOpacity);
            node.edgeElement.getElementAt(2).getStroke().setOpacity((1-t) * tmp.startParentEdgeOpacity);
        }
        if(tmp.hadLeft == true) {
            tmp.left.edgeElement.getElementAt(0).getStroke().setOpacity((1-t) * tmp.startLeftEdgeOpacity);
            tmp.left.edgeElement.getElementAt(1).getStroke().setOpacity((1-t) * tmp.startLeftEdgeOpacity);
            tmp.left.edgeElement.getElementAt(2).getStroke().setOpacity((1-t) * tmp.startLeftEdgeOpacity);
        }
        if(tmp.hadRight == true) {
            tmp.right.edgeElement.getElementAt(0).getStroke().setOpacity((1-t) * tmp.startRightEdgeOpacity);
            tmp.right.edgeElement.getElementAt(1).getStroke().setOpacity((1-t) * tmp.startRightEdgeOpacity);
            tmp.right.edgeElement.getElementAt(2).getStroke().setOpacity((1-t) * tmp.startRightEdgeOpacity);
        }
        node.nodeElement.getElementAt(0).getStroke().setOpacity((1-t) * tmp.startStrokeOpacity);
        node.nodeElement.getElementAt(0).getFill().setOpacity((1-t) * tmp.startFillOpacity);
        node.nodeElement.label.setOpacity((1-t) * tmp.startLabelOpacity);
    });
        
    animator.addEndListener(function() {
        visualiser.removeNodeElements(node); // remove nodeElement, edgeElement
    });
}

/**
 * Animate removing a nodeElement and an edgeElement.
 * 
 * @public
 * @param {btv.BinaryTreeNode} node
 */
btv.Visualiser.prototype.animateRemoveNode = function(node) {
    var visualiser = this;
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);
    
    animator.addStartListener(function() {
        animator.setDuration(1);
        
        // remove elements from panel
        visualiser.removeNodeElements(node);
    });
}

/**
 * Animate removing given elements.
 * 
 * @public
 * @param {Array<jsgl.elements.AbstractElement>}
 */
btv.Visualiser.prototype.animateRemoveElements = function(elements) {
    var visualiser = this;
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);

    animator.addStartListener(function() {
        animator.setDuration(1);
        
        // remove elements from panel
        visualiser.removeElements(elements);
    });
}

/**
 * Animate removing given element.
 * 
 * @public
 * @param {jsgl.elements.AbstractElement}
 */
btv.Visualiser.prototype.animateRemoveElement = function(element) {
    var visualiser = this;
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);

    animator.addStartListener(function() {
        animator.setDuration(1);
        
        // remove elements from panel
        visualiser.removeElement(element);
    });
}

/**
 * Animate changing (or showing of changing) node's nodeElement.
 * 
 * @public
 * @param {btv.BinaryTreeNode} node
 * @param {String} text
 * @param {Boolean} struckThrough
 * @param {Boolean} show
 */
btv.Visualiser.prototype.animateChangeAssistNodeShowParam = function(node, text, struckThrough, show) {
    var visualiser = this;
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);
    
    animator.addStartListener(function() {
        if(show === false) {
            animator.setDuration(1);
        } else {
            animator.setDuration(visualiser.stepDuration);
        }
        
        node.nodeElement.label.setText(text);
        node.nodeElement.label.setStruckThrough(struckThrough);
    });
}

/**
 * Animate showing of changing node's nodeElement.
 * 
 * @public
 * @param {btv.BinaryTreeNode} node
 * @param {String} text
 * @param {Boolean} struckThrough
 */
btv.Visualiser.prototype.animateShowChangeAssistNode = function(node, text, struckThrough) {
    this.animateChangeAssistNodeShowParam(node, text, struckThrough, true);
}

/**
 * Animate changing node's nodeElement.
 * 
 * @public
 * @param {btv.BinaryTreeNode} node
 * @param {String} text
 * @param {Boolean} struckThrough
 */
btv.Visualiser.prototype.animateChangeAssistNode = function(node, text, struckThrough) {
    this.animateChangeAssistNodeShowParam(node, text, struckThrough, false);
}

/**
 * Animate showing of inserting to arrayElement.
 * 
 * @public
 * @param {btv.BinaryTreeNode} node
 * @param {Number} index
 */
btv.Visualiser.prototype.animateShowInsertToArrayElem = function(node, index) {
    var visualiser = this;
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);
    
    animator.addStartListener(function() {
        animator.setDuration(visualiser.stepDuration);
        
        if(node == null) {
            visualiser.arrayElem.setTextAt(index, "n");
        } else {
            visualiser.arrayElem.setTextAt(index, node.getValue());
        }
    });
}

/**
 * Animate
 * 
 * @private
 * @param {btv.BinaryTreeNode} node
 * @param {Boolean} show
 */
btv.Visualiser.prototype.animateSelectNodeShowParam = function(node, show) {
    var visualiser = this;
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);
    
    animator.addStartListener(function() {
        if(show) {
            animator.setDuration(visualiser.stepDuration);
        } else {
            animator.setDuration(1);    
        }
        
        visualiser.setSelectedNode(node);
    });
}

/**
 * Animate showing of selecting of a given node.
 * 
 * @public
 * @param {btv.BinaryTreeNode} node
 */
btv.Visualiser.prototype.animateShowSelectNode = function(node) {    
    this.animateSelectNodeShowParam(node, true);
}

/**
 * Animate selecting of a given node.
 * 
 * @public
 * @param {btv.BinaryTreeNode} node
 */
btv.Visualiser.prototype.animateSelectNode = function(node) {
    this.animateSelectNodeShowParam(node, false);
}

/**
 * Animate showing the tree.
 * 
 * @public
 * @param {Number} 
 */
btv.Visualiser.prototype.animateShowTree = function(ratio) {
    var visualiser = this;
    
    if(ratio == null) {
        ratio = 1;
    }
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);
    
    animator.addStartListener(function() {
        animator.setDuration(ratio * visualiser.stepDuration);    
    });
}

/**
 * Animate redrawing given tree.
 * 
 * @public
 * @param {btv.BinaryTree} tree
 */
btv.Visualiser.prototype.animateRedrawTree = function(tree) {
    var visualiser = this;
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);
    
    animator.addStartListener(function() {
        animator.setDuration(1);
        
        visualiser.redrawTree(tree);
    });
}

/**
 * Start animation, that create new btv.AnimatorsArrayList object and fire startAnimationListeners of given algorithm.
 * 
 * @public
 * @param {btv.AbstractAlgorithm} algorithm This algorithm's start animation chain listeners will be invoked
 */
btv.Visualiser.prototype.animateStart = function(algorithm) {
    
    // it is just subalgorithm not a start of new algorithm
    if(algorithm.isSubalgorithm) {
        return; 
    }

    this.animation = new btv.AnimatorsArrayList();  

    var animator = new jsgl.util.Animator();
    this.animation.add(animator);

    animator.addStartListener(function() {
        animator.setDuration(1);
        
        algorithm.fireStartAnimationListeners();
    });
}

/**
 * End animation, that fire endAnimationListeners of given algorithm.
 * 
 * @public
 * @param {btv.AbstractAlgorithm} algorithm This algorithm's end animation chain listeners will be invoked
 */
btv.Visualiser.prototype.animateEnd = function(algorithm) {
    
    // it is subalgorithm not a start of new algorithm
    if(algorithm.isSubalgorithm) {
        return; 
    }
    
    var animator = new jsgl.util.Animator();
    this.animation.add(animator);
    
    animator.addStartListener(function() {
        animator.setDuration(1);
    });
    
    animator.addEndListener(function() {
        
        algorithm.fireEndAnimationListeners();
    });
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * NodeElement click listener - event handler.
 * 
 * @private 
 * @param {Object} eventArgs 
 */
btv.Visualiser.prototype.selectNodeListener = function(eventArgs) {
    var node = eventArgs.getSourceElement().node;
    
    if(node === this.getSelectedNode()) { // already selected => deselect
        this.setSelectedNode(null);
    } else {
        this.setSelectedNode(node);
    }
}

/**
 * @public
 * @param {btv.BinaryTreeNode} node
 */
btv.Visualiser.prototype.setSelectedNode = function(node) {

    if(this.selectedNode !== null && this.selectedNode === node) { // already selected
        return;
    }
    
    if(this.selectedNode !== null) { // deselect previous
        this.selectedNode.nodeElement.circle.setStroke(jsgl.util.clone(this.circleStroke));
    }
    
    if(node !== null) { // select given
        node.nodeElement.circle.setStroke(jsgl.util.clone(this.selectedCircleStroke));
    }
    
    this.selectedNode = node;
}

/**
 * @public
 * @returns {btv.BinaryTreeNode} selected node or null
 */
btv.Visualiser.prototype.getSelectedNode = function() {
    return this.selectedNode;
}

/**
 * Safely add given jsglElements to jsglPanel.
 * 
 * @public
 * @param {jsgl.elements.AbstractElement[]} elements Array of jsglElements to add to jsglPanel.
 * @return {Number} Return number of actually added elements.
 */ 
btv.Visualiser.prototype.addElements = function(elements) {   
    if(elements == null) { // null or undefined
        return 0;
    }
    
    var count = 0;
    for(var i = 0; i < elements.length; i++) {
        if(elements[i] == null) {
            continue; // skip null or undefined element
        }
        
        if(!this.panel.containsElement(elements[i])) {
            this.panel.addElement(elements[i]); // add element if is not contained in panel
            count++;
        }
    }
    
    return count;
}

/**
 * Safely add given jsglElement to jsglPanel.
 * 
 * @public
 * @param {jsgl.elements.AbstractElement} element A jsglElements to add.
 * @return {Number} Return number of actually added elements.
 */ 
btv.Visualiser.prototype.addElement = function(element) {
    return this.addElements([element]);
}

/**
 * Securely add all jsglElements of given node to jsglPanel.
 * 
 * @public
 * @param {btv.BinaryTree} node
 * @return {Number} Return number of actually added elements.
 */ 
btv.Visualiser.prototype.addNodeElements = function(node) {
    if(node == null) { 
        return 0; // do nothing for null or undefined node
    }
    
    // @warning add elements here if node is composed of more than that elements
    return this.addElements([node.nodeElement, node.edgeElement]);
}

/**
 * Safely remove given jsglElements added to jsglPanel.
 * 
 * @public
 * @param {jsgl.elements.AbstractElement[]} elements Array of jsglElements to remove.
 * @return {Number} Return number of actually removed elements.
 */ 
btv.Visualiser.prototype.removeElements = function(elements) {   
    if(elements == null) { // null or undefined
        return 0;
    }
    
    var count = 0;
    for(var i = 0; i < elements.length; i++) {
        if(elements[i] == null) {
            continue; // skip null or undefined element
        }
        
        if(this.panel.containsElement(elements[i])) {
            this.panel.removeElement(elements[i]); // remove element if is contained in panel
            count++;
        }
    }
    
    return count;
}

/**
 * Safely remove given jsglElement from jsglPanel.
 * 
 * @public
 * @param {jsgl.elements.AbstractElement} element A jsglElements to remove.
 * @return {Number} Return number of actually removed elements.
 */ 
btv.Visualiser.prototype.removeElement = function(element) {
    return this.removeElements([element]);
}

/**
 * Securely remove all jsglElements added to jsglPanel referenced from the node.
 * 
 * @public
 * @param {btv.BinaryTree} node
 * @return {Number} Return number of actually removed elements.
 */ 
btv.Visualiser.prototype.removeNodeElements = function(node) { 
    if(node == null) { 
        return 0; // do nothing for null or undefined node
    }
    
    // @warning add elements here if node is composed of more than that elements
    return this.removeElements([node.nodeElement, node.edgeElement]);
}

/**
 * @private
 * @param {btv.BinaryTreeNode|Number} node A node or index of a node.
 * @returns {jsgl.Vectro2D}
 */
btv.Visualiser.prototype.getNodeIndexLocation = function(node) {
    
    if(node instanceof btv.BinaryTreeNode) {
        node = node.getIndex();
    }
    var n = 0;
    
    // number of row
    for(var i = 0; node >= n; i++) { 
        n += Math.pow(2,i);
    }
    n -= Math.pow(2, i-1); // correction
    
    // number of column
    var j = node - n + 1;
    j = 1 + (j-1)*2; // recalculated
    
    return new jsgl.Vector2D(j/Math.pow(2, i) * this.width, i * this.verticalSpacing);
}

/**
 * @private
 * @param {btv.BinaryTreeNode|Number} node A node or an index of a node.
 * @returns {jsgl.Vector2D}  
 */
btv.Visualiser.prototype.getNextToNodeLocation = function(node) {
    return this.getNodeIndexLocation(node).subtract(new jsgl.Vector2D(0, this.circleRadius + this.verticalSpacing/2));
}

/**
 * @public
 * @param {btv.BinaryTree} tree
 */
btv.Visualiser.prototype.redrawTree = function(tree) {
    this.panel.clear();
    this.setSelectedNode(null);
    
    var node = tree.getRoot();
    
    if(node === null) {
        return;
    }
    
    node.nodeElement = this.createNodeElement(node, this.getNodeIndexLocation(node));
    this.addElement(node.nodeElement);
    
    this.redrawNodeRec(node.getLeft());
    this.redrawNodeRec(node.getRight());
    
    if(btv.controller.returnedValue != undefined) {
        if(btv.controller.returnedValue instanceof btv.BinaryTreeNode) {
            this.setSelectedNode(btv.controller.returnedValue);
        }
        // else if(btv.controller.returnedValue instanceof Array) {
        else if(this.arrayElem != null) {
            this.addElement(this.arrayElem);
        
            var array = new Array();
            for(var i = 0; i < btv.controller.returnedValue.length; i++) {
                if(btv.controller.returnedValue[i] == null) {
                    array.push("n");
                } else {
                    array.push(btv.controller.returnedValue[i].getValue());
                }
            }
            this.arrayElem.setTextAll(array);
        }
    }
}

/**
 * @private
 * @param {btv.BinaryTreeNode} node
 */
btv.Visualiser.prototype.redrawNodeRec = function(node) {
    if(node == null) {
        return;
    }
    
    node.nodeElement = this.createNodeElement(node, this.getNodeIndexLocation(node));
    node.edgeElement = this.createEdgeElement(node.getParent(), node); // has to have parent, root is recreated and readed in redrawTree
    
    this.addNodeElements(node);
    
    this.redrawNodeRec(node.getLeft());
    this.redrawNodeRec(node.getRight());
}