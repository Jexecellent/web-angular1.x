/**
 *  open.home Module
 *
 * 主页 Description
 */
;
(function () {
    'use strict';
    var mainModule = angular.module('open.main');

    mainModule.controller('MainController', MainController);

    function MainController($rootScope, $state, $scope, CommRestService, CacheService, vcModalService, $timeout) {

        $scope.appMenuIndex = 0;
        $scope.menuList = [];
        $scope.menuRootNames = [];
        $scope.loading = false;
        $scope.ableToOrderMenu = false;

        var MAIN_APP_PERMISSION = 'main:app';

        //递归装载用户权限
        var loadPermissionsFromMenuTree = function(menuTree, permissions){

            permissions.push(menuTree.permission);

            var subMenuTree = menuTree.menuTreeList;
            if (_.isArray(subMenuTree)) {
                _.each(subMenuTree, function (_subMenuTree) {
                    //permissions.push(_permission.permission);
                    loadPermissionsFromMenuTree(_subMenuTree, permissions);
                });
            }
        };

        //初始化用户菜单
        var initMenusAndPermissions = function (cb) {
            var menus = CacheService.getMenus(), menuRoots = CacheService.getMenuRoots();
            if (menus && menuRoots) {
                $scope.menuList = menus;
                $scope.menuRootNames = menuRoots;
                var rootIndex = _.indexOf(_.pluck(menuRoots,'permission'),MAIN_APP_PERMISSION);
                if (rootIndex >= 0) {
                    $scope.appMenuIndex = rootIndex;
                }

                var appModules = CacheService.getModules();
                if (appModules && appModules.length > 0 && CacheService.hasPermission('sort:type1')) {
                    $scope.ableToOrderMenu = true;
                }

                cb(null);
            }
            else {
                menus = [];
                CommRestService.post("base/menus", {}, function (data) {
                        var usrModules = [], permissions = [], menuRoots = [];
                        _.each(data, function (d, index) {

                            var subMenus = d.menuTreeList;
                            if (_.isArray(subMenus) && subMenus.length > 0) {

                                //只取一级菜单
                                menuRoots.push({name:d.menu_name,permission:d.permission});

                                var isMainAppMenu = d.permission === MAIN_APP_PERMISSION;
                                if (isMainAppMenu) {
                                    $scope.appMenuIndex = index;
                                }

                                var usrMenus = [];
                                _.each(subMenus, function (d2) {

                                    //采集用户的权限表
                                    loadPermissionsFromMenuTree(d2, permissions);

                                    //采集用户的菜单 : 只展示type为1的菜单
                                    if (d2.type === 1) {
                                        //用一样的菜单结构，大而全
                                        var menu = {
                                            id: d2.menu_id,
                                            moduleType: d2.moduleType,
                                            moduleId: d2.moduleId,
                                            moduleName: d2.menu_name,
                                            bizType: d2.bizType,
                                            aidType: d2.aidType,
                                            sortTime: d2.sort,
                                            menu_id: d2.menu_id,
                                            icon: d2.icon,
                                            menu_name: d2.menu_name,
                                            menu_url: d2.menu_url,
                                            menu_state: d2.menu_url
                                        };

                                        //先判断moduleId
                                        var startQuoat = d2.menu_url.indexOf('\'');
                                        var endQuoat = d2.menu_url.lastIndexOf('\'');
                                        if (!!d2.menu_url && startQuoat > 0 && endQuoat > 0) {
                                            menu.moduleId = d2.menu_url.substring(++startQuoat,endQuoat);
                                        }

                                        //App内容管理
                                        if (isMainAppMenu) {
                                            //采集用户的业务模块
                                            if (d2.moduleId) {
                                                menu.menu_url = d2.menu_url + "({moduleId:" + d2.moduleId + "})"
                                            }

                                            usrModules.push(menu);
                                        }

                                        usrMenus.push(menu);
                                    }
                                });

                                //直接展示在左侧的菜单
                                menus.push(usrMenus);
                            }
                        });

                        //缓存业务模块信息
                        CacheService.setModules(usrModules);
                        if (usrModules.length > 0 && _.indexOf(permissions, 'sort:type1') != -1) {
                            $scope.ableToOrderMenu = true;
                        }

                        //缓存用户菜单信息
                        CacheService.putMenuRoots(menuRoots);
                        CacheService.putMenus(menus);
                        //缓存用户权限信息
                        CacheService.putPermissions(permissions);

                        //直接展示在左侧的菜单
                        $scope.menuRootNames = menuRoots;
                        $scope.menuList = menus;

                        cb(null);
                    },
                    function (err) {
                        //获取菜单失败
                        cb(new Error('获取菜单失败'));
                    });
            }
        };

        /*
         var initConfigs = function(cb) {
         var configs = CacheService.getConfigs();
         if (!configs) {
         CommRestService.post("base/config", {}, function(data) {
         CacheService.setConfigs(data);
         if (typeof cb === 'function'){
         cb();
         }
         });
         }else{
         if (typeof cb === 'function'){
         cb();
         }
         }
         };

         var initModuleList = function(cb) {
         var list = CacheService.getModules();
         if (!list) {
         CommRestService.post("base/modules", {}, function(data) {
         CacheService.setModules(data);
         if (typeof cb === 'function'){
         cb();
         }
         });
         }
         else{
         if (typeof cb === 'function'){
         cb();
         }
         }
         };
         */

        var intStatTips = function (cb) {
            CommRestService.post("base/statTips", {}, function (data) {
                CacheService.setStatTips(data);
                if (typeof cb === 'function') {
                    cb();
                }
            });
        };

        $scope.initMain = function () {

            if ($rootScope.VC_isOpenAuth) {
                //加载用户菜单
                $scope.loading = true;

                //增加5秒超时处理
                var initTimer = $timeout(function () {
                    $scope.loading = false;
                    $state.go('login');
                }, 5000);

                async.waterfall([
                        function (cb) {
                            initMenusAndPermissions(cb);
                        },
                        /* 不调用了
                         function(cb) {
                         initConfigs(cb);
                         },
                         function (cb) {
                         initModuleList(cb);
                         },
                        function (cb) {
                            intStatTips(cb);
                        }*/],
                    function (err, result) {
                        $timeout.cancel(initTimer);
                        initTimer = null;
                        $scope.loading = false;
                        if (err) {
                            return;
                        }

                        if (CacheService.isTokenValid()) {
                            //再跳去个人主页，避免首页为空
                            if ($state.current.name === 'main') {
                                $state.go('main.home');
                            }
                        }

                        //左侧菜单滚动条出现
                        $timeout(function(){
                            $(".vc_o_page_left .mCustomScrollbar").mCustomScrollbar();
                        });
                    }
                );
            }
        };

        $scope.checkCurrentState = function (state, moduleId) {

            if (!!state && (state === $scope.currentState || state.indexOf(store.get('curMenuState'))==0)) {
                if (!!moduleId) {
                    if (!!$scope.currentModuleId) {
                        return moduleId == $scope.currentModuleId; //可能为字符串
                    }
                    else {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };

        $rootScope.$on('$stateChangeSuccess', function (evt, toState, toParams) {
            $scope.currentState = toState.name;
            $scope.currentModuleId = toParams.moduleId;
            store.set('curMenuState', toState.name);  //记录最后一次点击的菜单，用于页面刷新时赋选中的样式
        });

        $scope.orderMenu = function () {
            //栏目排序
            vcModalService({
                backdropCancel: false,
                title: '拖动调整APP端栏目显示顺序',
                css: {
                    height: '264px',
                    width: '320px'
                },
                templateUrl: 'app/templates/common/tplAppNavList.html',
                controller: 'AppMenuController',
                retId: 'menus',
                success: {
                    label: '确认',
                    fn: $scope.saveMenuOrder
                }
            });
        };

        $scope.saveMenuOrder = function (menus) {
            var len = menus.length;
            for (var i = 0; i < len; i++) {
                var _menu = menus[i];
                if (_menu.updated) {
                    CommRestService.post('base/sort', {
                        bizId: '' + _menu.moduleId,
                        updateTime: _menu.sortTime,
                        type: 1
                    }, function (data) {
                        //console.log('sort menu with id=' + _menu.id + ' and sortTime = ' + _menu.sortTime);
                    });
                }
            }

            //直接调整本地菜单的顺序 menuList
            var usrModules = _.sortBy(menus, 'sortTime');
            //顺序翻转
            if (Array.prototype.reverse) {
                usrModules.reverse();
            }

            $scope.menuList[$scope.appMenuIndex] = usrModules;

            CacheService.setModules(usrModules);
            CacheService.putMenus($scope.menuList);
        };

    }

    MainController.$inject = ['$rootScope', '$state', '$scope', 'CommRestService', 'CacheService', 'vcModalService', '$timeout'];

    mainModule.controller('AppMenuController', ['$scope', 'CacheService', AppMenuController]);

    function AppMenuController($scope, CacheService) {
        $scope.menus = [];

        $scope.init = function () {
            $scope.menus = CacheService.getModules();
        };

        function getSortByMenuId(menuId) {
            var len = $scope.menus.length;
            if (menuId) {
                for (var i = 0; i < len; i++) {
                    var _menu = $scope.menus[i];
                    if (_menu.id === parseInt(menuId)) {
                        return _menu.sortTime || 0;
                    }
                }
            }
            return 0;
        }

        function increateSortByMenuId(menuId) {
            var len = $scope.menus.length;
            if (menuId) {
                for (var i = 0; i < len; i++) {
                    var _menu = $scope.menus[i];
                    if (_menu.id === parseInt(menuId)) {
                        _menu.sortTime += 100;
                        _menu.updated = true;
                    }
                }
            }
        }

        $scope.orderMenu = function (cur, prev, next) {
            var len = $scope.menus.length;
            var _preSort = getSortByMenuId(prev);
            var _nextSort = getSortByMenuId(next);
            //新sort取pre和next : sort[pre > cur > next]
            if (_preSort != 0 && _preSort == _nextSort) {
                increateSortByMenuId(prev);
                _preSort += 100;
            }
            var _newSort = _preSort == 0 ? Date.now() : _preSort - (_nextSort == 0 ? 10 : Math.ceil(((_preSort - _nextSort) / 2)));

            for (var i = 0; i < len; i++) {
                var _menu = $scope.menus[i];
                if (_menu.id == cur) {
                    _menu.sortTime = _newSort;
                    _menu.updated = true;
                }
            }
        }
    }

})();