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
	this.shaftInputEnum = {twoD : "2D", threeD : "3D"};
	this.shaftInputType = this.shaftInputEnum.twoD;
	this.shaftAngle3D = new Point2D(0.5, 0);
	this.shaftSource2D = new Point2D(kcanvas.getWidth()/2, kcanvas.getHeight()/4);
	this.moveVertexState = 0;
}

LightShaftHandler.prototype.paint = function(kcanvas){
	if(kcanvas === undefined){
		kcanvas = this.kcanvas;
	}
	var self = this;
	//Draw shaft polygons/directions
	$(this.lightshafts).each(function(key, value){
		value.paint(kcanvas, key === self.focus, self.shaftInputType == self.shaftInputEnum.threeD);
	});
	
	//Draw shaft source if necessary
	if(this.shaftInputType == this.shaftInputEnum.twoD) {
		if(this.moveVertexState == 0) {
			this.kcanvas.drawCircle(self.shaftSource2D, 7, "rgba(0,0,0,.5)");
			this.kcanvas.drawCircle(self.shaftSource2D, 5, "rgba(255,255,0,.5)");
		} else {		
			this.kcanvas.drawCircle(self.shaftSource2D, 7, "rgba(0,0,0,1)");
			this.kcanvas.drawCircle(self.shaftSource2D, 5, "rgba(255,255,0,1)");
		}
	}
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
		element.append($('<a class="add-vertex-link">[add]</a>').click(function(){ self.addVertexMode(key); }));
		element.append($('<a class="move-vertex-link">[move]</a>').click(function(){ self.moveVertexMode(key); }));
		element.append($('<a class="delete-link">[del]</a>').click(function(){ self.deleteLightShaft(key); }));
		element.append("&nbsp;&nbsp;Refine:");
		if(value.matte_shaft) {
			element.append($('<input type="checkbox" checked/>').click(function(){ self.toggleMatte(key); }));
		} else {
			element.append($('<input type="checkbox"/>').click(function(){ self.toggleMatte(key); }));
		}
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
    this.addVertexMode(this.lightshafts.length-1);
	this.updateShaftAngle();
	this.buildToolbar();
}

LightShaftHandler.prototype.addVertexMode = function(key){
	var self = this;
	this.focus = key;
	
	log("[LightShaft] Switching to add vertex mode for light shaft "+key);
	
	$(this.kcanvas.canvas).unbind();
	$(this.kcanvas.canvas).mousedown(function(e){ self.addLightSourceMouseDownHandler(e) });
    $(document).mousemove(function(e){ self.addLightSourceMouseMoveHandler(e) });
	
	this.moveVertexState = 0;
	
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
	
	this.moveVertexState = 1;
	
	this.kcanvas.paintAll();
}



/**
 * HTML GUI buttons
 */
LightShaftHandler.prototype.setShaftInput2D = function(){
	document.getElementById('shaft3d-phi-link').disabled = 1;
	document.getElementById('shaft3d-theta-link').disabled = 1;
	this.shaftInputType = this.shaftInputEnum.twoD;
	this.kcanvas.paintAll();
}

LightShaftHandler.prototype.setShaftInput3D = function(){
	document.getElementById('shaft3d-phi-link').disabled = 0;
	document.getElementById('shaft3d-theta-link').disabled = 0;
	this.shaftInputType = this.shaftInputEnum.threeD;
	this.kcanvas.paintAll();
}

LightShaftHandler.prototype.updateShaftAngle = function(){
	//Update GUI
	var phi = parseFloat(document.getElementById('shaft3d-phi-link').value);
	var theta = parseFloat(document.getElementById('shaft3d-theta-link').value);
	phi = Math.floor(phi*1e2)/100; // Truncate to two decimal places
	theta = Math.floor(theta*1e2)/100;
	document.getElementById('shaft3d-phi-label-link').innerHTML = phi + " pi";
	document.getElementById('shaft3d-theta-label-link').innerHTML = theta + " pi";
	//Update shaft directions
	this.shaftAngle3D = new Point2D(phi, theta);
	$(this.lightshafts).each(function(key, value){
		value.direction.lat = 0.5+phi;
		value.direction.lon = theta;
	});
	this.kcanvas.paintAll();
}

LightShaftHandler.prototype.toggleMatte = function(key){
	this.lightshafts[key].matte_shaft = 1-this.lightshafts[key].matte_shaft;
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
	$(this.lightshafts[this.focus].polygon.vertices.concat(this.shaftSource2D)).each(function(key, value){
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
