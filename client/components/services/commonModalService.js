/**
 * Created by hxl on 2015/10/29.
 */
;
(function () {
    'use strict'
    angular.module('openApp')
        .factory('commonModalService', fComModalService);

    /**
     * ng-template处理service
     * @param $animate
     * @param $compile
     * @param $rootScope
     * @param $controller
     * @param $q
     * @param $http
     * @param $templateCache
     * @param $document
     * @param modalConfig
     * @returns {Function}
     */
    function fComModalService($timeout, $compile, $rootScope, $controller, $q, $http, $templateCache, $document) {

        return function modalFactory(config) {
            if (!(!config.template ^ !config.templateUrl)) {
                throw new Error('请输入要引用的模板!');
            }
            var controller = config.controller || null,
                controllerAs = config.controllerAs,
                container = config.container || 'body',
                //root = angular.element($document[0].querySelector('html')),
                element = null,
                html,
                scope;
            //加载模板
            if (config.template) {
                html = $q.when(config.template);
            } else {
                html = $http.get(config.templateUrl, {cache: $templateCache})
                    .then(function (response) {
                        return response.data;
                    });
            }
            //显示
            function activate(locals,css) {
                return html.then(function (html) {

                    if (!element) {
                        attach(html, locals,css);
                    }else {
                        deactivate();
                        attach(html, locals,css);
                    }
                });
            }

            function attach(html, locals,css) {
                element = angular.element(html);//解析成dom
                if (element.length === 0) {
                    throw new Error("模板内容不能为空");
                }
                if(css) {
                    element.css(css);
                }
                scope = $rootScope.$new();//为模板创建作用域
                if (controller) {
                    if (!locals) {
                        locals = {};
                    }
                    for (var prop in locals) {
                        scope[prop] = locals[prop];
                    }
                    var ctrl = $controller(controller, {$scope: scope});
                    if (controllerAs) {
                        scope[controllerAs] = ctrl;
                    }
                } else if (locals) {
                    for (var prop in locals) {
                        scope[prop] = locals[prop];
                    }
                }
                $compile(element)(scope);//编译模板
                //container.attr();
                return angular.element(container).append(element);
                //return $animate.enter(element, container);//显示模板
            }

            function deactivate() {
                if (!element) {
                    return $q.when();
                }
                //$animate.leave(element).then(function () {
                //
                //});
                //angular.element(container).remove(element[0]);
                scope.$destroy();
                scope = null;
                element.remove();
                element = null;
            }

            return {
                activate: activate,
                deactivate: deactivate
            };
        };
    }

    fComModalService.$inject = ['$timeout', '$compile', '$rootScope', '$controller', '$q', '$http', '$templateCache', '$document'];
})();