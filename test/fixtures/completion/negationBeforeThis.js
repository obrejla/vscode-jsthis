define([
], function () {

    var MyConstructor = function () {
        this.testProp = false;
        console.log(!this.testProp);
    };

    return new MyConstructor();

});