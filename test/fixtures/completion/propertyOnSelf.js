define([
], function () {

    var MyConstructor = function () {
        var self = this;
        self.testPropertySelf = 'property value';
    };

    return new MyConstructor();

});