Date.isLeapYear = function (year) { 
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)); 
};

Date.getDaysInMonth = function (year, month) {
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

Date.prototype.isLeapYear = function () { 
    return Date.isLeapYear(this.getFullYear()); 
};

Date.prototype.getDaysInMonth = function () { 
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

Date.prototype.addMonths = function (value) {
    let n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
};

Date.prototype.toWithinAMonth = function () {
    let today = new Date();
    let d = this.getDate();
    this.setDate(1);
    this.setFullYear(today.getFullYear());
    if (d > today.getDate()) this.setMonth(today.getMonth());
    else this.setMonth(today.getMonth() + 1);
    this.setDate(Math.min(d, this.getDaysInMonth()));
    return this;
};

Date.prototype.toWithinAYear = function () {
    let today = new Date();
    let d = this.getDate();
    this.setDate(1);
    if (this.getMonth() >= today.getMonth()) this.setFullYear(today.getFullYear());
    else this.setFullYear(today.getFullYear() + 1);
    this.setDate(Math.min(d, this.getDaysInMonth()));
    return this;
}

Date.prototype.getDayOfTheWeek = function (mini = false) {
    if (mini) return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][this.getDay()];
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][this.getDay()];
};