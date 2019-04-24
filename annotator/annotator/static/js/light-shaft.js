/**
 * LightSource
 */
 
 function LightShaft(vertices){
	this.polygon = new Polygon(vertices)
	this.direction = new PointSphere(1, 0);
	this.matte_shaft = 0;
 }
 
 LightShaft.prototype.paint = function(kcanvas, inFocus, showDirection){
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
	
	if(showDirection) {
		var cartesian_direction = this.direction.cartesian();
		var centroid = this.polygon.findCentroid();
		var direction = cartesian_direction.project2D();
		var end = this.polygon.findCentroid().plus(direction);
        var normalizedDirY = (cartesian_direction.y+100)/200; //r = 100, see PointSphere.js
        var lineColor = "rgba(" + Math.round(normalizedDirY*255) + ", 0, 255, 0.75)";
		kcanvas.drawLine(centroid, end, lineColor);
		
		var headlen = 10;
		var angle = Math.atan2(end.y-centroid.y, end.x-centroid.x);
		var arrowhead_right = new Point2D(end.x-headlen*Math.cos(angle-Math.PI/6), end.y-headlen*Math.sin(angle-Math.PI/6));
		var arrowhead_left = new Point2D(end.x-headlen*Math.cos(angle+Math.PI/6), end.y-headlen*Math.sin(angle+Math.PI/6));
		kcanvas.drawLine(end, arrowhead_right, "rgba(0,0,0,.5)");
		kcanvas.drawLine(end, arrowhead_left, lineColor);
		kcanvas.drawLine(end, arrowhead_right, lineColor);
		kcanvas.drawLine(end, arrowhead_left, lineColor);
	}
 }
