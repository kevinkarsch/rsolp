

function Polygon(vertices){
	this.lineWidth = 2;
	this.strokeStyle = "rgba(0,0,0,0.7)";
	this.fillStyle = "rgba(255,255,0,0.3)";
	
	this.vertices = vertices;
}

Polygon.prototype.paint = function(kcanvas){
	ctx = kcanvas.getContext();
	ctx.lineWidth = this.lineWidth;
	ctx.strokeStyle = this.strokeStyle;
	ctx.fillStyle = this.fillStyle;
	
	$(this.vertices).each(function(key, value){
		ctx.beginPath();
		ctx.arc(value.x, value.y, 1, 0, Math.PI*2, false);
		ctx.stroke();
	});
	
	kcanvas.drawLoop(this.vertices);
}

Polygon.prototype.findCentroid = function(){
	if(this.vertices.length < 1){
		return new Point2D(0, 0);
	}

	var sumX = 0;
	var sumY = 0;
	$(this.vertices).each(function(key, value){
		sumX += value.x;
		sumY += value.y;
	});
	return new Point2D(sumX/this.vertices.length, sumY/this.vertices.length);
}