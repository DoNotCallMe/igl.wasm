function getModuleWnd() {
    element = document.querySelector(".emscripten");
    //element = document.getElementById("canvas");
    //console.log(element);
    return element;
}

function wndToScreen(item, wnd){
    if (wnd) {
        var wnd_rectangle = wnd.getBoundingClientRect();
        y = wnd_rectangle.y + wnd_rectangle.height - item.y;
        x = item.x + wnd_rectangle.x;
        return {x: x, y: y, width: item.width, height: item.height};
    }
    return {x: item.x, y: item.y, width: item.width, height: item.height};
}

function onChange(e) {
    console.log("onChange fuction " + e);
}

//Shortcut for addEventListener to optimize the minified JS.
//@param {object} context The context to which the listener is attached.
//@param {string} type Event type.
//@param {(string|function)} selector Event target if delegation is used, event handler if not.
//@param {function} [fn] Event handler if delegation is used.
function addListener(context, type, selector, fn) {
    if (!context)
        return;
    var matches = Element.prototype.matches || Element.prototype.msMatchesSelector;
    // Delegate event to the target of the selector
    if (typeof selector === 'string') {
        context.addEventListener(type, function (event) {
            if (matches.call(event.target, selector)) {
            fn.call(event.target, event);
            }
        });
        // If the selector is not a string then it's a function
        // in which case we need regular event listener
    } else {
        fn = selector;
        context.addEventListener(type, fn);
    }
}

//Shortcut for removeEventListener to optimize the minified JS.
//@param {object} context The context to which the listener is attached.
//@param {string} type Event type.
//@param {(string|function)} selector Event target if delegation is used, event handler if not.
//@param {function} [fn] Event handler if delegation is used.
function removeListener(context, type, selector, fn) {
    if (!context)
        return;
    var matches = Element.prototype.matches || Element.prototype.msMatchesSelector;
    // Delegate event to the target of the selector
    if (typeof selector === 'string') {
        context.removeEventListener(type, function (event) {
            if (matches.call(event.target, selector)) {
            fn.call(event.target, event);
            }
        });
        // If the selector is not a string then it's a function
        // in which case we need regular event listener
    } else {
        fn = selector;
        context.removeEventListener(type, fn);
    }
}



class CWindow 
{
    window_settings = {
        theme: 'light',
        margin: 2,     
    }

    constructor()  {
    }

    render()
    {
        return document.createElement('div');
    }

    add(parent, id)
    {
        this.parent = parent;
        this.id = id;

        var element = this.render();

        element.id = this.id;

        element.classList.add("theme-" + this.window_settings.theme);

        this.parent.appendChild(element);

        this.onAddElement();
    }

    remove()
    {
        this.onRemoveElement();

        this.parent.removeChild(this.getElement());
    }

    onAddElement()
    {
    }

    onRemoveElement()
    {
    }

    getElement()
    {
        return document.getElementById(this.id);
    }

    getParent()
    {
        return this.parent;
    }

    getId()
    {
        return this.parent;
    }

    close(result)
    {
        console.log("Window::close fuction " + result + " - " + this.getElement());
        this.getElement().dispatchEvent(new CustomEvent('window:close', { detail: result }));
    }
}

class CModalDialog extends CWindow 
{
    modal_settings = {
        title: '',
    }

    constructor(window, rectangle, target) {

        super();

        this.window_settings.theme = 'no';

        this.target = target;
        this.targetRectangle = rectangle;
        this.content_window = window;
    }

