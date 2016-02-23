define([
], function () {

    var MyConstructor = function () {
        this.myMethod = function () {
            // do something
        };
        this.myMethod();
    };

    return new MyConstructor();

});