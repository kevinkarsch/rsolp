/**
 * PointSphere
 *
 */
function PointSphere(lat, lon){
	this.lat = lat;
	this.lon = lon;
}

PointSphere.prototype.cartesian = function(){
	var r = 100;
	var x = r * Math.sin(this.lat*Math.PI) * Math.cos(this.lon*Math.PI);
	var y = r * Math.sin(this.lat*Math.PI) * Math.sin(this.lon*Math.PI);
	var z = r * Math.cos(this.lat*Math.PI);
	log(x + " " + y + " " + z);
	return new Point3D(x, y, z);
}

PointSphere.prototype.project2D = function(){
	return this.cartesian().project2D();
}