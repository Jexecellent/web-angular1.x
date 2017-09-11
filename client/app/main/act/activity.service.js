/**
 * Created by hxl on 2015/10/19.
 */
;
(function () {
    'use strict'

    angular.module('main.act')
        .factory('activityListService', fActivityListService)
        .factory('clickList', fListClick)
        .factory('actionActivity', factionActivity);

    function fActivityListService(CommRestService,vcModalService,CacheService,TipService) {
        var _baseData = {};
        _baseData.search_text = ['当前筛选条件:'];
        _baseData._act_sub_type = [{name:'全部',opt:false,val:0},{name:'普通活动',opt:false,val:1},
            {name:'周期活动',opt:false,val:2},{name:'赛事',opt:false,val:3}];

        _baseData._type = [{name:'全部',opt:false,val:0},{name:'户外',opt:false,val:1},
            {name:'休闲',opt:false,val:2},{name:'骑行',opt:false,val:3},{name:'自驾',opt:false,val:4},
            {name:'摄影',opt:false,val:5},{name:'亲子',opt:false,val:6}];

        _baseData._union_type = [{name:'全部',opt:false,val:0},{name:'拼车',opt:false,val:1},
            {name:'返点',opt:false,val:2}];

        _baseData._levels = [{name:'全部',opt:false,val:-1},{name:'无难度',opt:false,val:1},
            {name:'初级难度',opt:false,val:2},{name:'中级难度',opt:false,val:3},{name:'自虐型',opt:false,val:4}];

        _baseData._search_date = [{name:'全部',opt:false,val:null},{name:'今天',opt:false,val:0},
            {name:'一天前',opt:false,val:1},{name:'三天以上',opt:false,val:3}];
        return {
            list:function (params, callback){
                params._$random = new Date().getTime();
                CommRestService.post('activity/getActivityList', params, callback, function(err){
                    TipService.add('error','获取活动列表失败',3000);
                });
            },
            tagEvent:function(curTag, data_array){
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
            },
            findDataById:function(data, id) {
                if(!data) {
                    return null;
                }
                var i;
                for(i in data) {
                    if(data[i].id == id) {
                        return data[i];
                    }
                }
            },
            validateUnion:function(params) {
                if(!params) {
                    return false;
                }
                var _cur_time = new Date().getTime();
                if(params.consultInfo.length === 0) {
                    window.vcAlert('缺少咨询人员');
                    return false;
                }
                for(var sub in params.assembleInfo) {
                    if(!params.assembleInfo[sub].address) {
                        window.vcAlert('缺少集合地地点');
                        return false;
                    }
                    if(!params.assembleInfo[sub].time) {
                        window.vcAlert('缺少集合时间');
                        return false;
                    }else if(_cur_time > (moment(params.assembleInfo[sub].time)._d.getTime())) {
                        window.vcAlert('集合时间不能小于当前时间');
                        return false;
                    }
                    if(!params.assembleInfo[sub].leaders.length) {
                        window.vcAlert('缺少集合地领队');
                        return false;
                    }
                }
                for(var sub in params.assembleInfo){
                    if(params.assembleInfo[sub].time.length > 6) {//非周期活动
                        params.assembleInfo[sub].time = moment(params.assembleInfo[sub].time)._d.getTime();
                    }else {
                        //周期活动默认加上今天日期
                        params.assembleInfo[sub].time = moment(moment(_cur_time).format("YYYY-MM-DD")+" "+params.assembleInfo[sub].time)._d.getTime();
                    }
                }
                return true;
            },
            sort:function(id, update_time,callback) {
                CommRestService.post('base/sort',{bizId:id,updateTime:update_time,type:4},callback,function(err){
                    TipService.add('error','排序功能出错',3000);
                });
            },
            offline:function(params, callback){
                CommRestService.post('activity/offline', params, callback, function(err) {
                    TipService.add('error','',3000);
                });
            },
            unionList:function(params, callback) {
                CommRestService.post('activity/union_list', params, callback,function(err){
                    TipService.add('error', '获取联盟列表失败', 3000);
                });
            },
            addUnion:function(params, callback,failure) {
                CommRestService.post('activity/union_add', params, callback,failure);
            },
            cancelUnion:function(params, callback){
                CommRestService.post('activity/union_cancel', params, callback, function(err) {
                    TipService.add('error','取消联盟失败', 3000);
                });
            },
            enterUnion:function(params, callback,failure) {
                CommRestService.post('activity/union_enter', params, callback, failure);
            },
            joinOrCancelUnion:function(act,unionOpt,unUnion, opt) {//opt = 2 是修改发出的联盟信息
                var _union_params = {
                    retId:'params',
                    backdropCancel: false,
                    title: '加入联盟',
                    css: {height: '315px',width: '400px'},
                    templateUrl: 'app/templates/activity/join_cancel_union_activity.html',controller: 'joinCancelUnionActivityController',
                    success: {label: '确定',fn: unionOpt}
                };
                if(act.unionState === 0 || act.unionState === 2 || (opt&&opt ===2) || act.unionState === 5) {//未联盟
                    if(act.isNeedCheck === 1) {
                        vcModalService({title:'提示',template:'<p style="text-align: center;">报名需要审核，不能加入联盟</p>'});
                        return;
                    }
                    if(act.subType === 1 || act.subType === 2) {
                        vcModalService(_union_params,{
                            activity:act,
                            opt:opt
                        });
                    }else if(act.subType === 3) {
                        _union_params.css = {height: '415px',width: '400px'};
                        _union_params.templateUrl = 'app/templates/activity/join_cancel_union_contest_activity.html';
                        _union_params.controller = 'joinCancelUnionContestActivityController';
                        vcModalService(_union_params,{
                            activity:act,
                            opt:opt
                        });
                    }
                }else if(act.unionState === 1){//已发出联盟，触发取消
                    vcModalService({
                        title: '退出联盟',
                        template: "<p style='text-align: center;'>您确认退出此活动的联盟吗？</p>",
                        success:{label:'确认',fn:unUnion}
                    });
                }else if(act.unionState === 3) {
                    vcModalService({
                        title: '退出联盟',
                        template: "<p style='text-align: center;'>您确认退出此活动的联盟吗？</p>",
                        success:{label:'确认',fn:unUnion}
                    });
                }
            },
            validateAddUion:function(opt,_cur_activity) {
                if(!opt.unionType) {
                    window.vcAlert('请选择联盟类型');
                    return false;
                }
                var _opt = {unionType:opt.unionType};
                var _unionInfo = {};
                if(opt.unionType === 1) {//返点
                    if(!opt.group) {
                        //普通和周期活动
                        if(!opt.repay || parseFloat(opt.repay) < 0) {
                            window.vcAlert('必须要有返利');
                            return false;
                        }
                        _unionInfo.repay = opt.repay;
                        if(!validateNumber()) {
                            return false;
                        }
                    }else {
                        //赛事活动
                        var obj = {};//
                        var _number = {};
                        var _enjoin = JSON.parse(_cur_activity.unionJoinNum);
                        for(var g in opt.group) {
                            if(_.isNumber(opt.group[g]._number) && parseInt(opt.group[g]._number) < 1){
                                window.vcAlert('名额人数必须是正整数');
                                return false;
                            }
                            if(!opt.group[g].repay) {//如果没有输入返利
                                window.vcAlert('必须要有返利');
                                return false;
                            }
                            var _name = opt.group[g].name;
                            var _val  = opt.group[g].repay;
                            obj[_name] = _val;
                            _number[_name] = opt.group[g]._number||opt.group[g].number;//没填人数，默认
                            _number[_name] = parseInt(_number[_name]);
                            //如果是再次加入联盟，验证人数不能少于以前联盟到的人数
                            if(!_.isEmpty && parseInt(_enjoin[_name] > _number[_name])) {
                                window.vcAlert(_name+'最少人数不能少于'+_enjoin[_name]);
                                return false;
                            }
                        }
                        _unionInfo.groupRepay = JSON.stringify(obj);
                        _unionInfo.groupNumber = JSON.stringify(_number);
                    }
                }else if(opt.unionType === 2){//拼车
                    _unionInfo.repay = null;
                    if(!opt.group) {//非赛事活动
                        if(!validateNumber()) {
                            return false;
                        }
                    }else {
                        var _enjoin = JSON.parse(_cur_activity.unionJoinNum);
                        var _number = {};
                        for(var g in opt.group) {
                            var _name = opt.group[g].name;
                            if(_.isNumber(opt.group[g]._number) && parseInt(opt.group[g]._number) < 1){
                                window.vcAlert('名额人数必须是正整数');
                                return false;
                            }
                            _number[_name] = opt.group[g]._number||opt.group[g].number;//没填人数，默认
                            //如果是再次加入联盟，验证人数不能少于以前联盟到的人数
                            if(!_.isEmpty && parseInt(_enjoin[_name] > _number[_name])) {
                                window.vcAlert(_name+'最少人数不能少于'+_enjoin[_name]);
                                return false;
                            }
                        }
                        _unionInfo.groupNumber = JSON.stringify(_number);
                    }
                }else {
                    return false;
                }
                //验证普通和周期活动人数
                function validateNumber() {
                    if(_.isNumber(opt.number) && parseInt(opt.number) < 1) {
                        window.vcAlert('名额人数必须是正整数');
                        return false;
                    }
                    _unionInfo.number = opt.number||_cur_activity.number;
                    _unionInfo.number = parseInt(_unionInfo.number);
                    if(_unionInfo.number > _cur_activity.number) {
                        window.vcAlert('名额人数不能大于活动人数');
                        return false;
                    }
                    if(_cur_activity.unionJoinNum && parseInt(_cur_activity.unionJoinNum) > _unionInfo.number) {
                        window.vcAlert('名额人数不能小于已联盟活动人数');
                        return false;
                    }
                    return true;
                }
                if(opt.time) {//联盟截止时间
                    _unionInfo.time = moment(opt.time)._d.getTime() + (82800000);
                    if(_unionInfo.time > _cur_activity.registEndTime && 2 != _cur_activity.subType) {//非周期活动
                        _unionInfo.time = _cur_activity.registEndTime;
                    }
                }else if(_cur_activity.subType === 2){//未填截止时间,且是周期活动
                    window.vcAlert('周期活动联盟需要明确截止日期');
                    return false;
                }else {
                    _unionInfo.time = _cur_activity.registEndTime;
                }
                _opt.activityId = _cur_activity.id;
                if(_cur_activity.unionState === 2) {
                    _opt.opType = 2;//取消后再次加入
                }else if(_cur_activity.unionState === 5) {
                    _opt.opType = 2;//截止后再次加入
                }else {
                    _opt.opType = 1;//加入
                }
                var _cur_interest = CacheService.getObject('current_user');
                if(_cur_interest) {
                    _unionInfo.iid = _cur_interest.iid;
                    _unionInfo.iname = _cur_interest.iname;
                }else {
                    return false;
                }
                _opt.unionInfo = JSON.stringify(_unionInfo);
                return _opt;
            },
            parseUser:function(json) {
                var _array = [];
                _.each(json,function(n){
                    if(n.name) {
                        _array.push(n);
                    }else {
                        _array.push({
                            uid: n.uid,name: n.nickname,imgPath: n.imgPath,sex: n.sex,phone: n.loginName,id: n.id
                        });
                    }
                });
                return _array;
            },
            updateTopByUpdateTime:function(activity, updateTime) {
                if(updateTime > new Date().getTime()) {
                    activity.isTop = 1;
                }else {
                    activity.isTop = 0;
                }
            },
            tabsCtrl:function() {
                function back() {

                }
                return {
                    from: {},
                    tag : {},
                    back: back
                };
            },
            refresh:function(data, fun) {
                if(!data) {
                    fun.call(null,0);
                    return;
                }
                if(_.isArray(data) && data.length < 1) {
                    fun.call(null,-1);
                }else {
                    fun.call(null,0);
                }
            },
            baseData:_baseData
        };
    };
    fActivityListService.$inject = ['CommRestService','vcModalService','CacheService','TipService'];
    function fListClick() {
        return {
            click:function ($scope, activity) {
                $scope.activitys.forEach(function(e){
                    if(e.id === activity.id) {
                        if(e.bg_color === 'checked') {
                            e.bg_color = "";
                        }else {
                            e.bg_color = "checked";
                        }
                    }else {
                        e.bg_color = "";
                    }
                });
            }
        };
    };
    function factionActivity(CommRestService) {
        return {
            save:function(_activity) {
                CommRestService.post('activity/add',_activity,function(data){
                    return 1;
                });
            },
            get:function(actId, cb){
                CommRestService.post('activity/get',{activityId:actId}, cb);
            }
        };
    };
})();