function getModuleWnd() {
    element = document.getElementById('SAGE_mainCanvas');
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
				this.close_button.textContent = '\u00D7'; // Unicode for multiplication sign (×)

                titlebar.appendChild(this.close_button);
            }

            this.dialog.appendChild(titlebar);
        }

        {
            this.content = document.createElement('div');
            this.content.className = 'modal-content';
            this.dialog.appendChild(this.content);
        }

        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
		overlay.appendChild(this.dialog);
        

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

		addListener(document, 'contextmenu', this.onContextMenu);
        addListener(document, 'keydown', this.onDocumentKeyDown);
        addListener(this.content_window.getElement(), 'window:close', this.close);
        addListener(document, 'mousedown', this.onDocumentMouseDown);
        addListener(this.close_button, 'click', this.close);
		
		if (isModuleInitialized) {
			Module._MakeDeaf(1);
		}
    }

    onRemoveElement()
    {
        super.onRemoveElement();
        this.content_window.remove();

		removeListener(document, 'contextmenu', this.onContextMenu);
        removeListener(document, 'keydown', this.onDocumentKeyDown);
        removeListener(this.content_window.getElement(), 'window:close', this.close);
        removeListener(document, 'mousedown', this.onDocumentMouseDown);
        removeListener(this.close_button, 'click', this.close);
		
		if (isModuleInitialized) {
			Module._MakeDeaf(0);
		}
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
	
	onContextMenu(e) {
        e.preventDefault();
		e.stopPropagation();
	}
} 
//Convert HSVA to RGBA.
//@param {object} hsva Hue, saturation, value and alpha values.
//@return {object} Red, green, blue and alpha values.
function HSVAtoRGBA(hsva) {
  var saturation = hsva.s / 100;
  var value = hsva.v / 100;
  var chroma = saturation * value;
  var hueBy60 = hsva.h / 60;
  var x = chroma * (1 - Math.abs(hueBy60 % 2 - 1));
  var m = value - chroma;
  chroma = chroma + m;
  x = x + m;
  var index = Math.floor(hueBy60) % 6;
  var red = [chroma, x, m, m, x, chroma][index];
  var green = [x, chroma, chroma, x, m, m][index];
  var blue = [m, m, x, chroma, chroma, x][index];
  return {
  r: Math.round(red * 255),
  g: Math.round(green * 255),
  b: Math.round(blue * 255),
  a: hsva.a };
}
//Convert HSVA to HSLA.
//@param {object} hsva Hue, saturation, value and alpha values.
// @return {object} Hue, saturation, lightness and alpha values.
function HSVAtoHSLA(hsva) {
  var value = hsva.v / 100;
  var lightness = value * (1 - hsva.s / 100 / 2);
  var saturation;
  if (lightness > 0 && lightness < 1) {
  saturation = Math.round((value - lightness) / Math.min(lightness, 1 - lightness) * 100);
  }
  return {
  h: hsva.h,
  s: saturation || 0,
  l: Math.round(lightness * 100),
  a: hsva.a };
}
//Convert RGBA to HSVA.
//@param {object} rgba Red, green, blue and alpha values.
//@return {object} Hue, saturation, value and alpha values.
function RGBAtoHSVA(rgba) {
  var red = rgba.r / 255;
  var green = rgba.g / 255;
  var blue = rgba.b / 255;
  var xmax = Math.max(red, green, blue);
  var xmin = Math.min(red, green, blue);
  var chroma = xmax - xmin;
  var value = xmax;
  var hue = 0;
  var saturation = 0;
  if (chroma) {
  if (xmax === red) {hue = (green - blue) / chroma;}
  if (xmax === green) {hue = 2 + (blue - red) / chroma;}
  if (xmax === blue) {hue = 4 + (red - green) / chroma;}
  if (xmax) {saturation = chroma / xmax;}
  }
  hue = Math.floor(hue * 60);
  return {
  h: hue < 0 ? hue + 360 : hue,
  s: Math.round(saturation * 100),
  v: Math.round(value * 100),
  a: rgba.a };
}
function hexToRGBA(hex) {
  var r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
      a = parseInt(hex.slice(7, 9), 16);
  if (a){
      return [r, g , b, a / 255.];
  }
  
  return [r, g , b];
}
//Parse a string to RGBA.
//@param {string} str String representing a color.
//@return {object} Red, green, blue and alpha values.
function strToRGBA(str) {

  let colors = ["r", "g", "b", "a"]

  let colorArr = [];
  if (str.indexOf("#") == 0){
      colorArr = hexToRGBA(str);        
  }
  else {
      colorArr = str.slice(
          str.indexOf("(") + 1, 
          str.indexOf(")")
      ).split(",");    
  }

  let obj = new Object();
  obj["a"] = 1.;
  colorArr.forEach((k, i) => {
          obj[colors[i]] = parseInt(k);
  });
  return obj;
}

/*
//Parse a string to RGBA.
//@param {string} str String representing a color.
//@return {object} Red, green, blue and alpha values.
function strToRGBA(str) {
  var regex = /^((rgba)|rgb)[\D]+([\d.]+)[\D]+([\d.]+)[\D]+([\d.]+)[\D]*?([\d.]+|$)/i;
  var match, rgba;

  // Default to black for invalid color strings
  ctx.fillStyle = '#000';

  // Use canvas to convert the string to a valid color string
  ctx.fillStyle = str;
  match = regex.exec(ctx.fillStyle);

  if (match) {
    rgba = {
      r: match[3] * 1,
      g: match[4] * 1,
      b: match[5] * 1,
      a: match[6] * 1 };


    // Workaround to mitigate a Chromium bug where the alpha value is rounded incorrectly
    rgba.a = +rgba.a.toFixed(2);

  } else {
    match = ctx.fillStyle.replace('#', '').match(/.{2}/g).map(function (h) {return parseInt(h, 16);});
    rgba = {
      r: match[0],
      g: match[1],
      b: match[2],
      a: 1 };

  }

  return rgba;
}
*/


//Guess the color format from a string.
//@param {string} str String representing a color.
//@return {string} The color format.
function getColorFormatFromStr(str)
{
  var format = str.substring(0, 3).toLowerCase();
  if (format === 'rgb' || format === 'hsl')
  {
      return format;
  }
  return 'hex';
}


class CColorPicker extends CWindow 
{

    // Default settings
    settings = {
        el: '[data-coloris]',
        wrap: true,
        format: 'rgb',
        formatToggle: false,
        swatches: [ '#264653',
                    '#2a9d8f',
                    '#e9c46a',
                    '#f4a261',
                    '#e76f51',
                    '#d62828',
                    '#023e8a',
                    '#0077b6',
                    '#0096c7',
                    '#00b4d8',
                    '#48cae4'],
        swatchesOnly: false,
        alpha: false,
        forceAlpha: false,
        focusInput: true,
        selectInput: false,
        autoClose: false,
        inline: false,
        cancelButton: 
        {
            show: false,
            label: 'Cancel' 
        },

        applyButton: 
        {
            show: true,
            label: 'OK' 
        },

        a11y: 
        {
            close: 'Close color picker',
            marker: 'Saturation: {s}. Brightness: {v}.',
            hueSlider: 'Hue slider',
            alphaSlider: 'Opacity slider',
            input: 'Color value field',
            swatch: 'Color swatch',
            instruction: 'Saturation and brightness selector. Use up, down, left and right arrow keys to select.' 
        } 
    };

    constructor(modifierId, color) {

        super();

        this.modifierId = modifierId;
        this.newColor = color;
        this.color = color;
        this.currentFormat = getColorFormatFromStr(this.color);
    }

