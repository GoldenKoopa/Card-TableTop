

renderVars = {
    mousePosX: window.innerWidth/2,
    mousePosY: window.innerHeight/2,
    mouseIsDown: false,
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    currentPosX: 0,
    currentPosY: 0,
    lastRender: Date.now()
}

function mouseDown(e){
    if (e.button !== 0) {return}
    renderVars.currentPosX = e.pageX;
    renderVars.currentPosY = e.pageY;
    renderVars.mouseIsDown = true;
    console.log(renderVars.mousePosX, renderVars.mousePosY)
}

function mouseUp(e){
    renderVars.x += renderVars.deltaX;
    renderVars.y += renderVars.deltaY;
    renderVars.deltaX = 0;
    renderVars.deltaY = 0;
    renderVars.mouseIsDown = false;
    console.log('test')
}

function mouseMove(event){

    renderVars.mousePosX = event.pageX;
    renderVars.mousePosY = event.pageY;


    if (!renderVars.mouseIsDown) {return}

    renderVars.deltaX = event.pageX - renderVars.currentPosY;
    renderVars.deltaY = event.pageY - renderVars.currentPosY;

    if (Date.now() - renderVars.lastRender > 20){
        render(renderVars.x + renderVars.deltaX, renderVars.y + renderVars.deltaY);
        console.log('test4')
    }
}
draggable_surface = document.getElementById('draggable');
function render(x, y){
    console.log('test1');
    draggable_surface.style.left = (x) + 'px';
    draggable_surface.style.top = (y) + 'px';
    renderVars.lastRender = Date.now()
}


document.body.addEventListener('mousemove', mouseMove);
document.body.addEventListener('mousedown', (e) => { mouseDown(e) });
document.body.addEventListener('mouseup', (e) => { mouseUp(e) });