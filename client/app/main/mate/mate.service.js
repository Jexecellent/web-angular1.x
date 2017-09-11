/**
 * Created by hxl on 2015/10/27.
 */
;(function(){
    'use strict'
    angular.module('main.mate')
        .factory('mateService', fMateService)
        .filter('mateTags', fMateTagsFilter)
        .filter('mateNum', fMateNumFilter)
        .filter('mateType', fMateTypeFilter)
        .filter('mateCost', fMateCostFilter);

    function fMateService(CommRestService) {
        return {
            list:function(_scope, params){
                CommRestService.post('mate/list', params,function(data) {
                    _scope.mates = data.content;
                    _scope.mates.forEach(function(e){
                        e.isChecked = false;
                    });
                    _scope.page = {
                        firstPage: data.firstPage,
                        lastPage: data.lastPage,
                        totalPages: data.totalPages,
                        pageNumber: data.pageNumber
                    };
                    console.log('mata list data:', data);
                }, function(err){
                    console.log('get mate list error, %j',err);
                });
            },
            save:function(params) {
                CommRestService.post('mate/add', params,function(data){
                    console.log('add mate list success, %j',data);
                }, function(err){
                    console.log('get mate list error, %j',err);
                });
            },
            offline:function(params, cb, failCb) {
                CommRestService.post('mate/offline', params,function(data){
                    console.log('del by mateId %j success.', params);
                    !!cb && cb(data);
                }, function(err) {
                    !!failCb && failCb(err);
                    console.log('del by mateId %j error, %j',params,err);
                });
            },
            get:function(_scope, params) {
                CommRestService.post('mate/get', params,function(data){
                    _scope.mate = data;
                    console.log("get mate %j",data);
                }, function(err){
                    console.log('get by mateId %j error, %j',err);
                });
            }
        };
    }

    function fMateTagsFilter() {
        return function(input){
            switch(input) {
                case 1:
                    return '聚餐';
                case 2:
                    return 'KTV';
                case 3:
                    return '户外';
                case 4:
                    return '电影';
                default :
                    return '其他';
            }
        };
    }
    function fMateNumFilter() {
        return function(input){
            switch (input) {
                case 2:
                    return '多人约伴';
                default :
                    return '两人约伴';
            }
        };
    }
    function fMateTypeFilter() {
        return function(input){
          switch (input) {
              case 1:
                  return '男女均可';
              case 2:
                  return '仅限男生';
              case 3:
                  return '仅限女生';
              default :
                  return '男女均可';
          }
        };
    }

    function fMateCostFilter() {
        return function(input) {
          switch (input) {
              case 1:
                  return '普通';
              case 2:
                  return 'AA制';
              case 3:
                  return 'TA请';
              case 4:
                  return 'TA蹭';
              default :
                  return '普通';
          }
        };
    }
})();