    onAddElement()
    {
        super.onAddElement();

        // Reference the UI elements
        this.picker = this.getElement();
        this.colorArea = document.getElementById('color-area');
        this.colorMarker = document.getElementById('color-marker');
        this.clearButton = document.getElementById('color-clear');
        this.applyButton = document.getElementById('color-apply');
        this.colorPreview = document.getElementById('color-preview');
        this.colorValue = document.getElementById('color-input');
        this.hueSlider = document.getElementById('color-hue-slider');
        this.hueMarker = document.getElementById('color-hue-marker');
        this.alphaSlider = document.getElementById('color-alpha-slider');
        this.alphaMarker = document.getElementById('color-alpha-marker');

      
        //update color
        this.setColorFromStr(this.color);
        this.pickColor();

        if (this.settings.focusInput || this.settings.selectInput)
        {
            this.colorValue.focus({ preventScroll: true });
        }

        if (this.settings.selectInput)
        {
            this.colorValue.select();
        }

        //this.onChangePosition = this.onChangePosition.bind(this);
        this.onColorAreaMouseDown = this.onColorAreaMouseDown.bind(this);
        this.onColorAreaTouchStart = this.onColorAreaTouchStart.bind(this);
        this.onColorMarkerMouseDown = this.onColorMarkerMouseDown.bind(this);
        this.onColorMarkerTouchStart = this.onColorMarkerTouchStart.bind(this);
        this.onCancelButtonClick = this.onCancelButtonClick.bind(this);
        this.onApplyButtonClick = this.onApplyButtonClick.bind(this);
        this.onPickerClick = this.onPickerClick.bind(this);
        this.onDocumentMouseUp = this.onDocumentMouseUp.bind(this);
        this.onDocumentTouchEnd = this.onDocumentTouchEnd.bind(this);
        this.onDocumentKeyDown = this.onDocumentKeyDown.bind(this);
        this.onDocumentClickButton = this.onDocumentClickButton.bind(this);
        this.onMoveMarker = this.onMoveMarker.bind(this);
        this.setHue = this.setHue.bind(this);
        this.setAlpha = this.setAlpha.bind(this);
        this.setColor = this.setColor.bind(this);
        this.onDocumentInput = this.onDocumentInput.bind(this);

        addListener(this.colorArea, 'mousedown', this.onColorAreaMouseDown);
        addListener(this.colorArea, 'touchstart', this.onColorAreaTouchStart);
        addListener(this.colorMarker, 'mousedown', this.onColorMarkerMouseDown);
        addListener(this.colorMarker, 'touchstart', this.onColorMarkerTouchStart);
        addListener(this.clearButton, 'click', this.onCancelButtonClick);
        addListener(this.applyButton, 'click', this.onApplyButtonClick);
        addListener(this.picker, 'click', '.color-swatches button', this.onPickerClick);
        addListener(document, 'mouseup', this.onDocumentMouseUp);
        addListener(document, 'touchend', this.onDocumentTouchEnd);
        addListener(document, 'keydown', this.onDocumentKeyDown);
        addListener(document, 'click', '.color-field button', this.onDocumentClickButton);
        addListener(this.colorArea, 'click', this.onMoveMarker);
        addListener(this.hueSlider, 'input', this.setHue);
        addListener(this.alphaSlider, 'input', this.setAlpha);
        addListener(this.colorValue, 'input', this.setColor);
    }

    onRemoveElement(){

        super.onRemoveElement();

        removeListener(this.colorArea, 'mousedown', this.onColorAreaMouseDown);
        removeListener(this.colorArea, 'touchstart', this.onColorAreaTouchStart);
        removeListener(this.colorMarker, 'mousedown', this.onColorMarkerMouseDown);
        removeListener(this.colorMarker, 'touchstart', this.onColorMarkerTouchStart);
        removeListener(this.clearButton, 'click', this.onCancelButtonClick);
        removeListener(this.applyButton, 'click', this.onApplyButtonClick);
        removeListener(this.picker, 'click', '.color-swatches button', this.onPickerClick);
        removeListener(document, 'mouseup', this.onDocumentMouseUp);
        removeListener(document, 'touchend', this.onDocumentTouchEnd);
        removeListener(document, 'keydown', this.onDocumentKeyDown);
        removeListener(document, 'click', '.color-field button', this.onDocumentClickButton);
        removeListener(this.colorArea, 'click', this.onMoveMarker);
        removeListener(this.hueSlider, 'input', this.setHue);
        removeListener(this.alphaSlider, 'input', this.setAlpha);
        removeListener(this.colorValue, 'input', this.setColor);
    }

    render()
    {
        //picker
        var picker = super.render();
        picker.className = 'color-picker';
        //parent.appendChild(picker);

        
        {//colorArea
            var div = document.createElement('div');
            div.id = 'color-area';
            div.ariaLabel = this.settings.a11y.instruction;
            div.className = 'color-gradient';            

            {
                //colorMarker
                var marker = document.createElement('div');
                marker.id = 'color-marker';
                marker.tabIndex = 0;
                marker.className = 'color-marker';
                div.appendChild(marker);
            }

            picker.appendChild(div);
        }

        {//hue
            var div = document.createElement('div');
            div.className = 'color-hue';
           
            {
                //hueSlider
                var slider = document.createElement('input');
                slider.id = 'color-hue-slider';
                slider.type = 'range';
                slider.min = 0;
                slider.max = 360;
                slider.step = 1;
                slider.ariaLabel = this.settings.a11y.hueSlider;
                div.appendChild(slider);

                //hueMarker
                var marker = document.createElement('div');
                marker.id = 'color-hue-marker';
                div.appendChild(marker);
            }

            picker.appendChild(div);
        }

        if (this.settings.alpha)
        {//alpha
            var div = document.createElement('div');
            div.className = 'color-alpha';

            {
                //alphaSlider
                var slider = document.createElement('input');
                slider.id = 'color-alpha-slider';
                slider.type = 'range';
                slider.min = 0;
                slider.max = 100;
                slider.step = 1;
                slider.ariaLabel = this.settings.a11y.alphaSlider;
                div.appendChild(slider);

                //alphaMarker
                var marker = document.createElement('div');
                marker.id = 'color-alpha-marker';
                div.appendChild(marker);

                var alpha_span = document.createElement('span');
                div.appendChild(alpha_span);
            }

            picker.appendChild(div);
        }

        {
            var div = document.createElement('div');
            div.className = 'color-preview-row';

            {//colorPreview
                var button = document.createElement('button');
                button.id = 'color-preview';
                button.type = 'button';
                button.ariaLabel = this.settings.a11y.close;
                button.className = 'color-preview';
                button.innerText =  this.settings.a11y.close;
                div.appendChild(button);
            }

            {//colorValue
                var input = document.createElement('input');
                input.id = 'color-input';
                input.spellcheck = false;
                input.ariaLabel = this.settings.a11y.input;
                input.className = 'color-input';
                input.value = this.color;
                div.appendChild(input);
            }           

            picker.appendChild(div);
        }

        if (this.settings.swatches.length > 0)
        {
            var div = document.createElement('div');
            div.className = 'color-swatches';

            this.settings.swatches.forEach(function (swatch, i) {

                var button = document.createElement('button');
                button.id = 'color-swatch-' + i;
                button.setAttribute('style', 'color: ' + swatch);
                button.innerText = swatch;
                button.className = 'color-swatch';
                div.appendChild(button);
            });
  
            picker.appendChild(div);
        }

        if (this.settings.cancelButton.show || this.settings.applyButton.show)
        {
            var div = document.createElement('div');
            div.className = 'color-button-row';

            if (this.settings.cancelButton.show)
            {//cancelButton
                var button = document.createElement('button');
                button.id = 'color-clear';
                button.type = 'button';
                button.className = 'color-clear';
                button.innerText =  this.settings.cancelButton.label;
                div.appendChild(button);
            }

            if (this.settings.applyButton.show)
            {//applyButton
                var button = document.createElement('button');
                button.id = 'color-apply';
                button.type = 'button';
                button.className = 'color-apply';
                button.innerText =  this.settings.applyButton.label;
                div.appendChild(button);
            }

            picker.appendChild(div);
        } 
        
        return picker;
    }

