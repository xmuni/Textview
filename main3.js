// https://javascript.info/mouse-drag-and-drop
'use strict';

console.log("Ok");


var dragged = null;
var offset_x = 0;
var offset_y = 0;

const GRID_W = 20;
const GRID_H = 20;

const ZOOM_STEP = 0.1;
var scale = 1;

var textboxes = {};

var drag_id = null;
var dragging = false;
var resizing_textarea = false;

var canvas = null;

const COLORS = ["blue","black","yellow","green","violet","red"];

var pan_start_x = 0;
var pan_start_y = 0;

var pan_x = 0;
var pan_y = 0;

// var translate_x = 0;
// var translate_y = 0;

var interval_check_notifications = null;

// var check_interval_min = 5;

var mouse_on_textarea = false;

var settings = null;

var canvas_element = document.querySelector("#canvas");

const database_storage_url = "https://herokustorage.herokuapp.com/update/textview"


onload = main;

onunload = function() {
    if(canvas)
        canvas.save();

    settings["pan_x"] = pan_x;
    settings["pan_y"] = pan_y;
    settings["scale"] = scale;
    var jsontext = JSON.stringify(settings);
    localStorage.setItem("settings",jsontext);
};


function write_to_database(jsontext)
{
    return
}



function load_from_database()
{
    var msg_confirm = "Loading from database will clear all current content. Continue?";
    if(confirm(msg_confirm))
    {
        canvas.clear();

        fetch('https://herokustorage.herokuapp.com/get/textview')
        .then(response => response.json())
        .then(data => {
            console.log("Data:",data);
            // var list = JSON.parse(data);
            // console.log(data);
            canvas.load_textboxes(data);
        });
    }
}


function main()
{
    console.log("Main");
    
    canvas = new Canvas();
    canvas.load();
    // canvas.add_textbox(600,400,300,300);
    // canvas.add_textbox(200,200,150,150);


    var default_settings = {
        "notify": true,
        "check_interval": 5,
        "pan_x": 0,
        "pan_y": 0,
        "scale": 1,
    }

    var saved = JSON.parse(localStorage.getItem("settings"));
    if(saved)
        settings = Object.assign(default_settings,saved);
    else
        settings = default_settings;

    pan_x = settings["pan_x"];
    pan_y = settings["pan_y"];
    scale = settings["scale"];
    repaint();



    // settings["notify"] = false;

    var checkbox_notify = document.querySelector("#checkbox-notify")
    checkbox_notify.checked = settings["notify"];
    console.log("Notify checkbox set to",settings["notify"],"from settings");
    checkbox_notify.addEventListener("click", function() {
        settings["notify"] = document.querySelector("#checkbox-notify").checked;
    });


    document.addEventListener("mouseup", function() {
        console.log("Mouse up");
        // dragged = null;
        // console.log("Removing mousedragmove");
        // document.removeEventListener("mousemove", mousedragmove);
        drag_id = null;
        dragging = false;
        resizing_textarea = false;
    });

    canvas_element.addEventListener("mousedown", pan_start);
    
    document.addEventListener("wheel", zoom);
    
    
    var spinbox_interval = document.querySelector("#spinbox-interval");
    spinbox_interval.value = settings["check_interval"];
    spinbox_interval.addEventListener("mouseenter", () => mouse_on_textarea = true);
    spinbox_interval.addEventListener("mouseleave", () => mouse_on_textarea = false);

    spinbox_interval.addEventListener("change", function(event) {
        var value = event.target.value;
        if(parseInt(value))
        {
            settings["check_interval"] = value;
            console.log("Check interval set to",value);
        }

        clearInterval(interval_check_notifications);
        interval_check_notifications = setInterval(check_notifications, settings["check_interval"]*60*1000);
    });


    check_notifications();
    clearInterval(interval_check_notifications);
    interval_check_notifications = setInterval(check_notifications, settings["check_interval"]*60*1000);
}


function pan(x,y)
{
    pan_x += x;
    pan_y += y;
    repaint();
}


