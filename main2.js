// https://javascript.info/mouse-drag-and-drop

console.log("Ok");

onload = main;

var dragged = null;
var offset_x = 0;
var offset_y = 0;

const GRID_W = 20;
const GRID_H = 20;

const ZOOM_STEP = 10;
var scale = 100;


function main()
{
    var handles = document.querySelectorAll(".handle");
    console.log(handles);

    handles.forEach(element => {
        element.addEventListener("mousedown", mousedown);
        element.addEventListener("dragstart", function() {
            return false;
        });
        // element.addEventListener("mouseup", function() {
        //     document.removeEventListener("mousemove", mousemove);
        // });
    });

    document.addEventListener("mouseup", function() {
        console.log("Mouse up");
        dragged = null;
        document.removeEventListener("mousemove", mousedragmove);
        document.removeEventListener("mousemove", mouseresizemove);
        resize_textareas_to_grid();
    });

    
    document.querySelector("textarea").addEventListener("resize",resize);

    document.addEventListener("mousedown", function() {
        document.addEventListener("mousemove", mouseresizemove);
    });


    // Zoom buttons
    // var btn_zoomin  = document.querySelector("#btn-zoomin");
    // var btn_zoomout = document.querySelector("#btn-zoomout");
    document.addEventListener("wheel", zoom);
}

function zoom(event) {
    event.preventDefault();
    var dir = event.deltaY > 0 ? "down" : "up";
    console.log('Scroll wheel '+dir);
    console.log(event);

    if(event.deltaY > 0)
        zoom_out();
    else if(event.deltaY < 0)
        zoom_in();
}

function zoom_in() {
    console.log("Zooming in");
    zoom_canvas(ZOOM_STEP);
}

function zoom_out() {
    console.log("Zooming out");
    zoom_canvas(-ZOOM_STEP);
}

function zoom_canvas(step_percent) {
    scale += step_percent;
    document.querySelector("body").style.transform = `scale(${scale}%)`;
}



function resize(event) {
    console.log(event);
}



function mousedown(event) {
    console.log("Mouse down");

    dragged = event.originalTarget;
    offset_x = event.clientX - dragged.style.left.replace("px","");
    offset_y = event.clientY - dragged.style.top.replace("px","");

    // console.log('Box width',dragged.offsetWidth);
    // console.log('Box height',dragged.offsetHeight);
    // console.log('Offset x',offset_x);
    // console.log('Offset y',offset_y);

    moveto(dragged, event.pageX, event.pageY);

    document.addEventListener('mousemove', mousedragmove);
}

function moveto(element,mousex,mousey) {

    // var scale_factor = scale/100;
    // mousex /= scale_factor
    // mousey /= scale_factor

    x = mousex - offset_x;
    y = mousey - offset_y;

    x = Math.round(x/GRID_W)*GRID_W;
    y = Math.round(y/GRID_H)*GRID_H;
    // console.log(x,y);

    // var array = [element,textarea]
    // array.forEach(e => {
    //     e.style.position = "absolute";
    //     e.style.left = x+"px";
    //     e.style.top  = y+"px";
    //     console.log(e);
    // });
    console.log("Move to",mousex,mousey);
        
    element.style.left = x+"px";
    element.style.top  = y+"px";
    
    // var textarea = element.parentElement.querySelector("textarea");
    var textarea = document.querySelector("textarea");
    textarea.style.left = (x+ 1*GRID_W)+"px";
    textarea.style.top = (y+ 1*GRID_W)+"px";
    textarea.style.position = "fixed";
    width = element.offsetWidth;
    height = element.offsetHeight;
    textarea.style.width = width;
    textarea.style.height = height;

    // console.log("Moving to",mousex,mousey, element.offsetWidth,element.offsetHeight, x,y)

    // Move textarea
}

function mousedragmove(event) {
    if(dragged)
        moveto(dragged,event.pageX,event.pageY);
}

function mouseresizemove(event) {
    // console.log(event.pageX,event.pageY);
    var textarea = document.querySelector("textarea");

    w = textarea.offsetWidth;
    h = textarea.offsetHeight;

    var handle = document.querySelector(".handle");
    handle.style.width  = w + 2*GRID_W +"px";
    handle.style.height = h + 2*GRID_H +"px";

    // Center handle on textarea
    x = textarea.offsetLeft;
    y = textarea.offsetTop;
    // handle.style.left = x -10 -w/2 +"px";
    // handle.style.top = y -10 -h/2 +"px";
}

function resize_textareas_to_grid() {
    console.log('Resizing textareas');
    document.querySelectorAll("textarea").forEach(textarea => {
        var w = textarea.offsetWidth;
        var h = textarea.offsetHeight;
        // console.log(w,h);

        w = Math.round(w/GRID_W)*GRID_W;
        h = Math.round(h/GRID_H)*GRID_H;

        textarea.style.width  = w+"px";
        textarea.style.height = h+"px";
        // console.log(w,h);

        var handle = document.querySelector(".handle");
        handle.style.width  = w + 2*GRID_W +"px";
        handle.style.height = h + 2*GRID_H +"px";
    });
}





// ball.onmouseup = function()
// {
//     document.removeEventListener('mousemove', mousemove);
//     ball.onmouseup = null;
// };