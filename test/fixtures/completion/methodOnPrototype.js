define([
], function () {

    var MyConstructor = function () {
        this.myField = 'fld';
    };

    MyConstructor.prototype.myPrMethod = function () {
        // do something
    };

    return new MyConstructor();

});