function pan_start(event)
{
    if(dragging || resizing_textarea)
        return;

    console.log("Pan start");
    document.addEventListener("mousemove", pan_canvas);
    document.addEventListener("mouseup", function() {
        document.removeEventListener("mousemove",pan_canvas);
    });

    pan_start_x = event.pageX - pan_x;
    pan_start_y = event.pageY - pan_y;
}


function pan_canvas(event)
{
    // console.log("Panning canvas");

    pan_x = event.pageX - pan_start_x;
    pan_y = event.pageY - pan_start_y;

    repaint();
}


function main_old()
{
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

    console.log("End main");
}


class Canvas
{
    constructor()
    {
        this.textboxes = {};
    }

    get_textboxes()
    {
        return Object.values(this.textboxes);
    }

    add_textbox(loaded_properties={})
    {
        console.log("Loaded textbox properties:",loaded_properties);

        var defaults = {
            "x": 600,
            "y": 400,
            "w": 400,
            "h": 300,
            "color": "blue",
            "wrap": "soft",
            "text": "",
            "title": "",
        }

        var properties = Object.assign(defaults, loaded_properties);

        var x = properties.x;
        var y = properties.y;
        var w = properties.w;
        var h = properties.h;
        var color = properties.color;
        var wrap = properties.wrap;
        var text = properties.text;
        var title = properties.title;

        console.log(x,y,w,h,color,wrap,title);

        var handle = document.createElement("div");
        var textarea = document.createElement('textarea');
        textarea.value = text;

        // Add wrap button
        var wrap_toggle = document.createElement('span');
        wrap_toggle.classList.add("wrap");
        wrap_toggle.textContent = "wrap";
        handle.appendChild(wrap_toggle);

        // Add color picker icon
        // var colorpicker = document.createElement('span');
        // colorpicker.classList.add("colorpicker");
        // colorpicker.classList.add("yellow");
        // handle.appendChild(colorpicker);

        // Add title div
        var title_div = document.createElement('div');
        title_div.classList.add("title");
        set_title(title_div,title);
        handle.appendChild(title_div);

        // Add title button
        var btn_title = document.createElement('div');
        btn_title.classList.add("set-title");
        btn_title.textContent = "title";
        handle.appendChild(btn_title);

        // Add delete button
        var del = document.createElement("div");
        del.classList.add("delete");
        handle.appendChild(del);
        // del.textContent = "×";

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
        handle.classList.add(color);
        handle.setAttribute("data-color",color);
        textarea.setAttribute("wrap",wrap);

        this.textbox_div = document.createElement("div");
        this.textbox_div.classList.add("textbox");
        this.textbox_div.appendChild(handle);
        this.textbox_div.appendChild(textarea);
        
        canvas_element.appendChild(this.textbox_div);
        
        var id = this.get_next_id();
        var textbox = new Textbox(id,handle,textarea);
        textbox.moveto(x,y);
        textbox.resize(w,h);
        
        // var id = 0;
        this.textboxes[id] = textbox;
        // this.textboxes.push(textbox);
        return textbox;
    }

    clear()
    {
        var elements = canvas_element.querySelectorAll(".textbox");
        elements.forEach(element => {
            while(element.firstChild)
                element.removeChild(element.firstChild);
            canvas_element.removeChild(element);
        });

        this.textboxes = {};
    }

    delete_textbox(id)
    {
        console.log("Deleting textbox with id",id);

        var confirm_delete = confirm("Delete this text box?");
        console.log(confirm_delete);

        if(!confirm_delete)
            return;
        
        // Delete from page
        var textbox_div = this.textboxes[id].handle.parentNode;
        while(textbox_div.firstChild)
            textbox_div.removeChild(textbox_div.firstChild);
        textbox_div.remove();

        // Delete from canvas dictionary
        delete this.textboxes[id];
    }

    get_next_id()
    {
        var maxid = 0;
        
        var ids = Object.keys(this.textboxes);

        for(var i=0; i<ids.length; i++)
        {
            if(!this.textboxes.hasOwnProperty(i))
                return i;
        }

        return ids.length;
    }

