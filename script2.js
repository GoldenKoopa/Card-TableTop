function makeSvgElment(parent, element) {
    return parent.appendChild(document.createElementNS("http://www.w3.org/2000/svg", element));
}

window.addEventListener('resize', eineFunktion)

function eineFunktion(e) {
    handle.changeRatio(document.body.clientHeight/document.body.clientWidth)
}
let handle = makeBoard(document.getElementsByClassName('breitwiederbildschirm')[0], 0, 0, 100, 100)
function makeBoard(svgElement, startX, startY, startHeight, startWidth, disableControls) {
    let handle = {
        parent: svgElement,
        view: { x: startX, y: startY, width: startWidth, height: startHeight, ratio: startHeight / startWidth },
        setView: () =>
            svgElement.setAttribute(
                "viewBox",
                `${handle.view.x} ${handle.view.y} ${handle.view.width} ${handle.view.height}`
            ),
        changeRatio: (ratio) => {
            if (handle.view.ratio !== ratio) {
                handle.view.ratio = ratio;
                handle.view.height = handle.view.width * ratio;
                handle.setView();
            }
        },
        sTbCoord: (c, elemPos, elemHeight, viewPos, viewHeight) => ((c - elemPos) * viewHeight) / elemHeight + viewPos,
        screenToBoardCoords: (x, y) => {
            let rect = svgElement.getBoundingClientRect();
            return {
                x: handle.sTbCoord(x, rect.left, rect.width, handle.view.x, handle.view.width),
                y: handle.sTbCoord(y, rect.top, rect.height, handle.view.y, handle.view.height),
            };
        },
        addSection: (id) => {
            let section = makeSvgElment(svgElement, "g");
            section.setAttribute("id", id);
            return new SvgElementContainer(section, handle);
        },
        drag: {
            realPos: { x: 0, y: 0 },
            pos: { x: 0, y: 0 },
            origin: { x: 0, y: 0 },
            dragging: false,
        },
    };

    handle.setView();

    if (!disableControls) {
        svgElement.addEventListener("wheel", (event) => {
            event.preventDefault();
            // zooming
            let delta = 1 + event.deltaY / 1000;
            let pos = handle.screenToBoardCoords(event.clientX, event.clientY);
            let view = handle.view;
            view.width *= delta;
            view.height *= delta;
            // move origin so that mouse position stays
            view.x = pos.x + (view.x - pos.x) * delta;
            view.y = pos.y + (view.y - pos.y) * delta;
            handle.setView();
        });

        let initialMousePosSetter = (event) => {
            if (event.buttons === 1) {
                let drag = handle.drag;
                // store information for dragging operation
                drag.pos = handle.screenToBoardCoords(event.clientX, event.clientY);
                drag.realPos.x = event.clientX;
                drag.realPos.y = event.clientY;
                drag.origin.x = handle.view.x;
                drag.origin.y = handle.view.y;
                drag.dragging = false;
            }
        };

        svgElement.addEventListener("mousedown", initialMousePosSetter);

        svgElement.addEventListener("mouseover", initialMousePosSetter);

        svgElement.addEventListener("mousemove", (event) => {
            if (event.buttons === 1) {
                let drag = handle.drag;
                // if mouse moved more than delta start dragging
                let mouseDelta =
                    (event.clientX - drag.realPos.x) * (event.clientX - drag.realPos.x) +
                    (event.clientY - drag.realPos.y) * (event.clientY - drag.realPos.y);
                if (drag.dragging || mouseDelta > 100) {
                    drag.dragging = true;

                    // reset origin for point transformation
                    handle.view.x = drag.origin.x;
                    handle.view.y = drag.origin.y;
                    let pos = handle.screenToBoardCoords(event.clientX, event.clientY);

                    // movement from start drag to now
                    let deltaX = drag.pos.x - pos.x;
                    let deltaY = drag.pos.y - pos.y;

                    handle.view.x = drag.origin.x + deltaX;
                    handle.view.y = drag.origin.y + deltaY;
                    handle.setView();
                }
            }
        });
    }
    // disable contextmenu showing
    //svgElement.addEventListener("contextmenu", (event) => event.preventDefault());

    handle.events = new SvgElementContainer(svgElement, handle);

    return handle;
}
class SvgElementContainer {
    constructor(parent, screen) {
        this.screen = screen;
        this.parent = parent;
        this._onclick = null;
        this._onclickEnabled = false;
        this._onenter = null;
        this._onenterEnabled = false;
        this._onhover = null;
        this._onhoverEnabled = false;
        this._onleave = null;
        this._onleaveEnabled = false;
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
        this.parent.setAttribute("x", x);
        this.parent.setAttribute("y", y);
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    // adds a svg use
    addElement(x, y, href) {
        if (href[0] !== "#") console.warn("TagPrefix missing:", href);
        let child = makeSvgElment(this.parent, "use");
        child.setAttribute("href", href);
        let wrappedChild = new SvgElementContainer(child, this.screen);
        wrappedChild.setPos(x, y);
        return wrappedChild;
    }

    addTag(tag) {
        let child = makeSvgElment(this.parent, tag);
        return new SvgElementContainer(child, this.screen);
    }

    // adds a svg group
    addSection() {
        return this.addTag("g");
    }

    // animates using animateMotion
    animate(path, duration, completedCallback) {
        let animateMotion = makeSvgElment(this.parent, "animateMotion");
        animateMotion.setAttribute("path", path);
        animateMotion.setAttribute("dur", duration);
        animateMotion.beginElement();
        setTimeout(() => {
            animateMotion.remove();
            completedCallback(this);
        }, duration * 1000);
    }

    //animates a given absolute path and sets position
    animatePos(pathNodes, x, y, duration, completedCallback) {
        this.setPos(x, y);
        let path = "M";
        pathNodes.forEach(node => path += node.length == 2 ? `${node[0] - x} ${node[1] - y},` : node);
        if(path.endsWith(","))
            path = path.slice(0, path.length - 1);
        this.animate(path, duration, completedCallback);
    }

    setClickListener(handler) {
        if (!this._onclickEnabled) {
            this.parent.addEventListener("click", (event) => {
                if (!this.screen.drag.dragging && this._onclick) {
                    let pos = this.screen.screenToBoardCoords(event.clientX, event.clientY);
                    this._onclick(this, "left", pos.x, pos.y);
                }
            });
            this.parent.addEventListener("contextmenu", (event) => {
                if (this._onclick) {
                    let pos = this.screen.screenToBoardCoords(event.clientX, event.clientY);
                    this._onclick(this, "right", pos.x, pos.y);
                }
            });
            this._onclickEnabled = true;
        }
        this._onclick = handler;
    }

    setEnterListener(handler) {
        if (!this._onenterEnabled) {
            this.parent.addEventListener("mouseover", (event) => {
                if (this._onenter) {
                    let pos = this.screen.screenToBoardCoords(event.clientX, event.clientY);
                    this._onenter(this, pos.x, pos.y);
                }
            });
            this._onenterEnabled = true;
        }
        this._onenter = handler;
    }

    setHoverListener(handler) {
        if (!this._onhoverEnabled) {
            this.parent.addEventListener("mousemove", (event) => {
                if (this._onhover) {
                    let pos = this.screen.screenToBoardCoords(event.clientX, event.clientY);
                    this._onhover(this, pos.x, pos.y);
                }
            });
            this._onhoverEnabled = true;
        }
        this._onhover = handler;
    }

    setLeaveListener(handler) {
        if (!this._onleaveEnabled) {
            this.parent.addEventListener("mouseout", () => {
                if (this._onleave) {
                    this._onleave(this);
                }
            });
            this._onleaveEnabled = true;
        }
        this._onleave = handler;
    }

    addProperty(property) {
        this.parent.classList.add(property);
    }

    removeProperty(property) {
        this.parent.classList.remove(property);
    }

    remove() {
        this.parent.remove();
    }

    // clears all children
    clearGroup() {
        this.parent.textContent = "";
    }
}

function animate(animationLayer, x, y, path, duration, href, properties, doneCallback) {
    let animate = makeSvgElment(animationLayer.parent, "animateMotion");
    animate.setAttribute("x", x);
    animate.setAttribute("y", y);
    animate.setAttribute("path", path);
    animate.setAttribute("dur", `${duration}s`);
    let child = makeSvgElment(animate, "use");
    child.setAttribute("href", href);
    child.classList.add(properties);
    setTimeout(() => {
        animate.remove();
        doneCallback();
    }, duration);
}

class Connection {
    constructor(socket, packets) {
        this.socket = socket;
        this.packets = packets;
        socket.addEventListener("message", (message) => this.receive(message));
        socket.addEventListener("open", (event) => this.event("open", event));
        socket.addEventListener("close", (event) => this.event("close", event));
        socket.addEventListener("error", (event) => this.event("error", event));
    }

    event(name, event) {
        if (name in this.packets) {
            this.packets[name](event);
        }
    }

    receive(msg) {
        let data = msg.data;
        let splitPos = data.indexOf(":");
        if (splitPos == -1) throw new Error("Received invalid packet!");
        let packet_name = data.slice(0, splitPos);
        if (!(packet_name in this.packets)) throw new Error(`Received unkown packet "${packet_name}"`);
        let packet = this.packets[packet_name];
        let raw = data.slice(splitPos + 1);
        let content = JSON.parse(raw);
        packet(content);
    }

    send(packet_name, content) {
        if (packet_name.includes(":")) throw new Error(`Packet name "${packet_name}" includes illegal character ":"`);
        this.socket.send(`${packet_name}:${JSON.stringify(content)}`);
    }

    isOpen() {
        return this.socket.readyState <= 1;
    }

    close() {
        this.socket.close();
    }
}