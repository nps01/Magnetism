(()=>{
    // 1) METHODS
    const resize_canvas = (cnv, OPT = 1) => {
        if (OPT === 1) {
            cnv.width = window.getComputedStyle(document.querySelector("body")).width.replace("px","");
            cnv.height = window.getComputedStyle(document.querySelector("body")).height.replace("px","");
        } else {
            cnv.width = window.innerWidth;
            cnv.height = window.innerHeight;
        }

    };
    const paint_canvas = (cnv, ctx, color="white") => {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, cnv.width, cnv.height);
    };
    const xpt1 = (ctx, w, h, count) => {

        for(var _ = 0; _ < count; _ ++) {
            var x = Math.random() * w, y = Math.random() * h;
            var value = getValue(x, y);
          
            ctx.save();
            ctx.translate(x, y);
          
            render(value);
          
            ctx.restore();
          }
          
          function getValue(x, y) {
            return (Math.sin(x * 0.01) + Math.sin(y * 0.01)) * Math.PI * 2;
          }
          
          function render(value) {
            ctx.rotate(value);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.random()*30 + 30 , 1);
            ctx.stroke();
          }
    }

    const xpt2 = (ctx, w, h) => {
        ctx.linewidth = 0.1;

        // random attractor params
        var a = Math.random() * 4 - 2;
        var b = Math.random() * 4 - 2;
        var c = Math.random() * 4 - 2;
        var d = Math.random() * 4 - 2;

        // create points. each aligned to left edge of screen,
        // spread out top to bottom.
        var points = [];
        for(var y = 0; y < h; y += 5) {
            points.push({
                x: 0,
                y: y, 
                vx: 0,
                vy: 0
            })
        };

        render();

        function render() {
            for(var i = 0; i < points.length; i++) {
                // get each point and do what we did before with a single point
                var p = points[i];
                var value = getValue(p.x, p.y);
                p.vx += Math.cos(value) * 0.3;
                p.vy += Math.sin(value) * 0.3;

                // move to current position
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);

                // add velocity to position and line to new position
                p.x += p.vx;
                p.y += p.vy;
                ctx.lineTo(p.x, p.y);
                ctx.stroke();

                // apply some friction so point doesn't speed up too much
                p.vx *= 0.99;
                p.vy *= 0.99;

                // wrap around edges of screen
                if(p.x > w) p.x = 0;
                if(p.y > h) p.y = 0;
                if(p.x < 0) p.x = w;
                if(p.y < 0) p.y = h;
            }

            // call this function again in one frame tick
            requestAnimationFrame(render);
        }

        function getValue(x, y) {
            // clifford attractor
            // http://paulbourke.net/fractals/clifford/
            
            // scale down x and y
            var scale = 0.005;
            x = (x - w / 2) * scale;
            y = (y - h / 2)  * scale;

            // attactor gives new x, y for old one. 
            var x1 = Math.sin(a * y) + c * Math.cos(a * x);
            var y1 = Math.sin(b * x) + d * Math.cos(b * y);

            // find angle from old to new. that's the value.
            return Math.atan2(y1 - y, x1 - x);
        }

    }

    // 2) VARIABLES/ CONSTANTS
    const cnv = document.querySelector("canvas"),
    ctx = cnv.getContext("2d"),
    BB=cnv.getBoundingClientRect(),
    offsetX=BB.left;
    offsetY=BB.top;
    props = {
        cnv_color: "white"
    };

    // 2X) new code
    // drag related variables
    var dragok = false;
    var startX;
    var startY;

    // resize canvas:
    resize_canvas(cnv);

    // an array of objects that define different shapes
    var shapes=[];
    // define 2 rectangles
    shapes.push({x:10,y:100,width:100,height:200,fill:"black",isDragging:false});

    // listen for mouse events
    cnv.onmousedown = myDown;
    cnv.onmouseup = myUp;
    cnv.onmousemove = myMove;

    // call to draw the scene
    draw();

    // draw a single rect
    function rect(r) {
        ctx.fillStyle=r.fill;
        ctx.fillRect(r.x,r.y,r.width,r.height);
    }

    // draw a single rect
    function circle(c) {
        ctx.fillStyle=c.fill;
        ctx.beginPath();
        ctx.arc(c.x,c.y,c.r,0,Math.PI*2);
        ctx.closePath();
        ctx.fill();
    }

    // clear the canvas
    function clear() {
        ctx.clearRect(0, 0, cnv.width, cnv.height);
    }

    // redraw the scene
    function draw() {
        clear();
        // redraw each shape in the shapes[] array
        for(var i=0;i<shapes.length;i++){
            // decide if the shape is a rect or circle
            // (it's a rect if it has a width property)
            if(shapes[i].width){
                rect(shapes[i]);
            }else{
                circle(shapes[i]);
            };
        }
    }

    // handle mousedown events
    function myDown(e){

        // tell the browser we're handling this mouse event
        e.preventDefault();
    e.stopPropagation();

    // get the current mouse position
    var mx=parseInt(e.clientX-offsetX);
    var my=parseInt(e.clientY-offsetY);
        alert(mx)
    // test each shape to see if mouse is inside
    dragok=false;
    for(var i=0;i<shapes.length;i++){
        var s=shapes[i];
        // decide if the shape is a rect or circle               
        if(s.width){
        // test if the mouse is inside this rect
        if(mx>s.x && mx<s.x+s.width && my>s.y && my<s.y+s.height){
            // if yes, set that rects isDragging=true
            dragok=true;
            s.isDragging=true;
        }
        }else{
        var dx=s.x-mx;
        var dy=s.y-my;
        // test if the mouse is inside this circle
        if(dx*dx+dy*dy<s.r*s.r){
            dragok=true;
            s.isDragging=true;
        }
        }
    }
    // save the current mouse position
    startX=mx;
    startY=my;
    }


    // handle mouseup events
    function myUp(e){
    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    // clear all the dragging flags
    dragok = false;
    for(var i=0;i<shapes.length;i++){
        shapes[i].isDragging=false;
    }
    }


    // handle mouse moves
    function myMove(e){
    // if we're dragging anything...
    if (dragok){

        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // get the current mouse position
        var mx=parseInt(e.clientX-offsetX);
        var my=parseInt(e.clientY-offsetY);

        // calculate the distance the mouse has moved
        // since the last mousemove
        var dx=mx-startX;
        var dy=my-startY;

        // move each rect that isDragging 
        // by the distance the mouse has moved
        // since the last mousemove
        for(var i=0;i<shapes.length;i++){
        var s=shapes[i];
        if(s.isDragging){
            s.x+=dx;
            s.y+=dy;
        }
        }

        // redraw the scene with the new rect positions
        draw();

        // reset the starting mouse position for the next mousemove
        startX=mx;
        startY=my;

    }
    }

    // 3) EVENT LISTENERS
    window.onresize = () => { 
        resize_canvas(cnv); paint_canvas(cnv,ctx,props.cnv_color) };

    // 4) START UP
    (()=>{
        // resize_canvas(cnv);
        // paint_canvas(cnv, ctx, props.cnv_color);
        // xpt2(ctx, cnv.width, cnv.height);
    })();
})();


