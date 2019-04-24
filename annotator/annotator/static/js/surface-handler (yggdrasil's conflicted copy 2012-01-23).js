/**
 * SurfaceHandler
 *
 */
 // Inherit from kCanvasHandler
SurfaceHandler.prototype = new kCanvasHandler();
SurfaceHandler.prototype.constructor = SurfaceHandler;
function SurfaceHandler(kcanvas){
	log("SurfaceHandler construct");
	kCanvasHandler.call(this, kcanvas);
	
	this.surfaces = new Array();
	this.focus = null;
}

SurfaceHandler.prototype.paint = function(kcanvas){
	if(kcanvas === undefined){
		kcanvas = this.kcanvas;
	}

	var self = this;
	$(this.surfaces).each(function(key, value){
		value.paint(kcanvas, key === self.focus);
	});
}

SurfaceHandler.prototype.buildToolbar = function(){
	var self = this;
	
	var list = $(document.createElement('ul')).attr('class','toolbar-list');
	var list_elements = "";
	$(this.surfaces).each(function(key, value){
		var element = $(document.createElement('li'));
		element.append(key + " ");
		var lat = $(document.createElement('span'));
		var lon = $(document.createElement('span'));
		element.append(lat);
		element.append(" ");
		element.append(lon);
		element.append($('<a class="add-vertex-link">[A]</a>').click(function(){ self.addVertexMode(key); }));
		element.append($('<a class="move-vertex-link">[M]</a>').click(function(){ self.moveVertexMode(key); }));
		element.append($('<a class="delete-link">[D]</a>').click(function(){ self.deleteSurface(key); }));
		list.append(element);
	});
	$('#surface-list').html(list);
}

SurfaceHandler.prototype.addSurface = function(){
	log("[Surface] Adding surface");

	var surface = new Surface([]);
	this.surfaces.push(surface);
	
	this.buildToolbar();
}

SurfaceHandler.prototype.deleteSurface = function(key){
	log("[Surface] Deleting surface " + key);
	
	this.surfaces.splice(key,1);
	if(this.focus === key) this.focus = null;
	
	this.kcanvas.paintAll();
	this.buildToolbar();
}

SurfaceHandler.prototype.addVertexMode = function(key){
	var self = this;
	this.focus = key;
	
	log("[Surface] Switching to add vertex mode for surface "+key);
	
	$(this.kcanvas.canvas).unbind();
	$(this.kcanvas.canvas).mousedown(function(e){ self.addSurfaceMouseDownHandler(e) });
    $(document).mousemove(function(e){ self.addSurfaceMouseMoveHandler(e) });
	
	this.kcanvas.paintAll();
}

SurfaceHandler.prototype.moveVertexMode = function(key){
	var self = this;
	this.focus = key;
	
	log("[Surface] Switching to move vertex mode for surface "+key);
	
	$(this.kcanvas.canvas).unbind();
	$(this.kcanvas.canvas).mousedown(function(e){ self.moveSurfaceMouseDownHandler(e) });
	$(document).mouseup(function(e){ self.moveSurfaceMouseUpHandler(e) });
    $(document).mousemove(function(e){ self.moveSurfaceMouseMoveHandler(e) });
	
	this.kcanvas.paintAll();
}





/**
 * Mouse move handler for adding surface
 */
SurfaceHandler.prototype.addSurfaceMouseMoveHandler = function(e){
	e.preventDefault();
	var offset = $(this.kcanvas.canvas).offset();
	var x = e.pageX - offset.left;
	var y = e.pageY - offset.top;
}

/**
 * Mouse down handler for adding surface
 */
var DRAG_RADIUS = 7;
SurfaceHandler.prototype.addSurfaceMouseDownHandler = function(e){
	e.preventDefault();

	var offset = $(this.kcanvas.canvas).offset();
	var x = e.pageX - offset.left;
	var y = e.pageY - offset.top;
	
	log("[Surface] Adding vertex ("+x+","+y+") to surface " + this.focus + "."); 
	
	this.surfaces[this.focus].polygon.vertices.push(new Point2D(x,y));
	this.kcanvas.paintAll();
}




/**
 * Modify mouse move handler
 */
SurfaceHandler.prototype.moveSurfaceMouseMoveHandler = function(e){
	e.preventDefault();
	var offset = $(this.kcanvas.canvas).offset();
	var x = e.pageX - offset.left;
	var y = e.pageY - offset.top;

	// Move vertex if we're currently dragging it
	if(this.isMouseDown && this.dragVertex){
		if(this.dragVertex.relativeTo !== undefined){
			var surface = this.surfaces[this.focus];
			var centroid = surface.polygon.findCentroid();
			this.dragVertex.translate(x-centroid.x, y-centroid.y);
		}else{
			this.dragVertex.translate(x, y);
		}
		this.kcanvas.paintAll();
	}
}

/**
 * Modify mouse down handler
 */
var DRAG_RADIUS = 7;
SurfaceHandler.prototype.moveSurfaceMouseDownHandler = function(e){
	e.preventDefault();

	var offset = $(this.kcanvas.canvas).offset();
	var x = e.pageX - offset.left;
	var y = e.pageY - offset.top;;

	this.dragX = x;
	this.dragY = y;
	this.isMouseDown = true;
	self = this;
	
	// See if click was anywhere near a vertex
	var surface = this.surfaces[this.focus];
	var allPoints = [].concat(surface.polygon.vertices, [surface.height]);
	$(allPoints).each(function(key, value){
		var checkx = value.x;
		var checky = value.y;
		if(key == allPoints.length - 1){
			var centroid = surface.polygon.findCentroid();
			checkx += centroid.x;
			checky += centroid.y;
		}
		dist = Math.pow((checkx - x), 2) + Math.pow((checky - y), 2);
		// If it was, move it
		if(dist < Math.pow(DRAG_RADIUS, 2)){
			self.dragVertex = value;
		}
	});
}

/**
 * Modify mouse up function
 */
SurfaceHandler.prototype.moveSurfaceMouseUpHandler = function(e){
	this.isMouseDown = false;
	delete this.dragVertex;
}