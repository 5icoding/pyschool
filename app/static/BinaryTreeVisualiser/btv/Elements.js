/*
 * @class Node element implementation.
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {jsgl.elements.AbstractDomPresenter} domPresenter
 * @param {btv.Visualiser} visualiser
 * @param {String} text
 * @param {jsgl.Vector2D} location
 * @extends {jsgl.elements.GroupElement}
 */
btv.elements.NodeElement = function(domPresenter, visualiser, text, location) {

    jsgl.elements.GroupElement.call(this, domPresenter, visualiser.panel, 0, 0, 0);

    // create circle
    /**
     * @public
     * @type {jsgl.elements.CircleElement}
     */
    this.circle = visualiser.panel.createCircle();
    this.circle.setZIndex(1); // relative to group
    this.circle.setCenterLocationXY(0, 0); // relative to group
    this.circle.setRadius(visualiser.circleRadius);
    this.circle.setStroke(jsgl.util.clone(visualiser.circleStroke));
    this.circle.setFill(jsgl.util.clone(visualiser.circleFill));
   
    // create label
    /**
     * @public
     * @type {jsgl.elements.LabelElement}
     */
    this.label = visualiser.panel.createLabel();
    this.label.setZIndex(2); // relative to group
    this.label.setText(text);
    this.label.setFontFamily("Arial");
    this.label.setLocationXY(0, 0); // relative to group
    this.label.setFontSize((3/4) * visualiser.circleRadius);
    this.label.setHorizontalAnchor(jsgl.HorizontalAnchor.CENTER);
    this.label.setVerticalAnchor(jsgl.VerticalAnchor.MIDDLE);
       
    // this extended group
    this.setLocation(location);
    this.setZIndex(btv.elements.NodeElement.zIndex);
    
    this.addElement(this.circle);
    this.addElement(this.label);
}
btv.elements.NodeElement.jsglExtend(jsgl.elements.GroupElement);

/**
 * Normal z-index.
 *
 * @public
 * @static
 */
btv.elements.NodeElement.zIndex = 3;



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class Edge element implementation.
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {jsgl.elements.AbstractDomPresenter} domPresenter
 * @param {btv.Visualiser} visualiser
 * @param {btv.BinaryTreeNode} fromNode
 * @param {btv.BinaryTreeNode} toNode
 * @extends {jsgl.elements.GroupElement}
 */
btv.elements.EdgeElement = function(domPresenter, visualiser, fromNode, toNode) {
    
    jsgl.elements.GroupElement.call(this, domPresenter, visualiser.panel, 0, 0, 0);
        
    /**
     * @public
     * @type {jsgl.elements.LineElement}
     */        
    this.majorLine = visualiser.panel.createLine();
    this.majorLine.setStroke(jsgl.util.clone(visualiser.lineStroke));
        
    /**
     * @public
     * @type {jsgl.elements.LineElement}
     */        
    this.minorLine1 = visualiser.panel.createLine();
    this.minorLine1.setStroke(this.majorLine.getStroke()); // shared stroke
        
    /**
     * @public
     * @type {jsgl.elements.LineElement}
     */        
    this.minorLine2 = visualiser.panel.createLine();
    this.minorLine2.setStroke(this.majorLine.getStroke()); // shared stroke
        
    // this group representing edgeElement
    var centerLocation = new jsgl.Vector2D((fromNode.nodeElement.getX() + toNode.nodeElement.getX())/2, (fromNode.nodeElement.getY() + toNode.nodeElement.getY())/2);
    this.setLocation(centerLocation);

    this.setStartEndNode(fromNode, toNode);

    this.setZIndex(btv.elements.EdgeElement.zIndex);
    
    this.addElement(this.majorLine);
    this.addElement(this.minorLine1);
    this.addElement(this.minorLine2);

}
btv.elements.EdgeElement.jsglExtend(jsgl.elements.GroupElement);

/**
 * Normal z-index.
 *
 * @public
 * @static
 */
btv.elements.EdgeElement.zIndex = 1;
    
/**
 * @public
 * @param {btv.BinaryTreeNode} startNode
 * @param {btv.BinaryTreeNode} endNode
 */
