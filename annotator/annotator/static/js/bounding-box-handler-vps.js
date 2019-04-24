/**
 * BoundingBoxHandler
 *
 */
 // Inherit from kCanvasHandler
BoundingBoxHandler.prototype = new kCanvasHandler();
BoundingBoxHandler.prototype.constructor = BoundingBoxHandler;
function BoundingBoxHandler(kcanvas, preview_handler){
	log("BoundingBoxHandler construct");
	kCanvasHandler.call(this, kcanvas);

	this.successImg = new Image();
	this.successImg.src = 'img/success.png';
	this.failImg = new Image();
	this.failImg.src = 'img/fail.png';
	
	this.x_col = "rgba(255,0,0,1)";
	this.y_col = "rgba(0,255,0,1)";
	this.z_col = "rgba(0,0,255,1)";
	this.box_points = this.initializeBox();
	this.box_points3d = new Array(
		new Point3D(0, 0, 0),
		new Point3D(0, 0, 0),
		new Point3D(0, 0, 0),
		new Point3D(0, 0, 0),
		new Point3D(0, 0, 0),
		new Point3D(0, 0, 0),
		new Point3D(0, 0, 0),
		new Point3D(0, 0, 0)
	);
	this.vp_line_x = new Array(
		new Point2D(300, 90),
		new Point2D(400, 95),
		new Point2D(300, 130),
		new Point2D(400, 125)
	);
	this.vp_line_z = new Array(
		new Point2D(120, 230),
		new Point2D(160, 170),
		new Point2D(180, 170),
		new Point2D(220, 230)
	);
	this.anchor = 0; //Vertex index that has full DOF
	this.vp_x = new Point2D(0,0);
	this.vp_y = new Point2D(0,0);
	this.vp_z = new Point2D(0,0);
	//Projection variables
	this.f = 0; 
	this.c = new Point2D(0,0);
	//this.K, this.Kinv, this.R, this.Rinv
	this.roomDepth = 15;
	//Initialize
	this.attachMouseHandlers();
	this.preview_handler = preview_handler;
	this.findVanishingPoints();
	this.snapToVanishingLines();
	this.computeBoxPoints3D();
	this.projectBox3D();
	this.kcanvas.paintAll();
}

BoundingBoxHandler.prototype.initializeBox = function(){
	return new Array(
						new Point2D(120, 200),
						new Point2D(120, 100),
						new Point2D(220, 100),
						new Point2D(220, 200),
						new Point2D(70, 250),
						new Point2D(70, 50),
						new Point2D(270, 50),
						new Point2D(270, 250)
					);
}

BoundingBoxHandler.prototype.attachMouseHandlers = function(){
	var self = this;
	$(document).mousemove(function(e){ self.mouseMoveHandler(e) });
	$(this.kcanvas.canvas).mousedown(function(e){ self.mouseDownHandler(e) });
	$(document).mouseup(function(e){ self.mouseUpHandler(e) });
}


BoundingBoxHandler.prototype.getAllVertices = function(){
	return this.box_points.slice(0,4).concat(this.vp_line_x).concat(this.vp_line_z);
}

/*
 * Define Mouse Events for Perspective Box
 *
 *
 */
/**
 * Mouse move function
 */
BoundingBoxHandler.prototype.mouseMoveHandler = function(e){
	e.preventDefault();
	var offset = $(this.kcanvas.canvas).offset();
	var x = e.pageX - offset.left;
	var y = e.pageY - offset.top;
	//log("[BoundingBox] Mouse moved " + x + "," + y);
	
	// Move vertex if we're currently dragging it
	if(this.isMouseDown && this.dragVertex){
        this.dragVertex.translate(x, y);
		this.findVanishingPoints();
        this.snapToVanishingLines();
		this.computeBoxPoints3D();
		this.projectBox3D();
		this.kcanvas.paintAll();
	}
}

/**
 * Mouse down function
 */
var DRAG_RADIUS = 7;
BoundingBoxHandler.prototype.mouseDownHandler = function(e){
	e.preventDefault();

	var offset = $(this.kcanvas.canvas).offset();
	var x = e.pageX - offset.left;
	var y = e.pageY - offset.top;
	
	this.dragX = x;
	this.dragY = y;
	this.isMouseDown = true;
	self = this;
	
	//log("[BoundingBox] Mouse down " + x + "," + y);
	
	// See if click was anywhere near a vertex
	this.getAllVertices().forEach(function(v){
		dist = Math.pow((v.x - x), 2) + Math.pow((v.y - y), 2);
		// If it was, move it
		if(dist < Math.pow(DRAG_RADIUS, 2)){
			self.dragVertex = v;
			//log("[BoundingBox] Dragging vertex from " + v.x + "," + v.y);
		}
	});
}