    onDocumentClickButton(e) {
        console.log("onDocumentClickButton fuction");
        e.target.nextElementSibling.dispatchEvent(new Event('click', { bubbles: true }));
    }

    onDocumentTouchEnd() {
        console.log("onDocumentTouchEnd fuction");
        document.removeEventListener('touchmove', this.onMoveMarker);
    }

    onDocumentMouseUp () {
        console.log("onDocumentMouseUp fuction");
        document.removeEventListener('mousemove', this.onMoveMarker);
    }

    onPickerClick (e) {
        console.log("onPickerClick fuction");
        this.setColorFromStr(e.target.textContent);
        this.pickColor();

        if (this.settings.autoClose) {
            this.close({result: 'pickerClick'});
        }
    }

    onCancelButtonClick() {
        console.log("onCancelButtonClick fuction");
        this.close({result: 'cancel'});
    }

    onApplyButtonClick() {
        console.log("onApplyButtonClick fuction");
        this.newColor = this.color;
        this.pickColor(this.color);
        this.close({result: 'apply'});
    }

    onColorAreaTouchStart() {
        console.log("onColorAreaTouchStart fuction");
        document.addEventListener('touchmove', this.onMoveMarker, { passive: false });
    };

    onColorMarkerMouseDown() {
        console.log("onColorMarkerMouseDown fuction");
        addListener(document, 'mousemove', this.onMoveMarker);
    };

    onColorMarkerTouchStart() {
        console.log("onColorMarkerTouchStart fuction");
        document.addEventListener('touchmove', this.onMoveMarker, { passive: false });
    };

    onColorAreaMouseDown(){
        console.log("onColorAreaMouseDown fuction");
        addListener(document, 'mousemove', this.onMoveMarker);
    };

    onDocumentKeyDown(e) {
        console.log("onDocumentKeyDown fuction");

        if (e.key === 'Escape') {
            this.close({result: "Escape"});
        }
    }

    onDocumentInput(e){
        var parent = e.target.parentNode;
    
        // Only update the preview if the field has been previously wrapped
        if (parent.classList.contains('color-field')) {
            parent.style.color = e.target.value;
        }
    }



    //Wrap the linked input fields in a div that adds a color preview.
    //selector One or more selectors pointing to input fields.
    /*(selector)
    {
        document.querySelectorAll(selector).forEach(function (field)
        {
            var parentNode = field.parentNode;

            if (!parentNode.classList.contains('color-field'))
            {
                var wrapper = document.createElement('div');

                wrapper.innerHTML = "<button type=\"button\" aria-labelledby=\"color-open-label\"></button>";
                parentNode.insertBefore(wrapper, field);
                wrapper.setAttribute('class', 'color-field');
                wrapper.style.color = field.value;
                wrapper.appendChild(field);
            }
        });
    }

    //Bind the color picker to input fields that match the selector.
    //@param {string} selector One or more selectors pointing to input fields.
    /*bindFields(selector) {
        // Show the color picker on click on the input fields that match the selector
        addListener(document, 'click', selector, function (event) {
        // Skip if inline mode is in use
        if (settings.inline) {
            return;
        }

        currentEl = event.target;
        oldColor = this.color;
        
        //currentEl.value;
        this.currentFormat = getColorFormatFromStr(oldColor);
        this.picker.classList.add('color-open');

        updatePickerPosition();
        setColorFromStr(oldColor);

        if (this.settings.focusInput || this.settings.selectInput) {
            this.colorValue.focus({ preventScroll: true });
        }

        if (this.settings.selectInput) {
            this.colorValue.select();
        }

        // Trigger an "open" event
        currentEl.dispatchEvent(new Event('open', { bubbles: true }));
        });

        // Update the color preview of the input fields that match the selector
        addListener(document, 'input', selector, this.onDocumentInput);
    }
/*
    //Configure the color picker.
    //@param {object} options Configuration options.
    configure(options) {
        if (typeof options !== 'object') {
        return;
        }

        for (var key in options) {
        switch (key) {
            case 'el':
            bindFields(options.el);
            if (options.wrap !== false) {
                wrapFields(options.el);
            }
            break;
            case 'parent':
            settings.parent = document.querySelector(options.parent);
            if (settings.parent) {
                settings.parent.appendChild(picker);
            }
            break;
            case 'themeMode':
            settings.themeMode = options.themeMode;
            if (options.themeMode === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                settings.themeMode = 'dark';
            }
            // The lack of a break statement is intentional
            case 'theme':
            if (options.theme) {
                settings.theme = options.theme;
            }

            // Set the theme and color scheme
            picker.className = "color-picker color-" + settings.theme + " color-" + settings.themeMode;

            // Update the color picker's position if inline mode is in use
            if (settings.inline) {
                updatePickerPosition();
            }
            break;
            case 'margin':
            options.margin *= 1;
            window_settings.margin = !isNaN(options.margin) ? options.margin : window_settings.margin;
            break;
            case 'wrap':
            if (options.el && options.wrap) {
                wrapFields(options.el);
            }
            break;
            case 'formatToggle':
            getEl('color-format').style.display = options.formatToggle ? 'block' : 'none';
            if (options.formatToggle) {
                settings.format = 'auto';
            }
            break;
            case 'swatches':
            if (Array.isArray(options.swatches)) {(function () {
                var swatches = [];

                options.swatches.forEach(function (swatch, i) {
                    swatches.push("<button type=\"button\" id=\"color-swatch-" + i + "\" aria-labelledby=\"color-swatch-label color-swatch-" + i + "\" style=\"color: " + swatch + ";\">" + swatch + "</button>");
                });

                getEl('color-swatches').innerHTML = swatches.length ? "<div>" + swatches.join('') + "</div>" : '';})();
            }
            break;
            case 'swatchesOnly':
            settings.swatchesOnly = !!options.swatchesOnly;
            picker.setAttribute('data-minimal', settings.swatchesOnly);

            if (settings.swatchesOnly) {
                settings.autoClose = true;
            }
            break;
            case 'alpha':
            settings.alpha = !!options.alpha;
            picker.setAttribute('data-alpha', settings.alpha);
            break;
            case 'inline':
            settings.inline = !!options.inline;
            picker.setAttribute('data-inline', settings.inline);

            if (settings.inline) {
                var defaultColor = options.defaultColor || settings.defaultColor;

                currentFormat = getColorFormatFromStr(defaultColor);
                updatePickerPosition();
                setColorFromStr(defaultColor);
            }
            break;
            case 'cancelButton':
            var display = 'none';

            if (options.cancelButton.show) {
                display = 'block';
            }

            if (options.cancelButton.label) {
                cancelButton.innerHTML = options.cancelButton.label;
            }

            cancelButton.style.display = display;
            break;
            case 'a11y':
            var labels = options.a11y;
            var update = false;

            if (typeof labels === 'object') {
                for (var label in labels) {
                if (labels[label] && settings.a11y[label]) {
                    this.settings.a11y[label] = labels[label];
                    update = true;
                }
                }
            }

            if (update) {
                var openLabel = getEl('color-open-label');
                var swatchLabel = getEl('color-swatch-label');

                openLabel.innerHTML = settings.a11y.open;
                swatchLabel.innerHTML = settings.a11y.swatch;

                this.colorPreview.setAttribute('aria-label', settings.a11y.close);
                this.hueSlider.setAttribute('aria-label', settings.a11y.hueSlider);
                this.alphaSlider.setAttribute('aria-label', settings.a11y.alphaSlider);
                this.colorValue.setAttribute('aria-label', settings.a11y.input);
                this.colorArea.setAttribute('aria-label', settings.a11y.instruction);
            }
            default:
            this.settings[key] = options[key];
        }
    }
*/
    //Convert RGBA to Hex.
    //@param {object} rgba Red, green, blue and alpha values.
    //@return {string} Hex color string.
    RGBAToHex(rgba) {
        var R = rgba.r.toString(16);
        var G = rgba.g.toString(16);
        var B = rgba.b.toString(16);
        var A = '';

        if (rgba.r < 16) {
            R = '0' + R;
        }

        if (rgba.g < 16) {
            G = '0' + G;
        }

        if (rgba.b < 16) {
            B = '0' + B;
        }

        if (this.settings.alpha && (rgba.a < 1 || this.settings.forceAlpha)) {
            var alpha = rgba.a * 255 | 0;
            A = alpha.toString(16);

            if (alpha < 16) {
                A = '0' + A;
            }
        }

        return '#' + R + G + B + A;
    }

