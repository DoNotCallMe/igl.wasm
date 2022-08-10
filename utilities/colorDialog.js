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