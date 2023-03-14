
/**
 * On load functions.
 */
window.onload = function() {
    createAnchors();
    setHistorySelectSize(6);
    setAlgorithmDivHeight();
    if(typeof prettyPrint != 'undefined') {
        prettyPrint(); // google-code-prettify
    }
    //createQuickmenu();
}

/**
 * Create anchors from HTMLelements (headlines) with class="anchor".
 */
function createAnchors() {
    var anchors = document.getElementsByClassName("anchor");
    
    var anchor;
    for(var i=0; i < anchors.length; i++) {
                    
        anchor = "#" + anchors[i].id;
        anchors[i].innerHTML = "" +
            '<span style="cursor: hand; cursor: pointer;" ' + 
            'onclick="javascript:window.location.href = \'' + anchor + '\';">' + anchors[i].innerHTML +
            '</span>';
    }
}

/**
 * Edit #historySelect select size.
 *
 * @param size Number of row
 */
function setHistorySelectSize(size) {
    var select = document.getElementById("historySelect");
    
    if(select) {
        select.size = size;
    }
}

/**
 * Edit #algorithmsDiv div height.
 */
function setAlgorithmDivHeight() {
    var AlgDiv = document.getElementById("algorithmsDiv");
    
    if(AlgDiv) {
        var height = 600;
        
        height -= document.getElementById("animationDiv").offsetHeight;
        height -= document.getElementById("historyDiv").offsetHeight;
        //height -= document.getElementById("problemDiv").offsetHeight;  
    
        AlgDiv.style.height = (height-12) + "px";
    }
}
