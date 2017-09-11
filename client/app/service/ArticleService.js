/**
 * Created by wayky on 15/11/5.
 */
;(function() {
    'use strict';
    angular.module('open.service')
        .factory('ArticleService', ['CommRestService', ArticleService]);

    function ArticleService(CommRestService) {

        return {
            list: function (params, callback) {
                CommRestService.post('article/list', params, callback);
            },
            save: function (params) {
                CommRestService.post('article/add', params, callback);
            },
            update: function (params, callback) {
                CommRestService.post('article/update', params, callback);
            },
            get: function (params, callback) {
                CommRestService.post('article/get', params, callback);
            },
            offline: function (params, callback) {
                CommRestService.post('article/offline', params, callback);
            }
        };
    }
})();