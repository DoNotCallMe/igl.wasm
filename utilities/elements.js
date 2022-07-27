
function getID()
{
    return "IGL" + (Control.ID++).toString();
}

class Component {

    // element id generation
    static ID = 0;
    static getID()
    {
        return "IGL" + (Control.ID++).toString();
    }

    #classList = [];
    getClassList(){
        return classList;
    }

    addClass(new_class)
    {
        let index = classList.indexOf(new_class);
        if (index == -1){
            classList.add(new_class);
            onClassChanged();
        }
    }

    removeClass(new_class)
    {
        let index = classList.indexOf(new_class);
        if (index != -1){
            classList.remove(new_class);
            onClassChanged();
        }
    }

    #onClassChanged()
    {
        for (const id of ids){
            element = document.getElementById(id);
            element.classList = this.getClassList();
        }
    }

    onValueChanged()
    {
        for (const id of ids){
            element = document.getElementById(id);
            applyValue(element);
        }
    }


    #ids = [];
    registerID(id) {
        let index = ids.indexOf(id);
        if (index != -1){
            ids.add(id);
        }
    }

    unregisterID(id) {
        ids.remove(id);
    }

    createElementRoutine(){
        element = document.createElement('div');
        return element;
    }

    createElement(){
        element = this.createElementRoutine();
        element.id = getID();
        this.registerID(element.id);
        element.classList = this.getClassList();           
        return element;
    }

    render(properties){
        element = createElement();
        prporties.parent.appendChild(element);
        onAppendControl(element.id);
    }

    onAppendControl(id){

    }    
}

class ColorPicker extends Component
{
    #color = '#000000';

    setColor(new_color){
        if (new_color != getColor()){
            color = new_color;
            onValueChanged();
        }
    }

    getColor() {
        return this.color;
    }

    applyValue(element) {
        element.Value = getColor();
    }


    createElementRoutine(){
        input = document.createElement('input');
        input.type = "text";
        return input;
    }

