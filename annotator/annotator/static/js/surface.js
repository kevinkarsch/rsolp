/**
 * Surface
 */
 
 function Surface(vertices){
	this.polygon = new Polygon(vertices)
	this.height = new Point2D(0, 20);
	this.height.relativeTo = this.polygon;
	this.solid = 1;
 }
 
 Surface.prototype.paint = function(kcanvas, inFocus){
	if(inFocus){
		this.polygon.lineWidth = 2;
		this.polygon.strokeStyle = "rgba(0,0,0,0.7)"
		this.polygon.fillStyle = "rgba(255,255,0,0.3)";
	}else{
		this.polygon.lineWidth = 2;
		this.polygon.strokeStyle = "rgba(0,0,0,0.35)"
		this.polygon.fillStyle = "rgba(255,255,0,0.15)";
	}
	this.polygon.paint(kcanvas);
	
    if(this.polygon.vertices.length > 0) {
        var start = this.polygon.vertices[0]; //this.polygon.findCentroid();
        var end = start.plus(this.height);
        kcanvas.drawLine(start, end, "rgba(0,255,255,0.8)");
    }
 }