    render(){

        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        {
            this.dialog = super.render();
            this.dialog.className = 'modal-window';

            {
                var titlebar = document.createElement('div');
                titlebar.className = 'modal-titlebar';
    
                {
                    var title = document.createElement('span');
                    title.className = 'modal-title';
                    title.textContent = this.modal_settings.title;
                    titlebar.appendChild(title);

                    this.close_button = document.createElement('button');
                    this.close_button.className = 'button-close';

                    /*{
                        var image = document.createElement('img');
                        image.className = 'button-close-image';
                        image.src = "images/close_icon.svg";
                        button.appendChild(image);
                    }*/
                    titlebar.appendChild(this.close_button);
                }

                this.dialog.appendChild(titlebar);
            }

            {
                this.content = document.createElement('div');
                this.content.className = 'modal-content';
                this.dialog.appendChild(this.content);
            }

            overlay.appendChild(this.dialog);
        }

        return overlay;
    }

    onAddElement()
    {
        super.onAddElement();
        this.content_window.add(this.content, 'color-picker')
        //this.updatePositionRoutine();

        this.onDocumentKeyDown = this.onDocumentKeyDown.bind(this);
        this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this);
        this.close = this.close.bind(this);

        addListener(document, 'keydown', this.onDocumentKeyDown);
        addListener(this.content_window.getElement(), 'window:close', this.close);
        addListener(document, 'mousedown', this.onDocumentMouseDown);
        addListener(this.close_button, 'click', this.close);
    }

    onRemoveElement()
    {
        super.onRemoveElement();
        this.content_window.remove();

        removeListener(document, 'keydown', this.onDocumentKeyDown);
        removeListener(this.content_window.getElement(), 'window:close', this.close);
        removeListener(document, 'mousedown', this.onDocumentMouseDown);
        removeListener(this.close_button, 'click', this.close);
    }


    updatePositionRoutine()
    {
        console.log("updatePositionRoutine fuction");
        
        var target = this.target;
        var rectangle = wndToScreen(this.targetRectangle, target);
        var scrollY = window.scrollY;

        var dialog = this.dialog;

        var dialogWidth = dialog.offsetWidth;
        var dialogHeight = dialog.offsetHeight;
        var reposition = { left: false, top: false };
        var parentStyle, parentMarginTop, parentBorderTop;
        //var offset = { x: 0, y: 0 };

        if (target)
        {
            parentStyle = window.getComputedStyle(target); 
            parentMarginTop = parseFloat(parentStyle.marginTop);
            parentBorderTop = parseFloat(parentStyle.borderTopWidth);
        }

       
        var left = rectangle.x;
        var top = scrollY + rectangle.y + rectangle.height + this.window_settings.margin;

        // If the color picker is inside a custom container
        // set the position relative to it
        if (target)
        {
            //left -= offset.x;
            //top -= offset.y;

            if (left + dialogWidth > target.clientWidth)
            {
                left += rectangle.width - dialogWidth;
                reposition.left = true;
            }

            if (top + dialogHeight > target.clientHeight - parentMarginTop)
            {
                top -= rectangle.height + dialogHeight + this.window_settings.margin * 2;
                reposition.top = true;
            }

            top += target.scrollTop;

            // Otherwise set the position relative to the whole document
        }
        else
        {
            if (left + dialogWidth > document.documentElement.clientWidth)
            {
                left += rectangle.width - dialogWidth;
                reposition.left = true;
            }

            if (top + dialogHeight - scrollY > document.documentElement.clientHeight)
            {
                top = scrollY + rectangle.y - dialogHeight - this.window_settings.margin;
                reposition.top = true;
            }
        }

        this.getElement().style.left = left + "px";
        this.getElement().style.top = top + "px";
    }

    onDocumentKeyDown(e) {
        console.log("Modal::onDocumentKeyDown fuction");

        if (e.key === 'Escape') {
            this.close({reason: "escape"});
        }
    }

    onDocumentMouseDown(e) {
        console.log("Modal::onDocumentMouseDown fuction");

        const rectangle = this.dialog.getBoundingClientRect();
        var x = e.pageX + window.scrollX;
        var y = e.pageY + window.scrollY;

        if (x < rectangle.left || x > rectangle.right || y < rectangle.top || y > rectangle.bottom){
            this.close({reason: "mouseClickOutside"});
        }        
    }
}