    //Convert RGBA values to a CSS rgb/rgba string.
    //@param {object} rgba Red, green, blue and alpha values.
    //@return {string} CSS color string.
    RGBAToStr(rgba) {
        if (!this.settings.alpha || rgba.a === 1 && !this.settings.forceAlpha) {
            return "rgb(" + rgba.r + "," + rgba.g + "," + rgba.b + ")";
        }

        return "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + ", " + rgba.a + ")";
    }

    // Convert HSLA values to a CSS hsl/hsla string.
    // @param {object} hsla Hue, saturation, lightness and alpha values.
    // @return {string} CSS color string.
    HSLAToStr(hsla) {
        if (!this.settings.alpha || hsla.a === 1 && !this.settings.forceAlpha) {
            return "hsl(" + hsla.h + "," + hsla.s + "%," + hsla.l + "%)";
        }

        return "hsla(" + hsla.h + "," + hsla.s + "%," + hsla.l + "%," + hsla.a + ")";
    }

    //Update the color marker's accessibility label.
    //@param {number} saturation
    //@param {number} value
    updateMarkerA11yLabel(saturation, value) {
        console.log("updateMarkerA11yLabel fuction");
        
        var label = this.settings.a11y.marker;

        saturation = saturation.toFixed(1) * 1;
        value = value.toFixed(1) * 1;
        label = label.replace('{s}', saturation);
        label = label.replace('{v}', value);
        this.colorMarker.ariaLabel = label;
    }

    updateColor(rgba, hsva)
    {
        console.log("updateColor fuction");

        var currentColor = { r: 0, g: 0, b: 0, h: 0, s: 0, v: 0, a: 1 };

        if (rgba === void 0) { rgba = {}; } if (hsva === void 0) { hsva = {}; }
        var format = this.settings.format;

        for (var key in rgba) {
          currentColor[key] = rgba[key];
        }

        for (var _key in hsva) {
          currentColor[_key] = hsva[_key];
        }

        var hexValue = this.RGBAToHex(currentColor);
        var opaqueHex = hexValue.substring(0, 7);

        this.colorMarker.style.color = opaqueHex;
        if (this.alphaMarker){
            this.alphaMarker.parentNode.style.color = opaqueHex;
            this.alphaMarker.style.color = hexValue;
        }
        this.colorPreview.style.color = hexValue;

        // Force repaint the color and alpha gradients as a workaround for a Google Chrome bug
        this.colorArea.style.display = 'none';
        this.colorArea.offsetHeight;
        this.colorArea.style.display = '';

        if (this.alphaMarker){
            this.alphaMarker.nextElementSibling.style.display = 'none';
            this.alphaMarker.nextElementSibling.offsetHeight;
            this.alphaMarker.nextElementSibling.style.display = '';
        }

        if (format === 'mixed') {
          format = currentColor.a === 1 ? 'hex' : 'rgb';
        } else if (format === 'auto') {
          format = this.currentFormat;
        }

        switch (format) {
          case 'hex':
            this.colorValue.value = hexValue;
            break;
          case 'rgb':
            this.colorValue.value = this.RGBAToStr(currentColor);
            break;
          case 'hsl':
            this.colorValue.value = this.HSLAToStr(HSVAtoHSLA(currentColor));
            break;}
    
    }

    //Set the hue when its slider is moved.
    setHue() {
        console.log("setHue fuction");

        var hue = this.hueSlider.value * 1;
        var x = this.colorMarker.style.left.replace('px', '') * 1;
        var y = this.colorMarker.style.top.replace('px', '') * 1;

        this.picker.style.color = "hsl(" + hue + ", 100%, 50%)";
        this.hueMarker.style.left = hue / 360 * 100 + "%";

        this.setColorAtPosition(x, y);
    }

    //Set the alpha when its slider is moved.
    setAlpha() {
        console.log("setAlpha fuction");

        var alpha = this.alphaSlider.value / 100;

        this.alphaMarker.style.left = alpha * 100 + "%";
        this.updateColor({ a: alpha });
        this.pickColor();
    }

    //enter color text
    setColor(e) {
        this.setColorFromStr(e.target.value);
        this.pickColor();
    }

    //Set the active color from a string.
    setColorFromStr(str)
    {
        console.log("setColorFromStr fuction");

        var rgba = strToRGBA(str);
        var hsva = RGBAtoHSVA(rgba);

        this.updateMarkerA11yLabel(hsva.s, hsva.v);
        this.updateColor(rgba, hsva);

        // Update the UI
        this.hueSlider.value = hsva.h;
        this.picker.style.color = "hsl(" + hsva.h + ", 100%, 50%)";
        this.hueMarker.style.left = hsva.h / 360 * 100 + "%";

        this.colorMarker.style.left = this.colorArea.offsetWidth * hsva.s / 100 + "px";
        this.colorMarker.style.top = this.colorArea.offsetHeight * (1 - hsva.v / 100) + "px";

        if (this.alphaSlider){
            this.alphaSlider.value = hsva.a * 100;
        }

        if (this.alphaMarker){
            this.alphaMarker.style.left = hsva.a * 100 + "%";
        }
    }

    //Copy the active color to the linked input field.
    //@param {number} [color] Color value to override the active color.
    pickColor(color) {
        console.log("pickColor fuction");
  
        let newColor = color;
        if (!newColor) {
            newColor = this.colorValue.value;
        }

        this.color = newColor;

        /*if (currentEl)
        {
            currentEl.value = newColor;
            currentEl.dispatchEvent(new Event('input', { bubbles: true }));
        }*/

        this.getElement().dispatchEvent(new CustomEvent('color:pick', { detail: { color: newColor } }));
    }

    //Set the active color based on a specific point in the color gradient.
    //@param {number} x Left position.
    //@param {number} y Top position.
    setColorAtPosition(x, y) {
        console.log("setColorAtPosition fuction");
        var hsva = {
        h: this.hueSlider.value * 1,
        s: x / this.colorArea.offsetWidth * 100,
        v: 100 - y / this.colorArea.offsetHeight * 100,
        a: this.alphaSlider ? this.alphaSlider.value / 100 : 1. };

        var rgba = HSVAtoRGBA(hsva);

        this.updateMarkerA11yLabel(hsva.s, hsva.v);
        this.updateColor(rgba, hsva);
        this.pickColor();
    }

    //Get the pageX and pageY positions of the pointer.
    //@param {object} event The MouseEvent or TouchEvent object.
    //@return {object} The pageX and pageY positions.
    getPointerPosition(e) {
        console.log("getPointerPosition fuction");
        return {
        pageX: e.changedTouches ? e.changedTouches[0].pageX : e.pageX,
        pageY: e.changedTouches ? e.changedTouches[0].pageY : e.pageY };

    }

    //Move the color marker when dragged.
    //@param {object} event The MouseEvent object.
    onMoveMarker(e) {
        console.log("onMoveMarker fuction");
        const rectangle = this.colorArea.getBoundingClientRect();
        var x = e.pageX - rectangle.left + window.scrollX;
        var y = e.pageY - rectangle.top + window.scrollY;

        x = x < 0 ? 0 : x > this.colorArea.offsetWidth ? this.colorArea.offsetWidth : x;
        y = y < 0 ? 0 : y > this.colorArea.offsetHeight ? this.colorArea.offsetHeight : y;

        this.colorMarker.style.left = x + "px";
        this.colorMarker.style.top = y + "px";

        this.setColorAtPosition(x, y);

        // Prevent scrolling while dragging the marker
        e.preventDefault();
        e.stopPropagation();
    }
}