btv.elements.EdgeElement.prototype.setStartEndNode = function(startNode, endNode) {

    // absolute center position of a group
    var centerLocation = new jsgl.Vector2D((startNode.nodeElement.getX() + endNode.nodeElement.getX())/2, (startNode.nodeElement.getY() + endNode.nodeElement.getY())/2);
    this.setLocation(centerLocation);
    
    // vector fromLocation->toLocation
    var direction = new jsgl.Vector2D(endNode.nodeElement.getX() - startNode.nodeElement.getX(), endNode.nodeElement.getY() - startNode.nodeElement.getY());
    var directionLength = Math.sqrt(direction.getX() * direction.getX() + direction.getY() * direction.getY());
    
    // edge length 
    var edgeLength = directionLength - 2*startNode.nodeElement.circle.getRadius() - startNode.nodeElement.circle.getStroke().getWeight();
    
    // vector centerLocation->endPoint - normalized direction vector multiply by edgeLength/2
    var CLtoEP = new jsgl.Vector2D(edgeLength/2 * direction.getX()/directionLength, edgeLength/2 * direction.getY()/directionLength);
    
    // relative to centerLocation - center of the group
    var relativeStartPoint = new jsgl.Vector2D(-CLtoEP.getX(), -CLtoEP.getY());
    var relativeEndPoint = new jsgl.Vector2D(CLtoEP.getX(), CLtoEP.getY());
    
    // create major line
    this.majorLine.setStartPoint(relativeStartPoint);
    this.majorLine.setEndPoint(relativeEndPoint);

    // vector endPoint->tmpPoint - normalized direction vector, multiply by circle radius/2, negative
    var tmpVector = new jsgl.Vector2D(startNode.nodeElement.circle.getRadius()/2 * direction.getX()/directionLength, startNode.nodeElement.circle.getRadius()/2 * direction.getY()/directionLength);
    
    // relative to centerLocation - center of the group
    // endPoint + tmpVector rotated by +30
    tmpVector = tmpVector.rotate(0, 0, +10);
    var minorLine1RelativeEndPoint = new jsgl.Vector2D(relativeEndPoint.getX() + tmpVector.getX(), relativeEndPoint.getY() + tmpVector.getY());

    // endPoint + tmpVector rotated by -30
    tmpVector = tmpVector.rotate(0, 0, -20);
    var minorLine2RelativeEndPoint = new jsgl.Vector2D(relativeEndPoint.getX() + tmpVector.getX(), relativeEndPoint.getY() + tmpVector.getY());

    // minorLine1
    this.minorLine1.setStartPoint(relativeEndPoint);
    this.minorLine1.setEndPoint(minorLine1RelativeEndPoint);
    
    // minorLine2
    this.minorLine2.setStartPoint(relativeEndPoint);
    this.minorLine2.setEndPoint(minorLine2RelativeEndPoint);
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
    
    
    
/*
 * @class Step element implementation.
 * @author Jakub Melezinek
 * 
 * @constructor
 * @param {jsgl.elements.AbstractDomPresenter} domPresenter
 * @param {btv.Visualiser} visualiser
 * @param {String} text
 * @param {jsgl.Vector2D} location
 * @extends {jsgl.elements.GroupElement}
 */
btv.elements.StepElement = function(domPresenter, visualiser, text, location) {

    jsgl.elements.GroupElement.call(this, domPresenter, visualiser.panel, 0, 0, 0);

    // create square
    /**
     * @public
     * @type {jsgl.elements.RectangleElement}
     */
    this.square = visualiser.panel.createRectangle();
    this.square.setZIndex(1); // relative to group
    
    this.square.setWidth(1.5*visualiser.circleRadius);
    this.square.setHeight(1.1*visualiser.circleRadius);
    
    this.square.setRadiiXY(visualiser.circleRadius/4, visualiser.circleRadius/4);
    
    this.square.setLocationXY(0, 0);
    this.square.setHorizontalAnchor(jsgl.HorizontalAnchor.CENTER);
    this.square.setVerticalAnchor(jsgl.VerticalAnchor.MIDDLE);
    
    this.square.setStroke(jsgl.util.clone(visualiser.circleStroke));
    this.square.setFill(jsgl.util.clone(visualiser.circleFill));
   
    // create label
    /**
     * @public
     * @type {jsgl.elements.LabelElement}
     */
    this.label = visualiser.panel.createLabel();
    this.label.setZIndex(2); // relative to group
    this.label.setText(text);
    this.label.setFontFamily("Arial");
    this.label.setLocationXY(0, 0); // relative to group
    this.label.setFontSize((3/4) * visualiser.circleRadius);
    this.label.setHorizontalAnchor(jsgl.HorizontalAnchor.CENTER);
    this.label.setVerticalAnchor(jsgl.VerticalAnchor.MIDDLE);
       
    // this extended group
    this.setLocation(location);
    this.setZIndex(btv.elements.StepElement.zIndex);
    
    this.addElement(this.square);
    this.addElement(this.label);
}
btv.elements.StepElement.jsglExtend(jsgl.elements.GroupElement);

/**
 * Normal z-index.
 *
 * @public
 * @static
 */
btv.elements.StepElement.zIndex = 4;



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
    
    
    
/**
 * @class Array element implementation.
 * @author Jakub Melezinek
 *
 * @constructor
 * @param {jsgl.elements.AbstractDomPresenter} domPresenter
 * @param {btv.Visualiser} visualiser
 * @param {number} length
 * @extends {jsgl.elements.GroupElement}
 */
btv.elements.ArrayElement = function(domPresenter, visualiser, length) {

    jsgl.elements.GroupElement.call(this, domPresenter, visualiser.panel, 0, 0, 0);        
        
    var centerLocation = new jsgl.Vector2D(visualiser.width/2, visualiser.height - visualiser.verticalSpacing/4);
    this.setLocation(centerLocation);
        
    var squareLength = visualiser.width/33;
    var squareStroke = jsgl.util.clone(visualiser.circleStroke);
    var squareFill = jsgl.util.clone(visualiser.circleFill);
        
    var square;
    var indexLabel;
    var valueLabel;
    var group;
    for(var i = 0; i < length; i++) {
            
        // square
        square = visualiser.panel.createRectangle();
        square.setWidth(squareLength);
        square.setHeight(squareLength);
            
        square.setLocationXY(0, 0);
        square.setHorizontalAnchor(jsgl.HorizontalAnchor.CENTER);
        square.setVerticalAnchor(jsgl.VerticalAnchor.MIDDLE);
            
        square.setStroke(squareStroke);
        square.setFill(squareFill);

        // index label
        indexLabel = visualiser.panel.createLabel();
            
        indexLabel.setLocationXY(0, -3/4 * squareLength);
        indexLabel.setHorizontalAnchor(jsgl.HorizontalAnchor.CENTER);
        indexLabel.setVerticalAnchor(jsgl.VerticalAnchor.MIDDLE);
          
        indexLabel.setFontSize(squareLength/2);
        indexLabel.setText(i+1);
        indexLabel.setFontFamily("Arial");
            
        // value label
        valueLabel = visualiser.panel.createLabel();
            
        valueLabel.setLocationXY(0, 0);
        valueLabel.setHorizontalAnchor(jsgl.HorizontalAnchor.CENTER);
        valueLabel.setVerticalAnchor(jsgl.VerticalAnchor.MIDDLE);
        
        valueLabel.setFontSize(squareLength/2);
        valueLabel.setFontFamily("Arial");

        group = visualiser.panel.createGroup();
        group.setLocationXY((-length/2)*squareLength + squareLength/2 + i*squareLength, 0);
        group.setZIndex(btv.elements.ArrayElement.zIndex);
        
        group.addElement(square);
        group.addElement(indexLabel);
        group.addElement(valueLabel);
            
        this.addElement(group);
    }
}
btv.elements.ArrayElement.jsglExtend(jsgl.elements.GroupElement);

/**
 * Normal z-index.
 *
 * @public
 * @static
 */
btv.elements.ArrayElement.zIndex = 5;
    
/**
 * @public
 * @param {Number} index
 * @param {String} text
 */
btv.elements.ArrayElement.prototype.setTextAt = function(index, text) {
    this.getElementAt(index).getElementAt(2).setText(text);
}

/**
 * @public
 * @param {String[]} array Index array
 */    
btv.elements.ArrayElement.prototype.setTextAll = function(array) {
    for(var i = 0; i < array.length; i++) {
        this.setTextAt(i, array[i]);
    }
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



/**
 * @class Comparison sign element implementation.
 * @author Jakub Melezinek
 *
 * @constructor
 * @param {jsgl.elements.AbstractDomPresenter} domPresenter
 * @param {btv.Visualiser} visualiser
 * @param {String} text
 * @param {jsgl.Vector2D} location
 * @extends {jsgl.elements.GroupElement}
 */
btv.elements.ComparisonSignElement = function(domPresenter, visualiser, text, location) {

    jsgl.elements.GroupElement.call(this, domPresenter, visualiser.panel, 0, 0, 0);        
        
    // square
    /**
     * @public
     * @type {jsgl.elements.RectangleElement}
     */
    this.square = visualiser.panel.createRectangle();
    
    var squareLength = (3/4) * (visualiser.circleRadius - visualiser.circleStroke.getWeight());
    this.square.setWidth(squareLength);
    this.square.setHeight(squareLength);
    
    this.square.setRadiiXY(squareLength/4, squareLength/4);
    
    this.square.setLocationXY(0, 0);
    this.square.setHorizontalAnchor(jsgl.HorizontalAnchor.CENTER);
    this.square.setVerticalAnchor(jsgl.VerticalAnchor.MIDDLE);
    
    
    var squareStroke = jsgl.util.clone(visualiser.circleStroke);
    squareStroke.setWeight(1);
    //square.setStroke(jsgl.stroke.DISABLED); // no stroke
    
    var squareFill = jsgl.util.clone(visualiser.circleFill);
    this.square.setFill(squareFill);

    // label
    /**
     * @public
     * @type {jsgl.elements.LabelElement}
     */
    this.label = visualiser.panel.createLabel();
    
    this.label.setLocationXY(0, 0);
    this.label.setHorizontalAnchor(jsgl.HorizontalAnchor.CENTER);
    this.label.setVerticalAnchor(jsgl.VerticalAnchor.MIDDLE);
        
    this.label.setFontSize((3/4) * squareLength);
    this.label.setFontFamily("Arial");
    this.label.setText(text);

    // group
    this.setLocation(location);
    this.setZIndex(btv.elements.ComparisonSignElement.zIndex);
    
    this.addElement(this.square);
    this.addElement(this.label);
    
}
btv.elements.ComparisonSignElement.jsglExtend(jsgl.elements.GroupElement);

/**
 * Normal z-index.
 *
 * @public
 * @static
 */
btv.elements.ComparisonSignElement.zIndex = 10;

/**
 * Maximal z-index.
 *
 * @public
 * @static
 */
btv.elements.maxZIndex = 15;