    to_json()
    {
        var list = [];
        var textboxes = Object.values(this.textboxes);
        textboxes.forEach(textbox => {
            list.push(textbox.save());
        });
        return JSON.stringify(list);
    }

    save_to_database()
    {
        // write_to_database(this.to_json());
        var jsontext = this.to_json();
        
        console.log('Updating database with jsontext:',typeof(jsontext),jsontext);

        var xhr = new XMLHttpRequest();
        xhr.open("PUT", database_storage_url, true);

        //Send the proper header information along with the request
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhr.onreadystatechange = function() {
            if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                console.log("Request sent");

                var button = document.querySelector("#button-savetodb");
                button.classList.add("bg-green");
                setTimeout(() => document.querySelector("#button-savetodb").classList.remove("bg-green"), 2000);
            }
        }
        xhr.send(jsontext);
    }

    save()
    {
        var jsontext = this.to_json();

        console.log("Saving data:")
        console.log(jsontext);

        localStorage.setItem("canvas",jsontext);

        console.log("Saved textboxes");
    }
    
    load()
    {
        var list = JSON.parse(localStorage.getItem("canvas"));
        this.load_textboxes(list);
    }

    load_from_database()
    {
        load_from_database();
    }

    load_textboxes(list)
    {
        console.log("Loading textboxes:",list);

        if(list)
        {
            console.log(list);

            list.forEach(properties => {
                console.log("Loading textbox properties:")
                console.log(properties);
                this.add_textbox(properties);
            });

            console.log("Loaded textboxes:",list);
        }
        else
            console.log("Nothing to load from local storage");
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

        this.textarea.addEventListener("dblclick", this.textarea_doubleclicked);
        this.textarea.addEventListener("mouseenter", () => mouse_on_textarea = true);
        this.textarea.addEventListener("mouseleave", () => mouse_on_textarea = false);

        this.btnwrap = handle.querySelector(".wrap");
        this.btnwrap.addEventListener("click", this.toggle_wrap.bind(this));

        
        handle.querySelector(".set-title").addEventListener("click", this.edit_title);

        
        var del = handle.querySelector(".delete");
        del.setAttribute("data-id",id);
        del.addEventListener("click", this.delete_textbox);
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

    save()
    {
        var obj = {
            "x": this.handle.style.left.replace("px",""),
            "y": this.handle.style.top.replace("px",""),
            "w": get_w(this.handle),
            "h": get_h(this.handle),
            "color": this.handle.attributes["data-color"].value,
            "wrap": this.textarea.attributes["wrap"].value,
            "text": this.textarea.value,
            "title": this.handle.querySelector(".title").textContent,
        }
        return obj;
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

    textarea_doubleclicked(event)
    {
        // console.log(this.value, this.selectionStart);
        var textarea = event.target;
        
        var text = textarea.value;
        var lines = text.split('\n');
        
        var selected_line = 0;
        for(var i=0; i<textarea.selectionStart; i++)
        {
            if(text[i] == '\n')
                selected_line += 1;
        }
        console.log('Selected line:',selected_line,typeof(selected_line));
        console.log(lines[selected_line])
        console.log(lines);

        // Open url
        var url = lines[selected_line].trim();
        if(url.includes("http") || url.includes("www"))
        {
            if(!url.startsWith("https://"))
                url = "https://"+url.replace("http://","");

            console.log("Opening url:",url);
            var newwin = window.open(url, "_blank");
            newwin.focus();
        }
    }

    edit_title(event)
    {
        var handle = event.target.parentNode.parentNode;

        var title_div = handle.querySelector(".title");
        var title = title_div.textContent;

        var new_title = window.prompt("Set a new title", title);

        set_title(title_div,new_title);
    }

    set_color(event)
    {
        var icon = event.target;
        var handle = icon.parentNode.parentNode;
        
        var newcolor = icon.attributes["data-color"].value;
        // console.log(newcolor,event);

        COLORS.forEach(color => {
            handle.classList.remove(color);
        });
        handle.classList.add(newcolor);
        handle.setAttribute("data-color",newcolor);
    }

    delete_textbox(event)
    {
        var del = event.target;
        var id = del.attributes['data-id'].value;
        canvas.delete_textbox(id);
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





function set_title(title_div,new_title)
{
    if(new_title == "")
    {
        title_div.textContent = "";
        title_div.style.display = "none";
    }

    else if(new_title)
    {
        title_div.textContent = new_title;
        title_div.style.display = "block";
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

    // Don't zoom if the user is trying to scroll a textarea
    if(mouse_on_textarea)
        return;

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
    repaint();
}

function reset_zoom()
{
    scale = 1;
    repaint();
}

function repaint()
{
    canvas_element.style.transform = `scale(${scale}) translate(${pan_x}px, ${pan_y}px)`;
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


function notifications_enabled()
{
    return document.querySelector("#checkbox-notify").checked;
}


function check_notifications(check_anyway=false)
{
    if(!notifications_enabled() && !check_anyway)
        return;

    console.log("Checking notifications...")

    const KEYWORD_NOTIFY = "DATE"

    var now = new Date();
    var now_year = now.getFullYear();
    var now_month = now.getMonth();
    var now_day = now.getUTCDate();

    canvas.get_textboxes().forEach(textbox => {
        var text = textbox.textarea.value;
        if(text.includes(KEYWORD_NOTIFY))
        {
            text.split('\n').forEach(line => {
                if(line.includes(KEYWORD_NOTIFY))
                {
                    line = line.replace(KEYWORD_NOTIFY,"").trim();
                    var words = line.replace("-"," ").replace(":"," ").split(" ");
                    // console.log(words);

                    var year = words[0];
                    var month = words[1] -1;
                    var day = words[2];
                    var hour = 0;
                    var min = 0;

                    if(words.length >= 5)
                    {
                        hour = words[3];
                        min = words[4];
                    }

                    // [year,month,day,hour,min].forEach(str => {
                    //     console.log(parseInt(str))
                    // });
                    
                    // console.log(year,month,day,hour,min);
                    var notify_date = new Date(year,month,day,hour,min);
                    console.log("Current date:",now);
                    console.log("Target date:",notify_date);

                    if(now >= notify_date)
                    {
                        console.log("Notify date reached");
                        notify(text, "  Textview");
                    }
                    else
                        console.log("Notify date still to reach. Now:", now);
                }
            });
        }
    });

    return "OK";
}


function notify(msg="Test notification message",title="Textview")
{
    var img = './img/dots3x3_square.svg';

    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        // alert("This browser does not support desktop notification");
        console.log("This browser does not support desktop notification");
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification(title, {body:msg, icon:img});
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied")
    {
        Notification.requestPermission().then(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted")
            {
                var notification = new Notification(title, {body:msg, icon:img});
            }
        });
    }
  
}


function save_txt()
{
    console.log("Saving txt");

    var date = get_date_string(new Date());
    
    var text_fields = [];
    canvas.get_textboxes().forEach(textbox => {

        var title = textbox.handle.querySelector(".title").textContent;
        if(title == "")
            text_fields.push("[Untitled textbox]");
        else
            text_fields.push(title);

        text_fields.push(textbox.textarea.value);   
    });
    console.log(text_fields);
    

    var filename = `Textview ${date}.txt`;
    download(text_fields.join("\n\n"), filename, 'text/plain');
}
    

function download(content, fileName, contentType)
{
    var newelement = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    newelement.href = URL.createObjectURL(file);
    newelement.download = fileName;
    newelement.style.display = "none";
    canvas_element.appendChild(newelement);
    newelement.click();
    canvas_element.removeChild(newelement);
    setTimeout(function() { URL.revokeObjectURL(newelement.href); }, 1000);
}


// Turns a date object into a string like "20190611"
function get_date_string(date)
{
	var year = date.getUTCFullYear();
	var month = date.getUTCMonth()+1;
	var day = date.getUTCDate();

	if(month<10)
		month = "0"+month;
	if(day<10)
		day = "0"+day;

	return [year,month,day].join('-');
}
