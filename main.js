console.log("Ok");

onload = main;
document.addEventListener("mouseup", mouse_release);
document.addEventListener("mousemove", mouse_move);

var mouse_x = 0;
var mouse_y = 0;

var dragged = null;

function main()
{
    var handles = document.querySelectorAll(".handle");
    console.log(handles);

    handles.forEach(element => {
        element.addEventListener("dragstart", dragstart_handler);
        element.addEventListener("dragend", dragend_handler);
    });
}


function logMouseButton(e) {
  if (typeof e === 'object') {
    switch (e.button) {
      case 0:
        log.textContent = 'Left button clicked.';
        break;
      case 1:
        log.textContent = 'Middle button clicked.';
        break;
      case 2:
        log.textContent = 'Right button clicked.';
        break;
      default:
        log.textContent = `Unknown button code: ${e.button}`;
    }
  }
}

function dragstart_handler(event)
{
    // console.log("Drag start");
    var handle = event.originalTarget;
    dragged = handle;
    // console.log(handle.offsetTop);
    // console.log(handle.offsetLeft);
    console.log("Drag start",event.clientX,event.clientY);
    console.log(event);


    x = getPos(event).x;
    y = getPos(event).y;
    // console.log(x,y); 
}

function getPos(evt)
{
    evt = event || window.event;
    return {x:evt.clientX,y:evt.clientY};
}

function dragend_handler(event) {

    
    // console.log("Drag end",event.screenX,event.screenY);
    console.log("Drag end");
    console.log("Mouse position:",mouse_x,mouse_y);
    console.log(event);
    var handle = event.originalTarget;

    // x = getPos(event).x;
    // y = getPos(event).y;

    // handle.style.top = x;
    // handle.style.left = y;
    
    // console.log("Setting position:",x,y)
}

function mouse_release(e) {

    // console.log(e);

    if(e.button == 0)
    {
        console.log("Left button release");
        x = getPos(event).x;
        y = getPos(event).y;

        if(dragged)
        {
            dragged.style.top = x+"px";
            dragged.style.left = y+"px";
            console.log("Setting position:",x,y)
        }
    }


    // if (typeof e === 'object') {
    //     switch (e.button) {
    //     case 0:
    //         log.textContent = 'Left button clicked.';
    //         break;
    //     case 1:
    //         log.textContent = 'Middle button clicked.';
    //         break;
    //     case 2:
    //         log.textContent = 'Right button clicked.';
    //         break;
    //     default:
    //         log.textContent = `Unknown button code: ${e.button}`;
    //     }
    // }
  }

function mouse_move(event)
{
    mouse_x = event.pageX;
    mouse_y = event.pageY;
    // console.log('Mouse move',event.pageX,event.pageY);
}