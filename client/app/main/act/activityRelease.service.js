;(function() {
    'use strict';

    angular.module('main.act')
        .factory('ActReleaseService', ActReleaseService);


    function ActReleaseService(CommRestService) {
        return {
            actReq: actReq
        };


        function actReq(url, param, cb, fail) {
            CommRestService.post(url, param, cb, fail);
        }

    }

    ActReleaseService.$inject = ['CommRestService'];
})();