COLOR_DIALOG = null;

function onChangeColor(e)
{
    console.log("openColorDialog function " + e.detail.color);
    //Module.ccall('ModifyColor', 'number', ['number', 'string', 'bool'], [COLOR_DIALOG.modifierId, e.detail.color, false]);
}

function openColorDialog(id, rectangle, color)
{
    console.log("openColorDialog function");
    if (!COLOR_DIALOG) {
        COLOR_DIALOG = new CModalDialog(new CColorPicker(id, color), rectangle, getModuleWnd());
        COLOR_DIALOG.modal_settings.title = 'Set color';
        COLOR_DIALOG.add(document.body, 'color-dialog');

        addListener(COLOR_DIALOG.content_window.getElement(), 'color:pick', onChangeColor);
        addListener(COLOR_DIALOG.getElement(), 'window:close', closeColorDialog)
    }
}

function closeColorDialog()
{
    console.log("closeColorDialog function");

    if (COLOR_DIALOG) {
        removeListener(COLOR_DIALOG.content_window.getElement(), 'color:pick', onChangeColor);
        removeListener(COLOR_DIALOG.getElement(), 'window:close', closeColorDialog);

        COLOR_DIALOG.remove();
        Module.ccall('ModifyColor', 'number', ['number', 'string'], [COLOR_DIALOG.content_window.modifierId, COLOR_DIALOG.content_window.newColor, true]);        
        COLOR_DIALOG = null;
    }
} 
class ContextMenu {
    constructor(container, items, id) {
        this.container = container;
        this.dom = null;
		this.main_dom = null;
        this.shown = false;
        this.root = true;
        this.parent = null;
        this.submenus = [];
        this.items = items;
		this.id = id;

        console.log("JS ContextMenu class was created - " + this.id);

        this._onclick = e => {
            if (this.dom && e.target != this.dom && 
				//this.main_dom && e.target != this.main_dom && 
                e.target.parentElement != this.dom && 
				//e.target.parentElement != this.main_dom && 
                !e.target.classList.contains('item') && 
                !e.target.parentElement.classList.contains('item')) {
                //this.hideAll();
				closeContextMenu();
            }
        };

        this._oncontextmenu = e => {
            e.preventDefault();
			//e.stopPropagation();
	
			if (e.target != this.dom && 
				//e.target != this.main_dom && 
                e.target.parentElement != this.dom && 
				//e.target.parentElement != this.main_dom && 
                !e.target.classList.contains('item') && 
                !e.target.parentElement.classList.contains('item')) {
				//this.hideAll();
				//this.show(e.clientX, e.clientY, true);
				closeContextMenu();
            }
        };
		
		//this._onmousemove = e => {
        //    e.preventDefault();
		//	e.stopPropagation();
        //};

        this._oncontextmenu_keydown = e => {
            if (e.keyCode != 93) return;
            e.preventDefault();

            //this.hideAll();
            //this.show(e.clientX, e.clientY, true);
			closeContextMenu();
        };

        this._onblur = e => {
            //this.hideAll();
			closeContextMenu();
        };
    }

    getMenuDom() {
        const menu = document.createElement('div');
        menu.classList.add('context');

        for (const item of this.items) {
            menu.appendChild(this.itemToDomEl(item));
        }
		
        return menu;
    }

    itemToDomEl(data) {
        const item = document.createElement('div');

        if (data === null) {
            item.classList.add('separator');
            return item;
        }

        if (data.hasOwnProperty('color') && /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(data.color.toString())) {
            item.style.cssText = `color: ${data.color}`;
        }

        item.classList.add('item');


		const item_mark = document.createElement('span');
		item_mark.classList.add('check-mark');
		item_mark.textContent = '\u2713';// Unicode for check mark
  
		if (!data.hasOwnProperty('checked') || !data.checked) {
			item_mark.style.display = 'none';
		}
		item.appendChild(item_mark);

        const label = document.createElement('span');
        label.classList.add('label');
        label.innerText = data.hasOwnProperty('text') ? data.text.toString() : '';
        item.appendChild(label);


		const is_submenu = data.hasOwnProperty('subitems') && Array.isArray(data.subitems) && data.subitems.length > 0

        if (data.hasOwnProperty('disabled') && data.disabled) {
            item.classList.add('disabled');
        } else {
            item.classList.add('enabled');
			
			if (data.hasOwnProperty('default') && data.default) {
				item.classList.add('default');
			}
        }
		
		

        const hotkey = document.createElement('span');
        hotkey.classList.add('hotkey');
        hotkey.innerText = data.hasOwnProperty('hotkey') ? data.hotkey.toString() : '';
        item.appendChild(hotkey);

        if (data.hasOwnProperty('subitems') && Array.isArray(data.subitems) && data.subitems.length > 0) {
            const menu = new ContextMenu(this.container, data.subitems, this.id);
            menu.root = false;
            menu.parent = this;

            const openSubItems = e => {
                if (data.hasOwnProperty('disabled') && data.disabled == true)
                    return;

                this.hideSubMenus();

                const x = this.dom.offsetLeft + this.dom.clientWidth + item.offsetLeft;
                const y = this.dom.offsetTop + item.offsetTop;

                if (!menu.shown) {
                    menu.show(x, y, false);
                } else {
                    menu.hide();
                }
            };

            this.submenus.push(menu);

            //item.classList.add('has-subitems');
            item.addEventListener('click', openSubItems);
            item.addEventListener('mousemove', openSubItems);
			
			const sub_menu_idicator = document.createElement('span');
			sub_menu_idicator.classList.add('has-subitems');
			sub_menu_idicator.innerText = '>';
			item.appendChild(sub_menu_idicator);
		
        } else if (data.hasOwnProperty('submenu') && data.submenu instanceof ContextMenu) {
            const menu = data.submenu;
            menu.root = false;
            menu.parent = this;

            const openSubItems = e => {
                if (data.hasOwnProperty('disabled') && data.disabled == true)
                    return;

                this.hideSubMenus();

                const x = this.dom.offsetLeft + this.dom.clientWidth + item.offsetLeft;
                const y = this.dom.offsetTop + item.offsetTop;

                if (!menu.shown) {
                    menu.show(x, y, false);
                } else {
                    menu.hide();
                }
            };

            this.submenus.push(menu);

            //item.classList.add('has-subitems');
            item.addEventListener('click', openSubItems);
            item.addEventListener('mousemove', openSubItems);
			
			const sub_menu_idicator = document.createElement('span');
			sub_menu_idicator.classList.add('has-subitems');
			sub_menu_idicator.innerText = '>';
			item.appendChild(sub_menu_idicator);
        } else {
            item.addEventListener('click', e => { 
                this.hideSubMenus();

                if (item.classList.contains('disabled'))
                    return;

                if (data.hasOwnProperty('onclick') && typeof data.onclick === 'function') {
                    const event = {
                        handled: false,
                        item: item,
                        label: label,
                        hotkey: hotkey,
                        items: this.items,
                        data: data
                    };
        
                    data.onclick(event);
        
                    if (!event.handled) {
                        this.hide();
                    }
                } else {
					if (data.hasOwnProperty('id')) {			
						Module.ccall('CallMenuCommand', 'number', ['number', 'number'], [this.id, data.id]);
						this.hide();
					} else {
						this.hide();
					}
                }
            });

            item.addEventListener('mousemove', e => {
                this.hideSubMenus();
            });
        }
		
        return item;
    }

    hideAll() {
        if (this.main_dom != this.dom) {
			Module._MakeDeaf(0);
		}
		
		if (this.root && !this.parent) {
            if (this.shown) {
                this.hideSubMenus();

                this.shown = false;
                this.container.removeChild(this.main_dom);

                if (this.parent && this.parent.shown) {
                    this.parent.hide();
                }
            }

            return;
        }

        this.parent.hide();
    }

