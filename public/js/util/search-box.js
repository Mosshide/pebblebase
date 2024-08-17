// a class called Filters that can be used to filter a search box
class Filters extends Element {
    constructor(onFilterChange = null, defaults = { search: "" }, settings = {}) {
        super("div", {
            defaultClasses: "filters",
            header: "Filters",
            hidden: true,
            ...settings
        });
        this.defaults = defaults;
        this.filter = this.defaults;
        this.onFilterChange = onFilterChange;

        this.search = this.addChild(new Input("text", {
            header: "Search",
            onInput: (filter) => { this.updateFilter(filter, "search"); }
        }));
    }

    setValue = (filter, which = "search") => {
        // update the filter
        this.updateFilter(filter, which);

        // update all child filters
        let keys = Object.keys(this.filter);
        for (let i = 0; i < keys.length; i++) {
            this[keys[i]].setValue(this.filter[keys[i]]);
        }
    }

    getValue = (which = "search") => {
        if (which) return this.filter[which];
        return this.filter;
    }

    // updates a specific filter or all filters if which is not null
    updateFilter = (filter, which = null) => {
        if (which) this.filter[which] = filter;
        else this.filter = filter;

        // if it has been set, call the onFilterChange function
        if (this.onFilterChange) this.onFilterChange();
    }

    setDefaults = (defaults = this.defaults) => {
        this.filter = { ...this.defaults };
    }
}

class SearchBox extends Element {
    constructor(settings = {}) {
        super("div", {
            defaultClasses: "search-box",
            onNew: null,
            onLiClick: null,
            styles: "search-box",
            filters: "default",
            ...settings
        }); 
        
        this.browser = null;
        this.buttons = this.addChild(new Buttons());
        this.buttons.addButton(new Button("new", (e, element) => {
            this.settings.onNew();
        }, { placeholder: "New" }));
        this.buttons.addButton(new Button("toggleFilters", () => { 
            if (this.filters) this.filters.toggle(); 
        }, { placeholder: "Filters" }));

        if (this.settings.filters === "default") this.filters = this.addChild(new Filters(this.renderSearchResults));
        else this.filters = null;
        if (this.settings.filters === "none") this.buttons.hideButton("toggleFilters");

        this.list = this.addChild(new Element("ul", {
            defaultClasses: "selector"        
        }));
    }

    extractLabel = (item) => {
        let label = null;
        
        if (typeof item === "string") label = item;
        else label = item?.name || item?.username || item?.title || 
                item?.header || item?.whenSearched || item?.note || item?.text;
        if (!label) label = "Unnamed Item";

        if (typeof label !== "string") label = String(label);
        return label;
    }

    addFilters = (filters, onFilterChange) => {
        this.filters = this.addChild(new filters(onFilterChange));
    }

    setFilters = (filters) => {
        if (this.filters) this.filters.setValue(filters);
    }

    getFilters = () => {
        if (this.filters) return this.filters.getValue();
        return null;
    }

    setItems = (items, onNew = this.settings.onNew, max = -1) => {
        this.items = items;
        this.max = max;
        
        if (!Array.isArray(this.items)) this.items = [this.items];

        if (onNew && (this.max < 0 || this.items.length < this.max)) {
            this.buttons.show("new");
            this.settings.onNew = onNew;
        }
        else {
            this.buttons.hide("new");
            this.settings.onNew = null;
        }
        this.renderSearchResults();
    }

    renderSearchResults = () => {
        if (this.browser) {
            this.browser.close();
            this.browser = null;
        }
        this.list.closeChildren();

        this.filter = this.filters ? this.filters.getValue("search") : "";

        for (let i = 0; i < this.items.length; i++) {
            this.renderItem(this.items[i], i);
        };
        if (this.items.length < 1) {
            this.list.addChild(new Element("p", { 
                placeholder: "No Items"
            }));
        }

        if (this.settings.onNew && (this.max < 0 || this.items.length < this.max)) {
            this.buttons.show("new");
        }
        else {
            this.buttons.hide("new");
        }
    }

    addItem = (item = {}, newItem = false) => {
        this.items.push(item);

        if (this.settings.onNew && (this.max < 0 || this.items.length < this.max)) {
            this.buttons.show("new");
        }
        else {
            this.buttons.hide("new");
        }

        return this.renderItem(item, this.items.length - 1, newItem);
    }

    renderItem = (item, i, newItem = false) => {
        let label = this.extractLabel(item);
        if (label.toLowerCase().includes(this.filter) || newItem) {
            return this.list.addChild(new Text("li", { 
                placeholder: label,
                id: i,
                onClick: (e, element) => {
                    if (this.settings.onLiClick) this.settings.onLiClick(e, element);
                }
            }));
        }
    }
}