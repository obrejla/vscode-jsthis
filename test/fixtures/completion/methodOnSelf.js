define([
], function () {

    var MyConstructor = function () {
        var self = this;
        self.myMethodSelf = function () {
            // do something
        };
        self.myMethodSelf();
    };

    return new MyConstructor();

});