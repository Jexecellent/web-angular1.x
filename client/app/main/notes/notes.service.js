;(function () {
    'use strict';

    angular.module('main.notes')
        .factory('NotesService', NotesService);


    function NotesService(CommRestService) {
        return {
            req: req,
            findDataById: findDataById
        };


        function req(url, param, cb) {
            CommRestService.post(url, param, cb);
        }

        function findDataById(data, id) {
            if (!data) {
                return null;
            }

            var i;
            for (i in data) {
                if (data[i].id === parseInt(id)) {
                    return data[i];
                }
            }
        }
    }

    NotesService.$inject = ['CommRestService'];
})();