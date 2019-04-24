/**
 * LightSource
 */
 
 function LightSource(vertices){
	this.polygon = new Polygon(vertices)
 }
 
 LightSource.prototype.paint = function(kcanvas, inFocus){
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
 }