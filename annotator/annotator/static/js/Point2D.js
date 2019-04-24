/**
 * Point2D
 *
 */
function Point2D(x, y, noattached){
	this.x = x;
	this.y = y;
	if(noattached === undefined){
		this.attached = new Point2D(this.x, this.y, true);
	}
}

Point2D.maxX = Number.MAX_VALUE;
Point2D.maxY = Number.MAX_VALUE;
Point2D.setMax = function(x, y){
	Point2D.maxX = x;
	Point2D.maxY = y;	
}

Point2D.prototype.correctDelta = function(dx, dy){
	var rx = 0;
	var ry = 0;
	if(this.relativeTo !== undefined){
		var centroid = this.relativeTo.findCentroid();
		rx = centroid.x;
		ry = centroid.y;
	}
	
	var testx = (dx > 0)?(Math.max(this.x+rx, this.attached.x+rx) + dx):(Math.min(this.x+rx, this.attached.x+rx) + dx);
	var testy = (dy > 0)?(Math.max(this.y+ry, this.attached.y+ry) + dy):(Math.min(this.y+ry, this.attached.y+ry) + dy);
	var dxCorrect = dx;
	var dyCorrect = dy;
	if(testx < 0) dxCorrect = dx - testx;
	if(testy < 0) dyCorrect = dy - testy;
	if(testx > Point2D.maxX) dxCorrect = dx - (testx-Point2D.maxX);
	if(testy > Point2D.maxY) dyCorrect = dy - (testy-Point2D.maxY);
	return [dxCorrect, dyCorrect];
}

Point2D.prototype.translate = function(x, y){
    dx = x - this.x;
    dy = y - this.y;
	dcorrect = this.correctDelta(dx, dy);
	dx = dcorrect[0];
	dy = dcorrect[1];
	this.x += dx;
	this.y += dy;
	if(this.attached){
		this.attached.x += dx;
		this.attached.y += dy;
	}
}

Point2D.prototype.plus = function(p){
	return new Point2D(this.x + p.x, this.y + p.y);
}
Point2D.prototype.minus = function(p){
	return new Point2D(this.x - p.x, this.y - p.y);
}
Point2D.prototype.times = function(s){
	return new Point2D(this.x*s, this.y*s);
}