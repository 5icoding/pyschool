/**
 * @class Abstract controller.
 * @author Jakub Melezinek
 * 
 * @abstract
 * @protected
 * @constructor
 * @param {HTMLDivElement} controlsDiv
 * @param {HTMLDivElement} treeDiv
 */
btv.AbstractController = function(controlsDiv, treeDiv) {

    // Prevent flashing new created elements.
    jsgl.IMMEDIATE_UPDATE = true;
     
    /**
     * @global
     * @type {btv.AbstractController}
     */    
    btv.controller = this;  
    
    /**
     * @protected
     * @type {HTMLDivElement}
     */    
    this.controlsDiv = controlsDiv;    
    
    /**
     * @protected
     * @type {HTMLDivElement}
     */    
    this.treeDiv = treeDiv;

    /**
     * Init in concrete child class.
     *
     * @protected
     * @type {btv.BinaryTree}
     */
    this.tree = this.tree;
    
    /**
     * @protected
     * @type {btv.Visualiser}
     */
    this.visualiser = new btv.Visualiser(new jsgl.Panel(treeDiv));

    /**
     * @protected
     * @type {jsgl.util.ArrayList}
     */
    this.algorithms = new btv.AlgorithmsArrayList();
    
    /**
     * @public
     * @type {mixed}
     */    
    this.returnedValue = undefined;
    
    /**
     * @protected
     * @type {Function}
     */
    this.delegatedDisableButtons = jsgl.util.delegate(this, this.disableButtons);
    
    /**
     * @protected
     * @type {Function}
     */
    this.delegatedEnableButtons = jsgl.util.delegate(this, this.enableButtons);

    // create inner divs
    /**
     * @protected
     * @type {HTMLDivElement}
     */
    this.controlsDiv.animationDiv = document.createElement("div");
    this.controlsDiv.animationDiv.setAttribute("id", "animationDiv");
    this.controlsDiv.appendChild(this.controlsDiv.animationDiv);

    // fill animation div
    this.controlsDiv.animationDiv.innerHTML =
    '<div id="animationLegend" class="legend">Animation</div>' +
    
    '<div class="item">' + 
    '<button id="previousButton">Previous</button>' +
    '<button id="skipBackwardButton">Skip Backward</button>' +
    '<button id="playPauseButton">Play</button>' +
    '<button id="skipForwardButton">Skip Forward</button>' +
    '<button id="nextButton">Next</button>' +
    '<input id="continuouslyCheckbox" type="checkbox" checked="checked"/><label for="continuouslyCheckbox">Continuously</label>' +
    '</div>' +

    '<div class="item">' +
    'Speed of move: <div id="moveSpeedSlider"></div>' + 
    '</div>' +
    
    '<div class="item">' +
    'Duration of a step: <div id="stepDurationSlider"></div>' + 
    '</div>';

    // jQuery UI
    $("#previousButton").button({
        icons: {
            primary: "ui-icon-seek-prev"
        },
        disabled: true,
        text: false
    }).click(jsgl.util.delegate(this, this.redoPreviousButton));

    $("#skipBackwardButton").button({
        icons: {
            primary: "ui-icon-seek-start"
        },
        disabled: true,
        text: false
    }).click(jsgl.util.delegate(this, this.skipBackwardButton));

    $("#playPauseButton").button({
        icons: {
            primary: "ui-icon-play"
        },
        text: false,
        disabled: true
    }).click(jsgl.util.delegate(this, this.playPauseButton));
    
    $("#skipForwardButton").button({
        icons: {
            primary: "ui-icon-seek-end"
        },
        disabled: true,
        text: false
    }).click(jsgl.util.delegate(this, this.skipForwardButton));
    
    $("#nextButton").button({
        icons: {
            primary: "ui-icon-seek-next"
        },
        disabled: true,
        text: false
    }).click(jsgl.util.delegate(this, this.redoNextButton));
    
    $("#continuouslyCheckbox").change(jsgl.util.delegate(this, this.continuouslyCheckbox));

    $("#moveSpeedSlider").slider({
        min: 100, 
        max: 1000,    
        value: this.visualiser.getMoveSpeed()*1000,
        change: jsgl.util.delegate(this, this.moveSpeedButton)
    }); 

    $("#stepDurationSlider").slider({
        min: 100, 
        max: 2000,    
        value:  this.visualiser.getStepDuration(),
        change: jsgl.util.delegate(this, this.stepDurationButton)
    });
    
    /**
     * @protected
     * @type {HTMLDivElement}
     */
    this.controlsDiv.historyDiv = document.createElement("div");
    this.controlsDiv.historyDiv.setAttribute("id", "historyDiv");
    this.controlsDiv.appendChild(this.controlsDiv.historyDiv);
    
    // fill history div
    this.controlsDiv.historyDiv.innerHTML = 
    '<div id="historyLegend" class="legend">History</div>' +
    '<form id="historyForm" action="javascript:btv.controller.redoSelectedButton()">' +
    
    '<div class="item">' + 
    '<select id="historySelect" ondblclick="btv.controller.redoSelectedButton();">' +
    '</select>' +
    '</div>' +

    '</form>';    

    /**
     * @protected
     * @type {HTMLDivElement}
     */
    this.controlsDiv.algorithmsDiv = document.createElement("div");
    this.controlsDiv.algorithmsDiv.setAttribute("id", "algorithmsDiv");
    this.controlsDiv.appendChild(this.controlsDiv.algorithmsDiv);
}

