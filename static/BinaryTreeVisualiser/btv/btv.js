/**
 * @author Jakub Melezinek
 * @namespace Binary Tree Visualiser.
 */
btv = {   
    
    /**
     * @namespace Elements
     */
    elements: {},
    
    /**
     * @namespace Binary Search Tree
     */
    bst: {},
    
    /**
     * @namespace Binary Heap
     */
    bh: {}    
};



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class Custom binary tree exception. 
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {String} message
 */
btv.BinaryTreeException = function(message) {
    /*
     * @public
     * @type {String}
     */
    this.message = message;
}
/*
 * @override
 *
 * @public
 * @returns {String}
 */
btv.BinaryTreeException.prototype.toString = function() {
    return "btv.BinaryTree Exception: " + this.message;
}

/**
 * @class Custom binary tree node exception. 
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {String} message
 */
btv.BinaryTreeNodeException = function(message) {
    /*
     * @public
     * @type {String}
     */
    this.message = message;
}
/*
 * @override
 *
 * @public
 * @returns {String}
 */
btv.BinaryTreeNodeException.prototype.toString = function() {
    return "btv.BinaryTreeNode Exception: " + this.message;
}

/**
 * @class Custom algorithm exception. 
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {String} message
 */
btv.AlgorithmException = function(message) {
    /*
     * @public
     * @type {String}
     */
    this.message = message;
}

/*
 * @override
 * @public
 * @returns {String}
 */
btv.AlgorithmException.prototype.toString = function() {
    return "btv.AbstractAlgorithm Exception: " + this.message;
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class Array list of animators. Provides synchronous animating. 
 * An instance of animatorsArrayList = animation of an algorithm.
 * @author Jakub Melezinek
 * 
 * @constructor
 * @extends jsgl.util.ArrayList
 */
btv.AnimatorsArrayList = function() {
    jsgl.util.ArrayList.call(this);
    
    /**
     * @private
     * @type {Number}
     */
    this.currentAnimatorIndex = 0;
}
btv.AnimatorsArrayList.jsglExtend(jsgl.util.ArrayList);

/**
 * @public
 * @param {Number} index
 * @returns {jsgl.util.Animator}
 */
btv.AnimatorsArrayList.prototype.setCurrentAnimatorIndex = function(index) {
    this.currentAnimatorIndex = index;
}

/**
 * @public
 * @returns {Number}
 */
btv.AnimatorsArrayList.prototype.getCurrentAnimatorIndex = function() {
    return this.currentAnimatorIndex
}

/**
 * @protected
 * @returns {jsgl.util.Animator} Returns current animator or null if array list is empty or all animators were played.
 */
btv.AnimatorsArrayList.prototype.getCurrentAnimator = function() {
    return this.get(this.currentAnimatorIndex); 
}


/**
 * @override
 * @public
 * @param {jsgl.util.Animator} animator
 */
btv.AnimatorsArrayList.prototype.add = function(animator) {
    var aal = this;
    
    animator.addEndListener(function() {
        aal.currentAnimatorIndex++;
        aal.play();
    });
    
    jsgl.util.ArrayList.prototype.add.call(this, animator);
}

/**
 * @public
 * @returns Returns -1 if is stopped (at the end of animation, no animator), 0 if is paused, 1 if is playing
 */
btv.AnimatorsArrayList.prototype.isPlaying = function() {
    var currentAnimator = this.getCurrentAnimator();
    if(currentAnimator == null) {
        return -1;
    } 
    
    if(currentAnimator.isPlaying()) {
        return 1;
    } else {
        return 0;
    }
}

/**
 * Plays current animator. 
 *
 * @public
 * @returns Returns false if current animator is null, othervise true.
 */
btv.AnimatorsArrayList.prototype.play = function() {
    var currentAnimator = this.getCurrentAnimator();
    if(currentAnimator == null) {
        return false;
    }
    
    currentAnimator.play();
    
    return true;
}

/**
 * Pauses current animator.
 * 
 * @public
 * @returns Returns false if current animator is null, othervise true.
 */
btv.AnimatorsArrayList.prototype.pause = function() {
    var currentAnimator = this.getCurrentAnimator();
    if(currentAnimator == null) {
        return false;
    }
    
    currentAnimator.pause();
    
    return true;
}

/**
 * Stops current animator.
 * 
 * @public
 * @returns Returns false if current animator is null, othervise true.
 */
btv.AnimatorsArrayList.prototype.stop = function() {
    var currentAnimator = this.getCurrentAnimator();
    if(currentAnimator == null) {
        return false;
    }
    
    currentAnimator.stop();
    
    return true;
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class Array list of algorithms.
 * @author Jakub Melezinek
 * 
 * @constructor
 * @extends jsgl.util.ArrayList
 */
btv.AlgorithmsArrayList = function() {
    jsgl.util.ArrayList.call(this);
    
    /**
     * @private
     * @type {Number}
     */
    this.currentAlgorithmIndex = -1; 

    /**
     * @private
     * @type {Function}
     */    
    this.delegatedIncreaseCurrentAlgorithmIndex = jsgl.util.delegate(this, this.increaseCurrentAlgorithmIndex);
}
btv.AlgorithmsArrayList.jsglExtend(jsgl.util.ArrayList);

/**
 * @public
 * @returns {Number}
 */
btv.AlgorithmsArrayList.prototype.getCurrentAlgorithmIndex = function() {
    // return null for non-existent index (for example if array list is empty)
    return this.currentAlgorithmIndex; 
}

/**
 * @public
 * @returns {btv.AbstractAlgorithm}
 */
btv.AlgorithmsArrayList.prototype.getCurrentAlgorithm = function() {
    // return null for non-existent index (for example if array list is empty)
    return this.get(this.currentAlgorithmIndex); 
}

/**
 * @override
 * @public
 * @param {btv.AbstractAlgorithm} algorithm
 * @param {Boolean} playContinously
 */
btv.AlgorithmsArrayList.prototype.add = function(algorithm, playContinously) {
    
    if(playContinously) {
        algorithm.addEndAnimationListener(this.delegatedIncreaseCurrentAlgorithmIndex);
    }
    
    // actually add algorithm to array list
    jsgl.util.ArrayList.prototype.add.call(this, algorithm);
}

/**
 * Increase current algorithm index (if there is some next algorithm), redo new current algorithm and play it.
 *
 * @private
 * @returns {Boolean} Returns true if index was increased, otherwise returns false.
 */
btv.AlgorithmsArrayList.prototype.increaseCurrentAlgorithmIndex = function() {

    this.currentAlgorithmIndex++;
    var curAlg = this.getCurrentAlgorithm();

    if(curAlg !== null) {
        
        // execute the algorithm
        // @TODO not nice but global, becouse of delegatedIncreaseCurrentAlgorithmIndex
        // it is called as endListener of algorithms, problem to return value and set it
        btv.controller.returnedValue = curAlg.redo();

        // play the algorithm
        // @TODO not nice but global, becouse of delegatedIncreaseCurrentAlgorithmIndex
        // it is called as endListener of algorithms, have to have another delegated function to play the animation
        btv.controller.visualiser.animation.play();
        
        
        // select right algorithm in history option
        var select = document.getElementById("historySelect");
        select.selectedIndex = this.currentAlgorithmIndex;
        
        return true;
    } else {
        this.currentAlgorithmIndex--; // no next algorithm => do not increase index
        
        return false;
    }
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/*
 * Returns a random integer between min and max (inclusive).
 * 
 * @public
 * @param min {Number}
 * @param max {Number}
 */
btv.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}