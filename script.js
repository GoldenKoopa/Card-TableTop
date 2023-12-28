let zoom_factor = 1.0;
renderVars = {
  mousePosX: window.innerWidth / 2,
  mousePosY: window.innerHeight / 2,
  mouseIsDown: false,
  mouseTarget: null,
  x: 0,
  y: 0,
  deltaX: 0,
  deltaY: 0,
  currentPosX: 0,
  currentPosY: 0,
  lastRender: Date.now(),
};

function mouseDown(e) {
  if (e.button !== 0) {
    return;
  }
  renderVars.currentPosX = e.pageX;
  renderVars.currentPosY = e.pageY;
  // console.log(renderVars.currentPosX, renderVars.currentPosY);
  renderVars.mouseIsDown = true;
  renderVars.mouseTarget = e.target;
  document.body.style.cursor = "grab";
  if (Object.values(e.target.classList).indexOf("rmenu") < 0) {
  }
}

function mouseUp(e) {
  renderVars.x += renderVars.deltaX;
  renderVars.y += renderVars.deltaY;
  renderVars.deltaX = 0;
  renderVars.deltaY = 0;
  renderVars.mouseIsDown = false;
  renderVars.mouseDownInBody = false;
  document.body.style.cursor = "auto";
}

function mouseMove(event) {
  renderVars.mousePosX = event.pageX;
  renderVars.mousePosY = event.pageY;

  if (!renderVars.mouseIsDown) {
    return;
  }
  renderVars.deltaX = event.pageX - renderVars.currentPosX;
  renderVars.deltaY = event.pageY - renderVars.currentPosY;

  if (Date.now() - renderVars.lastRender > 20) {
    render(renderVars.deltaX, renderVars.deltaY);
    renderVars.currentPosX = event.pageX;
    renderVars.currentPosY = event.pageY;
  }
}

document.body.style.backgroundPosition = 2 + "px " + 6 + "px";
draggable_surfaces = document.getElementsByClassName("draggable");
function render(dx, dy) {
  if (
    renderVars.mouseTarget == document.body ||
    renderVars.mouseTarget == document.getElementById("bkg")
  ) {
    for (let elem of draggable_surfaces) {
      elem.style.left =
        +elem.style.left.slice(0, elem.style.left.length - 2) + dx + "px";
      elem.style.top =
        +elem.style.top.slice(0, elem.style.top.length - 2) + dy + "px";
    }
    document.body.style.backgroundPosition =
      parseFloat(
        document.body.style.backgroundPosition
          .split(" ")[0]
          .slice(0, document.body.style.backgroundPosition[0].length - 3)
      ) +
      dx / 4 +
      "px " +
      (parseFloat(
        document.body.style.backgroundPosition
          .split(" ")[1]
          .slice(0, document.body.style.backgroundPosition[1].length - 2)
      ) +
        dy / 4) +
      "px";
  } else if (
    Object.values(draggable_surfaces).indexOf(renderVars.mouseTarget) > -1
  ) {
    renderVars.mouseTarget.style.left =
      +renderVars.mouseTarget.style.left.slice(
        0,
        renderVars.mouseTarget.style.left.length - 2
      ) +
      dx * (1 / zoom_factor) +
      "px";
    renderVars.mouseTarget.style.top =
      +renderVars.mouseTarget.style.top.slice(
        0,
        renderVars.mouseTarget.style.top.length - 2
      ) +
      dy * (1 / zoom_factor) +
      "px";
    if (
      renderVars.mouseTarget.getBoundingClientRect().top +
        renderVars.mouseTarget.getBoundingClientRect().height / 2 >
      document.getElementById("hand").offsetTop
    ) {
      renderVars.mouseTarget.remove();
      document.getElementById("hand").appendChild(renderVars.mouseTarget);
      renderVars.mouseTarget.classList.remove("draggable");
      renderVars.mouseTarget.classList.add("cardInHand");
      renderVars.mouseTarget.setAttribute("style", "");
    }
  }

  renderVars.lastRender = Date.now();
}

contents = document.getElementsByClassName("zoomable");
function zoom(e) {
  let delta = 1 + e.wheelDelta / 1000;
  zoom_factor += e.wheelDelta / 1000;

  if (zoom_factor > 5.0) {
    zoom_factor = 5.0;
  } else if (zoom_factor < 0.5) {
    zoom_factor = 0.5;
  }
  for (elem of contents) {
    elem.style.transform = `scale(${zoom_factor}, ${zoom_factor})`;
  }
}

function contextmenu(e) {
  e.preventDefault();
  mouseUp(e);
  renderVars.mouseTarget = e.target;
  // renderVars.currentPosX = e.pageX;
  // renderVars.currentPosY = e.pageY;
  document.getElementById("rmenu").style.left = e.pageX + "px";
  document.getElementById("rmenu").style.top = e.pageY + "px";
  document.getElementById("rmenu").style.display = "block";
}

document.body.addEventListener("wheel", zoom);
document.body.addEventListener("mousemove", mouseMove);
document.body.addEventListener("mousedown", (e) => {
  mouseDown(e);
});
document.body.addEventListener("mouseup", (e) => {
  mouseUp(e);
});
// document.body.addEventListener('contextmenu', contextmenu)