/**
 * Check and alert.
 *
 * @protected
 * @static
 * @param{Number} num
 * @return{Boolean}
 */
btv.AbstractController.isNumber = function(num) {
    
    if(isNaN(num)) {
        alert("The value is not a number.");
        return false;
    }
    
    return true;
}

/**
 * Add an option to historySelect.
 * 
 * @protected
 * @param {btv.AbstractAlgorithm} algorithm
 */
btv.AbstractController.prototype.addHistoryOption = function(algorithm) {

    var select = document.getElementById("historySelect");
    var option = document.createElement("option");
    option.text = algorithm.toString();

    // add the option at the end
    try
    {
        // for IE earlier than version 8
        select.add(option,select.options[null]);
    }
    catch (e)
    {
        select.add(option,null);
    }
    
    // select current algorithm
    select.selectedIndex = this.algorithms.currentAlgorithmIndex;
}

/**
 * Enable algorithms buttons and change animation buttons.
 * Used as listener of end of animation.
 *
 * @protected
 */
btv.AbstractController.prototype.enableButtons = function() {
    var buttons;
    var i;

    buttons = this.getAlgorithmsButtons();
    for(i = 0; i < buttons.length; i++) {
        buttons[i].disabled = false;
        buttons[i].form.onsubmit = function () {
            return true;  
        };
    }
    
    $("#playPauseButton").button("option", "disabled", true).button("option", "icons", {
        primary: "ui-icon-play"
    });
    $("#skipForwardButton").button("option", "disabled", true);  
}

/**
 * Disable algorithms buttons and change animation buttons.
 * Used as listener of start of animation.
 *
 * @protected
 */
btv.AbstractController.prototype.disableButtons = function() {
    var buttons;
    var i;

    buttons = this.getAlgorithmsButtons();
    for(i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
        buttons[i].form.onsubmit = function () {
            return false;  
        };
    }
    
    $("#playPauseButton").button("option", "disabled", false).button("option", "icons", {
        primary: "ui-icon-pause"
    });
    $("#skipBackwardButton").button("option", "disabled", false);
    $("#skipForwardButton").button("option", "disabled", false);
    if(this.algorithms.getCurrentAlgorithmIndex() >= 1) {
        $("#previousButton").button("option", "disabled", false);
    }
    if(this.algorithms.getCurrentAlgorithmIndex() < this.algorithms.getCount() - 1) {
        $("#nextButton").button("option", "disabled", false);
    } else {
        $("#nextButton").button("option", "disabled", true);
    }
}

/**
 * @abstract
 * @protected
 */
btv.AbstractController.prototype.getAlgorithmsButtons = function() {
    throw new AlgorithmException("abstract function");
}

/**
 * Plays or pause current visualisation depending on state of animation.
 * 
 * @public
 */
btv.AbstractController.prototype.playPauseButton = function() {
    
    switch(this.visualiser.animation.isPlaying()) {
        case -1: // animation is stopped
            break;
        case 0: // animation is paused
            this.playButton();
            break;
        case 1: // animation is playing
            this.pauseButton();
            break;
    }
}

