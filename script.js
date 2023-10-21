
let zoom_factor = 1.0;
renderVars = {
    mousePosX: window.innerWidth/2,
    mousePosY: window.innerHeight/2,
    mouseIsDown: false,
    mouseTarget: null,
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    currentPosX: 0,
    currentPosY: 0,
    lastRender: Date.now()
}

function mouseDown(e) {
    if (e.button !== 0) {return}
    renderVars.currentPosX = e.pageX;
    renderVars.currentPosY = e.pageY;
    renderVars.mouseIsDown = true;
    renderVars.mouseTarget = e.target
}

function mouseUp(e) {
    renderVars.x += renderVars.deltaX;
    renderVars.y += renderVars.deltaY;
    renderVars.deltaX = 0;
    renderVars.deltaY = 0;
    renderVars.mouseIsDown = false;
    renderVars.mouseDownInBody = false
}

function mouseMove(event) {

    renderVars.mousePosX = event.pageX;
    renderVars.mousePosY = event.pageY;


    if (!renderVars.mouseIsDown) {return}
    renderVars.deltaX = event.pageX - renderVars.currentPosX;
    renderVars.deltaY = event.pageY - renderVars.currentPosY;

    
    if (Date.now() - renderVars.lastRender > 20) {
        render(renderVars.deltaX, renderVars.deltaY);
        renderVars.currentPosX = event.pageX;
        renderVars.currentPosY = event.pageY;
    }
}


draggable_surfaces = document.getElementsByClassName('draggable');
function render(dx, dy){
    if (renderVars.mouseTarget == document.body || renderVars.mouseTarget == document.getElementById('bkg')) {
        for (let elem of draggable_surfaces){
            elem.style.left = (+elem.style.left.slice(0, elem.style.left.length-2) + dx ) + 'px';
            elem.style.top = (+elem.style.top.slice(0, elem.style.top.length-2) + dy) + 'px'
        }
    } else {
        renderVars.mouseTarget.style.left = (+renderVars.mouseTarget.style.left.slice(0, renderVars.mouseTarget.style.left.length-2) + dx * (1/zoom_factor) ) + 'px';
        renderVars.mouseTarget.style.top = (+renderVars.mouseTarget.style.top.slice(0, renderVars.mouseTarget.style.top.length-2) + dy * (1/zoom_factor)) + 'px'
    }
    renderVars.lastRender = Date.now();
}

contents = document.getElementsByClassName("zoomable");
function zoom(e){
    let delta = 1 + e.wheelDelta /1000;
    zoom_factor += e.wheelDelta/1000;
    
    if (zoom_factor > 2.0) { zoom_factor = 2.0 }
    else if (zoom_factor < 0.5) { zoom_factor = 0.5 }
    for (elem of contents) {
        elem.style.transform = `scale(${zoom_factor}, ${zoom_factor})`
    }
    
}

document.body.addEventListener('wheel', zoom)
document.body.addEventListener('mousemove', mouseMove);
document.body.addEventListener('mousedown', (e) => { mouseDown(e) });
document.body.addEventListener('mouseup', (e) => { mouseUp(e) });