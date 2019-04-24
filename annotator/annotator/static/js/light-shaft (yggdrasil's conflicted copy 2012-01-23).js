/**
 * LightSource
 */
 
 function LightShaft(vertices){
	this.polygon = new Polygon(vertices)
	this.direction = new PointSphere(1, 0);
 }
 
 LightShaft.prototype.paint = function(kcanvas, inFocus){
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
	
	var centroid = this.polygon.findCentroid();
	var direction = this.direction.project2D();
	var end = this.polygon.findCentroid().plus(direction);
	kcanvas.drawLine(centroid, end);
	
	/*var headlen = 10;
	var arrowhead1 = new Point3D(
			this.direction.cartesian().x-headlen*Math.sin(this.direction.lat*Math.PI)*Math.cos(this.direction.lon*Math.PI),
			this.direction.cartesian().y-headlen*Math.sin(this.direction.lat*Math.PI)*Math.sin(this.direction.lon*Math.PI),
			this.direction.cartesian().z-headlen*Math.cos(this.direction.lat*Math.PI)
		);
	var arrowhead2 = new Point3D(
			this.direction.cartesian().x-headlen*Math.sin(this.direction.lat*Math.PI)*Math.cos(this.direction.lon*Math.PI + Math.PI),
			this.direction.cartesian().y-headlen*Math.sin(this.direction.lat*Math.PI)*Math.sin(this.direction.lon*Math.PI + Math.PI),
			this.direction.cartesian().z-headlen*Math.cos(this.direction.lat*Math.PI)
		);
	kcanvas.drawLine(end, centroid.plus(arrowhead1.project2D()));
	kcanvas.drawLine(end, centroid.plus(arrowhead2.project2D()));*/
 }