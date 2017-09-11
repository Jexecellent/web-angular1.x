/**
 * Created by hxl on 2015/10/23.
 */
;
(function () {
    'use strict'
    angular.module('main.article')
        .factory('articleService', fArticltService)
        .filter('artPriority', fArtPriorityFilter);
    function fArticltService(CommRestService) {
        return {
            list: function (params, callback,failCallback) {
                CommRestService.post('article/list', params, callback,failCallback);
            },
            save: function (params, callback,failCallback) {
                CommRestService.post('article/add', params, callback,failCallback);
            },
            update: function (params, callback,failCallback) {
                CommRestService.post('article/update', params, callback,failCallback);
            },
            get: function (params, callback,failCallback) {
                CommRestService.post('article/get', params, callback,failCallback);
            },
            delete: function (params, callback,failCallback) {
                CommRestService.post('article/delete', params, callback,failCallback);
            },
            offline: function (params, callback,failCallback) {
                CommRestService.post('article/offline', params, callback,failCallback);
            }
        };
    }

    fArticltService.inject = ['CommRestService'];

    function fArtPriorityFilter() {
        return function (input) {
            switch (input) {
                case 0:
                    return "置顶";
                case 1:
                    return "取消置顶";
                default :
                    return "置顶";
            }
        };
    }
})();