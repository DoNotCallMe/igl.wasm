function wndToScreen(item, wnd){
    if (wnd) {
        var wnd_rectangle = wnd.getBoundingClientRect();
        y = wnd_rectangle.y + wnd_rectangle.height - item.y;
        x = item.x + wnd_rectangle.x;
        return {x: x, y: y, width: item.width, height: item.height};
    }
    return {x: item.x, y: item.y, width: item.width, height: item.height};
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

        element.classList.add("sage_theme_" + this.window_settings.theme);

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
        this.dialog.className = 'sage_modal_window';

        {
            var titlebar = document.createElement('div');
            titlebar.className = 'sage_modal_titlebar';
    
            {
                var title = document.createElement('span');
                title.className = 'sage_modal_title';
                title.textContent = this.modal_settings.title;
                titlebar.appendChild(title);

                this.close_button = document.createElement('button');
                this.close_button.className = 'sage_button_close';
				this.close_button.textContent = '\u00D7'; // Unicode for multiplication sign (×)

                titlebar.appendChild(this.close_button);
            }

            this.dialog.appendChild(titlebar);
        }

        {
            this.content = document.createElement('div');
            this.content.className = 'sage_modal_content';
            this.dialog.appendChild(this.content);
        }

        var overlay = document.createElement('div');
        overlay.className = 'sage_modal_overlay';
		overlay.appendChild(this.dialog);
        

        return overlay;
    }

    onAddElement()
    {
        super.onAddElement();
        this.content_window.add(this.content, 'sage_color_picker')

        this.onDocumentKeyDown = this.onDocumentKeyDown.bind(this);
        this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this);
        this.close = this.close.bind(this);

		addListener(document, 'contextmenu', this.onContextMenu);
        addListener(document, 'keydown', this.onDocumentKeyDown);
        addListener(this.content_window.getElement(), 'window:close', this.close);
        addListener(document, 'mousedown', this.onDocumentMouseDown);
        addListener(this.close_button, 'click', this.close);
		
        makeSAGECanvasDeaf(true);
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
		
        makeSAGECanvasDeaf(false);
    }


    updatePositionRoutine()
    {
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
        if (e.key === 'Escape') {
            this.close({reason: "escape"});
        }
    }

    onDocumentMouseDown(e) {
        const rectangle = this.dialog.getBoundingClientRect();
        var x = e.pageX + window.scrollX;
        var y = e.pageY + window.scrollY;

        console.log('Modal dialog rectangle:', retangle);
        console.log('Cursor pos: ', x, y);

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
        this.colorArea = document.getElementById('sage_color_area');
        this.colorMarker = document.getElementById('sage_color_marker');
        this.clearButton = document.getElementById('sage_color_clear');
        this.applyButton = document.getElementById('sage_color_apply');
        this.colorPreview = document.getElementById('sage_color_preview');
        this.colorValue = document.getElementById('sage_color_input');
        this.hueSlider = document.getElementById('sage_color_hue_slider');
        this.hueMarker = document.getElementById('sage_color_hue_marker');
        this.alphaSlider = document.getElementById('sage_color_alpha_slider');
        this.alphaMarker = document.getElementById('sage_color_alpha_marker');

      
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
        addListener(this.picker, 'click', '.sage_color_swatches button', this.onPickerClick);
        addListener(document, 'mouseup', this.onDocumentMouseUp);
        addListener(document, 'touchend', this.onDocumentTouchEnd);
        addListener(document, 'keydown', this.onDocumentKeyDown);
        addListener(document, 'click', '.sage_color_field button', this.onDocumentClickButton);
        addListener(this.colorArea, 'click', this.onMoveMarker);
        addListener(this.hueSlider, 'input', this.setHue);
        addListener(this.alphaSlider, 'input', this.setAlpha);
        addListener(this.colorValue, 'input', this.setColor);

        makeSAGECanvasDeaf(true);
    }

    onRemoveElement(){

        super.onRemoveElement();

        removeListener(this.colorArea, 'mousedown', this.onColorAreaMouseDown);
        removeListener(this.colorArea, 'touchstart', this.onColorAreaTouchStart);
        removeListener(this.colorMarker, 'mousedown', this.onColorMarkerMouseDown);
        removeListener(this.colorMarker, 'touchstart', this.onColorMarkerTouchStart);
        removeListener(this.clearButton, 'click', this.onCancelButtonClick);
        removeListener(this.applyButton, 'click', this.onApplyButtonClick);
        removeListener(this.picker, 'click', '.sage_color_swatches button', this.onPickerClick);
        removeListener(document, 'mouseup', this.onDocumentMouseUp);
        removeListener(document, 'touchend', this.onDocumentTouchEnd);
        removeListener(document, 'keydown', this.onDocumentKeyDown);
        removeListener(document, 'click', '.sage_color_field button', this.onDocumentClickButton);
        removeListener(this.colorArea, 'click', this.onMoveMarker);
        removeListener(this.hueSlider, 'input', this.setHue);
        removeListener(this.alphaSlider, 'input', this.setAlpha);
        removeListener(this.colorValue, 'input', this.setColor);

        makeSAGECanvasDeaf(false);
    }

    render()
    {
        //picker
        var picker = super.render();
        picker.className = 'sage_color_picker';
        //parent.appendChild(picker);

        
        {//colorArea
            var div = document.createElement('div');
            div.id = 'sage_color_area';
            div.ariaLabel = this.settings.a11y.instruction;
            div.className = 'sage_color_gradient';            

            {
                //colorMarker
                var marker = document.createElement('div');
                marker.id = 'sage_color_marker';
                marker.tabIndex = 0;
                marker.className = 'sage_color_marker';
                div.appendChild(marker);
            }

            picker.appendChild(div);
        }

        {//hue
            var div = document.createElement('div');
            div.className = 'sage_color_hue';
           
            {
                //hueSlider
                var slider = document.createElement('input');
                slider.id = 'sage_color_hue_slider';
                slider.type = 'range';
                slider.min = 0;
                slider.max = 360;
                slider.step = 1;
                slider.ariaLabel = this.settings.a11y.hueSlider;
                div.appendChild(slider);

                //hueMarker
                var marker = document.createElement('div');
                marker.id = 'sage_color_hue_marker';
                div.appendChild(marker);
            }

            picker.appendChild(div);
        }

        if (this.settings.alpha)
        {//alpha
            var div = document.createElement('div');
            div.className = 'sage_color_alpha';

            {
                //alphaSlider
                var slider = document.createElement('input');
                slider.id = 'sage_color_alpha_slider';
                slider.type = 'range';
                slider.min = 0;
                slider.max = 100;
                slider.step = 1;
                slider.ariaLabel = this.settings.a11y.alphaSlider;
                div.appendChild(slider);

                //alphaMarker
                var marker = document.createElement('div');
                marker.id = 'sage_color_alpha_marker';
                div.appendChild(marker);

                var alpha_span = document.createElement('span');
                div.appendChild(alpha_span);
            }

            picker.appendChild(div);
        }

        {
            var div = document.createElement('div');
            div.className = 'sage_color_preview_row';

            {//colorPreview
                var button = document.createElement('button');
                button.id = 'sage_color_preview';
                button.type = 'button';
                button.ariaLabel = this.settings.a11y.close;
                button.className = 'sage_color_preview';
                button.innerText =  this.settings.a11y.close;
                div.appendChild(button);
            }

            {//colorValue
                var input = document.createElement('input');
                input.id = 'sage_color_input';
                input.spellcheck = false;
                input.ariaLabel = this.settings.a11y.input;
                input.className = 'sage_color_input';
                input.value = this.color;
                div.appendChild(input);
            }           

            picker.appendChild(div);
        }

        if (this.settings.swatches.length > 0)
        {
            var div = document.createElement('div');
            div.className = 'sage_color_swatches';

            this.settings.swatches.forEach(function (swatch, i) {

                var button = document.createElement('button');
                button.id = 'sage_color_swatch_' + i;
                button.setAttribute('style', 'color: ' + swatch);
                button.innerText = swatch;
                button.className = 'sage_color_swatch';
                div.appendChild(button);
            });
  
            picker.appendChild(div);
        }

        if (this.settings.cancelButton.show || this.settings.applyButton.show)
        {
            var div = document.createElement('div');
            div.className = 'sage_color_button_row';

            if (this.settings.cancelButton.show)
            {//cancelButton
                var button = document.createElement('button');
                button.id = 'sage_color_clear';
                button.type = 'button';
                button.className = 'sage_color_clear';
                button.innerText =  this.settings.cancelButton.label;
                div.appendChild(button);
            }

            if (this.settings.applyButton.show)
            {//applyButton
                var button = document.createElement('button');
                button.id = 'sage_color_apply';
                button.type = 'button';
                button.className = 'sage_color_apply';
                button.innerText =  this.settings.applyButton.label;
                div.appendChild(button);
            }

            picker.appendChild(div);
        } 
        
        return picker;
    }

    onDocumentClickButton(e) {
        e.target.nextElementSibling.dispatchEvent(new Event('click', { bubbles: true }));
    }

    onDocumentTouchEnd() {
        document.removeEventListener('touchmove', this.onMoveMarker);
    }

    onDocumentMouseUp () {
        document.removeEventListener('mousemove', this.onMoveMarker);
    }

    onPickerClick (e) {
        this.setColorFromStr(e.target.textContent);
        this.pickColor();

        if (this.settings.autoClose) {
            this.close({result: 'pickerClick'});
        }
    }

    onCancelButtonClick() {
        this.close({result: 'cancel'});
    }

    onApplyButtonClick() {
        this.newColor = this.color;
        this.pickColor(this.color);
        this.close({result: 'apply'});
    }

    onColorAreaTouchStart() {
        document.addEventListener('touchmove', this.onMoveMarker, { passive: false });
    };

    onColorMarkerMouseDown() {
        addListener(document, 'mousemove', this.onMoveMarker);
    };

    onColorMarkerTouchStart() {
        document.addEventListener('touchmove', this.onMoveMarker, { passive: false });
    };

    onColorAreaMouseDown(){
        addListener(document, 'mousemove', this.onMoveMarker);
    };

    onDocumentKeyDown(e) {
        if (e.key === 'Escape') {
            this.close({result: "Escape"});
        }
    }

    onDocumentInput(e){
        var parent = e.target.parentNode;
    
        // Only update the preview if the field has been previously wrapped
        if (parent.classList.contains('sage_color_field')) {
            parent.style.color = e.target.value;
        }
    }

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
        var label = this.settings.a11y.marker;

        saturation = saturation.toFixed(1) * 1;
        value = value.toFixed(1) * 1;
        label = label.replace('{s}', saturation);
        label = label.replace('{v}', value);
        this.colorMarker.ariaLabel = label;
    }

    updateColor(rgba, hsva) {
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
        var hue = this.hueSlider.value * 1;
        var x = this.colorMarker.style.left.replace('px', '') * 1;
        var y = this.colorMarker.style.top.replace('px', '') * 1;

        this.picker.style.color = "hsl(" + hue + ", 100%, 50%)";
        this.hueMarker.style.left = hue / 360 * 100 + "%";

        this.setColorAtPosition(x, y);
    }

    //Set the alpha when its slider is moved.
    setAlpha() {
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
    setColorFromStr(str) {
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

        if (this.picker) {
            this.picker.dispatchEvent(new CustomEvent('color:pick', { detail: { color: newColor } }));
        }
    }

    //Set the active color based on a specific point in the color gradient.
    //@param {number} x Left position.
    //@param {number} y Top position.
    setColorAtPosition(x, y) {
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
        return {
        pageX: e.changedTouches ? e.changedTouches[0].pageX : e.pageX,
        pageY: e.changedTouches ? e.changedTouches[0].pageY : e.pageY };

    }

    //Move the color marker when dragged.
    //@param {object} event The MouseEvent object.
    onMoveMarker(e) {
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

function onChangeColor(e) {
    console.log("openColorDialog function " + e.detail.color);
}

function openColorDialog(id, title, rectangle, color, canvas_name) {
    if (!COLOR_DIALOG) {
        var canvas = document.getElementById(canvas_name);
        var container = document.body;// getElementById(canvas_name + 'Container');
        if (canvas && container) {
            COLOR_DIALOG = new CModalDialog(new CColorPicker(id, color), rectangle, canvas);
            COLOR_DIALOG.modal_settings.title = title;
            COLOR_DIALOG.add(container, 'sage_color_dialog');

            addListener(COLOR_DIALOG.content_window.getElement(), 'color:pick', onChangeColor);
            addListener(COLOR_DIALOG.getElement(), 'window:close', closeColorDialog)
        }
    }
}

function closeColorDialog() {
    if (COLOR_DIALOG) {
        removeListener(COLOR_DIALOG.content_window.getElement(), 'color:pick', onChangeColor);
        removeListener(COLOR_DIALOG.getElement(), 'window:close', closeColorDialog);

        COLOR_DIALOG.remove();
        Module.ccall('ModifyColor', 'number', ['number', 'string'], [COLOR_DIALOG.content_window.modifierId, COLOR_DIALOG.content_window.newColor]);        
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

        //console.log("JS ContextMenu class was created - " + this.id);

        this._onclick = e => {
            if (this.dom && e.target != this.dom && 
				//this.main_dom && e.target != this.main_dom && 
                e.target.parentElement != this.dom && 
				//e.target.parentElement != this.main_dom && 
                !e.target.classList.contains('sage_item') && 
                !e.target.parentElement.classList.contains('sage_item')) {
                //this.hideAll();
                closeContextMenu();
            }
        };

        this._oncontextmenu = e => {
            e.preventDefault();
	
            if (e.target != this.dom && 
				//e.target != this.main_dom && 
                e.target.parentElement != this.dom && 
				//e.target.parentElement != this.main_dom && 
                !e.target.classList.contains('sage_item') && 
                !e.target.parentElement.classList.contains('sage_item')) {
				//this.hideAll();
				//this.show(e.clientX, e.clientY, true);
                closeContextMenu();
            }
        };
		
        this._oncontextmenu_keydown = e => {
            if (e.keyCode != 93) return;
            e.preventDefault();

            closeContextMenu();
        };

        this._onblur = e => {
            closeContextMenu();
        };
    }

    getMenuDom() {
        const menu = document.createElement('div');
        menu.classList.add('sage_context');

        for (const item of this.items) {
            menu.appendChild(this.itemToDomEl(item));
        }
		
        return menu;
    }

    itemToDomEl(data) {
        const item = document.createElement('div');

        if (data === null) {
            item.classList.add('sage_separator');
            return item;
        }

        if (data.hasOwnProperty('color') && /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(data.color.toString())) {
            item.style.cssText = `color: ${data.color}`;
        }

        item.classList.add('sage_item');

		const item_mark = document.createElement('span');
		item_mark.classList.add('sage_check_mark');
		item_mark.textContent = '\u2713';// Unicode for check mark
  
        if (!data.hasOwnProperty('checked') || !data.checked) {
			item_mark.style.display = 'none';
		}
		item.appendChild(item_mark);

		const label = document.createElement('span');
		label.classList.add('sage_label');
		label.innerText = data.hasOwnProperty('text') ? data.text.toString() : '';
		item.appendChild(label);


		const is_submenu = data.hasOwnProperty('subitems') && Array.isArray(data.subitems) && data.subitems.length > 0

        if (data.hasOwnProperty('disabled') && data.disabled) {
			item.classList.add('sage_disabled');
		} else {
			item.classList.add('sage_enabled');
			
            if (data.hasOwnProperty('default') && data.default) {
				item.classList.add('sage_default');
			}
		}

        const hotkey = document.createElement('span');
        hotkey.classList.add('sage_hotkey');
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

            //item.classList.add('sage_has_subitems');
            item.addEventListener('click', openSubItems);
            item.addEventListener('mousemove', openSubItems);
			
			const sub_menu_idicator = document.createElement('span');
			sub_menu_idicator.classList.add('sage_has_subitems');
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

            //item.classList.add('sage_has_subitems');
            item.addEventListener('click', openSubItems);
            item.addEventListener('mousemove', openSubItems);
			
			const sub_menu_idicator = document.createElement('span');
			sub_menu_idicator.classList.add('sage_has_subitems');
			sub_menu_idicator.innerText = '>';
			item.appendChild(sub_menu_idicator);
        } else {
            item.addEventListener('click', e => { 
                this.hideSubMenus();

                if (item.classList.contains('sage_disabled'))
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
        if (this.main_dom != this.dom)
            makeSAGECanvasDeaf(false);
		
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
		
        if (this.main_dom != this.dom)
            makeSAGECanvasDeaf(false);
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
			overlay.className = 'sage_modal_overlay';
			
            overlay.addEventListener('mousedown', e => {
                e.stopPropagation();
            });
            overlay.addEventListener('mouseup', e => {
                e.stopPropagation();
            });
            overlay.addEventListener('mousemove', e => {
                e.stopPropagation();
            });
			overlay.addEventListener('click', e => {
				e.stopPropagation();
				this.hideAll(); // Hide the context menu if the overlay is clicked
			});
			
			overlay.appendChild(this.dom);
			this.main_dom = overlay;
			
			// Disable pointer events on the canvas
			makeSAGECanvasDeaf(true);
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
        this.container.addEventListener('keydown', this._oncontextmenu_keydown);
        this.container.addEventListener('click', this._onclick);

        window.addEventListener('blur', this._onblur);
    }

    uninstall() {
        this.dom = null;
		this.main_dom = null;
        this.container.removeEventListener('contextmenu', this._oncontextmenu);
        this.container.removeEventListener('keydown', this._oncontextmenu_keydown);
        this.container.removeEventListener('click', this._onclick);
        window.removeEventListener('blur', this._onblur);
    }
}

var CONTEXT_MENU = null;

let isContextMenuOpening = false;
function closeContextMenu(){
    if (!isContextMenuOpening && CONTEXT_MENU) {
        CONTEXT_MENU.hideAll();
		CONTEXT_MENU.uninstall();
        CONTEXT_MENU = null;
        //console.log('The context menu closed');
	}
}

function openContextMenu(id, xy, jsonData, canvas_name){
	if (jsonData != '{}') {
		try {
			const menuObject = JSON.parse(jsonData);
			console.log(menuObject);
			//console.log("ID" + id);

			if (Object.keys(menuObject).length != 0) {

				closeContextMenu();

				const pixelRatio = window.devicePixelRatio || 1;

                var container = document.body;// getElementById(canvas_name + 'Container');
                if (container) {
                    isContextMenuOpening = true;
                    menu = new ContextMenu(container, menuObject, id);
                    menu.install();
                    menu.show(xy.x / pixelRatio, xy.y / pixelRatio, true);
                    CONTEXT_MENU = menu;

                    // Use a timeout to reset the flag after a short delay
                    setTimeout(() => {
                        isContextMenuOpening = false;
                    }, 100);

                    //console.log('context menu opened', xy.x / pixelRatio, xy.y / pixelRatio);
                }
            }
        } catch (error) {
            console.error("Invalid JSON string:", error);
        }
    }
    else {
        console.error("Context menu JSON data is empty. Context menu failed to open.");
    }
}
 
// Flag to track if the mouse button is pressed inside the chart box
let isSAGEInitialized = false;
let sageDataCache = '';

function makeSAGECanvasDeaf(flag, canvas_name = '') {
	//console.log('Chart-box mouse leave');
	if (isSAGEInitialized) {
		let value = 0;
		if (flag)
			value = 1;

		Module.ccall('MakeDeaf', 'number', ['number', 'string'], [value, canvas_name]);
	}
}

//-------------------------------------------------------------------------------
function createSAGECanvas(canvas_name, owner_id = '') {
	// Create the container <div>
	var container = document.createElement('div');
	container.classList.add('sage_canvas_container');
	container.id = canvas_name + 'Container';
	
	// Create the canvas element
	var canvas = document.createElement('canvas');
	canvas.classList.add('sage_canvas');
	canvas.id = canvas_name;
	canvas._mouseIsHandled = false;
	canvas._ownerId = owner_id;

	// Append the canvas to the container
	container.appendChild(canvas);

	{//subscribe to canvas resizing here
		// Create a ResizeObserver
		const resizeObserver = new ResizeObserver((entries) => handleSAGECanvasResize(entries, canvas_name));
		// Observe the canvas element
		resizeObserver.observe(container);
	}

	{//subscribe to all mouse actions here
		canvas.addEventListener('mousemove', (event) => handleMouseMove(event, canvas_name));
		canvas.addEventListener('mousedown', (event) => handleMouseDown(event, canvas_name));
		//canvas.addEventListener('mouseup', (event) => handleMouseUp(event, canvas_name));
		canvas.addEventListener('wheel', (event) => blockDefaultInsideChart(event, canvas_name));
		canvas.addEventListener('contextmenu', (event) => blockDefaultInsideChart(event, canvas_name));
	}

	{
		var canvas_owner = document.getElementById(owner_id);
		if (canvas_owner)
		{//subscribe to canvas resizing here
			// Create a ResizeObserver
			const resizeObserver = new ResizeObserver((entries) => handleSAGEOwnerResize(entries, canvas_name));
			// Observe the canvas element
			resizeObserver.observe(canvas_owner);
		}
	}

	return container;
}

function addDefaultSAGECanvas(convas_name) {
	// Append the canvas to the container
	container = createSAGECanvas(convas_name);

	// Append the container to the document body
	document.body.appendChild(container);
}

function createSAGEOffscreenCanvas(canvasId, width, height) {

	// Create the canvas element
	var new_canvas = document.createElement('canvas');
	new_canvas.id = canvasId;
	new_canvas.width = width;
	new_canvas.height = height;

	// Apply styles to make it offscreen and hidden
	new_canvas.style.position = 'absolute';
	new_canvas.style.visibility = 'hidden';
	new_canvas.style.display = 'none';
	
	// Append the container to the document body
	document.body.appendChild(new_canvas);
	//console.log('Offscreen canvas was added successfully.');
}

function getSAGEWASMPath() {
	return "./sage/sage_wasm.js";
}

function initSAGE() {	

	var script = document.createElement('script');		
	script.src = getSAGEWASMPath();
	script.onload = () => {
		console.log('IdealGraphics module loaded');
	};
	script.onerror = (error) => {
		console.error('Error loading IdealGraphics module:', error);
	};
	document.body.appendChild(script);
}

// Function to handle canvas resize
function handleSAGECanvasResize(entries, canvas_name)
{
	var canvas = document.getElementById(canvas_name);
	if (canvas)
		updateSAGECanvasHDPI(canvas_name);
}

function handleSAGEOwnerResize(entries, canvas_name) {
	updateAllSAGECharts(canvas_name);
}

let current_chart_id = '';

function getSAGECurrentChartId() {
	return current_chart_id;
}

// Function to handle mouse leave event on chart box
function handleMouseMove(event, canvas_name) {

	// Get all elements with the "SAGE_chart" class	`
	var chartBoxes = document.querySelectorAll('.SAGE_chart');

	// Check if the cursor is inside of any chart box
	let isCursorInsideChartBox = false;
	current_chart_id = '';

	for (var chartBox of chartBoxes) {
		if (chartBox._canvasId == canvas_name) {
			let rect = chartBox.getBoundingClientRect();
			if (event.clientX >= rect.left && event.clientX <= rect.right &&
				event.clientY >= rect.top && event.clientY <= rect.bottom) {
				isCursorInsideChartBox = true;
				current_chart_id = chartBox.id;
				break;
			}
		}
	}

	// Use querySelector to find the first element with the class 'sage_modal_overlay'
	var modalOverlay = document.querySelector('.sage_modal_overlay');
	
	let mouseMustBeHandledByWASM = !modalOverlay && isCursorInsideChartBox;

	//console.log('Test mouse position: ' + mouseMustBeHandledByWASM);
	var canvas = document.getElementById(canvas_name);

	if (canvas && canvas._mouseIsHandled != mouseMustBeHandledByWASM)
	{
		canvas._mouseIsHandled = mouseMustBeHandledByWASM;
		
		if (canvas._mouseIsHandled) {
			//console.log('Enter chart window in canvas ', canvas_name);

			// Set pointer-events to none when mouse enters the chart box
			chartBoxes.forEach(chartBox => {
				if (chartBox._canvasId == canvas_name) {
					chartBox.style.pointerEvents = 'none';
				}
			});
			
			canvas.style.pointerEvents = 'auto';
			//console.log('Chart-box mouse enter');
			makeSAGECanvasDeaf(false, canvas_name);
		}
		else {
			//console.log('Leave chart window in canvas ', canvas_name);

			// Reset pointer-events when mouse leaves the chart box			
			chartBoxes.forEach(chartBox => {
				if (chartBox._canvasId == canvas_name) {
					chartBox.style.pointerEvents = 'auto';
				}
			});

			canvas.style.pointerEvents = 'none';
			//console.log('Chart-box mouse leave');
			makeSAGECanvasDeaf(true, canvas_name);
		}
	}

	// Stop propagation if the mouse is inside the chart box
	if (isCursorInsideChartBox) {
		event.stopPropagation();
	}
}

// Function to handle mouse leave event on chart box
function blockDefaultInsideChart(event, canvas_name) {

	// Get all elements with the "SAGE_chart" class	`
	var chartBoxes = document.querySelectorAll('.SAGE_chart');

	// Check if the cursor is inside of any chart box
	let isCursorInsideChartBox = false;

	for (var chartBox of chartBoxes)
	{
		if (chartBox._canvasId == canvas_name) {
			var rect = chartBox.getBoundingClientRect();
			if (event.clientX >= rect.left && event.clientX <= rect.right &&
				event.clientY >= rect.top && event.clientY <= rect.bottom) {
				isCursorInsideChartBox = true;
				break;
			}
		}
	}

	// Use querySelector to find the first element with the class 'sage_modal_overlay'
	var modalOverlay = document.querySelector('.sage_modal_overlay');
	
	if (modalOverlay || isCursorInsideChartBox) {
		event.preventDefault();		
	}
}

// Function to handle mouse down event on chart box
function handleMouseDown(event, canvas_name) {
	if (event.button === 0) {
	}
}

// Function to handle mouse up event on chart box
function handleMouseUp(event, canvas_name) {
	if (event.button === 0) {
		// Left mouse button is released
		handleMouseMove(event, canvas_name);
	}
}

function setSAGECursor(canvas_name, cursor) {
	const element = document.getElementById(canvas_name);
	if (element) {
		element.style.cursor = cursor;
	}
	else {
		console.log('Canvas was not found:', canvas_name);
	}
}

// Function to handle resizing of "SAGE_chart" elements
function handleSAGEChartBoxResize(entries) {
	entries.forEach(entry => {
		updateSAGEChartPosition(entry.target);
	});
}

let isTextDialogResizing = false;
let prevX = 0;
let prevY = 0;

function createModalHeader() {
	var header = document.createElement('div');
	header.className = 'sage_modal_header';

	var title = document.createElement('span');
	title.className = 'sage_modal_title';
	title.textContent = 'Set Content';

	var closeButton = document.createElement('button');
	closeButton.className = 'sage_close_btn';
	closeButton.setAttribute('onclick', 'closeModal()');

	var closeIcon = document.createElement('img');
	//closeIcon.setAttribute('src', '../images/close_icon.svg');
	closeIcon.setAttribute('alt', 'Close');

	closeButton.appendChild(closeIcon);
	header.appendChild(title);
	header.appendChild(closeButton);

	return header;
}

function createModalBody() {
	var body = document.createElement('div');
	body.className = 'sage_modal_body';

	var textArea = document.createElement('textarea');
	textArea.className = 'sage_text_input';
	textArea.setAttribute('placeholder', 'Type your content here');

	var okButton = document.createElement('button');
	okButton.className = 'sage_ok_btn';
	okButton.textContent = 'Ok';
	okButton.setAttribute('onclick', 'submitContent()');

	body.appendChild(textArea);
	body.appendChild(okButton);

	return body;
}

function createModalContent() {
	var modalContent = document.createElement('div');
	modalContent.className = 'sage_modal_content sage_text_dialog_content';
	modalContent.appendChild(createModalHeader());
	modalContent.appendChild(createModalBody());

	return modalContent;
}

function initializeTextDialog() {
	var modal = document.createElement('div');
	modal.id = 'sage_textDialog';
	modal.className = 'sage_modal sage_text_dialog';
	modal.appendChild(createModalContent());

	document.body.appendChild(modal);

	function handleKeyDown(event) {
		var dlg = document.getElementById('sage_textDialog');
		if (dlg.style.display === 'block') {
			var textInput = dlg.querySelector('.sage_text_input');
			textInput.focus();
			//console.log('handleKeyDown', event);
		}
	}

	{
		var dlg = document.getElementById('sage_textDialog');
		var modalContent = dlg.querySelector('.sage_modal_content');
		modalContent.addEventListener('mousedown', function (e) {
			if (e.target.classList.contains('sage_modal_header') || e.target.classList.contains('sage_modal_title')) {
				isTextDialogResizing = true;
				prevX = e.clientX;
				prevY = e.clientY;
			}
		});
	}

	document.addEventListener('mousemove', function (e) {
		if (!isTextDialogResizing) return;
		var dlg = document.getElementById('sage_textDialog');
		var modalContent = dlg.querySelector('.sage_modal_content');
		var width = modalContent.offsetWidth + (e.clientX - prevX);
		var height = modalContent.offsetHeight + (e.clientY - prevY);
		modalContent.style.width = `${width}px`;
		modalContent.style.height = `${height}px`;
		prevX = e.clientX;
		prevY = e.clientY;
	});

	document.addEventListener('mouseup', function () {
		isTextDialogResizing = false;
	});

	function openModal() {
		var dlg = document.getElementById('sage_textDialog');
		dlg.style.display = 'block';
		var textInput = dlg.querySelector('.sage_text_input');
		textInput.focus();
		makeSAGECanvasDeaf(true);
	}

	function closeModal() {
		var dlg = document.getElementById('sage_textDialog');
		dlg.style.display = 'none';
		makeSAGECanvasDeaf(false);
	}

	window.openModal = openModal;
	window.closeModal = closeModal;
}

function RegisterSAGEChart(id, canvas_name = 'sage_mainCanvas') {
	// Find the chart element by its ID
	var chartBox = document.getElementById(id);
	if (!chartBox) {
		console.log(`RegisterSAGEChart: Element with ID ${id} not found.`);
		return;
	}

	// Add the "SAGE_chart" class to the element
	chartBox.classList.add("SAGE_chart");
	chartBox._canvasId = canvas_name;

	if (!chartBox._chartBoxObserver) {
		// Create a ResizeObserver and observe the chartBox
		var chartBoxObserver = new ResizeObserver(handleSAGEChartBoxResize);
		chartBoxObserver.observe(chartBox);
		chartBox._chartBoxObserver = chartBoxObserver;

		// Initialize last known size and position
		const rect = chartBox.getBoundingClientRect();
		chartBox._lastWidth = rect.width;
		chartBox._lastHeight = rect.height;
		chartBox._lastLeft = rect.left;
		chartBox._lastTop = rect.top;
	}

	// Add event listeners for mousemove and mousedown
	if (!chartBox._handleMouseMove) {
		chartBox.addEventListener('mousemove', (event) => handleMouseMove(event, canvas_name));
		chartBox._handleMouseMove = handleMouseMove;
	}

	if (!chartBox._handleMouseDown) {
		chartBox.addEventListener('mousedown', (event) => handleMouseDown(event, canvas_name));
		chartBox._handleMouseDown = handleMouseDown;
	}

	console.log(`Element with ID ${id} registered.`);
}

function updateAllSAGECharts(canvas_name = '') {
	// Check positions of all chart elements
	const chartBoxes = document.querySelectorAll('.SAGE_chart');

	chartBoxes.forEach(chartBox => {
		if (chartBox._canvasId == canvas_name || canvas_name === '') {
			updateSAGEChartPosition(chartBox);
		}
	});
}

function observeDOMChanges() {
	const observer = new MutationObserver(() => {
		updateAllSAGECharts();
	});

	observer.observe(document.body, {
		attributes: true,
		childList: true,
		subtree: true
	});
}

function updateSAGEChartPosition(chartBox) {
	if (chartBox) {
		const rect = chartBox.getBoundingClientRect();
		if (chartBox._lastLeft !== rect.left || chartBox._lastTop !== rect.top || chartBox._lastWidth !== rect.width || chartBox._lastHeight !== rect.height) {

			// Update last known position
			chartBox._lastLeft = rect.left;
			chartBox._lastTop = rect.top;
			chartBox._lastWidth = rect.width;
			chartBox._lastHeight = rect.height;

			if (isSAGEInitialized) {
				Module.ccall('UpdateChartElement', 'number', ['string'], [chartBox.id]);
			}
		}
	}
}

function UnregisterSAGEChart(id) {
	// Find the chart element by its ID
	var chartBox = document.getElementById(id);
	if (!chartBox) {
		console.log(`UnregisterSAGEChart: Element with ID ${id} not found.`);
		return;
	}

	// Remove the "SAGE_chart" class from the element
	chartBox.classList.remove("SAGE_chart");

	// Remove the ResizeObserver
	if (chartBox._chartBoxObserver) {
		chartBox._chartBoxObserver.unobserve(chartBox);
		chartBox._chartBoxObserver = null;
	}

	// Remove event listeners for mousemove and mousedown
	if (chartBox._handleMouseMove) {
		chartBox.removeEventListener('mousemove', chartBox._handleMouseMove);
		chartBox._handleMouseMove = null;
	}
	if (chartBox._handleMouseDown) {
		chartBox.removeEventListener('mousedown', chartBox._handleMouseDown);
		chartBox._handleMouseDown = null;
	}
}

document.addEventListener("DOMContentLoaded", function() {

	// Initialize observers
	observeDOMChanges();

	addDefaultSAGECanvas('sage_mainCanvas');
	createSAGEOffscreenCanvas('sage_textCanvas', 256, 256);
	createSAGEOffscreenCanvas('sage_tooltipCanvas', 64, 64);
	
	initSAGE();
});

var Module = {
	onRuntimeInitialized: function () {
		isSAGEInitialized = true;
		console.log('WASM module was initialized');
		Module.doNotCaptureKeyboard = true;
	},
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
function getSAGEClipboardText(id) {

	if (!navigator.clipboard) {
		alert('Clipboard API is not supported in this browser. Please ensure you are using a modern browser, and that the site is served over HTTPS.');
		return;
	}

	return navigator.clipboard.readText()
		.then(text => {
			//console.log('Clipboard text reading was finished successfully:', text);

			var bufferSize = Module.lengthBytesUTF8(text);
			var bufferPtr = Module._malloc(bufferSize + 1);
			Module.stringToUTF8(text, bufferPtr, bufferSize + 1);

			// Call the WASM function to process the text data
			var result = Module.ccall('setClipboardData', 'number', ['number', 'number'], [bufferPtr, id]);

			// Free the allocated memory in WASM when done
			Module._free(bufferPtr);
		})
		.catch(err => {
			console.error('Failed to read text from clipboard: ' + err.message);
		});
}
//---------------------------------------------------------------------------------------
async function setSAGEClipboardText(text) {

	if (!navigator.clipboard) {
		alert('Clipboard API is not supported in this browser. Please ensure you are using a modern browser, and that the site is served over HTTPS.');
		return;
	}

	navigator.clipboard
		.writeText(text)
		.then(() => {
			console.log('Clipboard text was copied successfully');
		})
		.catch(err => {
			alert('Failed to copy a text sample to clipboard: ' + err.message);
		});
}
//---------------------------------------------------------------------------------------
function createSAGEClipboardCanvas(canvas_name, width, height) {
	var canvas = document.createElement('canvas');
	canvas.id = canvas_name;

	// Adjust the canvas size based on the devicePixelRatio
	const ratio = window.devicePixelRatio || 1;
	canvas.width = width * ratio;
	canvas.height = height * ratio;
	
	document.body.appendChild(canvas);
}

function deleteSAGEClipboardCanvas(canvas_name) {
	var canvas = document.getElementById(canvas_name);
	if (canvas) {
		canvas.parentNode.removeChild(canvas);
		console.log('Canvas with ID ' + canvas_name + ' was deleted successfully.');
	} else {
		console.log('Canvas with ID ' + canvas_name + ' not found.');
	}
}

async function processSAGEClipboardImage(width, height, rgbaArrayJS) {
	if (!navigator.clipboard || !window.ClipboardItem) {
		alert('Clipboard API is not supported in this browser. Please ensure you are using a modern browser, and that the site is served over HTTPS.');
		return;
	}

	// Get the current device pixel ratio
	const pixelRatio = window.devicePixelRatio || 1;

	// Calculate new dimensions based on the device pixel ratio
	const newWidth = Math.floor(width * pixelRatio);
	const newHeight = Math.floor(height * pixelRatio);

	// Create a canvas element for the enlarged image
	const enlargedCanvas = document.createElement('canvas');
	enlargedCanvas.width = newWidth;
	enlargedCanvas.height = newHeight;
	const enlargedContext = enlargedCanvas.getContext('2d');

	// Create ImageData for the enlarged image
	const enlargedImageData = enlargedContext.createImageData(newWidth, newHeight);

	// Process each pixel in the enlarged canvas using bilinear interpolation
	for (let y = 0; y < newHeight; y++) {
		for (let x = 0; x < newWidth; x++) {
			// Calculate the position in the original image
			const srcX = x / pixelRatio;
			const srcY = y / pixelRatio;

			// Get the integer and fractional parts
			const x0 = Math.floor(srcX);
			const y0 = Math.floor(srcY);
			const x1 = Math.min(x0 + 1, width - 1);
			const y1 = Math.min(y0 + 1, height - 1);
			const dx = srcX - x0;
			const dy = srcY - y0;

			// Interpolate the colors
			const interpolate = (c00, c10, c01, c11) => {
				return c00 * (1 - dx) * (1 - dy) +
					c10 * dx * (1 - dy) +
					c01 * (1 - dx) * dy +
					c11 * dx * dy;
			};

			const index00 = (y0 * width + x0) * 4;
			const index10 = (y0 * width + x1) * 4;
			const index01 = (y1 * width + x0) * 4;
			const index11 = (y1 * width + x1) * 4;

			const r = interpolate(rgbaArrayJS[index00], rgbaArrayJS[index10], rgbaArrayJS[index01], rgbaArrayJS[index11]);
			const g = interpolate(rgbaArrayJS[index00 + 1], rgbaArrayJS[index10 + 1], rgbaArrayJS[index01 + 1], rgbaArrayJS[index11 + 1]);
			const b = interpolate(rgbaArrayJS[index00 + 2], rgbaArrayJS[index10 + 2], rgbaArrayJS[index01 + 2], rgbaArrayJS[index11 + 2]);
			const a = interpolate(rgbaArrayJS[index00 + 3], rgbaArrayJS[index10 + 3], rgbaArrayJS[index01 + 3], rgbaArrayJS[index11 + 3]);

			const index = (y * newWidth + x) * 4;
			enlargedImageData.data[index] = r;
			enlargedImageData.data[index + 1] = g;
			enlargedImageData.data[index + 2] = b;
			enlargedImageData.data[index + 3] = a;
		}
	}

	// Put the processed image data into the enlarged canvas
	enlargedContext.putImageData(enlargedImageData, 0, 0);

	// Convert the enlarged canvas content to a Blob
	const blob = await new Promise((resolve, reject) => {
		enlargedCanvas.toBlob((blob) => {
			if (blob) {
				resolve(blob);
			} else {
				reject(new Error('Failed to convert enlarged canvas to Blob.'));
			}
		}, 'image/png');
	});

	// Create a ClipboardItem with the Blob
	const clipboardItem = new ClipboardItem({ 'image/png': blob });

	// Write the ClipboardItem to the clipboard
	navigator.clipboard
		.write([clipboardItem])
		.then(() => {
			console.log('An image was copied successfully');
		})
		.catch(err => {
			alert('Failed to set clipboard image: ' + err.message);
		});
}
//---------------------------------------------------------------------------------------
function updateSAGECanvasHDPI(canvas_name) {
	var pixelRatio = window.devicePixelRatio || 1;

	var canvas_container = document.getElementById(canvas_name + 'Container');

	var newWidth = Math.floor(canvas_container.offsetWidth * pixelRatio);
	var newHeight = Math.floor(canvas_container.offsetHeight * pixelRatio);
	
	var canvas = document.getElementById(canvas_name);

	canvas.width = newWidth;
	canvas.height = newHeight;

	if (isSAGEInitialized) {
		Module.ccall('ResizeCanvas', 'number', ['number', 'number', 'string'], [newWidth, newHeight, canvas_name]);
	}

	canvas.style.width = canvas_container.offsetWidth + "px";
	canvas.style.height = canvas_container.offsetHeight + "px";

	console.log(`updateSAGECanvasHDPI width: ${newWidth}, height: ${newHeight}, ratio: ${pixelRatio}`);
}

function beginSAGELoading() {
	console.log(`************** Begin loading`);
	var loader = document.getElementById("sage_loader");
	if (loader)
		loader.classList.remove('sage_hidden');
}

function endSAGELoading() {
	console.log(`************** End loading`);
	var loader = document.getElementById("sage_loader");
	if (loader)
		loader.classList.add('sage_hidden');
}

const encoder = new TextEncoder();
const threadBuffers = new Map(); // Per-thread buffers

function getThreadBuffer(threadId, size) {
	if (!threadBuffers.has(threadId) || threadBuffers.get(threadId).size < size) {
		if (threadBuffers.has(threadId)) Module._free(threadBuffers.get(threadId).ptr);
		var ptr = Module._malloc(size);
		threadBuffers.set(threadId, { ptr, size });
	}
	return threadBuffers.get(threadId).ptr;
}

function getSAGEChartDomain(index) {
	if (isSAGEInitialized) {
		var domainPtr = Module._GetChartDomain(index);
		var id = UTF8ToString(domainPtr); // Convert pointer to string
		return id;
	}

	return "";
}

function getSAGENumberOfCharts() {
	if (isSAGEInitialized) {
		var n = Module._GetNumberOfCharts();
		return n;
	}

	return 0;
}

function getSAGEChartIndex(id) {
	var number_of_charts = getSAGENumberOfCharts();
	for (var i = 0; i < number_of_charts; ++i) {
		if (getSAGEChartDomain(i) == id) {
			return i;
		}
	}

	return -1;
}

function removeSAGEChart(index) {
	if (isSAGEInitialized) {
		var is_deleted = Module._RemoveChart(index);
		return is_deleted;
	}

	return 0;
}

function clearSAGE() {
	var count = 0;

	if (isSAGEInitialized) {		
		var number_of_charts = getSAGENumberOfCharts();
		for (var i = 0; i < number_of_charts; ++i) {
			count += removeSAGEChart(0);
		}
	}

	return count;
}

function replaceSAGEChart(id, text) {
	var index = getSAGEChartIndex(id);
	if (index >= 0) {
		removeSAGEChart(index);
	}

	setSAGEData(text, true);
	return getSAGEChartIndex(id);
}

function setSAGEData(text, add, threadId = self.threadId) {
	if (!add) {
		clearSAGE();
	}

	sageDataCache = '';

	if (isSAGEInitialized) {
		var encodedText = encoder.encode(text);
		var bufferPtr = getThreadBuffer(threadId, encodedText.length + 1);

		if (!Module.HEAPU8) {
			console.error('HEAPU8 is not available');
			return -1;
		}

		var buffer = new Uint8Array(Module.HEAPU8.buffer, bufferPtr, encodedText.length + 1);

		if (!buffer) {
			console.error('Buffer is not initialized');
			return -1;
		}

		buffer.set(encodedText);
		buffer[encodedText.length] = 0;

		console.log(`processTextData method started`);
		// Measure WASM execution time
		var start = performance.now();
		var result = Module._processTextData(bufferPtr, add);
		var end = performance.now();
		console.log(`processTextData executed in ${(end - start).toFixed(3)} ms`);

		return result;
	}
	else {
		sageDataCache = text;
	}
	return -1;
}

function loadData(text, add){
	return setSAGEData(text, add);
}

function escapeHtmlSAGE(unsafe) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function getSAGEError(html_friendly) {
	if (isSAGEInitialized) {
		var error = Module.ccall('getError', 'string', []);

		if (html_friendly) {
			return escapeHtmlSAGE(error);
		}
		return error;
	}

	return "SAGE is not initialized";
}

function getSAGEValue(query, html_friendly = false, deep = false) {
	if (isSAGEInitialized) {

		console.log('getValue query:', query);

		var dataPtr = Module._malloc(query.length + 1);
		Module.stringToUTF8(query, dataPtr, query.length + 1);

		// Allocate memory for the length
		var lengthPtr = Module._malloc(4);

		// Call the function
		var textPtr = Module.ccall('getTreeValue', 'number', ['number', 'number'], [dataPtr, lengthPtr, deep]);

		// Read the length
		var length = Module.HEAP32[lengthPtr >> 2];

		// Read the string from memory
		var result = Module.UTF8ToString(textPtr, length);		

		// Free the allocated memory
		Module._free(lengthPtr);
		Module._free(textPtr);
		Module._free(dataPtr);

		if (html_friendly) {
			return escapeHtmlSAGE(result);
		}

		return result;
	}

	return "SAGE is not initialized";
}

function getSAGEJsonValue(query, deep = false) {
	var jsonString = getSAGEValue(query, false, deep);
	// Parse the JSON string to a JavaScript object
	return JSON.parse(jsonString);
}

function getSAGEInitialData(){
	return sageDataCache;
}

function loadSAGEContent() {
	return new Promise((resolve, reject) => {
		beginSAGELoading();
		setSAGEData(getSAGEInitialData(), 1);
		endSAGELoading(); // Hide loading spinner on error
	});	
}

function sendReq(site, machine, section) {
    var page = window.location.pathname;
    var req = 'https://ideal.intel.com/counter.asp?Action=pagehit&Machine=' + machine + '&Site=' + site + '&Section=' + section + '&Page=' + page;
    fetch(req, {mode: 'no-cors'});
}

function onSAGEIntitialized() {
}

function onSAGEIntitializedRoutine ()
{
	// Start async data loading
	loadSAGEContent().then(() => {
		console.log('************* Async loading completed.');
	}).catch((error) => {
		console.error('************* Async loading failed:', error);		
	});

	onSAGEIntitialized();	
}

// Assign the function to the global window object
window.onModuleIntitialized = onSAGEIntitialized; 
class CMessageBox extends CWindow 
{
    settings = {
        text: "",

        cancelButton:
        {
            show: false,
            label: 'Cancel'
        },

        okButton:
        {
            show: false,
            label: 'OK'
        },

        yesButton:
        {
            show: false,
            label: 'Yes'
        },

        noButton:
        {
            show: false,
            label: 'No'
        }
    };

    constructor(modifierId) {

        super();

        this.modifierId = modifierId;
        this.result = '';
    }

    onAddElement() {
        super.onAddElement();

        // Reference the UI elements
        this.messageBox = this.getElement();

        this.okButton = document.getElementById('sage_messagebox_ok_button');
        this.cancelButton = document.getElementById('sage_messagebox_cancel_button');
        this.yesButton = document.getElementById('sage_messagebox_yes_button');
        this.noButton = document.getElementById('sage_messagebox_no_button');

        this.onCancelButtonClick = this.onCancelButtonClick.bind(this);
        this.onOkButtonClick = this.onOkButtonClick.bind(this);
        this.onYesButtonClick = this.onYesButtonClick.bind(this);
        this.onNoButtonClick = this.onNoButtonClick.bind(this);

        addListener(this.okButton, 'click', this.onOkButtonClick);
        addListener(this.cancelButton, 'click', this.onCancelButtonClick);
        addListener(this.yesButton, 'click', this.onYesButtonClick);
        addListener(this.noButton, 'click', this.onNoButtonClick);
    }

    onRemoveElement() {
        super.onRemoveElement();

        removeListener(this.okButton, 'click', this.onOkButtonClick);
        removeListener(this.cancelButton, 'click', this.onCancelButtonClick);
        removeListener(this.yesButton, 'click', this.onYesButtonClick);
        removeListener(this.noButton, 'click', this.onNoButtonClick);
    }

    onCancelButtonClick() {        
        this.result = 'cancel';
        this.close({ result: 'cancel' });
    }

    onOkButtonClick() {        
        this.result = 'ok';
        this.close({ result: 'ok' });
    }

    onYesButtonClick() {        
        this.result = 'yes';
        this.close({ result: 'yes' });
    }

    onNoButtonClick() {        
        this.result = 'no';
        this.close({ result: 'no' });
    }

    render() {
        var messageBox = super.render();
        messageBox.className = 'sage_message_box';

        {
            var div = document.createElement('div');
            div.className = 'sage_messagebox_text_area';
            div.innerText = this.settings.text;
            messageBox.appendChild(div);
        }

        {
            var div = document.createElement('div');
            div.className = 'sage_messagebox_button_row';

            if (this.settings.cancelButton.show) {//cancelButton
                var button = document.createElement('button');
                button.id = 'sage_messagebox_cancel_button';
                button.type = 'button';
                button.className = 'sage_messagebox_button';
                button.innerText = this.settings.cancelButton.label;
                div.appendChild(button);
            }

            if (this.settings.okButton.show) {//okButton
                var button = document.createElement('button');
                button.id = 'sage_messagebox_ok_button';
                button.type = 'button';
                button.className = 'sage_messagebox_button';
                button.innerText = this.settings.okButton.label;
                div.appendChild(button);
            }

            if (this.settings.noButton.show) {//noButton
                var button = document.createElement('button');
                button.id = 'sage_messagebox_no_button';
                button.type = 'button';
                button.className = 'sage_messagebox_button';
                button.innerText = this.settings.noButton.label;
                div.appendChild(button);
            }

            if (this.settings.yesButton.show) {//yesButton
                var button = document.createElement('button');
                button.id = 'sage_messagebox_yes_button';
                button.type = 'button';
                button.className = 'sage_messagebox_button';
                button.innerText = this.settings.yesButton.label;
                div.appendChild(button);
            }

            messageBox.appendChild(div);
        }

        return messageBox;
    }
}

MESSAGE_BOX = null;

function openMessageBox(id, title, text, style, canvas_name) {
    //console.log('openMessageBox function - ', title, text, style);
    if (!MESSAGE_BOX) {
        var container = document.body;// getElementById(canvas_name + 'Container');
        if (container) {

            messageboxContent = new CMessageBox(id);
            messageboxContent.settings.text = text;

            messageboxContent.settings.yesButton.show = style.includes('yes');
            messageboxContent.settings.noButton.show = style.includes('no');
            messageboxContent.settings.okButton.show = style.includes('ok');
            messageboxContent.settings.cancelButton.show = style.includes('cancel');

            MESSAGE_BOX = new CModalDialog(messageboxContent);
            MESSAGE_BOX.modal_settings.title = title;
            MESSAGE_BOX.add(container, 'sage_message_box_dlg');

            addListener(MESSAGE_BOX.getElement(), 'window:close', closeMessageBox);
        }
    }
}

function closeMessageBox(e){
    if (MESSAGE_BOX) {
        removeListener(MESSAGE_BOX.getElement(), 'window:close', closeMessageBox);

        MESSAGE_BOX.remove();
        Module.ccall('MessageBox', 'number', ['number', 'string'], [MESSAGE_BOX.content_window.modifierId, MESSAGE_BOX.content_window.result, true]);
        MESSAGE_BOX = null;
    }
} 
function showTooltip(x, y, text, canvas_name) {
	
	const pixelRatio = window.devicePixelRatio || 1;
	x = x / pixelRatio;
	y = y / pixelRatio;
	
    var tooltipWrap = document.createElement("div"); //creates div
    tooltipWrap.className = 'sage_tooltip'; //adds class
    const rows = text.split(/\r?\n/);
    for (var i = 0; i < rows.length; ++i) {
        tooltipWrap.appendChild(document.createTextNode(rows[i])); //add the text node to the newly created div.
        if (i != rows.length - 1)
            tooltipWrap.appendChild(document.createElement('br'));
    }
    var firstChild = document.body.firstChild;//gets the first elem after body
    firstChild.parentNode.insertBefore(tooltipWrap, firstChild); //adds tt before elem 
    var margin = 10;
    var wnd = document.getElementById(canvas_name);
    if (wnd) {
        var wnd_rect = wnd.getBoundingClientRect();
        y = wnd_rect.y + wnd_rect.height - y;
        x += wnd_rect.x;
	}
	
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
    var selector = document.querySelector(".sage_tooltip");
    if (selector)
    {
        selector.remove();
    }
} 
