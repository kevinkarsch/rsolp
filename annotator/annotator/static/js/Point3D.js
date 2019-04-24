/**
 * PointSphere
 *
 */
function Point3D(x, y, z){
	this.x = x;
	this.y = y;
	this.z = z;
}

Point3D.prototype.normalize = function(){
	norm = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
	return new Point3D(this.x/norm, this.y/norm, this.z/norm);
}

Point3D.prototype.plus = function(p){
	return new Point3D(this.x+p.x, this.y+p.y, this.z+p.z);
}

Point3D.prototype.minus = function(p){
	return new Point3D(this.x-p.x, this.y-p.y, this.z-p.z);
}

Point3D.prototype.times = function(s){
	return new Point3D(s*this.x, s*this.y, s*this.z);
}

Point3D.prototype.dot = function(p){
	return p.x*this.x + p.y*this.y + p.z*this.z;
}

Point3D.prototype.cross = function(p){
	return new Point3D(p.z*this.y-p.y*this.z, p.x*this.z-p.z*this.x, p.y*this.x-p.x*this.y);
}

Point3D.prototype.project2D = function(){
	return new Point2D(this.x, this.z);
}