/**
 * Mouse up function
 */
BoundingBoxHandler.prototype.mouseUpHandler = function(e){
	this.isMouseDown = false;
	delete this.dragVertex;
}

/**
 * Paint
 */
BoundingBoxHandler.prototype.paint = function(){
	this.paintSuccessNotifier();
	this.paintBox();
	this.paintVPs();
}

/**
 * Draw edges of the perspective box
 */
BoundingBoxHandler.prototype.paintBox = function(){
	ctx = this.kcanvas.getContext();
	ctx.lineWidth = 2;
	
	//Shade middle wall
	ctx.strokeStyle = "rgba(00,00,255,0)";
	ctx.fillStyle = "rgba(255,255,255,0.3)";
	this.kcanvas.drawLoop(this.box_points.slice(0,4));
	
	// Draw box bounds
	this.kcanvas.drawLine(this.box_points[0], this.box_points[1], this.y_col);
	this.kcanvas.drawLine(this.box_points[3], this.box_points[2], this.y_col);
	//this.kcanvas.drawLine(this.box_points[0+4], this.box_points[1+4], this.y_col);
	//this.kcanvas.drawLine(this.box_points[3+4], this.box_points[2+4], this.y_col);	
	this.kcanvas.drawLine(this.box_points[0], this.box_points[3], this.x_col);
	this.kcanvas.drawLine(this.box_points[1], this.box_points[2], this.x_col);
	//this.kcanvas.drawLine(this.box_points[0+4], this.box_points[3+4], this.x_col);
	//this.kcanvas.drawLine(this.box_points[1+4], this.box_points[2+4], this.x_col);
	this.kcanvas.drawLine(this.box_points[0], this.box_points[4], this.z_col);
	this.kcanvas.drawLine(this.box_points[1], this.box_points[5], this.z_col);
	this.kcanvas.drawLine(this.box_points[2], this.box_points[6], this.z_col);
	this.kcanvas.drawLine(this.box_points[3], this.box_points[7], this.z_col);
	
	//Color code anchor/half-anchor verts
	this.kcanvas.drawCircle(this.box_points[this.anchor], 5, "rgb(0,0,0)");
	this.kcanvas.drawCircle(this.box_points[this.anchor], 3, "rgb(255,255,255)");
	this.kcanvas.drawCircle(this.box_points[(this.anchor+1)%4], 3, "rgb(0,0,0)");
	this.kcanvas.drawCircle(this.box_points[(this.anchor+3)%4], 3, "rgb(0,0,0)");
    
    //Draw back wall?
    var back_wall3d = this.box_points3d.slice(4,8);
    var back_wall2d = new Array(new Point2D(0,0),new Point2D(0,0),new Point2D(0,0),new Point2D(0,0));
    for(i=0;i<4;i++) {
        projPt = this.K.multMatrix(this.R).multPoint(back_wall3d[i]);
        back_wall2d[i] = new Point2D(projPt.x/projPt.z, projPt.y/projPt.z);
    }
	this.kcanvas.drawLine(back_wall2d[0], back_wall2d[1], "rgba(0,255,0,0.4)");
	this.kcanvas.drawLine(back_wall2d[3], back_wall2d[2], "rgba(0,255,0,0.4)");
	this.kcanvas.drawLine(back_wall2d[0], back_wall2d[3], "rgba(255,0,0,0.4)");
	this.kcanvas.drawLine(back_wall2d[1], back_wall2d[2], "rgba(255,0,0,0.4)");
}

