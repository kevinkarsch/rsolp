/**
 * PreviewHandler
 *
 */
 // Inherit from kCanvasHandler
PreviewHandler.prototype = new kCanvasHandler();
PreviewHandler.prototype.constructor = PreviewHandler;
function PreviewHandler(kcanvas){
	log("PreviewHandler construct");
	kCanvasHandler.call(this, kcanvas);
	this.x_col = "rgba(255,0,0,1)";
	this.y_col = "rgba(0,255,0,1)";
	this.z_col = "rgba(0,0,255,1)";
	this.anchor = 0;
	this.setBox3D(0,0,0,0);
}

PreviewHandler.prototype.setAnchor = function(anchor) {
	this.anchor = anchor;
	this.kcanvas.paintAll();
}

PreviewHandler.prototype.setBox3D = function(w,h,d, cam_h) {
	var pad = 4;
	var canvas_w = this.kcanvas.getWidth()-2*pad;
	var canvas_h = this.kcanvas.getHeight()-2*pad;
	
	var slope = (new Point2D(3,1)).times(1/Math.sqrt(10));
	var scale = new Point2D(d/w,d/h)
	var tmp_length = new Point2D((w+slope.x*d)*canvas_h, (h+slope.y*d)*canvas_w);
	var preview = new Point3D(0,0,0);
	if(tmp_length.x > tmp_length.y) {
		preview.x = canvas_w / (slope.x*scale.x+1);
		preview.z = preview.x * scale.x;
		preview.y = preview.x * (h/w);
	} else {
		preview.y = canvas_h / (slope.y*scale.y+1);
		preview.z = preview.y * scale.y;
		preview.x = preview.y * (w/h);
	}
	box = new Array(
					new Point2D(0+pad, preview.y+pad),
					new Point2D(0+pad, 0+pad),
					new Point2D(preview.x+pad, 0+pad),
					new Point2D(preview.x+pad, preview.y+pad),
					new Point2D(slope.x*preview.z+0+pad, slope.y*preview.z+preview.y+pad),
					new Point2D(slope.x*preview.z+0+pad, slope.y*preview.z+0+pad),
					new Point2D(slope.x*preview.z+preview.x+pad, slope.y*preview.z+0+pad),
					new Point2D(slope.x*preview.z+preview.x+pad, slope.y*preview.z+preview.y+pad)
				   );
	this.box_points = box;
	this.cam_height = cam_h; //Currently unused
	this.kcanvas.paintAll();
}

PreviewHandler.prototype.paint = function(){
	ctx = this.kcanvas.getContext();
	ctx.lineWidth = 2;
	this.kcanvas.drawLine(this.box_points[0], this.box_points[3], this.x_col);
	this.kcanvas.drawLine(this.box_points[1], this.box_points[2], this.x_col);
	this.kcanvas.drawLine(this.box_points[0], this.box_points[1], this.y_col);
	this.kcanvas.drawLine(this.box_points[3], this.box_points[2], this.y_col);
	
	this.kcanvas.drawLine(this.box_points[0], this.box_points[4], this.z_col);
	this.kcanvas.drawLine(this.box_points[1], this.box_points[5], this.z_col);
	this.kcanvas.drawLine(this.box_points[2], this.box_points[6], this.z_col);
	this.kcanvas.drawLine(this.box_points[3], this.box_points[7], this.z_col);
	
	this.kcanvas.drawCircle(this.box_points[this.anchor], 4, "rgb(0,0,0)");
	this.kcanvas.drawCircle(this.box_points[this.anchor], 2, "rgb(255,255,255)");
	this.kcanvas.drawCircle(this.box_points[(this.anchor+1)%4], 3, "rgb(0,0,0)");
	this.kcanvas.drawCircle(this.box_points[(this.anchor+3)%4], 3, "rgb(0,0,0)");
	
	this.kcanvas.drawLine(this.box_points[4], this.box_points[7], this.x_col);
	this.kcanvas.drawLine(this.box_points[5], this.box_points[6], this.x_col);
	
	this.kcanvas.drawLine(this.box_points[4], this.box_points[5], this.y_col);
	this.kcanvas.drawLine(this.box_points[7], this.box_points[6], this.y_col);
	
}
