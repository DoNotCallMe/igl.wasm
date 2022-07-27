function showTooltip(x, y, text) {
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
    var wnd = document.querySelector(".emscripten");
    if (wnd) {
        var wnd_rectangle = wnd.getBoundingClientRect();
        y = wnd_rectangle.y + wnd_rectangle.height - y;
        x += wnd_rectangle.x;
    }
    var tooltipWidth = tooltipWrap.offsetWidth;
    var tooltipHeight = tooltipWrap.offsetHeight;
    var left = x + margin;
    var top = y + margin;    
    if (left + tooltipWidth > document.documentElement.clientWidth) {
        left = x - tooltipWidth - margin ;
    }
    if (left < 0) {
        left = x + margin;
    }
    if (top + tooltipHeight > document.documentElement.clientHeight) {
        top = y - tooltipHeight - margin;
    }
    if (top < 0) {
        top = y + margin;
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
/*function openColorDialog(id, rectangle, color)
{
    var wnd = document.querySelector(".emscripten");
    if (wnd) {
        var wnd_rectangle = wnd.getBoundingClientRect();
        rectangle.y = wnd_rectangle.y + wnd_rectangle.height - rectangle.y;
        rectangle.x += wnd_rectangle.x;
    }
    Coloris.open(rectangle, color);
    //var colorisWrap = document.createElement("input"); //creates div
    //colorisWrap.type = 'text';
    //colorisWrap.className = 'coloris';
    //colorisWrap.setAttribute('value', color);
    //var firstChild = document.body.firstChild;//gets the first elem after body
    //firstChild.parentNode.insertBefore(colorisWrap, firstChild); //adds tt before elem
}
function closeColorDialog()
{
    Coloris.close();
}*/
//let color_piker = null;
function getModuleWnd() {
    element = document.getElementById("canvas");
    //console.log(element);
    return element;
}
function wndToScreen(item, wnd){
    if (wnd) {
        console.log(wnd);
        console.log(item);
        var wnd_rectangle = wnd.getBoundingClientRect();
        console.log(wnd_rectangle);
        y = wnd_rectangle.y + wnd_rectangle.height - item.y;
        x = item.x + wnd_rectangle.x;
        console.log({x: x, y: y, width: item.width, height: item.height});
        return {x: x, y: y, width: item.width, height: item.height};
    }
    return {x: item.x, y: item.y, width: item.width, height: item.height};
}
function onChange(e) {
    console.log("onChange fuction");
    console.log(e);
    console.log(getModuleWnd());
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

class CColorDialog{

    // Default settings
    settings = {
        el: '[data-coloris]',
        parent: getModuleWnd(),
        theme: 'default',
        themeMode: 'light',
        wrap: true,
        margin: 2,
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
        defaultColor: '#000000',
        clearButton: {
        show: false,
        label: 'Clear' },

        a11y: {
        open: 'Open color picker',
        close: 'Close color picker',
        marker: 'Saturation: {s}. Brightness: {v}.',
        hueSlider: 'Hue slider',
        alphaSlider: 'Opacity slider',
        input: 'Color value field',
        format: 'Color format',
        swatch: 'Color swatch',
        instruction: 'Saturation and brightness selector. Use up, down, left and right arrow keys to select.' } };

    constructor(modifierId, rectangle, color) {
        this.modifierId = modifierId;
        this.originalColor = color;
        this.color = color;
        this.targetRectangle = rectangle;
        this.currentFormat = getColorFormatFromStr(this.color);
    }

    show()
    {
        this.render(document.body);

        this.picker.classList.add('clr-open');

        this.updatePickerPositionRoutine();
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
        this.onPickerMouseDown = this.onPickerMouseDown.bind(this);
        this.onColorAreaMouseDown = this.onColorAreaMouseDown.bind(this);
        this.onColorAreaTouchStart = this.onColorAreaTouchStart.bind(this);
        this.onColorMarkerMouseDown = this.onColorMarkerMouseDown.bind(this);
        this.onColorMarkerTouchStart = this.onColorMarkerTouchStart.bind(this);
        this.onClearButtonClick = this.onClearButtonClick.bind(this);
        this.onColorPreviewClick = this.onColorPreviewClick.bind(this);
        this.onFormatRadioClick = this.onFormatRadioClick.bind(this);
        this.onPickerClick = this.onPickerClick.bind(this);
        this.onDocumentMouseUp = this.onDocumentMouseUp.bind(this);
        this.onDocumentTouchEnd = this.onDocumentTouchEnd.bind(this);
        this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this);
        this.onDocumentKeyDown = this.onDocumentKeyDown.bind(this);
        this.onDocumentClickButton = this.onDocumentClickButton.bind(this);
        this.onColorMakerKeyDown = this.onColorMakerKeyDown.bind(this);
        this.onMoveMarker = this.onMoveMarker.bind(this);
        this.setHue = this.setHue.bind(this);
        this.setAlpha = this.setAlpha.bind(this);
        this.onDocumentInput = this.onDocumentInput.bind(this);
        

        addListener(this.picker, 'mousedown', this.onPickerMouseDown);
        addListener(this.colorArea, 'mousedown', this.onColorAreaMouseDown);
        addListener(this.colorArea, 'touchstart', this.onColorAreaTouchStart);
        addListener(this.colorMarker, 'mousedown', this.onColorMarkerMouseDown);
        addListener(this.colorMarker, 'touchstart', this.onColorMarkerTouchStart);
        addListener(this.clearButton, 'click', this.onClearButtonClick);
        addListener(this.colorPreview, 'click', this.onColorPreviewClick);
        addListener(document, 'click', '.clr-format-input', this.onFormatRadioClick);
        addListener(this.picker, 'click', '.clr-swatches button', this.onPickerClick);
        addListener(document, 'mouseup', this.onDocumentMouseUp);
        addListener(document, 'touchend', this.onDocumentTouchEnd);
        addListener(document, 'mousedown', this.onDocumentMouseDown);
        addListener(document, 'keydown', this.onDocumentKeyDown);
        addListener(document, 'click', '.clr-field button', this.onDocumentClickButton);
        addListener(this.colorMarker, 'keydown', this.onColorMakerKeyDown);
        addListener(this.colorArea, 'click', this.onMoveMarker);
        addListener(this.hueSlider, 'input', this.setHue);
        addListener(this.alphaSlider, 'input', this.setAlpha);
    }

    close(){
        console.log("close fuction");
        // Hide the picker dialog
        this.picker.classList.remove('clr-open');

        removeListener(this.picker, 'mousedown', this.onPickerMouseDown);
        removeListener(this.colorArea, 'mousedown', this.onColorAreaMouseDown);
        removeListener(this.colorArea, 'touchstart', this.onColorAreaTouchStart);
        removeListener(this.colorMarker, 'mousedown', this.onColorMarkerMouseDown);
        removeListener(this.colorMarker, 'touchstart', this.onColorMarkerTouchStart);
        removeListener(this.clearButton, 'click', this.onClearButtonClick);
        removeListener(this.colorPreview, 'click', this.onColorPreviewClick);
        removeListener(document, 'click', '.clr-format input', this.onFormatRadioClick);
        removeListener(this.picker, 'click', '.clr-swatches button', this.onPickerClick);
        removeListener(document, 'mouseup', this.onDocumentMouseUp);
        removeListener(document, 'touchend', this.onDocumentTouchEnd);
        removeListener(document, 'mousedown', this.onDocumentMouseDown);
        removeListener(document, 'keydown', this.onDocumentKeyDown);
        removeListener(document, 'click', '.clr-field button', this.onDocumentClickButton);
        removeListener(this.colorMarker, 'keydown', this.onColorMakerKeyDown);
        removeListener(this.colorArea, 'click', this.onMoveMarker);
        removeListener(this.hueSlider, 'input', this.setHue);
        removeListener(this.alphaSlider, 'input', this.setAlpha);
    }

    render(parent){

        //picker
        var picker = document.createElement('div');
        picker.id = 'clr-picker';
        picker.className = 'clr-picker';
        parent.appendChild(picker);

        {
            //colorValue
            var input = document.createElement('input');
            input.id = 'clr-color-value';
            input.spellcheck = false;
            input.ariaLabel = this.settings.a11y.input;
            input.className = 'clr-color';
            input.value = this.color;
            picker.appendChild(input);
        }

        {
            //colorArea
            var div = document.createElement('div');
            div.id = 'clr-color-area';
            div.role = 'application';
            div.ariaLabel = this.settings.a11y.instruction;
            div.className = 'clr-gradient';
            picker.appendChild(div);

            //colorMarker
            var marker = document.createElement('div');
            marker.id = 'clr-color-marker';
            marker.tabIndex = 0;
            marker.className = 'clr-marker';
            div.appendChild(marker);
        }

        {//hue
            var div = document.createElement('div');
            div.className = 'clr-hue';
            picker.appendChild(div);

            //hueSlider
            var slider = document.createElement('input');
            slider.id = 'clr-hue-slider';
            slider.type = 'range';
            slider.min = 0;
            slider.max = 360;
            slider.step = 1;
            slider.ariaLabel = this.settings.a11y.hueSlider;
            div.appendChild(slider);

            //hueMarker
            var marker = document.createElement('div');
            marker.id = 'clr-hue-marker';
            div.appendChild(marker);
        }

        if (this.settings.alpha)
        {//alpha
            var div = document.createElement('div');
            div.className = 'clr-alpha';
            picker.appendChild(div);

            //alphaSlider
            var slider = document.createElement('input');
            slider.id = 'clr-alpha-slider';
            slider.type = 'range';
            slider.min = 0;
            slider.max = 100;
            slider.step = 1;
            slider.ariaLabel = this.settings.a11y.alphaSlider;
            div.appendChild(slider);

            //alphaMarker
            var marker = document.createElement('div');
            marker.id = 'clr-alpha-marker';
            div.appendChild(marker);

            var alpha_span = document.createElement('span');
            div.appendChild(alpha_span);
        }

        {
            var div = document.createElement('div');
            div.id = 'clr-format';
            div.className = 'clr-format';
            picker.appendChild(div);

            {
                var fieldset = document.createElement('fieldset');
                div.className = 'clr-segmented';
                div.appendChild(fieldset);

                var legend = document.createElement('legend');
                legend.innerText = this.settings.a11y.format;
                fieldset.appendChild(legend);

                var formats1 = ['hex', 'rgb', 'hsl'];
                var formats2 = ['Hex', 'RBG', 'HSL'];
                for (let i = 0; i < formats1.length; i++) {
                    
                    var id = 'clr-f' + (i + 1).toString();
                    
                    var input = document.createElement('input');
                    input.id = id;
                    input.type = 'radio';
                    input.name = 'clr-format';
                    input.value = formats1[i];
                    input.className = 'clr-format-input';
                    fieldset.appendChild(input);

                    var label = document.createElement('label');
                    label.setAttribute('for', id);
                    label.innerText = formats2[i];
                    input.className = 'clr-format-label';
                    fieldset.appendChild(label);
                }

                var span = document.createElement('span');
                fieldset.appendChild(span);
            }
        }

        {
            var div = document.createElement('div');
            div.id = 'clr-swatches';
            div.className = 'clr-swatches';
            picker.appendChild(div);
        }

        {//clearButton
            var button = document.createElement('button');
            button.id = 'clr-clear';
            button.type = 'button';
            button.className = 'clr-clear';
            button.innerText =  this.settings.clearButton.label;
            picker.appendChild(button);
        }

        {//colorPreview
            var button = document.createElement('button');
            button.id = 'clr-color-preview';
            button.type = 'button';
            button.ariaLabel = this.settings.a11y.close;
            button.className = 'clr-preview';
            button.innerText =  this.settings.a11y.close;
            picker.appendChild(button);
        }

        {
            var span = document.createElement('span');
            span.id = 'clr-open-label';
            span.hidden = true;
            span.innerText =  this.settings.a11y.open;
            picker.appendChild(span);
        }

        if (this.settings.swatches.length > 0)
        {
            var div = document.createElement('div');
            div.id = 'clr-swatch-label';
            div.className = 'clr-swatches';

            this.settings.swatches.forEach(function (swatch, i) {

                var button = document.createElement('button');
                button.id = 'clr-swatch-' + i;
                button.setAttribute('aria-labelledby', 'clr-swatch-label clr-swatch-' + i);
                button.setAttribute('style', 'color: ' + swatch);
                button.innerText = swatch;
                button.className = 'clr-swatch';
                div.appendChild(button);
                //swatches.push("<button type=\"button\" id=\"clr-swatch-" + i + "\" aria-labelledby=\"clr-swatch-label clr-swatch-" + i + "\" style=\"color: " + swatch + ";\">" + swatch + "</button>");
            });
  
            //span.innerHTML = swatches.length ? "<div>" + swatches.join('') + "</div>" : '';


            picker.appendChild(div);
        }

        // Reference the UI elements
        this.picker = document.getElementById('clr-picker');
        this.colorArea = document.getElementById('clr-color-area');
        this.colorMarker = document.getElementById('clr-color-marker');
        this.clearButton = document.getElementById('clr-clear');
        this.colorPreview = document.getElementById('clr-color-preview');
        this.colorValue = document.getElementById('clr-color-value');
        this.hueSlider = document.getElementById('clr-hue-slider');
        this.hueMarker = document.getElementById('clr-hue-marker');
        this.alphaSlider = document.getElementById('clr-alpha-slider');
        this.alphaMarker = document.getElementById('clr-alpha-marker');
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
            //this.close();
            closeColorDialog();
        }
    }

    onFormatRadioClick (e) {
        console.log("onFormatRadioClick fuction");
        this.currentFormat = e.target.value;
        this.updateColor();
        this.pickColor();
    }

    onColorPreviewClick() {
        console.log("onColorPreviewClick fuction");
        this.pickColor();
        //this.close();
        closeColorDialog();
    }

    onClearButtonClick() {
        console.log("onClearButtonClick fuction");
        this.pickColor('');
        //this.close();
        closeColorDialog();
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

    onColorMakerKeyDown(e){
        console.log("onColorMakerKeyDown fuction");

        var movements = {
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0] };

        if (Object.keys(movements).indexOf(e.key) !== -1) {
            this.moveMarkerOnKeydown.apply(void 0, movements[e.key]);
            e.preventDefault();
        }
    }

    onDocumentKeyDown(e) {
        console.log("onDocumentKeyDown fuction");

        if (e.key === 'Escape') {
            this.color = this.originalColor;
            //this.close();
            closeColorDialog();
        } else if (e.key === 'Tab') {
            this.picker.classList.add('clr-keyboard-nav');
        }
    }

    onPickerMouseDown(e) {
        console.log("onPickerMouseDown fuction");
        this.picker.classList.remove('clr-keyboard-nav');
        e.stopPropagation();
    }

    onDocumentMouseDown() {
        console.log("onDocumentMouseDown fuction");

        this.picker.classList.remove('clr-keyboard-nav');
        //this.close();
        closeColorDialog();
    }

    onDocumentInput(e){
        var parent = eveent.target.parentNode;
    
        // Only update the preview if the field has been previously wrapped
        if (parent.classList.contains('clr-field')) {
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

            if (!parentNode.classList.contains('clr-field'))
            {
                var wrapper = document.createElement('div');

                wrapper.innerHTML = "<button type=\"button\" aria-labelledby=\"clr-open-label\"></button>";
                parentNode.insertBefore(wrapper, field);
                wrapper.setAttribute('class', 'clr-field');
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
        this.picker.classList.add('clr-open');

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
            picker.className = "clr-picker clr-" + settings.theme + " clr-" + settings.themeMode;

            // Update the color picker's position if inline mode is in use
            if (settings.inline) {
                updatePickerPosition();
            }
            break;
            case 'margin':
            options.margin *= 1;
            settings.margin = !isNaN(options.margin) ? options.margin : settings.margin;
            break;
            case 'wrap':
            if (options.el && options.wrap) {
                wrapFields(options.el);
            }
            break;
            case 'formatToggle':
            getEl('clr-format').style.display = options.formatToggle ? 'block' : 'none';
            if (options.formatToggle) {
                settings.format = 'auto';
            }
            break;
            case 'swatches':
            if (Array.isArray(options.swatches)) {(function () {
                var swatches = [];

                options.swatches.forEach(function (swatch, i) {
                    swatches.push("<button type=\"button\" id=\"clr-swatch-" + i + "\" aria-labelledby=\"clr-swatch-label clr-swatch-" + i + "\" style=\"color: " + swatch + ";\">" + swatch + "</button>");
                });

                getEl('clr-swatches').innerHTML = swatches.length ? "<div>" + swatches.join('') + "</div>" : '';})();
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
            case 'clearButton':
            var display = 'none';

            if (options.clearButton.show) {
                display = 'block';
            }

            if (options.clearButton.label) {
                clearButton.innerHTML = options.clearButton.label;
            }

            clearButton.style.display = display;
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
                var openLabel = getEl('clr-open-label');
                var swatchLabel = getEl('clr-swatch-label');

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


        // Select the current format in the format switcher
        document.querySelector("#clr-format [value=\"" + format + "\"]").checked = true;       
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

        this.colorMarker.style.left = this.colorAreaDims.width * hsva.s / 100 + "px";
        this.colorMarker.style.top = this.colorAreaDims.height - this.colorAreaDims.height * hsva.v / 100 + "px";

        if (this.alphaSlider){
            this.alphaSlider.value = hsva.a * 100;
        }

        if (this.alphaMarker){
            this.alphaMarker.style.left = hsva.a * 100 + "%";
        }
    }

    //Update the color picker's position and the color gradient's offset
    updatePickerPositionRoutine()
    {
        console.log("updatePickerPositionRoutine fuction");
        
        var parent = this.settings.parent;
        var rectangle = wndToScreen(this.targetRectangle, parent);
        var scrollY = window.scrollY;
        var pickerWidth = this.picker.offsetWidth;
        var pickerHeight = this.picker.offsetHeight;
        var reposition = { left: false, top: false };
        var parentStyle, parentMarginTop, parentBorderTop;
        //var offset = { x: 0, y: 0 };

        if (parent)
        {
            parentStyle = window.getComputedStyle(parent); 
            parentMarginTop = parseFloat(parentStyle.marginTop);
            parentBorderTop = parseFloat(parentStyle.borderTopWidth);

            //offset = parent.getBoundingClientRect();
            //offset.y += parentBorderTop + scrollY;
        }

        //this.picker.style.left = rectangle.x + "px";
        //this.picker.style.top = (scrollY + rectangle.y + rectangle.height + this.settings.margin) + "px";

        if (!this.settings.inline)
        {
            var left = rectangle.x;
            var top = scrollY + rectangle.y + rectangle.height + this.settings.margin;

            // If the color picker is inside a custom container
            // set the position relative to it
            if (parent)
            {
                //left -= offset.x;
                //top -= offset.y;

                if (left + pickerWidth > parent.clientWidth)
                {
                    left += rectangle.width - pickerWidth;
                    reposition.left = true;
                }

                if (top + pickerHeight > parent.clientHeight - parentMarginTop)
                {
                    top -= rectangle.height + pickerHeight + this.settings.margin * 2;
                    reposition.top = true;
                }

                top += parent.scrollTop;

                // Otherwise set the position relative to the whole document
            }
            else
            {
                if (left + pickerWidth > document.documentElement.clientWidth)
                {
                    left += rectangle.width - pickerWidth;
                    reposition.left = true;
                }

                if (top + pickerHeight - scrollY > document.documentElement.clientHeight)
                {
                    top = scrollY + rectangle.y - pickerHeight - this.settings.margin;
                    reposition.top = true;
                }
            }

            this.picker.classList.toggle('clr-left', reposition.left);
            this.picker.classList.toggle('clr-top', reposition.top);
            this.picker.style.left = left + "px";
            this.picker.style.top = top + "px";
        }

        this.colorAreaDims = {
            width: this.colorArea.offsetWidth,
            height: this.colorArea.offsetHeight,
            x: this.picker.offsetLeft + this.colorArea.offsetLeft,// + offset.x,
            y: this.picker.offsetTop + this.colorArea.offsetTop,// + offset.y
        };
    }

    /*onChangePosition(e){
        console.log("onChangePosition fuction");
        var element = getModuleWnd();
        console.log(this.targetRectangle);
        const tmp = wndToScreen(this.targetRectangle, element);
        console.log(tmp);
    }*/

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

        document.dispatchEvent(new CustomEvent('coloris:pick', { detail: { color: newColor } }));
    }

    //Set the active color based on a specific point in the color gradient.
    //@param {number} x Left position.
    //@param {number} y Top position.
    setColorAtPosition(x, y) {
        console.log("setColorAtPosition fuction");
        var hsva = {
        h: this.hueSlider.value * 1,
        s: x / this.colorAreaDims.width * 100,
        v: 100 - y / this.colorAreaDims.height * 100,
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
        var pointer = this.getPointerPosition(e);
        var x = pointer.pageX - this.colorAreaDims.x;
        var y = pointer.pageY - this.colorAreaDims.y;

        if (this.settings.parent) {
            y += this.settings.parent.scrollTop;
        }

        x = x < 0 ? 0 : x > this.colorAreaDims.width ? this.colorAreaDims.width : x;
        y = y < 0 ? 0 : y > this.colorAreaDims.height ? this.colorAreaDims.height : y;

        this.colorMarker.style.left = x + "px";
        this.colorMarker.style.top = y + "px";

        this.setColorAtPosition(x, y);

        // Prevent scrolling while dragging the marker
        e.preventDefault();
        e.stopPropagation();
    }

    //Move the color marker when the arrow keys are pressed.
    //@param {number} offsetX The horizontal amount to move.
    //@param {number} offsetY The vertical amount to move.
    moveMarkerOnKeydown(offsetX, offsetY) {
        console.log("moveMarkerOnKeydown fuction");
        var x = this.colorMarker.style.left.replace('px', '') * 1 + offsetX;
        var y = this.colorMarker.style.top.replace('px', '') * 1 + offsetY;

        this.colorMarker.style.left = x + "px";
        this.colorMarker.style.top = y + "px";

        this.setColorAtPosition(x, y);
    }
}

COLOR_DIALOG = null;

function onChangeColor(e)
{
    console.log(e.detail.color);
    Module.ccall('ModifyColor', 'number', ['number', 'string', 'bool'], [COLOR_DIALOG.modifierId, e.detail.color, false]);
}

function openColorDialog(id, rectangle, color)
{
    console.log("openColorDialog function");
    if (!COLOR_DIALOG) {
        COLOR_DIALOG = new CColorDialog(id, rectangle, color);
        document.addEventListener('coloris:pick', onChangeColor);
        COLOR_DIALOG.show();
    }

    /*if (!color_piker){
        var wnd = document.querySelector(".emscripten");
        if (wnd) {
            var wnd_rectangle = wnd.getBoundingClientRect();
            rectangle.y = wnd_rectangle.y + wnd_rectangle.height - rectangle.y;
            rectangle.x += wnd_rectangle.x;
        }

        color_piker = new ColorPicker();
        color_piker.setColor("rgb(255,0,0)");
        color_piker.render(document.body);
    }*/

}

function closeColorDialog()
{
    console.log("closeColorDialog function");

    if (COLOR_DIALOG) {
        document.removeEventListener('coloris:pick', onChangeColor);
        COLOR_DIALOG.close();
        Module.ccall('ModifyColor', 'number', ['number', 'string'], [COLOR_DIALOG.modifierId, COLOR_DIALOG.color, true]);        
        COLOR_DIALOG = null;
    }

    /*if (color_piker){
        color_piker.clear();
        color_piker = null;
    }*/
}
