/**
 * LightSourceHandler
 *
 */
 // Inherit from kCanvasHandler
LightSourceHandler.prototype = new kCanvasHandler();
LightSourceHandler.prototype.constructor = LightSourceHandler;
function LightSourceHandler(kcanvas){
	log("LightSourceHandler construct");
	kCanvasHandler.call(this, kcanvas);
	
	this.lightsources = new Array();
	this.focus = null;
}

LightSourceHandler.prototype.paint = function(kcanvas){
	if(kcanvas === undefined){
		kcanvas = this.kcanvas;
	}

	var self = this;
	$(this.lightsources).each(function(key, value){
		value.paint(kcanvas, key === self.focus);
	});
}

LightSourceHandler.prototype.buildToolbar = function(){
	var self = this;
	
	var list = $(document.createElement('ul')).attr('class','toolbar-list');
	var list_elements = "";
	$(this.lightsources).each(function(key, value){
		var element = $(document.createElement('li'));
		element.append(key + " ");
		element.append($('<a class="add-vertex-link">[A]</a>').click(function(){ self.addVertexMode(key); }));
		element.append($('<a class="move-vertex-link">[M]</a>').click(function(){ self.moveVertexMode(key); }));
		element.append($('<a class="delete-link">[D]</a>').click(function(){ self.deleteLightSource(key); }));
		list.append(element);
	});
	$('#lightsource-list').html(list);
}

LightSourceHandler.prototype.deleteLightSource = function(key){
	log("[LightSource] Deleting light source " + key);
	
	this.lightsources.splice(key,1);
	if(this.focus === key) this.focus = null;
	
	this.kcanvas.paintAll();
	this.buildToolbar();
}

LightSourceHandler.prototype.addLightSource = function(){
	log("[LightSource] Adding light source");

	var lightsource = new LightSource([]);
	this.lightsources.push(lightsource);
	
	this.buildToolbar();
}

LightSourceHandler.prototype.addVertexMode = function(key){
	var self = this;
	this.focus = key;
	
	log("[LightSource] Switching to add vertex mode for light source "+key);
	
	$(this.kcanvas.canvas).unbind();
	$(this.kcanvas.canvas).mousedown(function(e){ self.addLightSourceMouseDownHandler(e) });
    $(document).mousemove(function(e){ self.addLightSourceMouseMoveHandler(e) });
	
	this.kcanvas.paintAll();
}

LightSourceHandler.prototype.moveVertexMode = function(key){
	var self = this;
	this.focus = key;
	
	log("[LightSource] Switching to move vertex mode for light source "+key);
	
	$(this.kcanvas.canvas).unbind();
	$(this.kcanvas.canvas).mousedown(function(e){ self.moveLightSourceMouseDownHandler(e) });
	$(document).mouseup(function(e){ self.moveLightSourceMouseUpHandler(e) });
    $(document).mousemove(function(e){ self.moveLightSourceMouseMoveHandler(e) });
	
	this.kcanvas.paintAll();
}





/**
 * Mouse move handler for adding light source
 */
LightSourceHandler.prototype.addLightSourceMouseMoveHandler = function(e){
	e.preventDefault();
	var offset = $(this.kcanvas.canvas).offset();
	var x = e.pageX - offset.left;
	var y = e.pageY - offset.top;
}

/**
 * Mouse down handler for adding light source
 */
var DRAG_RADIUS = 7;
LightSourceHandler.prototype.addLightSourceMouseDownHandler = function(e){
	e.preventDefault();

	var offset = $(this.kcanvas.canvas).offset();
	var x = e.pageX - offset.left;
	var y = e.pageY - offset.top;
	
	log("[LightSource] Adding vertex ("+x+","+y+") to light source " + this.focus + "."); 
	
	this.lightsources[this.focus].polygon.vertices.push(new Point2D(x,y));
	this.kcanvas.paintAll();
}




/**
 * Modify mouse move handler
 */
LightSourceHandler.prototype.moveLightSourceMouseMoveHandler = function(e){
	e.preventDefault();
	var offset = $(this.kcanvas.canvas).offset();
	var x = e.pageX - offset.left;
	var y = e.pageY - offset.top;

	// Move vertex if we're currently dragging it
	if(this.isMouseDown && this.dragVertex){
        this.dragVertex.translate(x, y);
		this.kcanvas.paintAll();
	}
}

/**
 * Modify mouse down handler
 */
var DRAG_RADIUS = 7;
LightSourceHandler.prototype.moveLightSourceMouseDownHandler = function(e){
	e.preventDefault();

	var offset = $(this.kcanvas.canvas).offset();
	var x = e.pageX - offset.left;
	var y = e.pageY - offset.top;

	this.dragX = x;
	this.dragY = y;
	this.isMouseDown = true;
	self = this;
	
	// See if click was anywhere near a vertex
	$(this.lightsources[this.focus].polygon.vertices).each(function(key, value){
		dist = Math.pow((value.x - x), 2) + Math.pow((value.y - y), 2);
		// If it was, move it
		if(dist < Math.pow(DRAG_RADIUS, 2)){
			self.dragVertex = value;
		}
	});
}

/**
 * Modify mouse up function
 */
LightSourceHandler.prototype.moveLightSourceMouseUpHandler = function(e){
	this.isMouseDown = false;
	delete this.dragVertex;
}