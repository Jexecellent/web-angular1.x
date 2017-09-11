/**
 * Created by wayky on 15/11/9.
 */
;
(function () {

    'use strict';

    var app = angular.module('openApp');

    app.directive('vcTabs', vcTabsDirective);
    app.directive('vcTabHead', vcTabHeadDirective);
    app.directive('vcTabBody', vcTabBodyDirective);

    function vcTabsDirective() {
        return {
            scope: true,
            restrict: 'A',
            controller: vcTabsController,
            link: function (scope, element, attributes) {
                //默认选中的Tab
                var defaultIndex = parseInt(attributes.vcTabs);
                if (defaultIndex > 0) {
                    scope.activeTab.index = defaultIndex;
                }
                //自定义的tabId
                scope.tabsId = attributes.id || 'vcRootTab_' + Math.ceil(Math.random()*100);
            }
        };
    }

    function vcTabsController($scope, $rootScope, $timeout, $q, $http, $templateCache, $compile, $controller, vcTabsBroadcastKey) {

        $scope.activeTab = {
            activeType: 0,
            lastTab: null,
            index: 1,
            tag: '',
            query: null
        };

        $scope.$on("$destory", function () {
            $scope.loadedTabs.clear();
            var parentScopeId = $scope.$parent.$id;
            _.each($scope.subTabScopes, function (scope) {
                if (scope.$id != parentScopeId) {
                    scope.$destroy();
                    scope = null;
                }
            });
            $scope.subTabScopes.clear();
            $scope.tagIndex.clear();
            //todo:清理mCustomScoll
        });

        //通知打开父级Tab
        $scope.openTabIfHasParent = function(vcTabInfo) {
            if ($scope.activeTab.activeType == 1) {
                //broadcast方式来的才处理
                var _parent = vcTabInfo.parent;
                do {
                    if (!!_parent) {
                        //console.log('$rootScope.$broadcast parent');
                        $rootScope.$broadcast(vcTabsBroadcastKey, {
                            next: '$INDEX$_' + _parent.index,
                            content: {},
                            root: _parent.root
                        });
                        _parent = _parent.parent;
                    }
                }
                while (!!_parent);
            }
        };

        //已加载的tabs管理
        $scope.loadedTabs = [];
        $scope.isTabLoaded = function (tag) {
            return _.contains($scope.loadedTabs, tag);
        };
        $scope.setLoadedTab = function (tag) {
            var subScope = this.getSubTabScope(tag);
            //打开父级Tab
            this.openTabIfHasParent(subScope.$vcTabInfo);

            if (_.isFunction(subScope.vcTabOnload)) {
                subScope.vcTabOnload.call(subScope, this.activeTab.query, this.activeTab.lastTab);
            }
            _.contains($scope.loadedTabs, tag) || $scope.loadedTabs.push(tag);
        };

        $scope.subTabScopes = {};
        $scope.getSubTabScope = function (tag) {
            return $scope.subTabScopes[tag];
        };
        $scope.putSubTabScope = function (tag, scope) {
            //注入当前的tabInfo
            scope.$vcTabInfo = {index: $scope.activeTab.index, tag: $scope.activeTab.tag, root: $scope.tabsId};

            //关键：父级tab信息
            if (!_.isUndefined(scope.$parent.$vcTabInfo)){
                scope.$vcTabInfo.parent = scope.$parent.$vcTabInfo;
            }
            //关键：注入当前的$dirty值 : 默认为true 需要tab自行重载数据
            scope.$dirty = true;

            //关键：注入更新调整滚动区域的方法
            scope.$vcUpdateTabScroller = function(){
                $scope.updateTabScroll(scope.$vcTabInfo.tag);
            };

            $scope.subTabScopes[tag] = scope;
        };

        $scope.tagIndex = {};
        $scope.getIndex = function(tag){
            return this.tagIndex[tag] || -1;
        };
        $scope.setIndex = function(tag, index){
            this.tagIndex[tag] = index;
        };

        //vcTabs 广播接收中心
        //根据消息里的rootTabsId过滤
        //从CommTabService里取子Tab寄存的消息内容
        $scope.$on(vcTabsBroadcastKey, function (event, msg) {
            if (_.isPlainObject(msg) && msg.root === $scope.tabsId) {
                event.preventDefault();
                if (!!msg.next) {
                    var index = 1;
                    if (msg.next.indexOf('$INDEX$_') == 0) {
                        index = parseInt(msg.next.replace('$INDEX$_',''));
                    }
                    else if (msg.next.indexOf('$TAG$_') == 0) {
                        index = $scope.getIndex(msg.next.replace('$TAG$_',''));
                    }

                    if (index > 0) {
                        $scope.activeTab.activeType = 1;

                        if ($scope.activeTab.index == index) {
                            //目标Tab已打开的
                            var _scope = $scope.getSubTabScope($scope.activeTab.tag);

                            $scope.openTabIfHasParent(_scope.$vcTabInfo);
                            //也要让其执行onTabOnload方法
                            if (_.isFunction(_scope.vcTabOnload)) {
                                //vcAlert(JSON.stringify(subScope.$vcTabInfo) + ' vcTabOnload called and $scope.$dirty is ' + subScope.$dirty);
                                _scope.vcTabOnload.call(_scope, msg.content, msg.from);
                            }
                            return;
                        }

                        $scope.activeTab.index = index;
                        $scope.activeTab.lastTab  = msg.from;   //用于返回
                        $scope.activeTab.query = msg.content;

                        if(!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }
                }
                else if (!!msg.dirty && _.isArray(msg.dirty)){
                    _.each(msg.dirty, function(tag){
                        var _scope = $scope.getSubTabScope(tag);
                        if (!!_scope) {
                            _scope.$dirty = true;
                            if (msg.reload){
                                _scope.vcTabOnload.call(_scope, {}, msg.from);
                            }
                        }
                    });
                }
            }
        });

        this.tabIndex = 0;
        this.incTabHeadIndex = function (tag) {
            this.tabIndex++;
            $scope.setIndex(tag, this.tabIndex);
            return this.tabIndex;
        };

        this.loadTplHtml = function (tplUrl) {
            var html = $templateCache.get(tplUrl);
            if (!html) {
                var deferred = $q.defer();
                $http.get(tplUrl).success(function (data) {
                    deferred.resolve(data);
                });
                html = deferred.promise;
            }
            return html;
        };

        this.saveTemplateCache = function (tplUrl, html) {
            $templateCache.put(tplUrl, html);
        };

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

        this.compileTpl = function (tag, ctrl, passedInLocals, html, element) {
            //这是子Tab的scope
            var _scope = $scope.$new();
            var $ctrl = $controller(ctrl, {$scope: _scope});

            //angular.extend(_scope, passedInLocals);
            extendDeep(_scope, passedInLocals);

            $scope.putSubTabScope(tag, _scope);
            var tabEl = angular.element(html);

            tabEl.contents().data('$ngControllerController', $ctrl);

            //angular-ueditor 指令需要在$compile渲染好dom
            element.empty();
            element.append(tabEl);

            $compile(tabEl)(_scope);
        };

        //no index 支持
        this.noIndex = [];
        this.addNoIndex = function (index) {
            this.noIndex.push(index);
        };
        this.isNoIndex = function (index) {
            return _.contains(this.noIndex, index);
        };

        var getSiblingDom = function (barDom, selector) {
            var doms = barDom.siblings(selector);
            return doms.length > 0 ? $(doms[0]) : null;
        };

        var getChildDomHeight = function (barDom, selector) {
            //取回所有的tools，隐藏的高度为0，显示的有高度
            var doms = barDom.find(selector), ret = 0;
            if (doms.length > 0) {
                _.each(doms, function(dom){
                    if ($(dom).height() > 0) {
                        ret = $(dom).outerHeight();
                        return false;
                    }
                })
            }
            return ret;
        };

        var updateCustomScroll = function(tabBodyElement, updateType){
            $timeout(function(){
                //调整cnt_box的高度
                var sh= 0, th=0, ph = 0;
                var cntBox = tabBodyElement.find('.cnt_box');
                if (cntBox.length == 0) {
                    cntBox = tabBodyElement.closest('.cnt_box');
                }
                if (cntBox.length == 1) {
                    var stateDom = getSiblingDom(cntBox, ".state");
                    sh = stateDom !== null ? stateDom.outerHeight() : 0;

                    th = getChildDomHeight(cntBox, ".tool");

                    if (sh == 0 && th == 0) {
                        cntBox.css({
                            "margin-top": 10,
                            "padding-top": 0
                        });
                    }
                    else {
                        var cntBoxCss = {};
                        if (sh == 0) {
                            cntBoxCss = {
                                "margin-top": -th,
                                "padding-top": th
                            };
                        }
                        else {
                            cntBoxCss = {
                                "padding-top": sh + th,
                                "margin-top": -(sh + th)
                            };
                        }

                        if (th > 0) {
                            var fixTh = getChildDomHeight(cntBox, ".fixedTool");
                            if (fixTh > 0) {
                                //fixTool
                                if (stateDom) {
                                    //含state栏
                                    stateDom.css({"margin-top": fixTh});
                                }
                                else {
                                    cntBoxCss = {"padding-top": fixTh};
                                }
                            }
                        }
                        else {
                            if (stateDom) {
                                //含state栏
                                stateDom.css({"margin-top": '10px'});
                            }
                        }

                        cntBox.css(cntBoxCss);
                    }

                    //判断分页，如无则要去除cnt_YPaging样式
                    ph = getChildDomHeight(cntBox, ".paging ul");
                    if (ph < 30) {
                        cntBox.removeClass('cnt_Ypaging');
                    }
                    else {
                        cntBox.addClass('cnt_Ypaging');
                    }
                }

                //调整其子节点的mCustomScrollbar的高度
                var scrollBars = tabBodyElement.find('.mCustomScrollbar');
                if (scrollBars.length == 0) {
                    scrollBars = tabBodyElement.closest('.mCustomScrollbar');
                }
                if (scrollBars.length > 0) {
                    _.each(scrollBars, function (_scrollBar) {
                        var scrollBar = $(_scrollBar);
                        //启用滚动
                        if (scrollBar.length > 0) {
                            if (!!updateType && updateType === 'update') {
                                scrollBar.mCustomScrollbar(updateType);
                            }
                            else {
                                scrollBar.mCustomScrollbar();
                            }
                            //$timeout(function(){
                            //    scrollBar.mCustomScrollbar("scrollTo", "top");
                            //},0);
                        }
                    });
                }
            }, 300);
        };

        //mCustomScroll支持
        this.mCustomScroll = function (tabBodyElement) {
            updateCustomScroll(tabBodyElement);
        };

        $scope.updateTabScroll = function(tag){
            var tabBodyElement = angular.element("div#" + $scope.tabsId).find("div[tag='" + tag + "']");
            updateCustomScroll(tabBodyElement, 'update');
        };
    }

    vcTabsController.$inject = ['$scope', '$rootScope', '$timeout', '$q', '$http', '$templateCache', '$compile', '$controller', 'vcTabsBroadcastKey'];

    function vcTabHeadDirective() {
        return {
            restrict: 'A',
            require: '^vcTabs',
            scope: false,
            link: function (scope, element, attributes, controller) {

                //当前tab的标识
                var tag = attributes.tag;
                //当前tab的索引
                var index = controller.incTabHeadIndex(tag);

                if (!_.isUndefined(attributes.noIndex)) {
                    controller.addNoIndex(index);
                    element.hide();
                }
                else {
                    element.bind('click', function () {
                        scope.activeTab.activeType = 0;
                        scope.activeTab.index = index;
                        scope.activeTab.query  = null;
                        scope.$$phase || scope.$apply();
                    });
                }

                scope.$watch('activeTab.index', function (newVal, oldVal, scope) {
                    if (!controller.isNoIndex(scope.activeTab.index)) {
                        element.toggleClass('current', scope.activeTab.index === index);
                    }

                    if (oldVal === index) {
                        //旧的Tab
                        var oldTabScope = scope.getSubTabScope(scope.activeTab.tag);
                        if (oldTabScope && _.isFunction(oldTabScope.vcTabOnUnload)) {
                            oldTabScope.vcTabOnUnload.call(oldTabScope);
                        }
                    }

                    if (newVal === index) {
                        //新的Tab
                        scope.activeTab.tag = tag;
                    }
                });

            }
        };
    }

    function vcTabBodyDirective() {
        return {
            scope: false,
            restrict: 'A',
            require: '^vcTabs',
            replace: true,
            link: function (scope, element, attributes, controller) {
                var tag = attributes.tag;
                var ctrl = attributes.ctrl, tplUrl = attributes.tplUrl, tplHtml = '';
                var locals = attributes.locals;
                var localsValue = locals ? scope.$eval(locals) : null;

                scope.$watch('activeTab.tag', function () {
                    element.toggleClass('hidden', scope.activeTab.tag !== tag);
                    if (scope.activeTab.tag === tag) {
                        //检查是否已经加载过
                        var loaded = false;
                        if (ctrl && tplUrl) {
                            loaded = scope.isTabLoaded(tag);
                            if (!loaded) {
                                tplHtml = controller.loadTplHtml(tplUrl);
                            }
                        }

                        if (!loaded) {
                            //检查是否是内置页面：不含ctrl和tplUrl
                            if (ctrl && tplHtml) {
                                if (typeof tplHtml.then === "function") {
                                    tplHtml.then(function (html) {
                                        controller.saveTemplateCache(tplUrl, html);

                                        controller.compileTpl(tag, ctrl, localsValue, html, element);

                                        //scope.activeTab.loaded = false;
                                        scope.setLoadedTab(tag);

                                        controller.mCustomScroll(element);
                                    });
                                }
                                else {
                                    if (_.isArray(tplHtml) && tplHtml.length == 4) {
                                        tplHtml = tplHtml[1];
                                    }

                                    controller.compileTpl(tag, ctrl, localsValue, tplHtml, element);

                                    //scope.activeTab.loaded = false;
                                    scope.setLoadedTab(tag);

                                    controller.mCustomScroll(element);
                                }
                            }
                            else {
                                scope.putSubTabScope(tag, scope.$parent);
                                //scope.activeTab.loaded = true;
                                scope.setLoadedTab(tag);
                                controller.mCustomScroll(element);
                            }
                        }
                        else {
                            var subScope = scope.getSubTabScope(tag);
                            if (subScope){
                                //打开父级Tab
                                scope.openTabIfHasParent(subScope.$vcTabInfo);

                                if (_.isFunction(subScope.vcTabOnload)){
                                    //传入2个参数：query是消息条件 lastTab是来自上一个tab的$vcTabInfo
                                    //vcAlert(JSON.stringify(subScope.$vcTabInfo) + ' vcTabOnload called and $scope.$dirty is ' + subScope.$dirty);
                                    subScope.vcTabOnload.call(subScope, scope.activeTab.query, scope.activeTab.lastTab);
                                }
                            }

                            controller.mCustomScroll(element);
                        }
                    }
                });

                //fix height
                element.css('height', '100%');
            }
        };
    }

})();