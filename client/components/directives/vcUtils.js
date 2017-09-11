/**
 * Varicom 通用Directives
 * Created by wayky on 15/10/26.
 */
;
(function () {

    //'use strict'; //日期选择控件WdatePicker不支持严格模式

    var app = angular.module('openApp');
    //datepicker
    app.directive('vcDatePicker', vcDatePicker);
    //下拉选项
    app.directive('vcDropDownList', vcDropDownList);
    //带权限验证的按钮
    app.directive('vcPermissionButton', vcPermissionButton);
    //自动搜索
    app.directive('vcSearch', ['$timeout', vcSearch]);

    app.directive('openFormFocus', openFormFocus);
    app.directive('openKeyDown', openKeyDown);

    //字符串转数字的类型转换,可用于input中,示例如:发布活动表单中
    app.directive('strToNum', strToNum);
    //颜色选择器
    app.directive('jscolorDir', fJsColor);

    //循环完成后触发事件
    app.directive('repeatDone', function() {
        return {
            link: function(scope, element, attrs) {
                if (scope.$last) {
                    scope.$eval(attrs.repeatDone);
                }
            }
        }
    });

    function vcDatePicker() {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                dateFmt: '@',  //具体日期格式
                isShowWeek: '@',  //是否显示周
                minDate: '@',  //最小时间,
                otherConf: '='
            },
            link: function (scope, element, attr, ngModel) {

                element.val(ngModel.$viewValue);

                function oncleared(){//清除
                    ngModel.$setViewValue(null);
                }

                function onpicking(dp) {
                    var date = dp.cal.getNewDateStr();
                    scope.$apply(function () {
                        ngModel.$setViewValue(date);
                    });
                }

                element.off('click').on('click', function () {
                    var _params = {
                        el: element[0],
                        onpicking: onpicking,
                        oncleared: oncleared,
                        dateFmt: (scope.dateFmt || 'yyyy-MM-dd'),
                        isShowWeek: (scope.isShowWeek || false),
                        readOnly: true,
                        autoUpdateOnChanged:true
                    };
                    if (scope.minDate) {
                        _params.minDate = (scope.minDate || '%y-%M-%d');
                    }
                    if (scope.otherConf) {
                        for (var i in scope.otherConf) {
                            _params[i] = scope.otherConf[i];
                        }
                    }
                    //先隐藏日期选择框
                    if($dp.hide) {
                        $dp.hide();
                    }
                    //注意：传入el参数配置非常重要
                    WdatePicker(_params);
                });
            }
        };
    }

    function vcDropDownList(CommRestService) {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                value: '=',
                /*ng-model*/
                selectList: '=',
                /*列表静态数据*/
                selectName: '@',
                /*select元素的name*/
                selectUrl: '@',
                /*列表动态获取数据的url*/
                id: '@',
                /*遍历的id，后台参数*/
                dis: '@', /*遍历的页面显示值*/
                onChange:'=',
                defaultShow : '@'  //是否需要多加一列 如全部

            },
            template: '<select ng-model="value" ng-change="change()" ng-options="option.id as option.name for option in selectList"></select>',
            link: function(scope) {

                if (!angular.isUndefined(scope.selectList)) {
                    convertList(scope.selectList);
                }
                if (!angular.isUndefined(scope.selectUrl)) {
                    CommRestService.post(scope.selectUrl, {
                        pageSize: 5,
                        pageNumber: 1
                    }, function(result) {
                        if (_.isArray(result.content)) {
                            convertList(result.content);
                        }
                    }, function(reason) {
                        return reason;
                    });
                }

                //匹配出指定需要的遍历id,name
                function convertList(list) {
                    //不传设置默认值
                    if (angular.isUndefined(scope.id)) {
                        scope.id = 'id';
                    }
                    if (angular.isUndefined(scope.dis)) {
                        scope.dis = 'name';
                    }

                    var ret = [];
                    if (!_.isUndefined(scope.defaultShow)) {
                        ret.push({id:0, name:scope.defaultShow});
                        scope.value = 0;  //默认选中
                    }

                    _.each(list, function(re) {
                        ret.push({
                            id: re[scope.id],
                            name: re[scope.dis]
                        });
                    });

                    scope.selectList = ret;
                }
                scope.change = function(){
                    if(angular.isFunction(scope.onChange)){
                        scope.onChange.call(this,{value:scope.value});
                    }
                };
            }

        };
    }

    function vcPermissionButton(CacheService) {
        return {
            restrict: 'A',
            scope: {
                needPermission: '@',
                needWatch: '@'
            },
            link: function (scope, element, attr) {
                var handlePermissionButton = function () {
                    var permission = scope.needPermission;
                    if (permission && permission.indexOf(',') != -1) {
                        permission = permission.split(',');
                    }
                    if (!CacheService.hasPermission(permission)) {
                        element.addClass('ng-hide');
                    }
                    else {
                        element.removeClass('ng-hide');
                    }
                };

                if (scope.needWatch === "yes") {
                    scope.$watch('needPermission', handlePermissionButton);
                }
                else {
                    handlePermissionButton();
                }
            }
        };
    }

    function openFormFocus() {
        var FOCUS_CLASS = "open-focused";
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                ctrl.$focused = false;
                element.bind('focus', function (evt) {
                    element.addClass(FOCUS_CLASS);
                    scope.$apply(function () {
                        ctrl.$focused = true;
                    });
                }).bind('blur', function (evt) {
                    element.removeClass(FOCUS_CLASS);
                    scope.$apply(function () {
                        ctrl.$focused = false;
                    });
                });
            }
        };
    }

    function openKeyDown() {
        return {
            restrict: "A",
            link: function (scope, element, attr) {
                element.bind('keyup', function (event) {
                    if (event.which === 13) {
                        scope.$apply(function () {
                            scope.searchByTitle();
                        });
                        event.preventDefault();
                    }
                });
            }
        };
    }

    function strToNum() {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function (value) {
                    return parseFloat(value);
                });
            }
        };
    }

    function vcSearch($timeout) {
        return {
            restrict: 'EA',
            scope: {
                vcChange: "&",
                vcModel: '=',
                placeholder:'@'
            },
            replace: true,
            template: '<div class="search_box"><i class="icon_search" ng-click="vcChange()"></i><input type="text" ng-model="vcModel" placeholder="{{placeholder}}"></div>',
            link: function (scope, element) {
                if(angular.isUndefined(scope.placeholder)){
                    scope.placeholder='请输入关键字';
                }
                var timeout;
                scope.$watch('vcModel', function (newValue, oldValue) {
                    //默认不触发加载数据
                    if(!newValue && !oldValue){
                        return ;
                    }
                    //console.log("vcModel newValue="+newValue+", oldValue="+oldValue);

                    if (timeout) {
                        $timeout.cancel(timeout);
                    }
                    timeout = $timeout(function () {
                        scope.vcChange();
                    }, 500);
                });

                scope.$on("$destroy", function(){
                    if (timeout) {
                        $timeout.cancel(timeout);
                        timeout = null;
                    }
                });
            }
        };
    }

    function fJsColor() {
        return {
            restrict: 'EA',
            require:'?ngModel',
            link:function(scope, ele, attrs, ngCtrl) {
                var picker = new jscolor(ele[0]);
                scope.picker = picker;
                picker.onFineChange = function() {
                    var _this = this;
                    if (!scope.$$phase) {
                        scope.$apply(function() {
                            ngCtrl.$setViewValue(_this.toHEXString());
                        });
                    }
                    angular.element(".jscolor-active").empty();
                }
                angular.element(ele).empty();
            }
        };
    }

})();