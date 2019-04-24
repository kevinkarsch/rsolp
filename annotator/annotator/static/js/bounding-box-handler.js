/**
 * BoundingBoxHandler
 *
 */
 // Inherit from kCanvasHandler
BoundingBoxHandler.prototype = new kCanvasHandler();
BoundingBoxHandler.prototype.constructor = BoundingBoxHandler;
function BoundingBoxHandler(kcanvas){
	log("BoundingBoxHandler construct");
	kCanvasHandler.call(this, kcanvas);

	this.arrow_vector = new Array(
		new Point2D(50, 250),
		new Point2D(50, 50),
		new Point2D(250, 50),
		new Point2D(250, 250)
	);
	this.box_points = new Array(
		new Point2D(100, 200),
		new Point2D(100, 100),
		new Point2D(200, 100),
		new Point2D(200, 200)
	);
    for(i in this.box_points){
        this.box_points[i].attached = this.arrow_vector[i]
    }
	this.attachMouseHandlers();
}

BoundingBoxHandler.prototype.attachMouseHandlers = function(){
	var self = this;
	$(document).mousemove(function(e){ self.mouseMoveHandler(e) });
	$(this.kcanvas.canvas).mousedown(function(e){ self.mouseDownHandler(e) });
	$(document).mouseup(function(e){ self.mouseUpHandler(e) });
}


BoundingBoxHandler.prototype.getAllVertices = function(){
	return this.arrow_vector.concat(this.box_points);
}

/*
 * Define Mouse Events for Perspective Box
 *
 *
 */
/**
 * Mouse move function
 */
BoundingBoxHandler.prototype.mouseMoveHandler = function(e){
	e.preventDefault();
	var offset = $(this.kcanvas.canvas).offset();
	var x = e.pageX - offset.left;
	var y = e.pageY - offset.top;
	//log("[BoundingBox] Mouse moved " + x + "," + y);
	
	// Move vertex if we're currently dragging it
	if(this.isMouseDown && this.dragVertex){
        this.dragVertex.translate(x, y);
		this.kcanvas.paintAll();
	}
}

/**
 * Mouse down function
 */
var DRAG_RADIUS = 7;
BoundingBoxHandler.prototype.mouseDownHandler = function(e){
	e.preventDefault();

	var offset = $(this.kcanvas.canvas).offset();
	var x = e.pageX - offset.left;
	var y = e.pageY - offset.top;
	
	this.dragX = x;
	this.dragY = y;
	this.isMouseDown = true;
	self = this;
	
	//log("[BoundingBox] Mouse down " + x + "," + y);
	
	// See if click was anywhere near a vertex
	this.getAllVertices().forEach(function(v){
		dist = Math.pow((v.x - x), 2) + Math.pow((v.y - y), 2);
		// If it was, move it
		if(dist < Math.pow(DRAG_RADIUS, 2)){
			self.dragVertex = v;
			log("[BoundingBox] Dragging vertex from " + v.x + "," + v.y);
		}
	});
}

/**
 * Mouse up function
 */
BoundingBoxHandler.prototype.mouseUpHandler = function(e){
	this.isMouseDown = false;
	delete this.dragVertex;
}















/**
 * Paint
 */
BoundingBoxHandler.prototype.paint = function(){
	this.paintEdges();
}

/**
 * Draw edges of the perspective box
 */
BoundingBoxHandler.prototype.paintEdges = function(){
	ctx = this.kcanvas.getContext();
	ctx.lineWidth = 3;
	// Draw square
	ctx.strokeStyle = "rgba(00,00,255,0.7)";
	ctx.fillStyle = "rgba(255,255,255,0.2)"
	this.kcanvas.drawLoop(this.box_points, false, true);
	// Draw arrows edges
	ctx.strokeStyle = "rgba(00,255,0,0.7)";
	this.connectArrows();
}

/**
 * Connects the arrows to the box
 */
BoundingBoxHandler.prototype.connectArrows = function(){
	var front = this.arrow_vector;
	var back = this.box_points;
    var headlen = 10;   // length of arrow head in pixels
	for(i in front){
		this.kcanvas.drawLine(front[i], back[i]);
		var angle = Math.atan2(front[i].y-back[i].y, front[i].x-back[i].x);
		var arrowhead_right = new Point2D(front[i].x-headlen*Math.cos(angle-Math.PI/6), 
			front[i].y-headlen*Math.sin(angle-Math.PI/6));
		var arrowhead_left = new Point2D(front[i].x-headlen*Math.cos(angle+Math.PI/6), 
			front[i].y-headlen*Math.sin(angle+Math.PI/6));
		this.kcanvas.drawLine(front[i], arrowhead_right);
		this.kcanvas.drawLine(front[i], arrowhead_left);
	}
}

