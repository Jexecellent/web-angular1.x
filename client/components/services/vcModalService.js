/**
 * Created by wayky on 15/11/4.
 */
;
(function () {

    'use strict';

    var app = angular.module('openApp');

    app.factory('vcModalService', ["$document", "$compile", "$rootScope", "$controller", "$timeout", '$q', '$http', '$templateCache',
        function ($document, $compile, $rootScope, $controller, $timeout, $q, $http, $templateCache) {
            var defaults = {
                id: null,
                retId: '$selectedValue',
                template: null,
                templateUrl: null,
                title: '提示',
                backdrop: true,
                success: {
                    label: '确定',
                    fn: null
                },
                cancel: {
                    label: '取消',
                    fn: null
                },
                controller: null, //just like route controller declaration
                backdropClass: "o_pop",
                backdropCancel: false,
                footerTemplate: null,
                removeFooter: false,
                modalClass: "m_pop",
                css: {
                    height: '200px',
                    width: '400px'
                }
            };
            var body = $document.find('body');

            return function vcModal(templateUrl /*optional*/, options, passedInLocals) {

                // Handle arguments if optional template isn't provided.
                if (angular.isObject(templateUrl)) {
                    passedInLocals = options;
                    options = templateUrl;
                } else {
                    options.templateUrl = templateUrl;
                }

                options = angular.extend({}, defaults, options); //options defined in constructor

                //隐藏底部按钮时 o_pop_content 要加上class padding_b_n
                var fix_padding_clz = options.removeFooter ? "padding_b_n" : "";

                var modalBody = (function () {
                    if (options.template) {
                        if (angular.isString(options.template)) {
                            // Simple string template
                            return '<div class="o_pop_content ' + fix_padding_clz + '"><div class="mCustomScrollbar">' + options.template + '</div><div class="o_loading" ng-show="loading"></div></div>';
                        } else {
                            // jQuery/JQlite wrapped object
                            return '<div class="o_pop_content ' + fix_padding_clz + '"><div class="mCustomScrollbar">' + options.template.html() + '</div><div class="o_loading" ng-show="loading"></div></div>';
                        }
                    } else {
                        // Template url with controller : wayky
                        //return '<div class="o_pop_content mCustomScrollbar" ng-include="\'' + options.templateUrl + '\'" ' + (options.controller ? 'ng-controller="' + options.controller + '"' : '') + '></div>'
                        var html = $templateCache.get(options.templateUrl);
                        if (!html) {
                            var deferred = $q.defer();
                            $http.get(options.templateUrl).success(function (data) {
                                deferred.resolve(data);
                            });
                            html = deferred.promise;
                        } else {
                            if (_.isArray(html) && html.length == 4) {
                                html = html[1];
                            }
                            if(!angular.element(html).hasClass("o_pop_content")) {
                                html = '<div class="o_pop_content ' + fix_padding_clz + '"><div class="mCustomScrollbar">' + html + '</div><div class="o_loading" ng-show="loading"></div></div>';
                            }
                        }
                        return html;
                    }
                })();

                //fix
                if (typeof modalBody.then === "function") {
                    //异步获取到的页面
                    modalBody.then(function (html) {
                        html = '<div class="o_pop_content ' + fix_padding_clz + '"><div class="mCustomScrollbar">' + html + '</div><div class="o_loading" ng-show="loading"></div></div>';
                        $templateCache.put(options.templateUrl, html);
                        handlePage(html);
                    });
                } else {
                    handlePage(modalBody);
                }

                function handlePage(modalBody) {
                    var key;
                    var idAttr = options.id ? ' id="' + options.id + '" ' : '';

                    var defaultFooter = '<a class="cancel" ng-click="$modalCancel()">{{$modalCancelLabel}}</a>' +
                        '<a class="confirm" ng-click="$modalSuccess()">{{$modalSuccessLabel}}</a>';

                    var footerTemplate = options.removeFooter ? '' : '<div class="o_pop_foot">' +
                    (options.footerTemplate || defaultFooter) +
                    '</div>';

                    var modalEl = angular.element(
                        '<section class="' + options.modalClass + '"' + idAttr + ' style="display: block;">' +
                        '<p class="close" ng-click="$modalClose()"><i class="icon_close_2"></i></p>' +
                        '<div class="o_pop_title"><h3>{{$title}}</h3></div>' +
                        modalBody +
                        footerTemplate +
                        '</section>');

                    for (key in options.css) {
                        modalEl.css(key, options.css[key]);
                    }

                    var divHTML = "<article";
                    if (options.backdropCancel) {
                        divHTML += ' ng-click="$modalClose($event)"';
                    }
                    divHTML += ">";
                    var backdropEl = angular.element(divHTML);
                    backdropEl.addClass(options.backdropClass);
                    //backdropEl.addClass('fade in');

                    var handleEscPressed = function (event) {
                        if (event.keyCode === 27) {
                            //scope.$modalCancel();
                            scope.$modalClose();
                        }
                    };

                    var closeFn = function (e) {
                        body.unbind('keydown', handleEscPressed);
                        if (e) {
                            if (angular.element(e.target).hasClass('o_pop')) {
                                backdropEl.remove();
                            }
                        } else {
                            backdropEl.remove();
                        }
                    };

                    body.bind('keydown', handleEscPressed);

                    var ctrl, locals;
                    var scope = null;
                    if (options.scope) {
                        scope = options.scope.$new();
                    } else {
                        scope = $rootScope.$new();
                    }

                    scope.$title = options.title;
                    scope.$modalClose = closeFn;
                    scope.$modalCancel = function () {
                        var callFn = options.cancel.fn || closeFn;
                        var ret = true;
                        if (options.controller) {
                            //fixed by wayky
                            ret = callFn.call(this, this[options.retId]);
                        } else {
                            callFn.call(this);
                        }

                        if (ret || typeof ret === "undefined") {
                            scope.$modalClose();
                            scope.$destroy();
                            scope = null;
                        }
                    };
                    scope.$modalSuccess = function () {
                        var callFn = options.success.fn || closeFn;
                        var ret = true;
                        if (options.controller) {
                            //fixed by wayky
                            ret = callFn.call(this, this[options.retId]);
                        } else {
                            callFn.call(this);
                        }

                        if (ret || typeof ret === "undefined") {
                            scope.$modalClose();
                            scope.$destroy();
                            scope = null;
                        }
                    };
                    scope.$modalSuccessLabel = options.success.label;
                    scope.$modalCancelLabel = options.cancel.label;

                    var extendDeep = function (dst) {
                        angular.forEach(arguments, function (obj) {
                            if (obj !== dst) {
                                angular.forEach(obj, function (value, key) {
                                    if (angular.isObject(dst[key]) || angular.isArray(dst[key])) {
                                        extendDeep(dst[key], value);
                                    } else {
                                        dst[key] = angular.copy(value);
                                    }
                                });
                            }
                        });
                        return dst;
                    };

                    if (options.controller) {
                        //使用另一种方式
                        //locals = angular.extend({$scope: scope}, passedInLocals);
                        //ctrl = $controller(options.controller, locals);

                        //angular.extend(scope, passedInLocals);
                        extendDeep(scope, passedInLocals);
                        ctrl = $controller(options.controller, {
                            $scope: scope
                        });

                        // Yes, ngControllerController is not a typo
                        modalEl.contents().data('$ngControllerController', ctrl);
                    }

                    $compile(modalEl)(scope);
                    $compile(backdropEl)(scope);

                    //body.append(modalEl);
                    backdropEl.append(modalEl);

                    //if (options.backdrop)
                    body.append(backdropEl);

                    //供外部页面高度调整后更新mCustomScrollbar
                    scope.updateScroll = function(){
                        modalEl.find(".mCustomScrollbar").mCustomScrollbar('update');
                        console.log('vcModalScroll update!');
                    };

                    //简单处理
                    $timeout(function () {
                        //利用mCustomScrollbar的回调特性，抛弃infinite-scroll
                        modalEl.find(".mCustomScrollbar").mCustomScrollbar({
                            callbacks: {
                                onTotalScroll: function () {
                                    if (_.isFunction(scope.getData)) {
                                        scope.getData.call(this);
                                        scope.$$phase || scope.$apply();
                                    }
                                }
                            }
                        });
                    }, (options.controller ? 500 : 0));
                }
            };
        }
    ]);

})();