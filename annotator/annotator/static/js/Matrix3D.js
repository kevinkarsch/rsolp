/**
 * Matrix3D
 * Requires Point3D.js
 */
function Matrix3D(r1, r2, r3){
	//Each row as a point3D
	this.r1 = r1;
	this.r2 = r2;
	this.r3 = r3;
}

Matrix3D.prototype.multPoint = function(p){
	return new Point3D(this.r1.dot(p), this.r2.dot(p), this.r3.dot(p));
}

Matrix3D.prototype.multMatrix = function(M){
	var Mt = M.transpose();
	var r1 = this.multPoint(Mt.r1);
	var r2 = this.multPoint(Mt.r2);
	var r3 = this.multPoint(Mt.r3);
	var result = new Matrix3D(r1,r2,r3);
	return result.transpose();
}

Matrix3D.prototype.transpose = function() {
	var r1 = new Point3D(this.r1.x, this.r2.x, this.r3.x);
	var r2 = new Point3D(this.r1.y, this.r2.y, this.r3.y);
	var r3 = new Point3D(this.r1.z, this.r2.z, this.r3.z);
	return new Matrix3D(r1,r2,r3);
}

Matrix3D.prototype.asString = function() {
	return "[" + this.r1.x + " "+ this.r1.y + " "+ this.r1.z + "]\n["
		  	   + this.r2.x + " "+ this.r2.y + " "+ this.r2.z + "]\n["
		       + this.r3.x + " "+ this.r3.y + " "+ this.r3.z + "]";
}