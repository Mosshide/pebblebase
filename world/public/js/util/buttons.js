class Button extends Text {
    constructor(id, onClick = null, settings = {}) {
        super("button", {
            id: id,
            onClick: onClick,
            placeholder: "=",
            ...settings
        });
    }
}

class Buttons extends Element {
    constructor(settings = {}) {
        super("div", {
            defaultClasses: "buttons",
            isTabs: false,
            styles: "buttons",
            ...settings
        });

        this.buttons = {};
    }

    addButton = (button) => {
        this.buttons[button.settings.id] = button;
        this.addChild(button);
        return button;
    }

    hideButton = (which = null) => {
        if (which) this.buttons[which].hide();
        else {
            let keys = Object.keys(this.buttons);

            for (let i = 0; i < keys.length; i++) {
                this.buttons[keys[i]].hide();
            }
        }
    }

    showButton = (which) => {
        if (which) this.buttons[which].show();
        else {
            let keys = Object.keys(this.buttons);

            for (let i = 0; i < keys.length; i++) {
                this.buttons[keys[i]].show();
            }
        }
    }

    enableButton = (which, onClick = null) => {
        if (which) this.buttons[which].enable(onClick);
        else {
            let keys = Object.keys(this.buttons);

            for (let i = 0; i < keys.length; i++) {
                this.buttons[keys[i]].enable(onClick);
            }
        }
    }

    disableButton = (which) => {
        if (which) this.buttons[which].disable();
        else {
            let keys = Object.keys(this.buttons);

            for (let i = 0; i < keys.length; i++) {
                this.buttons[keys[i]].disable();
            }
        }
    }

    removeChild(child) {
        super.removeChild(child);
        delete this.buttons[child.settings.id];
    }
}