BoundingBoxHandler.prototype.paintVPs = function(){
	ctx = this.kcanvas.getContext();
	//Draw VPs (might not be visible on screen)
	var diagl = new Point2D(7,7);
	var diagr = new Point2D(7,-7);
	ctx.lineWidth = 5;
	this.kcanvas.drawLine(this.vp_x.plus(diagl), this.vp_x.minus(diagl), "rgb(0,0,0)");
	this.kcanvas.drawLine(this.vp_x.plus(diagr), this.vp_x.minus(diagr), "rgb(0,0,0)");
	ctx.lineWidth = 3;
	this.kcanvas.drawLine(this.vp_x.plus(diagl), this.vp_x.minus(diagl), this.x_col);
	this.kcanvas.drawLine(this.vp_x.plus(diagr), this.vp_x.minus(diagr), this.x_col);
	ctx.lineWidth = 5;
	this.kcanvas.drawLine(this.vp_z.plus(diagl), this.vp_z.minus(diagl), "rgb(0,0,0)");
	this.kcanvas.drawLine(this.vp_z.plus(diagr), this.vp_z.minus(diagr), "rgb(0,0,0)");
	ctx.lineWidth = 3;
	this.kcanvas.drawLine(this.vp_z.plus(diagl), this.vp_z.minus(diagl), this.z_col);
	this.kcanvas.drawLine(this.vp_z.plus(diagr), this.vp_z.minus(diagr), this.z_col);
	//Draw VP lines
	ctx.lineWidth = 3;
	this.kcanvas.drawLine(this.vp_line_x[0], this.vp_line_x[1], "rgb(0,0,0)");
	ctx.lineWidth = 2;
	this.kcanvas.drawLine(this.vp_line_x[0], this.vp_line_x[1], this.x_col);
	ctx.lineWidth = 3;
	this.kcanvas.drawLine(this.vp_line_x[2], this.vp_line_x[3], "rgb(0,0,0)");
	ctx.lineWidth = 2;
	this.kcanvas.drawLine(this.vp_line_x[2], this.vp_line_x[3], this.x_col);
	ctx.lineWidth = 3;
	this.kcanvas.drawLine(this.vp_line_z[0], this.vp_line_z[1], "rgb(0,0,0)");
	ctx.lineWidth = 2;
	this.kcanvas.drawLine(this.vp_line_z[0], this.vp_line_z[1], this.z_col);
	ctx.lineWidth = 3;
	this.kcanvas.drawLine(this.vp_line_z[2], this.vp_line_z[3], "rgb(0,0,0)");
	ctx.lineWidth = 2;
	this.kcanvas.drawLine(this.vp_line_z[2], this.vp_line_z[3], this.z_col);
	for(i=0; i<4; i++) {
		this.kcanvas.drawCircle(this.vp_line_x[i], 4, "rgb(0,0,0)");
		this.kcanvas.drawCircle(this.vp_line_x[i], 3, this.x_col);
		this.kcanvas.drawCircle(this.vp_line_z[i], 4, "rgb(0,0,0)");
		this.kcanvas.drawCircle(this.vp_line_z[i], 3, this.z_col);
	}
}

BoundingBoxHandler.prototype.paintSuccessNotifier = function(){
	ctx = this.kcanvas.getContext();
	if(isNaN(this.f)) {
		ctx.drawImage(this.failImg, 10, 10);
	} else {
		ctx.drawImage(this.successImg, 10, 10);
	}
}

/** 
 *  GUI buttons
 */
BoundingBoxHandler.prototype.updateAnchor = function(idx){
	this.anchor = idx;
	this.kcanvas.paintAll();
	this.preview_handler.setAnchor(idx);
}

BoundingBoxHandler.prototype.updateRoomDepth = function(){
	d = document.getElementById('update-depth-link').value;
	this.roomDepth = parseFloat(d);
	this.computeBoxPoints3D();
	this.projectBox3D();
	this.kcanvas.paintAll();
}

BoundingBoxHandler.prototype.resetCorners = function(){
	this.box_points = this.initializeBox();
	this.snapToVanishingLines();
	this.computeBoxPoints3D();
	this.projectBox3D();
	this.kcanvas.paintAll();
}

/**
 * Vanishing point math
 */