/**
 * Plays current visualisation. Change play/pause button.
 * 
 * @public
 */
btv.AbstractController.prototype.playButton = function() {
    
    if(this.visualiser.playAnimation()) {
        $("#playPauseButton").button( "option", "icons", {
            primary: "ui-icon-pause"
        });
    }
}

/**
 * Pauses current visualisation. Change play/pause button.
 * 
 * @public
 */
btv.AbstractController.prototype.pauseButton = function() {
   
    if(this.visualiser.pauseAnimation()) {
        $("#playPauseButton").button("option", "icons", {
            primary: "ui-icon-play"
        });
    }
}

/**
 * Set new speed of move.
 * 
 * @public
 */
btv.AbstractController.prototype.moveSpeedButton = function(event, ui) {
    
    //var speed = $("#moveSpeedSlider").slider("option", "value");
    this.visualiser.setMoveSpeed(ui.value/1000);   
}

/**
 * Set new duration of a step.
 * 
 * @public
 */
btv.AbstractController.prototype.stepDurationButton = function(event, ui) {
    
    this.visualiser.setStepDuration(ui.value);   
}

/**
 * Skip current visualisation backward.
 * 
 * @public
 */
btv.AbstractController.prototype.skipBackwardButton = function() {
    
    var alg = this.algorithms.getCurrentAlgorithm();
    
    if(alg !== null) {
        this.isPlayingSafety();
        
        this.redoAlgorithm(alg);
    } else {
        alert("No algorithm.");
    }
}

/**
 * Skip current visualisation forward.
 * 
 * @public
 */
btv.AbstractController.prototype.skipForwardButton = function() {
    
    var skipped = this.visualiser.skipAnimationForward();
    if(skipped) { // if a visualisation was skipped it is needed to redraw tree and fire end listeners of animation
        
        this.visualiser.redrawTree(this.tree);
        
        var curAlg = this.algorithms.getCurrentAlgorithm();
        
        if($('#continuouslyCheckbox').is(':checked')) { // do not go to next animation
          
            // remove end animation listener to delegated increase algorithm index
            curAlg.removeEndAnimationListener(this.algorithms.delegatedIncreaseCurrentAlgorithmIndex);
        }
        
        curAlg.fireEndAnimationListeners(); // will fire end listeners but without delegatedIncreaseCurrentAlgorithmIndex
        
        if($('#continuouslyCheckbox').is(':checked')) {
            // readd end animation listener to delegated increase algorithm index
            curAlg.addEndAnimationListener(this.algorithms.delegatedIncreaseCurrentAlgorithmIndex);
        }
    }
}

/**
 * Add or remove listeners that ensure playing one animation after another. 
 *
 * @public
 */
btv.AbstractController.prototype.continuouslyCheckbox = function() {
    if($('#continuouslyCheckbox').is(':checked')) {
        // add increaseCurrentAlgorithmIndex() function to all algorithms as endAnimatorListener
        for(var i = 0; i < this.algorithms.getCount(); i++) {
            this.algorithms.get(i).addEndAnimationListener(this.algorithms.delegatedIncreaseCurrentAlgorithmIndex);
        }
    } else {
        // remove increaseCurrentAlgorithmIndex() function from all algorithms
        for(var j = 0; j < this.algorithms.getCount(); j++) {
            this.algorithms.get(j).removeEndAnimationListener(this.algorithms.delegatedIncreaseCurrentAlgorithmIndex);
        }
    }
}


/**
 * Redo previous algorithm and start animation.
 *
 * @public
 */
btv.AbstractController.prototype.redoPreviousButton = function() {
    
    var index = this.algorithms.getCurrentAlgorithmIndex() - 1; // previous
    var alg = this.algorithms.get(index);
    
    if(alg !== null) {
        this.isPlayingSafety();
        
        this.algorithms.currentAlgorithmIndex = index; // set right current index
        
        this.redoAlgorithm(alg);
        
    } else {
        alert("No previous algorithm.");
    }
    
    if(this.algorithms.getCurrentAlgorithmIndex() >= 1) {
        $("#previousButton").button("option", "disabled", false);
    } else {
        $("#previousButton").button("option", "disabled", true);
    }
}