    hide() {
        if (this.main_dom && this.shown) {
            this.shown = false;
            this.hideSubMenus();
            this.container.removeChild(this.main_dom);

            if (this.parent && this.parent.shown) {
                this.parent.hide();
            }
        }
		
		if (this.main_dom != this.dom && isModuleInitialized) {
			Module._MakeDeaf(0);
		}
    }

    hideSubMenus() {
        for (const menu of this.submenus) {
            if (menu.shown) {
                menu.shown = false;
                menu.container.removeChild(menu.dom);
            }
            menu.hideSubMenus();
        }
    }

    show(x, y, show_overlay) {
        var menu = this.getMenuDom();
        
		menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        	
		this.dom = menu;
		this.main_dom = menu;
			
		if (show_overlay) {
			var overlay = document.createElement('div');
			overlay.className = 'modal-overlay';
			
			overlay.addEventListener('mousedown', e => e.stopPropagation());
			overlay.addEventListener('mouseup', e => e.stopPropagation());
			overlay.addEventListener('mousemove', e => e.stopPropagation());
			overlay.addEventListener('click', e => {
				e.stopPropagation();
				this.hideAll(); // Hide the context menu if the overlay is clicked
			});
			
			overlay.appendChild(this.dom);
			this.main_dom = overlay;
			
			// Disable pointer events on the canvas
			if (isModuleInitialized) {
				Module._MakeDeaf(1);
			}
		}

		this.shown = true;		
		
        this.container.appendChild(this.main_dom);
				
		//update position is context menu is out of visible area
		var margin = 0;
		var menuWidth = menu.offsetWidth;
		var menuHeight = menu.offsetHeight;
		var left = x + margin;
		var top = y + margin;    
		if (left + menuWidth > document.documentElement.clientWidth) {
			left = x - menuWidth - margin ;
		}
		if (left < 0) {
			left = margin;
		}
		if (top + menuHeight > document.documentElement.clientHeight) {
			top = y - menuHeight - margin;
		}
		if (top < 0) {
			top = margin;
		}
		menu.setAttribute('style', 'top:' + top + 'px;' + 'left:' + left + 'px;');		
    }

    install() {
        this.container.addEventListener('contextmenu', this._oncontextmenu);
		//this.container.addEventListener('mousemove', this._onmousemove);
        this.container.addEventListener('keydown', this._oncontextmenu_keydown);
        this.container.addEventListener('click', this._onclick);

        window.addEventListener('blur', this._onblur);
    }

    uninstall() {
        this.dom = null;
		this.main_dom = null;
        this.container.removeEventListener('contextmenu', this._oncontextmenu);
		//this.container.removeEventListener('mousemove', this._onmousemove);
        this.container.removeEventListener('keydown', this._oncontextmenu_keydown);
        this.container.removeEventListener('click', this._onclick);
        window.removeEventListener('blur', this._onblur);
    }
}

var CONTEXT_MENU = null;


function closeContextMenu(){
	if (CONTEXT_MENU) {
		CONTEXT_MENU.hideAll();
		CONTEXT_MENU.uninstall();
		CONTEXT_MENU = null;
	}
}

function openContextMenu(id, xy, jsonData){
    console.log('updateContextMenu');
	console.log(xy);
	console.log(id);
	console.log(jsonData);
	
	if (jsonData != '{}')
	{
		try {
			const menuObject = JSON.parse(jsonData);
            console.log(menuObject);
            console.log("ID" + id);
		
			if (Object.keys(menuObject).length != 0) {
				
				closeContextMenu();
				
				const pixelRatio = window.devicePixelRatio || 1;
				
				CONTEXT_MENU = new ContextMenu(document.body, menuObject, id);
				CONTEXT_MENU.install();
				CONTEXT_MENU.show(xy.x / pixelRatio, xy.y / pixelRatio, true);
			}
		} catch (error) {
			console.error("Invalid JSON string:", error);
		}
	}
}
 
// Flag to track if the mouse button is pressed inside the chart box
let mouseCaptureChartBox = false;
let mouseIsCanvasHandled = false;
let isModuleInitialized = false;

//-------------------------------------------------------------------------------
function createContainerWithCanvas(containerId, canvasId) {
    // Create the container <div>
    var container = document.createElement('div');
    container.id = containerId;

    // Create the canvas element
    var global_canvas = document.createElement('canvas');
    global_canvas.id = canvasId;
    
    // Append the canvas to the container
    container.appendChild(global_canvas);
	
	//var loader = document.createElement('div');
    //loader.id = 'loader';
    //loader.classList.add('hidden');
	
	// Append the loader to the container
    //container.appendChild(loader);

    // Append the container to the document body
	document.body.appendChild(container);
	/*if (document.body.firstChild) {
		document.body.insertBefore(container, document.body.firstChild);
	} else {
		document.body.appendChild(container);
	}*/

    console.log('Container and canvas added successfully.');
}
	
function createTextCanvas(canvasId) {

    // Create the canvas element
    var new_canvas = document.createElement('canvas');
	new_canvas.id = canvasId;

    // Append the container to the document body
	document.body.appendChild(new_canvas);

    console.log('Text canvas added successfully.');
}

function initIdealGraphics() {	

	var script = document.createElement('script');		
	script.src = "sage/sage_wasm.js";
	script.onload = () => {
		console.log('IdealGraphics module loaded');
	};				
	script.onerror = (error) => {
		console.error('Error loading IdealGraphics module:', error);
	};
	document.body.appendChild(script);
}

// Function to handle canvas resize
function handleCanvasResize(entries) {
	updateCanvasHDPI();
}

// Function to handle mouse leave event on chart box
function handleMouseMove(event) {

	// Get all elements with the "SAGE_chart" class	`
	const chartBoxes = document.querySelectorAll('.SAGE_chart');

	// Check if the cursor is inside of any chart box
	let isCursorInsideChartBox = false;

	for (const chartBox of chartBoxes) {
		const rect = chartBox.getBoundingClientRect();
		if (event.clientX >= rect.left && event.clientX <= rect.right &&
			event.clientY >= rect.top && event.clientY <= rect.bottom) {
			isCursorInsideChartBox = true;
			break;
		}
	}

	// Use querySelector to find the first element with the class 'modal-overlay'
	var modalOverlay = document.querySelector('.modal-overlay');
	
	let mouseMustBeHandledByWASM = !modalOverlay && (isCursorInsideChartBox || mouseCaptureChartBox);


	console.log('Test mouse position: ' + mouseMustBeHandledByWASM);

	if (mouseIsCanvasHandled != mouseMustBeHandledByWASM) {
		mouseIsCanvasHandled = mouseMustBeHandledByWASM;


		const global_canvas = getModuleWnd();
		
		if (mouseIsCanvasHandled) {

			console.log('Enter chart window');

			// Set pointer-events to none when mouse enters the chart box
			chartBoxes.forEach(chartBox => {
				chartBox.style.pointerEvents = 'none';
			});
			
			global_canvas.style.pointerEvents = 'auto';
			console.log('Chart-box mouse enter');
			if (isModuleInitialized) {
				Module._MakeDeaf(0);
			}
		}
		else {

			console.log('Leave chart window');

			// Reset pointer-events when mouse leaves the chart box			
			chartBoxes.forEach(chartBox => {
				chartBox.style.pointerEvents = 'auto';
			});

			global_canvas.style.pointerEvents = 'none';
			console.log('Chart-box mouse leave');
			if (isModuleInitialized) {
				Module._MakeDeaf(1);
			}
		}
	}
}

