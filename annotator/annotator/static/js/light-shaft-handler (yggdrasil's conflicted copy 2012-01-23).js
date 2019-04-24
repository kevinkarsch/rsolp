/**
 * LightShaftHandler
 *
 */
 // Inherit from kCanvasHandler
LightShaftHandler.prototype = new kCanvasHandler();
LightShaftHandler.prototype.constructor = LightShaftHandler;
function LightShaftHandler(kcanvas){
	log("LightShaftHandler construct");
	kCanvasHandler.call(this, kcanvas);
	
	this.lightshafts = new Array();
	this.focus = null;
}

LightShaftHandler.prototype.paint = function(kcanvas){
	if(kcanvas === undefined){
		kcanvas = this.kcanvas;
	}

	var self = this;
	$(this.lightshafts).each(function(key, value){
		value.paint(kcanvas, key === self.focus);
	});
}

LightShaftHandler.prototype.buildToolbar = function(){
	var self = this;
	
	var list = $(document.createElement('ul')).attr('class','toolbar-list');
	var list_elements = "";
	$(this.lightshafts).each(function(key, value){
		var element = $(document.createElement('li'));
		element.append(key + " ");
		var lat = $(document.createElement('span'));
		var lon = $(document.createElement('span'));
		element.append(lat);
		element.append(" ");
		element.append(lon);
		element.append($('<a class="add-vertex-link">[A]</a>').click(function(){ self.addVertexMode(key); }));
		element.append($('<a class="move-vertex-link">[M]</a>').click(function(){ self.moveVertexMode(key); }));
		element.append($('<a class="delete-link">[D]</a>').click(function(){ self.deleteLightShaft(key); }));
		element.append($(document.createElement('div')).attr('class','toolbar-slider').slider({
			min: 0,
			max: 1,
			step: 0.01,
			value: 1,
			animate: true,
			slide: function(event, ui){
				value.direction.lat = ui.value;
				lat.html(ui.value);
				self.kcanvas.paintAll();
			}
		}));
		element.append($(document.createElement('div')).attr('class','toolbar-slider').slider({
			min: 0,
			max: 2,
			step: 0.01,
			animate: true,
			slide: function(event, ui){
				value.direction.lon = ui.value;
				lon.html(ui.value);
				self.kcanvas.paintAll();
			}
		}));
		list.append(element);
	});
	$('#lightshaft-list').html(list);
}

LightShaftHandler.prototype.deleteLightShaft = function(key){
	log("[LightShaft] Deleting light shaft " + key);
	
	this.lightshafts.splice(key,1);
	if(this.focus === key) this.focus = null;
	
	this.kcanvas.paintAll();
	this.buildToolbar();
}

LightShaftHandler.prototype.addLightShaft = function(){
	log("[LightShaft] Adding light shaft");

	var lightshaft = new LightShaft([]);
	this.lightshafts.push(lightshaft);
	
	this.buildToolbar();
}

LightShaftHandler.prototype.addVertexMode = function(key){
	var self = this;
	this.focus = key;
	
	log("[LightShaft] Switching to add vertex mode for light shaft "+key);
	
	$(this.kcanvas.canvas).unbind();
	$(this.kcanvas.canvas).mousedown(function(e){ self.addLightSourceMouseDownHandler(e) });
    $(document).mousemove(function(e){ self.addLightSourceMouseMoveHandler(e) });
	
	this.kcanvas.paintAll();
}

LightShaftHandler.prototype.moveVertexMode = function(key){
	var self = this;
	this.focus = key;
	
	log("[LightShaft] Switching to move vertex mode for light shaft "+key);
	
	$(this.kcanvas.canvas).unbind();
	$(this.kcanvas.canvas).mousedown(function(e){ self.moveLightSourceMouseDownHandler(e) });
	$(document).mouseup(function(e){ self.moveLightSourceMouseUpHandler(e) });
    $(document).mousemove(function(e){ self.moveLightSourceMouseMoveHandler(e) });
	
	this.kcanvas.paintAll();
}





/**
 * Mouse move handler for adding light shaft
 */
LightShaftHandler.prototype.addLightSourceMouseMoveHandler = function(e){
	e.preventDefault();
	var offset = $(this.kcanvas.canvas).offset();
	var x = e.pageX - offset.left;
	var y = e.pageY - offset.top;
}

/**
 * Mouse down handler for adding light shaft
 */
var DRAG_RADIUS = 7;
LightShaftHandler.prototype.addLightSourceMouseDownHandler = function(e){
	e.preventDefault();

	var offset = $(this.kcanvas.canvas).offset();
	var x = e.pageX - offset.left;
	var y = e.pageY - offset.top;
	
	log("[LightShaft] Adding vertex ("+x+","+y+") to light shaft " + this.focus + "."); 
	
	this.lightshafts[this.focus].polygon.vertices.push(new Point2D(x,y));
	this.kcanvas.paintAll();
}




/**
 * Modify mouse move handler
 */
LightShaftHandler.prototype.moveLightSourceMouseMoveHandler = function(e){
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
LightShaftHandler.prototype.moveLightSourceMouseDownHandler = function(e){
	e.preventDefault();

	var offset = $(this.kcanvas.canvas).offset();
	var x = e.pageX - offset.left;
	var y = e.pageY - offset.top;;

	this.dragX = x;
	this.dragY = y;
	this.isMouseDown = true;
	self = this;
	
	// See if click was anywhere near a vertex
	$(this.lightshafts[this.focus].polygon.vertices).each(function(key, value){
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
LightShaftHandler.prototype.moveLightSourceMouseUpHandler = function(e){
	this.isMouseDown = false;
	delete this.dragVertex;
}