/**
 * Redo algorithm selected from history and start animation.
 *
 * @public
 */
btv.AbstractController.prototype.redoSelectedButton = function() {
    
    var index = document.getElementById("historySelect").selectedIndex; // selected
    var alg = this.algorithms.get(index);
    
    if(alg !== null) {
        this.isPlayingSafety();
        
        this.algorithms.currentAlgorithmIndex = index; // set current index
        
        this.redoAlgorithm(alg);
        
    } else {
        alert("No selected algorithm.");
    }
    
    if(this.algorithms.getCurrentAlgorithmIndex() >= 1) {
        $("#previousButton").button("option", "disabled", false);
    } else {
        $("#previousButton").button("option", "disabled", true);
    }
    
    if(this.algorithms.getCurrentAlgorithmIndex() < this.algorithms.getCount() - 1) {
        $("#nextButton").button("option", "disabled", false);
    } else {
        $("#nextButton").button("option", "disabled", true);
    }
}

/**
 * Redo next algorithm and start animation.
 *
 * @public
 */
btv.AbstractController.prototype.redoNextButton = function() {
    
    var index = this.algorithms.getCurrentAlgorithmIndex() + 1; // next
    var alg = this.algorithms.get(index);
    
    if(alg !== null) {
        this.isPlayingSafety();
        
        this.algorithms.currentAlgorithmIndex = index; // set right current index
        
        this.redoAlgorithm(alg);

    } else {
        alert("No next algorithm.");
    }
    
    if(this.algorithms.getCurrentAlgorithmIndex() < this.algorithms.getCount() - 1) {
        $("#nextButton").button("option", "disabled", false);
    } else {
        $("#nextButton").button("option", "disabled", true);
    }    
}

/**
 * Skip animation forward if it is playing but it is need to be stopped.
 *
 * @protected
 */
btv.AbstractController.prototype.isPlayingSafety = function() {
    
    if(this.visualiser.animation.isPlaying() != -1) { // not stopped, stop it
        this.skipForwardButton(); // do not fire increase cur alg index, but fire all others end listeners
    }
}

/**
 * Add an algorithm to algorithms array list, add history option and increase current algorithm index that (re)does the algorithm for the first time and plays the algorithm.
 * 
 * @protected
 * @param {btv.AbstractAlgorithm} algorithm
 */
btv.AbstractController.prototype.doAlgorithm = function(algorithm) {

    // if there are some algorithms after current one
    // they have to be removed from algorithms array list and history select
    var select = document.getElementById("historySelect");
    for(var i = this.algorithms.getCount() - 1; i > this.algorithms.currentAlgorithmIndex; i--) {
        this.algorithms.removeAt(i);
        select.remove(i);
    }
    
    algorithm.addStartAnimationListener(this.delegatedDisableButtons);
    algorithm.addEndAnimationListener(this.delegatedEnableButtons);
    
    this.algorithms.add(algorithm, $('#continuouslyCheckbox').is(':checked'));

    this.algorithms.increaseCurrentAlgorithmIndex();
    
    this.addHistoryOption(algorithm);
}

/**
 * Calls undoAlgorithm(returns tree to the state before given algorithm, redraw tree and select right history option) and execute the algorithm again and play the animation.
 *
 * @protected
 * @param {btv.AbstractAlgorithm}
 */
btv.AbstractController.prototype.redoAlgorithm = function(algorithm) {
    if(algorithm != null) {
        this.undoAlgorithm(algorithm);
        algorithm.redo();
        this.visualiser.playAnimation();
    }
}

/**
 * Returns tree to the state before given algorithm, redraw tree and select right history option.
 *
 * @protected
 * @param {btv.AbstractAlgorithm}
 */
