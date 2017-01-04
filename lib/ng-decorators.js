/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
// Utils functions
function pascalCaseToCamelCase(str) {
    return str.charAt(0).toLowerCase() + str.substring(1);
}

function dashCaseToCamelCase(string) {
    return string.replace(/-([a-z])/ig, function (all, letter) {
        return letter.toUpperCase();
    });
}
// End of utils functions

let app;
function init(angularApp) {
    app = angularApp;
}

function Run() {
    return function decorator(target, key, descriptor) {
        app.run(descriptor.value);
    };
}

function Config() {
    return function decorator(target, key, descriptor) {
        app.config(descriptor.value);
    };
}

function Service(options) {
    return function decorator(target) {
        options = options ? options : {};
        if (!options.serviceName) {
            throw new Error('@Service() must contains serviceName property!');
        }
        app.service(options.serviceName, target);
    };
}

function Filter(filter) {
    return function decorator(target, key, descriptor) {
        filter = filter ? filter : {};
        if (!filter.filterName) {
            throw new Error('@Filter() must contains filterName property!');
        }
        app.filter(filter.filterName, descriptor.value);
    };
}

function Inject(...dependencies) {
    return function decorator(target, key, descriptor) {
        // if it's true then we injecting dependencies into function and not Class constructor
        if (descriptor) {
            const fn = descriptor.value;
            fn.$inject = dependencies;
        } else {
            target.$inject = dependencies;
        }
    };
}

function Component(component) {
    return function decorator(target) {
        if (!component.selector) {
            throw new Error('@Component() must contains selector property!');
        }

        component.selector = pascalCaseToCamelCase(component.selector);
        component.selector = dashCaseToCamelCase(component.selector);

        app.component(component.selector, Object.assign({ controller: target, controllerAs: 'vm' }, component));
    };
}

function Directive(options) {
    return function decorator(target) {
        const directiveName = dashCaseToCamelCase(options.selector);
        app.directive(directiveName, target.directiveFactory);
    };
}

function RouteConfig(options) {
    return function decorator() {
        app.config(['$stateProvider', ($stateProvider) => {
            if (options.component) {
                options.component = pascalCaseToCamelCase(options.component);
                options.component = dashCaseToCamelCase(options.component);
            }
            $stateProvider.state(options);
        }]);
    };
}

export { Component, RouteConfig, Inject, Run, Config, Service, Filter, Directive, init };