BoundingBoxHandler.prototype.findVanishingPoints = function(){
	//Compute horizontal VP (intersection of two VP lines)
	result = this.rayIntersect(this.vp_line_x[0], this.vp_line_x[1], this.vp_line_x[2], this.vp_line_x[3]);
	this.vp_x = result.p;
	//Compute depth VP (intersection of two VP lines)
	result = this.rayIntersect(this.vp_line_z[0], this.vp_line_z[1], this.vp_line_z[2], this.vp_line_z[3]);
	this.vp_z = result.p;
	//Compute vertical VP (must be orthogonal to vx, vz; need to compute proj first)
	//K = [f 0 c.x; 0 f c.y; 0 0 1], then vy = cross(inv(K)*vx, inv(K)*vz)
	this.computeProjection(); // Get focal length and camera center
	var vx = this.vp_x;
	var vz = this.vp_z;
	var div = this.c.x*vx.y - this.c.x*vz.y - this.c.y*vx.x + this.c.y*vz.x + vx.x*vz.y - vx.y*vz.x;
	this.vp_y = new Point2D(this.f*(vx.y-vz.y)/div, this.f*(vx.x-vz.x)/div);
	if(!isFinite(this.vp_y) || isNaN(this.vp_y)) {
		this.vp_y = new Point2D(this.kcanvas.getWidth()/2,1e10);
	}
}

BoundingBoxHandler.prototype.computeProjection = function() {
	var vx = this.vp_x;
	var vz = this.vp_z;
	var w = this.kcanvas.getWidth();
	var h = this.kcanvas.getHeight();
	var org = vz;
	var dir = vx.minus(org);
	var t = (dir.x*(org.x - w/2) - dir.y*(h/2 - org.y))/(dir.x*dir.x + dir.y*dir.y)
	this.c = this.closestPtOnRay(org,dir, new Point2D(w/2,h/2));
	var f2 = this.c.x*vx.x + this.c.x*vz.x + this.c.y*vx.y + this.c.y*vz.y - 
			 vx.x*vz.x - vx.y*vz.y - this.c.x*this.c.x - this.c.y*this.c.y;
    this.f = Math.sqrt(Math.abs(f2));
    this.K = new Matrix3D(new Point3D(this.f,0,this.c.x), new Point3D(0,this.f,this.c.y),new Point3D(0,0,1));
    this.Kinv = new Matrix3D(new Point3D(1/this.f,0,-this.c.x/this.f), new Point3D(0,1/this.f,-this.c.y/this.f),new Point3D(0,0,1));
    var rotx = this.Kinv.multPoint(new Point3D(vx.x,vx.y,1));
    var rotz = this.Kinv.multPoint(new Point3D(vz.x,vz.y,1));
    var roty = rotx.cross(rotz);
    this.Rinv = new Matrix3D(rotx.normalize(), roty.normalize(), rotz.normalize());
    this.R = this.Rinv.transpose();
}

BoundingBoxHandler.prototype.snapToVanishingLines = function() {
	if(isNaN(this.f)) {
		return;
	}

	a = this.box_points[this.anchor];
	if(this.anchor==0 || this.anchor==2) {
		ax = (this.anchor+3)%4;
		ay = (this.anchor+1)%4;
	} else {
		ax = (this.anchor+1)%4;
		ay = (this.anchor+3)%4;
	}
	
	var anchor_x = this.closestPtOnRay(a, this.vp_x.minus(a), this.box_points[ax]);
	this.box_points[ax].translate(anchor_x.x, anchor_x.y);
	
	var anchor_y = this.closestPtOnRay(a, this.vp_y.minus(a), this.box_points[ay]);
	this.box_points[ay].translate(anchor_y.x, anchor_y.y);
	
	var anchor_xy = this.rayIntersect(this.box_points[ay], this.vp_x, this.box_points[ax], this.vp_y);
	this.box_points[(this.anchor+2)%4].translate(anchor_xy.p.x, anchor_xy.p.y);
}

BoundingBoxHandler.prototype.computeBoxPoints3D = function() {
	for(i=0; i<4; i++) {
		var p3 = new Point3D(this.box_points[i].x, this.box_points[i].y, 1);
		this.box_points3d[i] = this.Rinv.multMatrix(this.Kinv).multPoint(p3);
	}
    var cam_height = 5;
	this.box_points3d[0] = this.box_points3d[0].times(-cam_height/this.box_points3d[0].y);
	this.box_points3d[1] = this.box_points3d[1].times(this.box_points3d[0].z/this.box_points3d[1].z);
	this.box_points3d[2] = this.box_points3d[2].times(this.box_points3d[0].z/this.box_points3d[2].z);
	this.box_points3d[3] = this.box_points3d[3].times(-cam_height/this.box_points3d[3].y);
	for(i=0; i<4; i++) {
		this.box_points3d[i+4] = new Point3D(this.box_points3d[i].x, this.box_points3d[i].y, 
										     this.box_points3d[i].z - this.roomDepth);
	}
	//Set preview window
	box_w = Math.abs(this.box_points3d[0].x-this.box_points3d[3].x);
	box_h = Math.abs(this.box_points3d[0].y-this.box_points3d[1].y);
	box_d = Math.abs(this.box_points3d[0].z-this.box_points3d[4].z);
	this.preview_handler.setBox3D(box_w, box_h, box_d, -cam_height);
}

