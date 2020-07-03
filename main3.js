// https://javascript.info/mouse-drag-and-drop
'use strict';

console.log("Ok");


var dragged = null;
var offset_x = 0;
var offset_y = 0;

const GRID_W = 20;
const GRID_H = 20;

const ZOOM_STEP = 10;
var scale = 100;

var textboxes = {};

var drag_id = null;
var dragging = false;
var resizing_textarea = false;

var canvas = null;

const COLORS = ["blue","yellow"];


onload = main;

// main();


function main()
{
    console.log("Main");
    
    canvas = new Canvas();
    canvas.add_textbox(600,400,300,300);
    canvas.add_textbox(200,200,150,150);

    // var handles = document.querySelectorAll(".handle");
    // console.log("Handles:",handles);
    

    document.addEventListener("mouseup", function() {
        console.log("Mouse up");
        // dragged = null;
        // console.log("Removing mousedragmove");
        // document.removeEventListener("mousemove", mousedragmove);
        drag_id = null;
        dragging = false;
        resizing_textarea = false;
        // document.removeEventListener("mousemove", mouseresizemove);

        /*
        for(var key in textboxes) {
            if(textboxes.hasOwnProperty(key)) {
                textboxes[key].remove_event_listeners();
                textboxes[key].resize_textarea_to_grid();
            }
        }
        */

        // resize_textareas_to_grid();
    });

    return;

    var textbox_divs = document.querySelectorAll(".textbox");

    counter = 0;
    textbox_divs.forEach(element => {
        console.log(element);
        var handle = element.querySelector(".handle");
        var textarea = element.querySelector("textarea");

        // moveto(handle,300,200);

        if(handle && textarea)
            textboxes[counter] = new Textbox(handle,textarea);

        counter += 1;
    });

    // console.log("Textboxes:");
    // console.log(textboxes);


    
    document.querySelector("textarea").addEventListener("resize",resize);

    document.addEventListener("mousedown", function() {
        document.addEventListener("mousemove", mouseresizemove);
    });


    // Zoom buttons
    // var btn_zoomin  = document.querySelector("#btn-zoomin");
    // var btn_zoomout = document.querySelector("#btn-zoomout");
    document.addEventListener("wheel", zoom);

    console.log("End main");
}




class Canvas
{
    constructor()
    {
        this.textboxes = {};
    }

    add_textbox(x=600,y=400,w=400,h=300)
    {
        var handle = document.createElement("div");
        var textarea = document.createElement('textarea');

        var wrap_toggle = document.createElement('span');
        wrap_toggle.classList.add("wrap");
        wrap_toggle.textContent = "wrap";
        handle.appendChild(wrap_toggle);

        // Add color picker icon
        // var colorpicker = document.createElement('span');
        // colorpicker.classList.add("colorpicker");
        // colorpicker.classList.add("yellow");
        // handle.appendChild(colorpicker);

        // Add color menu
        var colormenu = document.createElement("div");
        colormenu.classList.add("colormenu");
        handle.appendChild(colormenu);
        
        COLORS.forEach(color => {
            var coloricon = document.createElement("div");
            coloricon.classList.add("coloricon");
            coloricon.classList.add(color);
            coloricon.setAttribute("data-color",color);
            colormenu.appendChild(coloricon);
        });


        handle.classList.add("handle");
        handle.classList.add("blue");
        textarea.setAttribute("wrap","soft");

        var textbox_div = document.createElement("div");
        textbox_div.classList.add("textbox");
        textbox_div.appendChild(handle);
        textbox_div.appendChild(textarea);
        
        document.querySelector("body").appendChild(textbox_div);
        
        var id = Object.keys(this.textboxes).length;
        var textbox = new Textbox(id,handle,textarea);
        textbox.moveto(x,y);
        textbox.resize(w,h);
        
        // var id = 0;
        this.textboxes[id] = textbox;
        // this.textboxes.push(textbox);
        return textbox;
    }

}



class Textbox
{
    constructor(id,handle,textarea)
    {
        this.id = id;

        this.handle = handle;
        this.textarea = textarea;

        this.offset_x = 0;
        this.offset_y = 0;

        // this.handle.setAttribute("data-textbox",id);
        // this.textarea.setAttribute("data-textbox",id);

        handle.addEventListener("mousedown", this.handle_dragstart.bind(this));
        handle.addEventListener("dragstart", function() { return false; });

        this.textarea.addEventListener("mousedown", function() {
            console.log("Mousedown on textarea");
            resizing_textarea = true;
            document.addEventListener("mousemove", mouseresizemove.bind(this)); // <-- "this" = this.textarea
        });

        this.textarea.addEventListener("click", function() {
            console.log(this.value, this.selectionStart);
        });

        this.btnwrap = handle.querySelector(".wrap");
        this.btnwrap.addEventListener("click", this.toggle_wrap.bind(this));

        // this.colorpicker = handle.querySelector(".colorpicker");
        // this.colorpicker.addEventListener("click", this.toggle_colorpicker.bind(this));
        
        var colormenu = handle.querySelector(".colormenu");
        var coloricons = colormenu.querySelectorAll(".coloricon");
        coloricons.forEach(icon => {
            icon.addEventListener("click",this.set_color);
        });

        // Move textbox to default coordinates
        // this.moveto(this.handle,300,200);
        this.moveto(300,200);

        this.handle.style.width  = "640px";
        this.handle.style.height = "440px";
        this.textarea.style.width  = "600px";
        this.textarea.style.height = "400px";

        console.log("Textbox created");
        console.log("Handle:",this.handle);
        console.log("Textarea:",this.textarea);
    }

