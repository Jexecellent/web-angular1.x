/**
 * Created by hxl on 2016/1/7.
 */
;(function(){
    'use strict'
    angular.module('main.log')
        .factory('logService',fLogService);

    fLogService.$inject = ['CommRestService','TipService'];
    function fLogService(CommRestService,TipService) {

        function processLogData(data) {
            var _rids = getAllRid(data);
            _service.user_list({pageNumber:1,pageSize:10,rids:_rids.join(',')},function(page_users){
                var _users = page_users.content;
                _.each(data,function(n) {
                    _.each(_users, function(u){
                        if(u.id === n.rid) {
                            n.__user_name = u.nickname;
                            return;
                        }
                    });
                });
            });
        }
        function getAllRid(data) {
            var _rids = [];
            if(data && data.length == 0) {
                return _rids;
            }
            _.each(data, function(n) {
                _rids.push(n.rid);
            });
            return _rids;
        }

        var _service = {
            processLogData:processLogData,
            list:function(params, callback, failure) {
                CommRestService.post('log/list',params, callback,failure||function(err){
                        TipService.add('error','获取操作管理列表失败:'+err.msg,3000);
                    });
            },
            user_list:function(params, callback, failure) {
                CommRestService.post('user/list',params, callback,failure||function(err){
                        TipService.add('error','获取操作员列表失败:'+err.msg,3000);
                    });
            },
            export:function(params, callback, failure) {
                CommRestService.post('log/export',params, callback,failure||function(err){
                        TipService.add('error','导出失败:'+err.msg,3000);
                    });
            }
        };
        return _service;
    }
})();
