// a class called Element that adds functionality to a JQuery element
// Element should be used as a base class for other elements
class Element {
    constructor(elementType = "div", settings = {}) {
        this.settings = {
            defaultClasses: "",
            attributes: {},
            defaultCSS: {},
            id: null,
            src: null,
            placeholder: "",
            hidden: false,
            onClick: null,
            onInput: null,            
            onClose: null,
            header: null,
            styles: null,
            ...settings
        };
        this.type = elementType;
        this.parent = null;
        this.children = [];
        this.$div = null;
        this.value = null;
        this.enabled = true;

        if (this.settings.styles) Element.attemptStyle(this.settings.styles);
    }

    static styled = {};

    static attemptStyle(which) {
        if (!Element.styled[which]) {
            $("head").append(`<link async href='/styles/${which}.css' rel='stylesheet' />`);
            Element.styled[which] = true;
        }
    }

    // renders the element
    render() {
        // create the element
        if (!this.$div) {
            this.$div = $(`<${this.type}></${this.type}>`);
            this.initModifiers();
        }

        this.$div.empty();
        if (this.settings.header) this.$div.append(`<h4>${this.settings.header}</h4>`);

        // render the children
        this.children.forEach((child) => {
            child.render().appendTo(this.$div);
        });

        if (this.settings.hidden) this.hide();
        else this.show();

        if (this.enabled) this.enable();

        return this.$div;
    }

    initModifiers = () => {
        if (this.$div) {
            // add the attributes
            if (this.settings.attributes) {
                for (let key in this.settings.attributes) {
                    this.$div.attr(key, this.settings.attributes[key]);
                }
            }
            // add the default classes
            this.$div.removeClass();
            if (this.settings.defaultClasses) this.$div.addClass(this.settings.defaultClasses);
            // add the default css
            if (this.settings.defaultCSS) {
                for (let key in this.settings.defaultCSS) {
                    this.$div.css(key, this.settings.defaultCSS[key]);
                }
            }
            // add the id
            if (this.settings.id) this.$div.attr("id", this.settings.id);
            else this.$div.removeAttr("id");
            // add the src
            if (this.settings.src) this.$div.attr("src", this.settings.src);
        }
    }

    // adds a child to the element
    addChild = (child) => {
        this.children.push(child);
        child.setParent(this);
        child.$div.appendTo(this.$div);
        return child;
    }

    // prepends a child to the element
    preChild = (child) => {
        this.children.unshift(child);
        child.setParent(this);
        child.$div.prependTo(this.$div);
        return child;
    }

    // sets the parent of the element
    setParent = (parent) => {
        this.parent = parent;
        if (!this.$div) this.render();
    }

    // removes a child from the element and returns it
    removeChild = (child) => {
        let index = this.children.indexOf(child);
        if (index != -1) {
            this.children.splice(index, 1);
            return child;
        }

        return null;
    }

    // removes all children from the element and returns them
    closeChildren = () => {
        let children = [];

        while (this.children.length > 0) {
            children.push(this.children[0].close());
        }

        return children;
    }

    // sets the value of the element
    setValue = (value = null) => {
        this.value = value;
        this.render();
    }

    getValue = () => {
        return this.value;
    }

    // resets the value of the element
    resetValue = () => {
        this.value = this.settings.placeholder;
    }

    // hides the element
    hide = () => {
        this.settings.hidden = true;
        this.$div.addClass("invisible");
    }

    // shows the element
    show = () => {
        this.settings.hidden = false;
        this.$div.removeClass("invisible");
    }

    toggle = () => {
        if (this.settings.hidden) this.show();
        else this.hide();
    }

    // disables the element
    disable = () => {
        this.enabled = false;
        this.$div.off();
        this.$div.addClass("disabled");
    }

    // enables the element
    enable = (onClick = this.settings.onClick) => {
        this.enabled = true;
        this.$div.off();

        if (onClick) this.settings.onClick = onClick;
        if (this.settings.onClick) {
            this.$div.on("click", (e) => {
                this.settings.onClick(e, this);
                e.stopPropagation();
            });
        }

        this.$div.removeClass("disabled");
    }

    close = () => {
        this.hide();
        this.$div.remove();
        if (this.parent) this.parent.removeChild(this);
        if (this.settings.onClose) this.settings.onClose();
        return this;
    }

    // sets or gets the css of the element
    css = (style, value = null) => {
        if (this.$div) this.$div.css(style, value);
    }
}

// a class called Text that can be used to display text
class Text extends Element {
    constructor(elementType = "p", settings = {}) {
        super(elementType, {
            placeholder: "",
            ...settings
        });
    }

    // renders the element
    render = () => {
        this.$div = super.render();

        if (this.value != null) this.$div.append(this.value);
        else this.$div.append(this.settings.placeholder);

        return this.$div;
    }

    setValue = (value) => {
        if (value) {
            this.value = value.toString();
            this.value = this.value.replace(/(?:\r\n|\r|\n)/g, '<br />');
        }
        this.render();
    }
}

// a class called Alert that can be used to display alerts
class Alert extends Text {
    constructor(settings = {}) {
        super("p", {
            defaultClasses: "alert",
            hidden: true,
            ...settings
        });

        this.addChild(new Button("hide", () => { this.hide(); }, {
            defaultClasses: "hide",
            placeholder: "X"
        }));
    }
}

// a class called Input that can be used to get user input
class Input extends Element {
    constructor(inputType = "text", settings = {}) {
        super("div", {
            inputType: inputType,
            step: null,
            ...settings
        });
    }

