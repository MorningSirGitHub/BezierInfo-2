setup() {
    this.curve = Bezier.defaultQuadratic(this);
    setMovable(this.curve.points);
}

draw() {
    resetTransform();
    clear();
    this.curve.drawSkeleton();
    this.curve.drawCurve();
    this.curve.drawPoints();

    translate(this.width/2, 0);
    line(0,0,0,this.height);

    // translate to (0,0)
    let points = this.curve.points;
    let m = points[0];
    points = points.map(v => {
        return {
            x: v.x - m.x,
            y: v.y - m.y
        }
    });

    // rotate so that last point is (...,0)
    let dx = points[2].x;
    let dy = points[2].y;
    let a = atan2(dy, dx);
    points = points.map(v => {
        return {
            x: v.x * cos(-a) - v.y * sin(-a),
            y: v.x * sin(-a) + v.y * cos(-a)
        };
    });

    let ncurve = new Bezier(this, points);
    translate(10, this.height/2);
    setStroke(`grey`);
    line(0,-this.height,0,this.height);
    line(-10,0,this.width,0);
    ncurve.drawCurve();
    setFill(`black`);
    text(`(0,0)`, 5,15);
    text(`(${points[2].x|0},0)`, points[2].x, 15, CENTER);
}

onMouseMove() {
    redraw();
}