    onAppendControl(id){

    }

/*
    // Default settings
    settings = {
        el: '[data-coloris]',
        parent: null,
        theme: 'default',
        themeMode: 'light',
        wrap: true,
        margin: 2,
        format: 'hex',
        formatToggle: false,
        swatches: [],
        swatchesOnly: false,
        alpha: true,
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

    constructor(color) {
        this.#color = color;
    }

    createElement(){
        this.picker = super.createElement();
        this.picker.setAttribute('id', 'clr-picker');
        
        this.picker.className = 'clr-picker';
        this.picker.innerHTML =
        "<input id=\"clr-color-value\" class=\"clr-color\" type=\"text\" value=\"\" spellcheck=\"false\" aria-label=\"" + this.settings.a11y.input + "\">" + ("<div id=\"clr-color-area\" class=\"clr-gradient\" role=\"application\" aria-label=\"" +
        this.settings.a11y.instruction + "\">") +
        '<div id="clr-color-marker" class="clr-marker" tabindex="0"></div>' +
        '</div>' +
        '<div class="clr-hue">' + ("<input id=\"clr-hue-slider\" type=\"range\" min=\"0\" max=\"360\" step=\"1\" aria-label=\"" +
        this.settings.a11y.hueSlider + "\">") +
        '<div id="clr-hue-marker"></div>' +
        '</div>' +
        '<div class="clr-alpha">' + ("<input id=\"clr-alpha-slider\" type=\"range\" min=\"0\" max=\"100\" step=\"1\" aria-label=\"" +
        this.settings.a11y.alphaSlider + "\">") +
        '<div id="clr-alpha-marker"></div>' +
        '<span></span>' +
        '</div>' +
        '<div id="clr-format" class="clr-format">' +
        '<fieldset class="clr-segmented">' + ("<legend>" +
        this.settings.a11y.format + "</legend>") +
        '<input id="clr-f1" type="radio" name="clr-format" value="hex">' +
        '<label for="clr-f1">Hex</label>' +
        '<input id="clr-f2" type="radio" name="clr-format" value="rgb">' +
        '<label for="clr-f2">RGB</label>' +
        '<input id="clr-f3" type="radio" name="clr-format" value="hsl">' +
        '<label for="clr-f3">HSL</label>' +
        '<span></span>' +
        '</fieldset>' +
        '</div>' +
        '<div id="clr-swatches" class="clr-swatches"></div>' + ("<button type=\"button\" id=\"clr-clear\" class=\"clr-clear\">" +
        this.settings.clearButton.label + "</button>") + ("<button type=\"button\" id=\"clr-color-preview\" class=\"clr-preview\" aria-label=\"" +
        this.settings.a11y.close + "\"></button>") + ("<span id=\"clr-open-label\" hidden>" +
        this.settings.a11y.open + "</span>") + ("<span id=\"clr-swatch-label\" hidden>" +
        this.settings.a11y.swatch + "</span>");
        
        return picker;
    }

    onAppendElement()
    {
        super.onAppendElement();

        // Reference the UI elements
        this.colorArea = getEl('clr-color-area');
        this.colorMarker = getEl('clr-color-marker');
        this.clearButton = getEl('clr-clear');
        this.colorPreview = getEl('clr-color-preview');
        this.colorValue = getEl('clr-color-value');
        this.hueSlider = getEl('clr-hue-slider');
        this.hueMarker = getEl('clr-hue-marker');
        this.alphaSlider = getEl('clr-alpha-slider');
        this.alphaMarker = getEl('clr-alpha-marker');

        // Bind the picker to the default selector
        bindFields(this.settings.el);
        wrapFields(this.settings.el);

        addListener(picker, 'mousedown', function (event) {
            this.picker.classList.remove('clr-keyboard-nav');
            event.stopPropagation();
        });

        addListener(colorArea, 'mousedown', function (event) {
            addListener(document, 'mousemove', moveMarker);
        });

        addListener(colorArea, 'touchstart', function (event) {
            document.addEventListener('touchmove', moveMarker, { passive: false });
        });

        addListener(colorMarker, 'mousedown', function (event) {
            addListener(document, 'mousemove', moveMarker);
        });

        addListener(colorMarker, 'touchstart', function (event) {
            document.addEventListener('touchmove', moveMarker, { passive: false });
        });

        addListener(colorValue, 'change', function (event) {
            setColorFromStr(colorValue.value);
            pickColor();
        });

        addListener(clearButton, 'click', function (event) {
            pickColor('');
            closePicker();
        });

        addListener(colorPreview, 'click', function (event) {
            pickColor();
            closePicker();
        });

        addListener(document, 'click', '.clr-format input', function (event) {
        currentFormat = event.target.value;
        updateColor();
        pickColor();
        });

        addListener(picker, 'click', '.clr-swatches button', function (event) {
            setColorFromStr(event.target.textContent);
            pickColor();

            if (this.settings.autoClose) {
                closePicker();
            }
        });

        addListener(document, 'mouseup', function (event) {
            document.removeEventListener('mousemove', moveMarker);
        });

        addListener(document, 'touchend', function (event) {
            document.removeEventListener('touchmove', moveMarker);
        });

        addListener(document, 'mousedown', function (event) {
            this.picker.classList.remove('clr-keyboard-nav');
            closePicker();
        });

        addListener(document, 'keydown', function (event) {
            if (event.key === 'Escape') {
                closePicker(true);
            } else if (event.key === 'Tab') {
                this.picker.classList.add('clr-keyboard-nav');
            }
        });

        addListener(document, 'click', '.clr-field button', function (event) {
            event.target.nextElementSibling.dispatchEvent(new Event('click', { bubbles: true }));
        });

        addListener(colorMarker, 'keydown', function (event) {
            var movements = {
                ArrowUp: [0, -1],
                ArrowDown: [0, 1],
                ArrowLeft: [-1, 0],
                ArrowRight: [1, 0] };


            if (Object.keys(movements).indexOf(event.key) !== -1) {
                moveMarkerOnKeydown.apply(void 0, movements[event.key]);
                event.preventDefault();
            }
        });

        addListener(colorArea, 'click', moveMarker);
        addListener(hueSlider, 'input', setHue);
        addListener(alphaSlider, 'input', setAlpha);
    }*/
}