/**
 * Created by wayky on 15/10/26.
 */
;(function() {
    'use strict';
    angular.module('open.service')
        .factory('CacheService', ['$rootScope', '$cookies', CacheService]);

    function CacheService($rootScope, $cookies) {
        return {
            putObject: function (k, v) {
                store.set(k, v);
            },
            getObject: function (k) {
                return store.get(k);
            },
            removeObject: function (k) {
                store.remove(k);
            },

            putToken: function (_token) {
                store.set('token', {
                    token: _token,
                    expireIn: Date.now() + 7200 * 1000
                });
            },

            getToken: function () {
                var _token = store.get('token');
                if (_token) {
                    return _token.token;
                }

                var openToken = $cookies.get('open-user');
                if (openToken) {
                    this.putToken(openToken);
                    return openToken;
                }

                return '';
            },

            isTokenValid: function () {
                var _token = store.get('token');
                if (_token) {
                    if (_token.token && _token.expireIn) {
                        return Date.now() < _token.expireIn;
                    }
                }
                return false;
            },

            putPermissions: function (permissions) {
                store.set('permissions', permissions);
            },

            getPermissions: function () {
                return store.get('permissions');
            },

            /**
             * 判断用户有无权限
             * @param permission 单权限名，也可以是数组
             * @returns {boolean}
             */
            hasPermission: function (permission) {
                var myPermissions = this.getPermissions();
                if (_.isArray(permission)) {
                    var ret = false;
                    _.each(permission, function (p) {
                        if (_.indexOf(myPermissions, p) > -1) {
                            ret = true;
                            return false;
                        }
                    });
                    return ret;
                }

                return _.contains(myPermissions, permission);
            },

            putMenus: function (menus) {
                store.set('menus', menus);
            },

            getMenus: function () {
                return store.get('menus');
            },

            putMenuRoots: function (menuRoots) {
                store.set('menuRoots', menuRoots);
            },

            getMenuRoots: function () {
                return store.get('menuRoots');
            },

            setConfigs: function (configs) {
                store.set('open_configs', configs);
            },

            getConfigs: function (type) {
                var configs = store.get('open_configs');
                if (configs) {
                    return !!type ? configs[type] : configs;
                }
                return null;
            },

            setModules: function (modules) {
                store.set('open_modules', modules);
            },

            getModules: function () {
                return store.get('open_modules');
            },

            getModelByType: function (moduleType) {
                return _.findWhere(this.getModules(), {moduleType: moduleType});
            },

            getModelById: function (moduleId) {
                return _.findWhere(this.getModules(), {moduleId: moduleId});
            },

            setStatTips: function (stattips) {
                store.set('open_stattips', stattips);
            },

            getStatTips: function () {
                return store.get('open_stattips');
            },

            clear: function () {
                $rootScope.currentUserName = null;
                $cookies.remove('open_user');
                store.clear();
            }
        };
    }
})();