btv.AbstractController.prototype.undoAlgorithm = function(algorithm) {
    // return to the tree in state before that algoritm
    algorithm.undo();
  
    // redraw the tree
    this.visualiser.redrawTree(this.tree);
    
    // select right algorithm in history option
    var select = document.getElementById("historySelect");
    select.selectedIndex = this.algorithms.getCurrentAlgorithmIndex();
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class Controller for binary search tree.
 * @author Jakub Melezinek
 * 
 * @public
 * @constructor
 * @param {HTMLDivElement} controlsDiv
 * @param {HTMLDivElement} treeDiv
 * @extends btv.AbstractController
 */
btv.BinarySearchTreeController = function(controlsDiv, treeDiv) {
    
    this.tree = new btv.BinaryTree("Binary Search Tree");
    
    btv.AbstractController.call(this, controlsDiv, treeDiv);
            
    // fill div with controls
    this.controlsDiv.algorithmsDiv.innerHTML = 
    '<div id="algorithmsLegend" class="legend">Algorithms</div>' +

'<div class="item">' + 
'<form id="BSTRandomBSTreeForm" action="javascript:btv.controller.randomBSTreeButton()">' +
'<input id="BSTRandomBSTreeButton" type="submit" value="Random BSTree"/> ' +
'min: <input id="BSTRandomBSTreeMinText" type="text" value="0" size="1"/> ' +
'max: <input id="BSTRandomBSTreeMaxText" type="text" value="99" size="1"/>' +
'</form>' +
'</div>' +

'<div class="item">' + 
'<form id="BSTInsertForm" action="javascript: btv.controller.insertButton()">' +
'<input id="BSTInsertButton" type="submit" value="Insert"/> ' +
'value: <input id="BSTInsertText" type="text" size="1"/>' +
'</form>' +
'</div>' +

'<div class="item">' + 
'<form id="BSTFindForm" action="javascript:btv.controller.findButton()">' +
'<input id="BSTFindButton" type="submit" value="Find"/> ' +
'value: <input id="BSTFindText" type="text" size="1"/>' +
'</form>' +    
'</div>' +

'<div class="item">' + 
'<form id="BSTDeleteForm" action="javascript:btv.controller.deleteButton()">' +
'<input id="BSTDeleteButton" type="submit" value="Delete"/> selected node' +
'</form>' +
'</div>' +

'<div class="item">' + 
'<form id="BSTGetMaxForm" action="javascript:btv.controller.getMaxButton()">' +
'<input id="BSTGetMaxButton" type="submit" value="Get Max"/> of selected (sub)tree ' +
'</form>' +  
'</div>' +

'<div class="item">' + 
'<form id="BSTGetMinForm" action="javascript:btv.controller.getMinButton()">' +
'<input id="BSTGetMinButton" type="submit" value="Get Min"/> of selected (sub)tree ' +
'</form>' +      
'</div>' +

'<div class="item">' + 
'<form id="BSTGetPredecessorForm" action="javascript:btv.controller.getPredecessorButton()">' +
'<input id="BSTGetPredecessorButton" type="submit" value="Get Predecessor"/> of selected node' +
'</form>' +    
'</div>' + 

'<div class="item">' + 
'<form id="BSTGetSuccessorForm" action="javascript:btv.controller.getSuccessorButton()">' +
'<input id="BSTGetSuccessorButton" type="submit" value="Get Successor"/> of selected node' +
'</form>' +
'</div>' + 

'<div class="item">' + 
'<form id="BSTToPreorderArrayForm" action="javascript:btv.controller.toPreorderArrayButton()">' +
'<input id="BSTToPreorderArrayButton" type="submit" value="To Preorder Array"/>' +
'</form>' +
'</div>' + 

'<div class="item">' + 
'<form id="BSTToInorderArrayForm" action="javascript:btv.controller.toInorderArrayButton()">' +
'<input id="BSTToInorderArrayButton" type="submit" value="To Inorder Array"/> (To Sorted Array)' +
'</form>' +
'</div>' + 

'<div class="item">' + 
'<form id="BSTToPostorderArrayForm" action="javascript:btv.controller.toPostorderArrayButton()">' +
'<input id="BSTToPostorderArrayButton" type="submit" value="To Postorder Array"/>' +
'</form>' +
'</div>';
}
btv.BinarySearchTreeController.jsglExtend(btv.AbstractController);

/**
 * @override
 * @protected
 */
btv.BinarySearchTreeController.prototype.getAlgorithmsButtons = function() {
    return new Array(
        document.getElementById("BSTRandomBSTreeButton"),
        document.getElementById("BSTInsertButton"),
        document.getElementById("BSTFindButton"),
        document.getElementById("BSTDeleteButton"),
        document.getElementById("BSTGetMaxButton"),
        document.getElementById("BSTGetMinButton"),
        document.getElementById("BSTGetPredecessorButton"),
        document.getElementById("BSTGetSuccessorButton"),
        document.getElementById("BSTToPreorderArrayButton"),
        document.getElementById("BSTToInorderArrayButton"),
        document.getElementById("BSTToPostorderArrayButton")
        );
}

/**
 * @public
 */
btv.BinarySearchTreeController.prototype.randomBSTreeButton = function() {
    
    // get params
    var minInput = document.getElementById("BSTRandomBSTreeMinText");
    var maxInput = document.getElementById("BSTRandomBSTreeMaxText");

    // parse values to int  
    var min = parseInt(minInput.value);
    if(btv.AbstractController.isNumber(min) == false) {
        minInput.value = "";
        minInput.focus();
        return;
    }

    var max = parseInt(maxInput.value);
    if(btv.AbstractController.isNumber(max) == false) {
        maxInput.value = "";
        maxInput.focus();
        return;
    }

    if(min > max) {
        alert("Minimum is greather than maximum.");
        return;
    }

    // create alg
    var alg = new btv.bst.RandomBSTreeAlg(this.tree, this.visualiser, min, max);
    
    // execute alg
    this.doAlgorithm(alg);
}

/**
 * @public
 */
btv.BinarySearchTreeController.prototype.insertButton = function() {
    
    // get alg params
    var valueInput = document.getElementById("BSTInsertText");
    
    // parse value to float and check if is number
    var value = parseFloat(valueInput.value);
    if(btv.AbstractController.isNumber(value) == false) {
        // reset value input
        valueInput.value = "";
        valueInput.focus();
        
        return;
    }
     
    // create alg
    var alg = new btv.bst.InsertAlg(this.tree, this.visualiser, value);
    
    // execute alg
    this.doAlgorithm(alg);

    // reset value input
    valueInput.value = "";
    valueInput.focus();
}

/**
 * @public
 */
btv.BinarySearchTreeController.prototype.findButton = function() {
    
    // get alg params
    var valueInput = document.getElementById("BSTFindText");
    
    var value = parseFloat(valueInput.value);
    if(btv.AbstractController.isNumber(value) == false) {
        // reset value input
        valueInput.value = "";
        valueInput.focus();
    
        return;
    }

    // create alg
    var alg = new btv.bst.FindAlg(this.tree, this.visualiser, value);
        
    // execute alg
    this.doAlgorithm(alg);

    // reset value input
    valueInput.value = "";
    valueInput.focus();
}

/**
 * @public
 */
btv.BinarySearchTreeController.prototype.deleteButton = function() {

    // get alg params
    var selectedNode = this.visualiser.getSelectedNode();
    if(selectedNode === null) {
        return;
    }
    
    // create alg
    var alg = new btv.bst.DeleteAlg(this.tree, this.visualiser, selectedNode);
    
    // execute alg
    this.doAlgorithm(alg);
}

/**
 * @public
 */
btv.BinarySearchTreeController.prototype.getMaxButton = function() {
    
    // get alg params
    var selectedNode = this.visualiser.getSelectedNode();
    if(selectedNode === null) {
        selectedNode = this.tree.getRoot(); // get max of whole tree
        if(selectedNode === null) { // root === null
            return;
        }
    }    
    
    // create alg
    var alg = new btv.bst.GetMaxAlg(this.tree, this.visualiser, selectedNode);
    
    // execute alg
    this.doAlgorithm(alg);
}

/**
 * @public
 */
btv.BinarySearchTreeController.prototype.getMinButton = function() {
    
    // get alg params
    var selectedNode = this.visualiser.getSelectedNode();
    if(selectedNode === null) {
        selectedNode = this.tree.getRoot(); // get min of whole tree
        if(selectedNode === null) { // root === null
            return;
        }
    }    
    
    // create alg
    var alg = new btv.bst.GetMinAlg(this.tree, this.visualiser, selectedNode);
    
    // execute alg
    this.doAlgorithm(alg);
}

/**
 * @public
 */
btv.BinarySearchTreeController.prototype.getPredecessorButton = function() {
    
    // get alg params
    var selectedNode = this.visualiser.getSelectedNode();
    if(selectedNode === null) {
        return;
    }
    
    // create alg
    var alg = new btv.bst.GetPredecessorAlg(this.tree, this.visualiser, selectedNode);
    
    // execute alg
    this.doAlgorithm(alg);
}

/**
 * @public
 */
btv.BinarySearchTreeController.prototype.getSuccessorButton = function() {
    
    // get alg params
    var selectedNode = this.visualiser.getSelectedNode();
    if(selectedNode === null) {
        return;
    }
    
    // create alg
    var alg = new btv.bst.GetSuccessorAlg(this.tree, this.visualiser, selectedNode);
    
    // execute alg
    this.doAlgorithm(alg);
}

/**
 * @public
 */
btv.BinarySearchTreeController.prototype.toIndexArrayButton = function() {
    
    // create alg
    var alg = new btv.bst.ToIndexArrayAlg(this.tree, this.visualiser);
    
    // execute alg
    this.doAlgorithm(alg);
}

/**
 * @public
 */
btv.BinarySearchTreeController.prototype.toPreorderArrayButton = function() {
    
    // create alg
    var alg = new btv.bst.ToPreorderArrayAlg(this.tree, this.visualiser);
    
    // execute alg
    this.doAlgorithm(alg);
}

/**
 * @public
 */
btv.BinarySearchTreeController.prototype.toInorderArrayButton = function() {
    
    // create alg
    var alg = new btv.bst.ToInorderArrayAlg(this.tree, this.visualiser);
    
    // execute alg
    this.doAlgorithm(alg);
}

/**
 * @public
 */
btv.BinarySearchTreeController.prototype.toPostorderArrayButton = function() {
    
    // create alg
    var alg = new btv.bst.ToPostorderArrayAlg(this.tree, this.visualiser);
    
    // execute alg
    this.doAlgorithm(alg);
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class Controller for binary heap.
 * @author Jakub Melezinek
 * 
 * @public
 * @constructor
 * @param {HTMLDivElement} controlsDiv
 * @param {HTMLDivElement} treeDiv
 * @extends btv.AbstractController
 */
btv.BinaryHeapController = function(controlsDiv, treeDiv) {
    
    this.tree = new btv.BinaryTree("Binary Heap");
    
    btv.AbstractController.call(this, controlsDiv, treeDiv);    
            
    // fill div with controls
    this.controlsDiv.algorithmsDiv.innerHTML = 
    '<div id="algorithmsLegend" class="legend">Algorithms</div>' +

'<div class="item">' + 
'<form id="BHRandomHeapForm" action="javascript:btv.controller.randomBHeapButton()">' +
'<input id="BHRandomHeapButton" type="submit" value="Random BHeap"/> ' +
'min: <input id="BHRandomHeapMinText" type="text" value="0" size="1"/> ' +
'max: <input id="BHRandomHeapMaxText" type="text" value="99" size="1"/>' +
'</form>' +
'</div>' +

'<div class="item">' + 
'<form id="BHBuildHeapForm" action="javascript:btv.controller.buildHeapButton()">' +
'<input id="BHBuildHeapButton" type="submit" value="Build Heap"/> array: <input id="BHArrayText" type="text" size="10"/>' +
'</form>' + 
'</div>' +

'<div class="item">' + 
'<form id="BHInsertForm" action="javascript: btv.controller.insertButton()">' +
'<input id="BHInsertButton" type="submit" value="Insert"/> value: <input id="BHInsertText" type="text" size="1"/>' +
'</form>' +
'</div>' +

'<div class="item">' + 
'<form id="BHDeleteForm" action="javascript:btv.controller.deleteButton()">' +
'<input id="BHDeleteButton" type="submit" value="Delete"/> selected node' +
'</form>' +
'</div>' +

'<div class="item">' + 
'<form id="BHExtractMaxForm" action="javascript:btv.controller.extractMaxButton()">' +
'<input id="BHExtractMaxButton" type="submit" value="Extract Max"/>' +
'</form>' +
'</div>' +

'<div class="item">' + 
'<form id="BHGetMaxForm" action="javascript:btv.controller.getMaxButton()">' +
'<input id="BHGetMaxButton" type="submit" value="Get max"/>' +
'</form>' +  
'</div>' +

'<div class="item">' + 
'<form id="BHHeapSortForm" action="javascript:btv.controller.heapSortButton()">' +
'<input id="BHHeapSortButton" type="submit" value="Heap Sort"/>' +
'</form>' + 
'</div>';
}
btv.BinaryHeapController.jsglExtend(btv.AbstractController);

/**
 * @override
 * @protected
 */
btv.BinaryHeapController.prototype.getAlgorithmsButtons = function() {
    return new Array(
        document.getElementById("BHRandomHeapButton"),
        document.getElementById("BHBuildHeapButton"),
        document.getElementById("BHInsertButton"),
        document.getElementById("BHDeleteButton"),
        document.getElementById("BHExtractMaxButton"),
        document.getElementById("BHGetMaxButton"),
        document.getElementById("BHHeapSortButton")
        );
}

/**
 * @public
 */
btv.BinaryHeapController.prototype.randomBHeapButton = function() {
    
    // get params
    var minInput = document.getElementById("BHRandomHeapMinText");
    var maxInput = document.getElementById("BHRandomHeapMaxText");

    // parse values to int  
    var min = parseInt(minInput.value);
    if(btv.AbstractController.isNumber(min) == false) {
        minInput.value = "";
        minInput.focus();
        return;
    }

    var max = parseInt(maxInput.value);
    if(btv.AbstractController.isNumber(max) == false) {
        maxInput.value = "";
        maxInput.focus();
        return;
    }
    
    if(min > max) {
        alert("Minimum is greather than maximum.");
        return;
    }
    
    // create alg
    var alg = new btv.bh.RandomBHeapAlg(this.tree, this.visualiser, min, max);
    
    // execute alg
    this.doAlgorithm(alg);
}

/**
 * @public
 */
btv.BinaryHeapController.prototype.buildHeapButton = function() {
    
    // get alg params
    var valueInput = document.getElementById("BHArrayText");
    
    var array = valueInput.value.split(',');
    
    for(var i = 0; i < array.length; i++) {
        array[i] = parseFloat(array[i]);
        if(btv.AbstractController.isNumber(array[i]) == false) {
            valueInput.focus();
            return;
        }
    }
    
    // create alg
    var alg = new btv.bh.BuildHeapAlg(this.tree, this.visualiser, array);
        
    // execute alg
    this.doAlgorithm(alg);

    // reset value input
    valueInput.value = "";
    valueInput.focus();
}

/**
 * @public
 */
btv.BinaryHeapController.prototype.insertButton = function() {
    
    // get alg params
    var valueInput = document.getElementById("BHInsertText");
    
    // parse value to float and check if is number
    var value = parseFloat(valueInput.value);
    if(btv.AbstractController.isNumber(value) == false) {
        // reset value input
        valueInput.value = "";
        valueInput.focus();
        
        return;
    }
     
    // create alg
    var alg = new btv.bh.InsertAlg(this.tree, this.visualiser, value);
    
    // execute alg
    this.doAlgorithm(alg);
    
    // reset value input
    valueInput.value = "";
    valueInput.focus();
}

/**
 * @public
 */
btv.BinaryHeapController.prototype.deleteButton = function() {

    // get alg params
    var selectedNode = this.visualiser.getSelectedNode();
    if(selectedNode === null) {
        return;
    }
    
    // create alg
    var alg = new btv.bh.DeleteAlg(this.tree, this.visualiser, selectedNode);
    
    // execute alg
    this.doAlgorithm(alg);
}

/**
 * @public
 */
btv.BinaryHeapController.prototype.extractMaxButton = function() {
    
    // create alg
    var alg = new btv.bh.ExtractMaxAlg(this.tree, this.visualiser);
    
    // execute alg
    this.doAlgorithm(alg);
}

/**
 * @public
 */
btv.BinaryHeapController.prototype.getMaxButton = function() {
    
    // create alg
    var alg = new btv.bh.GetMaxAlg(this.tree, this.visualiser);
    
    // execute alg
    this.doAlgorithm(alg);
}

/**
 * @public
 */
btv.BinaryHeapController.prototype.heapSortButton = function() {
    
    // create alg
    var alg = new btv.bh.HeapSortAlg(this.tree, this.visualiser);
    
    // execute alg
    this.doAlgorithm(alg);
}