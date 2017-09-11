/**
 * Created by wayky on 15/10/29.
 */
;
(function () {
    'use strict';

    angular.module('openApp')
        .factory('emojiParseService', function () {
            return {
                parse: function (text) {
                    if (typeof ioNull !== 'undefined') {
                        return ioNull.emoji.parse(text);
                    }
                    return text;
                }
            };
        })
        .factory('echartService', function () {
            return {
                barAndLine: function (id,data, jsonData) {
                    var _view = echarts.init(document.getElementById(id));
                    //如无数据则隐藏loading（读取中）
                    if(_.isArray(data) && data.length ===0){
                        _view.hideLoading();
                    }else{
                      _view.setOption(jsonData);  
                    }
                    
                }
            };
        })
        .factory('ModuleUtils', ['CacheService', function (CacheService) {
            return {
                ByType: function (type) {
                    var _modules = CacheService.getModules();
                    if (_modules) {
                        for (var i = 0; i < _modules.length; i++) {
                            if (_modules[i].moduleType === type) {
                                return _modules[i];
                            }
                        }
                    }
                }
            };
        }])
        .factory('bannerTabService', ['ModuleUtils', function (ModuleUtils) {
            return {
                init: function (_scope, moduleType, lazyInit) {
                    _scope.module = ModuleUtils.ByType(moduleType);
                    if (!_scope.module) {
                        //找不到该类型的栏目
                    }
                    _scope.bannerLazyInit = lazyInit;
                    _scope.showBanner = function () {
                        _scope.bannerLazyInit = false;
                    }
                }
            };
        }])
        .factory('auditService', ['CommRestService', function (CommRestService) {
            return {
                setDraft: function (_scope, lazyInit) {
                    _scope.draftLazyInit = lazyInit;
                    _scope.showDraftList = function () {
                        _scope.draftLazyInit = false;
                    }
                },
                setAudit: function (_scope, lazyInit) {
                    _scope.auditLazyInit = lazyInit;
                    _scope.showAuditList = function () {
                        _scope.auditLazyInit = false;
                    }
                },
                list: function (params, callback) {
                    CommRestService.post('audit/list', params, callback);
                },
                add: function (params, callback) {
                    CommRestService.post('audit/add', params, callback);
                },
                update: function (params, callback) {
                    CommRestService.post('audit/update', params, callback);
                },
                del: function (params, callback) {
                    CommRestService.post('audit/del', params, callback);
                },
                get: function (params, callback) {
                    CommRestService.post('audit/get', params, callback);
                },
                notpass: function (params, callback) {
                    CommRestService.post('audit/notpass', params, callback);
                }
            };
        }])
        .factory('TipService', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
            return {
                add: add
            };

            function add(type, msg, time) {
                $rootScope.tips = [];
                $rootScope.tips.push({
                    'type': type,
                    'msg': msg,
                    'close': function () {
                        $rootScope.tips.splice($rootScope.tips.indexOf(this), 1);
                    }
                });
                //如果设置定time的话就定时消失
                if (time) {
                    $timeout(function () {
                        $rootScope.tips = [];
                    }, time);
                }

            }

        }])
        .factory('dateTimeService', function () {
            var _every_day = 86400000;//一天的毫秒数
            return {
                getTimeUpToNow: function (num) {
                    //获取num天前的开始时间
                    var _curDate = new Date();
                    //今天凌晨的时间
                    var _today = _curDate.getTime() - ((_curDate.getHours() * 60 * 60 + (_curDate.getMinutes() * 60) + (_curDate.getSeconds())) * 1000);

                    return _today - (num * _every_day);
                }
            };
        });
})();