// Function to handle mouse leave event on chart box
function blockDefaultInsideChart(event) {

	// Get all elements with the "SAGE_chart" class	`
	const chartBoxes = document.querySelectorAll('.SAGE_chart');

	// Check if the cursor is inside of any chart box
	let isCursorInsideChartBox = false;

	for (const chartBox of chartBoxes) {
		const rect = chartBox.getBoundingClientRect();
		if (event.clientX >= rect.left && event.clientX <= rect.right &&
			event.clientY >= rect.top && event.clientY <= rect.bottom) {
			isCursorInsideChartBox = true;
			break;
		}
	}

	// Use querySelector to find the first element with the class 'modal-overlay'
	var modalOverlay = document.querySelector('.modal-overlay');
	
	if (modalOverlay || isCursorInsideChartBox) {
		event.preventDefault();		
	}
}
// Function to handle mouse down event on chart box
function handleMouseDown(event) {
	if (event.button === 0) {
		// Left mouse button is pressed inside the chart box
		//mouseCaptureChartBox = true;
		//handleMouseMove(event);
	}
}

// Function to handle mouse up event on chart box
function handleMouseUp(event) {
	if (event.button === 0) {
		// Left mouse button is released
		mouseCaptureChartBox = false;
		handleMouseMove(event);
	}
}

// Function to handle resizing of "SAGE_chart" elements
function handleChartBoxResize(entries) {
	entries.forEach(entry => {
	const target = entry.target;
	const newWidth = target.offsetWidth;
	const newHeight = target.offsetHeight;
	const chartBoxId = target.id; // Get the ID of the resized element
	console.log('Chart-box resized:', chartBoxId, newWidth, newHeight);
			
	//var result = Module.ccall('UpdateChartElement', 'bool', ['string'], [chartBoxId]);
	if (isModuleInitialized) {
		//var result = Module.ccall('UpdateChartElement', 'bool', ['string'], [chartBoxId]);
			const dataPtr = Module._malloc(chartBoxId.length + 1);
			Module.stringToUTF8(chartBoxId, dataPtr, chartBoxId.length + 1);

			// Call the UpdateChartElement function from your WebAssembly module
			const result = Module.ccall('UpdateChartElement', 'number', ['number'], [dataPtr]);
			console.log('UpdateChartElement result:', result);

			// Free the allocated memory
			Module._free(dataPtr);
		}
	});
}
	
let isTextDialogResizing = false;
let prevX = 0;
let prevY = 0;

function createModalHeader() {
    const header = document.createElement('div');
    header.className = 'modal-header';

    const title = document.createElement('span');
    title.className = 'modal-title';
    title.textContent = 'Set Content';

    const closeButton = document.createElement('button');
    closeButton.className = 'close-btn';
    closeButton.setAttribute('onclick', 'closeModal()');

    const closeIcon = document.createElement('img');
    //closeIcon.setAttribute('src', '../images/close_icon.svg');
    closeIcon.setAttribute('alt', 'Close');

    closeButton.appendChild(closeIcon);
    header.appendChild(title);
    header.appendChild(closeButton);

    return header;
}

function createModalBody() {
    const body = document.createElement('div');
    body.className = 'modal-body';

    const textArea = document.createElement('textarea');
    textArea.className = 'text-input';
    textArea.setAttribute('placeholder', 'Type your content here');

    const okButton = document.createElement('button');
    okButton.className = 'ok-btn';
    okButton.textContent = 'Ok';
    okButton.setAttribute('onclick', 'submitContent()');

    body.appendChild(textArea);
    body.appendChild(okButton);

    return body;
}

function createModalContent() {
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content text_dialog_content';
    modalContent.appendChild(createModalHeader());
    modalContent.appendChild(createModalBody());

    return modalContent;
}

function initializeTextDialog() {
    const modal = document.createElement('div');
    modal.id = 'textDialog';
    modal.className = 'modal text_dialog';
    modal.appendChild(createModalContent());

    document.body.appendChild(modal);

	function handleKeyDown(event) {
		const dlg = document.getElementById('textDialog');
		if (dlg.style.display === 'block') {
			const textInput = dlg.querySelector('.text-input');
			textInput.focus();
			console.log('handleKeyDown', event);
			//event.preventDefault();
			//event.stopPropagation();
		}
	}
	//document.addEventListener('keydown', handleKeyDown, true);


	{
		const dlg = document.getElementById('textDialog');
		const modalContent = dlg.querySelector('.modal-content');
		modalContent.addEventListener('mousedown', function (e) {
			if (e.target.classList.contains('modal-header') || e.target.classList.contains('modal-title')) {
				isTextDialogResizing = true;
				prevX = e.clientX;
				prevY = e.clientY;
			}
		});
	}

    document.addEventListener('mousemove', function (e) {
        if (!isTextDialogResizing) return;
		const dlg = document.getElementById('textDialog');
		const modalContent = dlg.querySelector('.modal-content');
        const width = modalContent.offsetWidth + (e.clientX - prevX);
        const height = modalContent.offsetHeight + (e.clientY - prevY);
        modalContent.style.width = `${width}px`;
        modalContent.style.height = `${height}px`;
        prevX = e.clientX;
        prevY = e.clientY;
    });

    document.addEventListener('mouseup', function () {
        isTextDialogResizing = false;
    });

    function openModal() {
        const dlg = document.getElementById('textDialog');
		dlg.style.display = 'block';
		const textInput = dlg.querySelector('.text-input');
        textInput.focus();
        if (isModuleInitialized) {
			Module._MakeDeaf(1);			
		}
    }

    function closeModal() {
        const dlg = document.getElementById('textDialog');
		dlg.style.display = 'none';
        if (isModuleInitialized) {
			Module._MakeDeaf(0);
		}
    }

    window.openModal = openModal;
    window.closeModal = closeModal;
}
	
document.addEventListener("DOMContentLoaded", function() {
    
	createContainerWithCanvas('SAGE_canvasGlobalContainer', 'SAGE_mainCanvas');
	createTextCanvas('SAGE_textCanvas');
	//initializeTextDialog();
		
    {//subscribe to canvas resizing here
		const canvas_container = document.getElementById('SAGE_canvasGlobalContainer');
		// Create a ResizeObserver
		const resizeObserver = new ResizeObserver(handleCanvasResize);
		// Observe the canvas element
		resizeObserver.observe(canvas_container);
	}
		
	{//subscribe to all mouse actions here
		const global_canvas = getModuleWnd();
		global_canvas.addEventListener('mousemove', handleMouseMove);
		global_canvas.addEventListener('mousedown', handleMouseDown);
		//global_canvas.addEventListener('mouseup', handleMouseUp);
		global_canvas.addEventListener('wheel', blockDefaultInsideChart);//, { passive: false });
		global_canvas.addEventListener('contextmenu', blockDefaultInsideChart);//, { passive: false });
	
		// Get all elements with the "SAGE_chart" class
		const chartBoxes = document.querySelectorAll('.SAGE_chart');
		
		// Create a ResizeObserver for each "SAGE_chart" element
		chartBoxes.forEach(chartBox => {
			const chartBoxObserver = new ResizeObserver(handleChartBoxResize);
			chartBoxObserver.observe(chartBox);
			
			chartBox.addEventListener('mousemove', handleMouseMove);
			chartBox.addEventListener('mousedown', handleMouseDown);
			//chartBox.addEventListener('mouseup', handleMouseUp);
		});
	}
	
	initIdealGraphics();
});

var Module = {
	onRuntimeInitialized: function () {
		isModuleInitialized = true;
		console.log('WASM module was initialized');
		Module.doNotCaptureKeyboard = true;
	},
	
	canvas: (function() {
		return getModuleWnd();
	})(),
            // Disable keyboard capturing
    dontCaptureKeyboard: true
};

//---------------------------------------------------------------------------------------
var mouseState = {
    left: false,
    middle: false,
    right: false
};

function handleStateMouseDown(event) {
    if (event.button === 0) {
        mouseState.left = true;
    } else if (event.button === 1) {
        mouseState.middle = true;
    } else if (event.button === 2) {
        mouseState.right = true;
    }
}