    // renders the element
    render = () => {
        this.$div = super.render();

        this.$input = $(`<input type="${this.settings.inputType}" value="${this.value ? this.value : ""}" placeholder="${this.settings.placeholder}">`).appendTo(this.$div);

        if (this.enabled) this.enable();

        return this.$div;
    }

    setValue = (value) => {
        if (value != null) {
            if (this.$div) this.$input.val(value);
            this.value = value;
        }
    }

    getValue = () => {
        this.value = this.$input.val();
        return this.value;
    }

    enable = (onInput = this.settings.onInput) => {
        this.enabled = true;
        this.$div.off();

        if (onInput) this.settings.onInput = onInput;

        if (this.settings.onClick) {
            this.$div.on("click", (e) => {
                this.settings.onClick(e, this);
                e.stopPropagation();
            });
        }

        if (this.settings.onInput && this.$input) this.$input.on("input", (e) => { 
            return this.settings.onInput(e.currentTarget.value.toLowerCase()); 
        });

        this.$div.removeClass("disabled");
    }
}

// a class called TextArea that can be used to get user input
class TextArea extends Element {
    constructor(settings = {}) {
        super("div", settings);
    }

    // renders the element
    render = () => {
        this.$div = super.render();

        this.$input = $(`<textarea rows="8" placeholder="${this.settings.placeholder}">${this.value ? this.value : ""}</textarea>`).appendTo(this.$div);

        if (this.enabled) this.enable();
        return this.$div;
    }

    setValue = (value) => {
        if (value != null) {
            if (this.$div) this.$input.val(value);
            this.value = value;
        }
    }

    getValue = () => {
        this.value = this.$input.val();
        return this.value;
    }

    enable = (onInput = this.settings.onInput) => {
        this.enabled = true;
        this.$div.off();

        if (onInput) this.settings.onInput = onInput;
        
        if (this.settings.onClick) {
            this.$div.on("click", (e) => {
                this.settings.onClick(e, this);
                e.stopPropagation();
            });
        }

        if (this.settings.onInput && this.$input) this.$input.on("input", (e) => { 
            return this.settings.onInput(e.currentTarget.value.toLowerCase()); 
        });

        this.$div.removeClass("disabled");
    }
}

// a class called Select that can be used to get user input
class Select extends Element {
    constructor(settings = {}) {
        super("select", {
            options: [],
            ...settings
        });
    }

    // renders the element
    render = () => {
        // create the element
        if (!this.$div) {
            this.$div = $(`<select></select>`);
            this.initModifiers();
        }

        this.$div.empty();

        for (let i = 0; i < this.settings.options.length; i++) {
            $(`<option id="${i}" value="${this.settings.options[i]}">${this.settings.options[i]}</option>`).appendTo(this.$div);
            // this.addChild(new Text("option", {
            //     placeholder: this.settings.options[i]
            // }));
        }

        if (this.value) this.$div.find(`option:contains("${this.value}")`).prop('selected', true);

        if (this.settings.hidden) this.hide();
        else this.show();

        if (this.enabled) this.enable();
        return this.$div;
    }

    setValue = (which) => {
        if (which != null) {
            if (this.$div) this.$div.val(which);
            this.value = which;
        }
        else {
            if (this.$div) this.$div.val(this.settings.placeholder);
            this.value = this.settings.placeholder;
        }
    }

    getValue = () => {
        this.value = this.$div.find(`option:selected`).text();
        return this.value;
    }

    enable = (onChange = this.settings.onChange) => {
        this.enabled = true;
        this.$div.off();

        if (onChange) this.settings.onChange = onChange;
        
        if (this.settings.onClick) {
            this.$div.on("click", (e) => {
                this.settings.onClick(e, this);
                e.stopPropagation();
            });
        }

        if (this.settings.onChange) this.$div.on("change", (e) => { 
            return this.settings.onChange(e.currentTarget.value, e, this); 
        });

        this.$div.removeClass("disabled");
    }
}

// a class called CheckBox that can be used to get user input
class CheckBox extends Element {
    constructor(settings = {}) {
        super("div", {
            ...settings
        });
    }

    // renders the element
    render = () => {
        this.$div = super.render();

        // create the element
        this.$input = $(`<input type="checkbox">`).appendTo(this.$div);

        if (this.value !== null) this.$input.prop("checked", this.value);
        else if (this.settings.placeholder !== null) this.$input.prop("checked", this.settings.placeholder);
        else this.$input.prop("checked", false);

        if (this.settings.hidden) this.hide();
        else this.show();

        this.enable();

        return this.$div;
    }

    setValue = (value) => {
        if (value !== null) {
            if (this.$input) this.$input.prop("checked", value);
            this.value = value;
        } 
    }

    getValue = () => {
        this.value = this.$input.prop("checked");
        return this.value;
    }
}


// a class called Container that can be used to contain other Elements
class Container extends Element {
    constructor(settings = {}) {
        super("container", {
            defaultClasses: "container",
            ...settings
        });
    }

    // attaches the element
    render(query = null) {
        if (query) {
            this.$div = $(query);
            this.initModifiers();
        }
        
        if (this.$div) this.$div.empty();

        if (this.settings.header) this.$div.append(`<h4>${this.settings.header}</h4>`);

        // render the children
        this.children.forEach((child) => {
            child.render().appendTo(this.$div);
        });

        if (this.settings.hidden) this.hide();
        else this.show();

        if (this.settings.onClick) this.enable();

        return this.$div;
    }
}