    resize(w,h)
    {
        set_w(this.handle, w);
        set_h(this.handle, h);

        set_w(this.textarea, w - 2*GRID_W);
        set_h(this.textarea, h - 2*GRID_H);
    }

    handle_dragstart(event)
    {
        // console.log("Mousedown");

        // console.log("Handle for dragstart:",this.handle)

        // dragged = event.originalTarget;
        this.offset_x = event.clientX - this.handle.style.left.replace("px","");
        this.offset_y = event.clientY - this.handle.style.top.replace("px","");

        this.moveto(event.pageX, event.pageY);

        document.addEventListener('mousemove', mousedragmove);

        document.addEventListener("mouseup", this.resize_textarea_to_grid.bind(this));

        drag_id = this.id;
        dragging = true;
    }

    // mousedragmove(event)
    // {
    //     this.moveto(this.handle,event.pageX,event.pageY);
    // }

    move_to_xy(mousex,mousey)
    {
        this.moveto(mousex,mousey);
    }

    moveto(mousex,mousey)
    {
        var x = mousex - this.offset_x;
        var y = mousey - this.offset_y;
    
        x = Math.round(x/GRID_W)*GRID_W;
        y = Math.round(y/GRID_H)*GRID_H;

        // console.log(x,y);
        // console.log("Move to",mousex,mousey,this);
        // console.log("Moving element:",element);
            
        this.handle.style.left = x+"px";
        this.handle.style.top  = y+"px";
        
        this.textarea.style.left = (x +5*GRID_W)+"px";
        this.textarea.style.top = (y +5*GRID_H)+"px";
        this.textarea.style.position = "fixed";

        // var width = get_w(this.handle);
        // var height = get_h(this.handle);

        set_w(this.textarea, this.handle.offsetWidth -2*GRID_W);
        set_h(this.textarea, this.handle.offsetHeight -2*GRID_H);
    }

    // mouseresizemove()
    // {
    //     console.log("Resizing textbox");
    // }

    // remove_event_listeners()
    // {
    //     document.removeEventListener("mousemove",this.mousedragmove);
    //     document.removeEventListener("mousemove",this.mouseresizemove);
    // }

    resize_textarea_to_grid()
    {
        console.log("Resizing textarea to grid");

        var w = this.textarea.offsetWidth;
        var h = this.textarea.offsetHeight;
        // console.log(w,h);

        w = Math.round(w/GRID_W)*GRID_W;
        h = Math.round(h/GRID_H)*GRID_H;

        this.textarea.style.width  = w+"px";
        this.textarea.style.height = h+"px";
        // console.log(w,h);

        this.handle.style.width  = w + 2*GRID_W +"px";
        this.handle.style.height = h + 2*GRID_H +"px";
    }

    toggle_wrap()
    {
        var wrap = this.textarea.attributes['wrap'].value;
        var newwrap = wrap=="off" ? "soft" : "off";
        // console.log(wrap,newwrap);
        this.textarea.setAttribute("wrap",newwrap);

        if(newwrap == "off")
            this.btnwrap.textContent = "no wrap";
        else
            this.btnwrap.textContent = "wrap";
    }
    
    set_color(event)
    {
        var icon = event.target;
        var handle = icon.parentNode.parentNode;
        
        var newcolor = icon.attributes["data-color"].value;
        console.log(newcolor,event);

        COLORS.forEach(color => {
            handle.classList.remove(color);
        });
        handle.classList.add(newcolor);
    }
}



function mousedragmove()
{
    if(dragging)
    {
        var textbox = canvas.textboxes[drag_id];
        textbox.moveto(event.pageX,event.pageY);
        // this.moveto(event.pageX,event.pageY);
    }
}






function get_w(element)
{
    return element.offsetWidth;
}

function get_h(element)
{
    return element.offsetHeight;
}

function set_w(element,width)
{
    element.style.width = width+"px";
}

function set_h(element,height)
{
    element.style.height = height+"px";
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



function resize(event)
{
    console.log(event);
}



function mouseresizemove(event)
{
    // console.log("Resizing textarea:",this);
    // console.log(this);
    if(resizing_textarea)
    {
        var textarea = this;
        // console.log(textarea);

        var w = textarea.offsetWidth;
        var h = textarea.offsetHeight;

        var textbox = textarea.parentNode;
        var handle = textbox.querySelector(".handle");

        // console.log(handle);
    
        // var handle = document.querySelector(".handle");
        // handle = canvas.textboxes[id];
        handle.style.width  = w + 2*GRID_W +"px";
        handle.style.height = h + 2*GRID_H +"px";
    
        // Center handle on textarea
        // x = textarea.offsetLeft;
        // y = textarea.offsetTop;
    }
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