function handleStateMouseUp(event) {
    if (event.button === 0) {
        mouseState.left = false;
    } else if (event.button === 1) {
        mouseState.middle = false;
    } else if (event.button === 2) {
        mouseState.right = false;
    }
}

window.addEventListener('mousedown', handleStateMouseDown);
window.addEventListener('mouseup', handleStateMouseUp);

// Expose mouseState to Emscripten
Module['mouseState'] = mouseState;
//---------------------------------------------------------------------------------------
var modifierKeyStates = {
    alt: false,
    ctrl: false,
    shift: false
};

function handleKeyDown(event) {
    if (event.code === 'AltLeft' || event.code === 'AltRight') {
        modifierKeyStates.alt = true;
    }
    if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
        modifierKeyStates.ctrl = true;
    }
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        modifierKeyStates.shift = true;
    }
}

function handleKeyUp(event) {
    if (event.code === 'AltLeft' || event.code === 'AltRight') {
        modifierKeyStates.alt = false;
    }
    if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
        modifierKeyStates.ctrl = false;
    }
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        modifierKeyStates.shift = false;
    }
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

// Expose modifierKeyStates to Emscripten
Module['modifierKeyStates'] = modifierKeyStates;
//---------------------------------------------------------------------------------------
async function getClipboardText() {
    try {
        const text = await navigator.clipboard.readText();
        return text;
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        return '';
    }
}
// Expose the function to the Emscripten module
Module['getClipboardText'] = getClipboardText;
//---------------------------------------------------------------------------------------
async function setClipboardText(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log('Clipboard text set successfully:', text);
    } catch (err) {
        //console.error('Failed to set clipboard text:', err);
    }
}
// Expose the function to the Emscripten module
Module['setClipboardText'] = setClipboardText;
//---------------------------------------------------------------------------------------
	
function createOffscreenCanvas(width, height) {
    const offscreenCanvas = new OffscreenCanvas(width, height);
    return offscreenCanvas;
}

function updateCanvasHDPI() {
	const pixelRatio = window.devicePixelRatio || 1;

	const canvas_container = document.getElementById('SAGE_canvasGlobalContainer');

	const newWidth = Math.floor(canvas_container.offsetWidth * pixelRatio);
	const newHeight = Math.floor(canvas_container.offsetHeight * pixelRatio);
	
	const global_canvas = getModuleWnd();
	
	global_canvas.width = newWidth;
	global_canvas.height = newHeight;

	if (isModuleInitialized) {
		Module._ResizeCanvas(newWidth, newHeight);
	}

	global_canvas.style.width = canvas_container.offsetWidth + "px";
	global_canvas.style.height = canvas_container.offsetHeight + "px";

	console.log(`updateCanvasHDPI width: ${newWidth}, height: ${newHeight}, ratio: ${pixelRatio}`);
}	

function removeAllCharts() {
	if (isModuleInitialized) {
		var number_of_charts = Module._GetNumberOfCharts();
		for (var i = 0; i < number_of_charts; ++i) {
			Module._RemoveChart(0);
		}
	}
}

function beginLoading() {
	console.log(`************** Begin loading`);
	var loader = document.getElementById("loader");
	if (loader)
		loader.classList.remove('hidden');
}

function endLoading() {
	console.log(`************** End loading`);
	var loader = document.getElementById("loader");
	if (loader)
		loader.classList.add('hidden');
}
		
function loadData(text, add) {
	if (!add) {
		removeAllCharts();
	}

	if (isModuleInitialized) {
		const bufferSize = Module.lengthBytesUTF8(text);
		const bufferPtr = Module._malloc(bufferSize + 1);
		Module.stringToUTF8(text, bufferPtr, bufferSize + 1);

		console.log(`processTextData method started`);
		// Call the WASM function to process the text data
		Module.ccall('processTextData', 'number', ['number', 'number'], [bufferPtr, add]);
		console.log(`processTextData method ended`);

		// Free the allocated memory in WASM when done
		Module._free(bufferPtr);
	}	
}

function loadContent() {
	return new Promise((resolve, reject) => {
		beginLoading();
		loadData(getInitialData(), 1);
		endLoading(); // Hide loading spinner on error
    });	
}
		
function onModuleIntitialized()
{
	// Start async data loading
    loadContent().then(() => {
        console.log('************* Async loading completed.');
    }).catch((error) => {
        console.error('************* Async loading failed:', error);		
    });
}

// Assign the function to the global window object
window.onModuleIntitialized = onModuleIntitialized; 
class CMessageBox extends CWindow 
{
    message_box_settings = {
        text: "",
    };

    constructor(text) {
        super();
		this.message_box_settings.text = text;
    }

    onAddElement() {
        super.onAddElement();

        // Reference the UI elements
        this.messageBox = this.getElement();
    }

    onRemoveElement(){
        super.onRemoveElement();
    }

    render()
    {
        var messageBox = super.render();
        messageBox.className = 'message-box';
        messageBox.innerText = this.message_box_settings.text;
  
        return messageBox;
    }
}

MESSAGE_BOX = null;

function openMessageBox(title, text, style)
{
    console.log('openMessageBox function - ', title, text);
    if (!MESSAGE_BOX) {
        MESSAGE_BOX = new CModalDialog(new CMessageBox(text));
        MESSAGE_BOX.modal_settings.title = title;
        MESSAGE_BOX.add(document.body, 'message-box-dlg');
        addListener(MESSAGE_BOX.getElement(), 'window:close', closeMessageBox)
    }
}

function closeMessageBox()
{
    console.log("closeMessageBox function");

    if (MESSAGE_BOX) {
        removeListener(MESSAGE_BOX.getElement(), 'window:close', closeMessageBox);
        MESSAGE_BOX.remove();
        MESSAGE_BOX = null;
    }
} 
function showTooltip(x, y, text) {
	
	const pixelRatio = window.devicePixelRatio || 1;
	x = x / pixelRatio;
	y = y / pixelRatio;
	
    //console.log(`Tooltip x: ${x}, y: ${y}');
	//var title = this.title;
    //this.title = '';
    //this.setAttribute("tooltip", title);
    var tooltipWrap = document.createElement("div"); //creates div
    tooltipWrap.className = 'tooltip'; //adds class
    const rows = text.split(/\r?\n/);
    for (var i = 0; i < rows.length; ++i) {
        tooltipWrap.appendChild(document.createTextNode(rows[i])); //add the text node to the newly created div.
        if (i != rows.length - 1)
            tooltipWrap.appendChild(document.createElement('br'));
    }
    var firstChild = document.body.firstChild;//gets the first elem after body
    firstChild.parentNode.insertBefore(tooltipWrap, firstChild); //adds tt before elem 
    var margin = 10;
    var wnd = getModuleWnd();
    if (wnd) {
        var wnd_rect = wnd.getBoundingClientRect();
		//console.log(wnd_rect);
        y = wnd_rect.y + wnd_rect.height - y;
        x += wnd_rect.x;
	}
	//y = window.innerHeight - 200;
	
    var tooltipWidth = tooltipWrap.offsetWidth;
    var tooltipHeight = tooltipWrap.offsetHeight;
    var left = x + margin;
    var top = y + margin;    
    if (left + tooltipWidth > document.documentElement.clientWidth) {
        left = x - tooltipWidth - margin ;
    }
    if (left < 0) {
        left = margin;
    }
    if (top + tooltipHeight > document.documentElement.clientHeight) {
        top = y - tooltipHeight - margin;
    }
    if (top < 0) {
        top = margin;
    }

    tooltipWrap.setAttribute('style', 'top:' + top + 'px;' + 'left:' + left + 'px;');
}

function hideTooltip()
{
    //var title = this.getAttribute("tooltip");
    //this.title = title;
    //this.removeAttribute("tooltip");
    var selector = document.querySelector(".tooltip");
    if (selector)
    {
        selector.remove();
    }
} 
