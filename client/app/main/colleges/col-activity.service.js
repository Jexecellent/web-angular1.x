/**
 * Created by hxl on 2015/12/22.
 */
;(function(){
    'use strict'
    angular.module('main.college')
        .factory('colActivityServices',fColActivityServices);

    /**
     * 高校活动services
     * @param CommRestService
     * @param vcModalService
     * @param CacheService
     * @param TipService
     */
    function fColActivityServices(CommRestService,vcModalService,CacheService,TipService) {
        var _opType = {
            EDIT    :   1,
            AUDIT   :   2,
            DRAFT   :   3,
            OFFLINE :   4
        };
        /****release****/
        var _ueditor_instance = "col_activity_ueditor_instance";
        var release_base_data = {
            payTypeList:[{id: 1, name: '免费'}, /*{id: 2, name: '线上收定金'}
                , {id: 3, name: '线上收全款'},*/ {id: 4, name: '线下收全款'}],
            actiTypeList:[{
                id: -1, name: '选择活动所属分类'
            }, {id: 1, name: '户外'}, {id: 2, name: '休闲'
            }, {id: 3, name: '骑行'}, {id: 4, name: '自驾'
            }, {id: 5, name: '摄影'}, {id: 6, name: '亲子'}],
            start_date_conf:{'realDateFmt':'yyyy-MM-dd','realTimeFmt':'HH:mm','startDate':'%y-%M-{%d+7} %H:%m'}
        };
        /***release end****/
        var _init_list_params  = {pageSize:10, pageNumber:1,status:1};//分页状态,不可共享
        var _init_offline_params  = {pageSize:10, pageNumber:1,status:2};//分页状态,不可共享
        var _init_query_params = {};//查询状态，可共享
        var _col_activity_list_url      = "college/list";
        var _col_activity_save_url      = "college/add";
        var _col_activity_update_url    = "college/update";
        var _col_activity_get_url       = "college/get";
        var _col_activity_offline_url   = "college/offline";
        var _col_activity_join_list_url = "college/join_list";
        var _col_activity_join_export_url="college/join_export";
        var _permission = {
            add     :   CacheService.hasPermission('activitycollege:add'),
            update  :   CacheService.hasPermission('activitycollege:update'),
            offline :   CacheService.hasPermission('activitycollege:offline'),
            join    :   CacheService.hasPermission('activitycollege:joinlist')
        };
        var _baseData = {};
        _baseData.search_text = ['当前筛选条件:'];
        _baseData._type = [{name:'全部',opt:false,val:0},{name:'户外',opt:false,val:1},
            {name:'休闲',opt:false,val:2},{name:'骑行',opt:false,val:3},{name:'自驾',opt:false,val:4},
            {name:'摄影',opt:false,val:5},{name:'亲子',opt:false,val:6}];
        _baseData._search_date = [{name:'全部',opt:false,val:null},{name:'今天',opt:false,val:0},
            {name:'一天前',opt:false,val:1},{name:'三天以上',opt:false,val:3}];
        function findDataById(data,id) {
            if(!data || !id) {
                return null;
            }
            for(var i in data) {
                if(data[i].id == id) {
                    return data[i];
                }
            }
        }
        return {
            opType:_opType,
            ueditor_instance:_ueditor_instance,
            releaseBaseData:release_base_data,
            permission : _permission,
            list_params: _init_list_params,
            offline_params: _init_offline_params,
            query_params:_init_query_params,
            list_query_data_init:_baseData,
            getListQueryParams:function() {
                for(var p in _init_query_params) {
                    if(_init_query_params.hasOwnProperty(p)) {
                        _init_list_params[p] = _init_query_params[p];
                    }
                }
                return _init_list_params;
            },
            getOfflineQueryParams:function(){
                /*
                for(var p in _init_query_params) {
                    if(_init_query_params.hasOwnProperty(p)) {
                        _init_offline_params[p] = _init_query_params[p];
                    }
                }
                */
                return _init_offline_params;
            },
            init:function(activity) {
                if(!activity) {
                    return;
                }
                activity.subType        = 1;
                activity.level          = 0;
                activity.isNeedCheck    = 0;
                activity.isNeedIdCode   = 0;
                activity.consultInfo    = [];
                activity.payType        = 1;
                activity.registNotice   = '1.活动的费用请在活动现场交付领队。2.报名后如无法参加活动，请在活动开始前联系领队。';
                activity.poster         = '';
                activity.activityType   = 1;
            },
            list:function(params, callback, failure) {
                CommRestService.post(_col_activity_list_url, params, callback, failure||function(err){
                        TipService.add('error','获取活动列表失败:'+err.msg,3000);
                });
            },
            save:function(params, callback, failure) {
                CommRestService.post(_col_activity_save_url, params, callback, failure||function(err){
                        TipService.add('error','保存活动失败:'+err.msg,3000);
                });
            },
            update:function(params, callback, failure) {
                CommRestService.post(_col_activity_update_url, params, callback, failure||function(err){
                        TipService.add('error','更新活动失败:'+err.msg,3000);
                });
            },
            get:function (params, callback, failure) {
                CommRestService.post(_col_activity_get_url, params, callback, failure||function(err){
                        TipService.add('error','获取活动失败:'+err.msg,3000);
                });
            },
            offline:function(params, callback, failure) {
                CommRestService.post(_col_activity_offline_url, params, callback, failure||function(err){
                        TipService.add('error','下线活动失败:'+err.msg,3000);
                });
            },
            joinList:function(params, callback, failure) {
                CommRestService.post(_col_activity_join_list_url, params, callback, failure||function(err) {
                    TipService.add('error','获取名单列表失败:'+err.msg,3000);
                });
            },
            onlineRefresh:function(data,callback){
                if(!data) {
                    _init_list_params.pageNumber = 1;
                }
                if(_.isArray(data) && data.length <= 1){
                    _init_list_params.pageNumber = (_init_list_params.pageNumber-1)>0 ? (_init_list_params.pageNumber-1) : 1;
                }
                callback.call(this)
            },
            sort:function(id,update_time,callback,failure) {
                CommRestService.post('base/sort',{bizId:id,updateTime:update_time,type:8},callback,failure||function(err){
                    TipService.add('error','排序功能出错'+err,3000);
                });
            },
            calculateUpdateTime:function(cur, prev, next, data) {
                //var cur_act = findDataById(data, cur);
                var prev_act = null;
                var next_act = null;
                //上下都有
                if(prev && next) {
                    prev_act = findDataById(data, prev);
                    next_act = findDataById(data, next);
                    var _curTime = new Date().getTime();
                    if(prev_act && prev_act.updateTime) {
                        var _update_time = null;
                        if(next_act.updateTime == prev_act.updateTime) {

                        }else if(prev_act.updateTime > _curTime && next_act.updateTime < _curTime) {
                            //如果前面一条是置顶，后面一条不是置顶，则
                            _update_time = _curTime - 50;//显示在所有未置顶的第一条
                        }else {
                            var _mid = (prev_act.updateTime - next_act.updateTime)/2;
                            _update_time = next_act.updateTime + parseInt(_mid);
                            if(_update_time === next_act.updateTime) {
                                //如果计算出的中间值为0
                            }
                        }
                        return _update_time;
                    }
                }
                //只有下一条
                if(next) {
                    next_act = findDataById(data, next);
                    if(next_act && next_act.updateTime) {
                        return next_act.updateTime+50;
                    }
                }
                //只有上一条
                if(prev) {
                    prev_act = findDataById(data, prev);
                    if(prev_act && prev_act.updateTime) {
                        return prev_act.updateTime-50;
                    }
                }
            },
            exportJoin:function(params,callback,failure) {
                CommRestService.post(_col_activity_join_export_url, params,callback,failure||function(){
                    TipService.add('error','导出名单列表失败',3000);
                });
            },
            tagEvent:function(curTag, data_array) {
                if(curTag.opt) {
                    curTag.opt = false;
                    return null;
                }else {
                    var l;
                    for(l in data_array) {
                        data_array[l].opt = false;
                    }
                    curTag.opt = true;
                    return curTag;
                }
            },
            searchTextShow:function(add_or_remove, title, val,array) {
                var i = null,
                    _exists=false,
                    _value = title+':'+val,
                    _show = '';
                if(add_or_remove === 'add') {
                    for(i in array) {
                        if(-1 != array[i].indexOf(title)) {
                            _exists = true;
                            array[i] = _value;
                        }
                    }
                    if(!_exists) {
                        array.push(_value);
                    }
                }else {
                    var _index = null;
                    for(i in array) {
                        if(-1 != array[i].indexOf(title)) {
                            _index = i;
                        }
                    }
                    if(_index) {
                        array.splice(_index,1);
                    }
                }
                if(array.length > 1) {
                    _show = array.join(' ');
                }else {
                    _show = '';
                }
                return _show;
            }
        };
    }
    fColActivityServices.$inject = ['CommRestService','vcModalService','CacheService','TipService'];
})();