BoundingBoxHandler.prototype.projectBox3D = function() {
	/*for(i=0; i<4; i++) {
		var p2 = this.K.multMatrix(this.R).multPoint(this.box_points3d[i]);
		this.box_points[i].translate(p2.x/p2.z, p2.y/p2.z);
	}*/
	
	var w = this.kcanvas.getWidth();
	var h = this.kcanvas.getHeight();
	nearClip = 0.1;
	for(i=4; i<8; i++) {
		var Rp3 = this.R.multPoint(this.box_points3d[i]);
		//Intersect with clipping plane = (0,0,1, -nearClip)
		var plane_n = new Point3D(0,0,1);
		var plane_d = -nearClip;
		var org = this.R.multPoint(this.box_points3d[i-4]);
		var dir = Rp3.minus(org);
		var t = -(plane_n.dot(org)+plane_d) / plane_n.dot(dir);
		if(t<1) {
			Rp3 = dir.times(t).plus(org);
		}
		var p2un = this.K.multPoint(Rp3);
		var p2 = new Point2D(p2un.x/p2un.z, p2un.y/p2un.z);
		if(p2.x<0 || p2.x>=w || p2.y<0 || p2.y>=h) {
			//Insersect the corner-to-vp ray with the edges of the image
			var result1 = this.rayIntersect(this.box_points[i-4], this.vp_z, new Point2D(0,0), new Point2D(w,0));
			var result2 = this.rayIntersect(this.box_points[i-4], this.vp_z, new Point2D(w,0), new Point2D(w,h));
			var result3 = this.rayIntersect(this.box_points[i-4], this.vp_z, new Point2D(w,h), new Point2D(0,h));
			var result4 = this.rayIntersect(this.box_points[i-4], this.vp_z, new Point2D(0,h), new Point2D(0,0));
			//Choose closest positive edge
			result1.t = result1.t<0 ? 1e10 : result1.t;
			result2.t = result2.t<0 ? 1e10 : result2.t;
			result3.t = result3.t<0 ? 1e10 : result3.t;
			result4.t = result4.t<0 ? 1e10 : result4.t;
			var min_t = Math.min(result1.t, result2.t, result3.t, result4.t);
			if(min_t==result1.t) {
				p2 = result1.p;
			} else if(min_t==result2.t) {
				p2 = result2.p;
			} else if(min_t==result3.t) {
				p2 = result3.p;
			} else {
				p2 = result4.p;
			}
		}
		this.box_points[i].translate(p2.x, p2.y);
	}
}

BoundingBoxHandler.prototype.rayIntersect = function(p1a, p1b, p2a, p2b) {
	var o1 = p1a;
	var o2 = p2a;
	var d1 = o1.minus(p1b);
	var d2 = o2.minus(p2b);
	var det = d1.x*d2.y - d2.x*d1.y;
	var t = (d2.x*o1.y - d2.y*o1.x - d2.x*o2.y + d2.y*o2.x)/det;
	return {p : d1.times(t).plus(o1), t : t};
}

BoundingBoxHandler.prototype.closestPtOnRay = function(org, dir, pt0) {
	var t = (dir.x*(org.x - pt0.x) - dir.y*(pt0.y - org.y))/(dir.x*dir.x + dir.y*dir.y);
	return dir.times(-t).plus(org);
}

BoundingBoxHandler.prototype.lineSegIntersect = function(p1a, p1b, p2a, p2b) {
	var pt = null;
	var result1 = rayIntersect(p1a, p1b, p2a, p2b);
	if(0 <= result1.t && result1.t < 1) {
		var result2 = rayIntersect(p2a, p2b, p1a, p1b);
		if(0 <= result2.t && result2.t < 1) {
			pt = result2.p;
		}
	}
	return pt;
}

BoundingBoxHandler.prototype.splitAtEdges = function(poly_array) {
	var poly_array_s = poly_array.slice(0);
	//TODO: clip polygon across box
	return poly_array_s;
}