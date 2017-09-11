/**
 * Created by wayky on 15/11/11.
 */
;(function() {
    'use strict';
    angular.module('open.service')
        .factory('ModuleService', ['CommRestService', ModuleService]);

    function ModuleService(CommRestService) {

        return {
            list: function (params, callback) {
                CommRestService.post('module/list', params, callback);
            }
        };
    }
})();