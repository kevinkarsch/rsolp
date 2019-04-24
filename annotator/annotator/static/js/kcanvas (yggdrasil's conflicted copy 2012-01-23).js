
/**
 * kCanvas
 */
function kCanvas(canvas){
	this.canvas = canvas;
	this.painters = new Array();
}

/**
 * Load image
 */
kCanvas.prototype.loadImage = function(src){
	var self = this;
	
	var image = new Image();
	image.onload = function(){
		self.image = image;
		self.canvas.width = image.width;
		self.canvas.height = image.height;
		Point2D.setMax(image.width, image.height);
		self.paintAll();
	}
	image.src = src;
}

// Get context
kCanvas.prototype.getContext = function(){
	return this.canvas.getContext('2d');
}

kCanvas.prototype.getHeight = function(){
	return this.canvas.height;
}

kCanvas.prototype.getWidth = function(){
	return this.canvas.width;
}

/*
 * Drawing stuff
 *
 */
// Draw
kCanvas.prototype.paintAll = function(){
	// Clear canvas to draw
	this.getContext().clearRect(0, 0, this.canvas.width, this.canvas.height);
	
	// Draw image if loaded
	if(this.image){
		this.getContext().drawImage(this.image, this.getWidth()/2-this.image.width/2, this.getHeight()/2-this.image.height/2);
	}
	
	for(var i = 0; i < this.painters.length; i++){
		this.painters[i].paint(this);
	}
}

// Draw line
kCanvas.prototype.drawLine = function(a, b){
	ctx = this.getContext();
	ctx.beginPath();  
	ctx.moveTo(a.x, a.y);
	ctx.lineTo(b.x, b.y);
	ctx.closePath();
	ctx.stroke();
}

// Draw loop
kCanvas.prototype.drawLoop = function(vertices){
	if(vertices.length < 2) return;

	ctx = this.getContext();
	ctx.beginPath();
	ctx.moveTo(vertices[0].x, vertices[0].y);
	for(var i = 0; i < vertices.length; i++){
		var v = vertices[i];
		ctx.lineTo(v.x, v.y);
	}
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
}