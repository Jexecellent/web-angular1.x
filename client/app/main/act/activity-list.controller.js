/**
 *  open.home Module
 *
 * 主页 Description
 */

;(function() {
    'use strict';
    angular.module('main.act')
        .controller('ActivityDetailController', ActivityDetailController)
        .controller('ActivityListController',ActivityListController)
        .controller('joinCancelUnionActivityController', fJoinCancelUnionActivityController)
        .controller('joinCancelUnionContestActivityController',fJoinCancelUnionContestActivityController)
        .controller('modifyJoinUnionActivityController',fModifyJoinUnionActivityController)
    ;

    /**
     * 活动详情ctrl
     * @param $scope
     * @param CacheService
     * @param actionActivity
     * @param activityListService
     * @constructor
     */
    function ActivityDetailController($scope,$state,CacheService,actionActivity,dateTimeService,activityJoinListLayoutService,
                                      cycleActivityJoinListLayoutService,contestActivityJoinListLayoutService,activityListService,
                                      vcModalService,CommTabService,TipService) {

        $scope._cur_act_detail = null;

        $scope.lastTabIndex = 1;

        $scope.offlinePerminssion = CacheService.hasPermission('activity:offline');
        $scope.joinlistPerminssion = CacheService.hasPermission('activity:joinlist');

        $scope.vcTabOnload = function(data, fromIndex) {

            $scope.lastTabIndex = fromIndex;
            //每次进入都重新加载
            if ($("#act_preview_ifram").length == 0){
                //load iframe
                $("#preview_div").html('<iframe id="act_preview_ifram" width="100%" height="100%"></iframe>');
            }

            if (data && data.actId) {
                var actId = data.actId;
                getActivityInfo(actId);
            }
            try {
                var _height = angular.element(".act_tab_body").children().first().height();
                angular.element(".act_detail_body").css({'height':_height});
            }catch(err){}
        };

        function getActivityInfo(actId) {
            //根据活动ID拉取
            actionActivity.get(actId, function(actInfo){
                $scope._cur_act_detail = actInfo;
                if(actInfo.activityInfo && actInfo.activityInfo.unionInfo){//联盟信息
                    $scope._cur_act_union = JSON.parse(actInfo.activityInfo.unionInfo);
                }else {
                    $scope._cur_act_union = null;
                }
                if(actInfo.activityInfo && actInfo.activityInfo.consultInfo) {
                    $scope._cur_act_consults = JSON.parse(actInfo.activityInfo.consultInfo);
                }else {
                    $scope._cur_act_consults = null;
                }
                $scope._cur_act_union_type = '拼车';
                if($scope._cur_act_detail.activityInfo.unionType === 1) {
                    $scope._cur_act_union_type = '返点';
                }
                CacheService.putObject('preview_activity', actInfo.activityInfo);

                var previewUrl = '/assets/preview/activity/index.html?r=' + Math.random();
                $("#act_preview_ifram").attr('src', previewUrl);
            });
        }

        //活动详情返回
        $scope.goBackFromDetail = function(){
            //CacheService.removeObject('preview_activity');
            //CommTabService.next($scope.$vcTabInfo, $scope.lastTabIndex, {});
            CommTabService.next($scope.$vcTabInfo, 'online', {},['online']);
        };

        /**
         * 报名列表
         */
        $scope.activityJoin = function(act) {
            if(!act) {
                act = $scope._cur_act_detail.activityInfo;
            }
            //var _curTime = new Date().getTime();
            //var z_index = _curTime - dateTimeService.getTimeUpToNow(0);
            if(act.subType === 1) {
                activityJoinListLayoutService.activate({activity_id:act.id,activity:act}/*,{'z-index':z_index,'top':'44px'}*/);
            }else if(act.subType === 2) {
                cycleActivityJoinListLayoutService.activate({activity_id:act.id,subTags:act.subTags,activity:act}/*,
                    {'z-index':z_index,'top':'44px'}*/);
            }else if(act.subType ===3) {
                contestActivityJoinListLayoutService.activate({activity_id:act.id,eventGroupInfo:act.eventGroupInfo,activity:act}/*,
                    {'z-index':z_index,'top':'44px'}*/);
            }
        }
        /**
         * 加入，退出，修改联盟信息
         * @param opt
         */
        $scope.switchUnion = function(opt) {
            if($scope._cur_act_detail.activityInfo.activityStatus !== 1) {
                TipService.add('error','活动已报名截止',3000);
                return ;
            }
            activityListService.joinOrCancelUnion($scope._cur_act_detail.activityInfo,unionOpt,unUnion,opt);
        }
        /**
         * 确认取消联盟
         */
        function unUnion() {
            activityListService.cancelUnion({activityId:$scope._cur_act_detail.activityInfo.id},function(data){
                try {
                    var _resp = JSON.parse(data);
                    if(_resp.tips) {
                        vcModalService({
                            title: '提示',
                            template: "<p style='text-align: center;'>"+_resp.tips+"</p>"
                        });
                        unUnion_after();
                    }else if(_resp.managers) {
                        var _html = [];
                        for(var e in _resp.managers) {
                            _html.push("<p style='text-align: center;'>"+_resp.managers[e]+"</p>");
                        }
                        vcModalService({
                            title: '请联系一下社团停止联盟',
                            template: _html.join("")
                        });
                    }else {
                        unUnion_after();
                    }
                }catch(err){}
            },function(err){
                TipService.add('error','取消联盟失败:'+err.msg,3000);
            });
        }
        //取消联盟请求，后台返回后的处理
        function unUnion_after() {
            if($scope._cur_act_detail.activityInfo.unionState === 3) {
                //联盟来的活动，退出后直接下线
                CommTabService.next($scope.$vcTabInfo, 'online', {},['online']);
            }else {
                $scope._cur_act_detail.activityInfo.unionState = 2;//发出联盟取消
                getActivityInfo($scope._cur_act_detail.activityInfo.id);
            }
        }
        /**
         * 添加/修改联盟确定
         * @param opt
         * @returns {boolean}
         */
        function unionOpt(opt) {
            var _opt = activityListService.validateAddUion(opt,$scope._cur_act_detail.activityInfo);
            if(opt && opt.opt ===2) {
                _opt.opType = 3;//修改联盟信息
            }
            if(_opt) {
                activityListService.addUnion(_opt,function(data) {
                    $scope._cur_act_detail.activityInfo.unionState = 1;
                    getActivityInfo($scope._cur_act_detail.activityInfo.id);
                    //CommTabService.next($scope.$vcTabInfo,'online',{},['online']);
                    CommTabService.dirty($scope.$vcTabInfo,'online',true);
                },function(err) {
                    TipService.add('error','加入/修改联盟失败:'+err.msg,3000);
                });
                return true;
            }
            return false;
        }
        /**
         * 编辑
         */
        $scope.toEdit = function(act) {
            act = $scope._cur_act_detail.activityInfo;
            if(act.unionState === 3) {//来自其他世界的活动，编辑联盟信息
                vcModalService({
                    retId:'params',
                    backdropCancel: false,
                    title: '修改联盟',
                    css: {height: '415px',width: '400px'},
                    templateUrl: 'app/templates/activity/enter_union_activity.html',controller: 'enterUnionActivityController',
                    success: {label: '确定',fn: editUnion}
                },{
                    union:act
                });
            }else {
                /*
                CommTabService.next($scope.$vcTabInfo, 1, {
                    operate: 'edit',
                    dataId: act.id
                }, 'actTabs');
                */
                CommTabService.next($scope.$vcTabInfo, 'act-tab-add', {
                    operate: 'edit',
                    dataId: act.id
                }, 'actTabs');
            }
        }

        /**
         * 编辑联盟到的活动信息
         */
        function editUnion(params) {
            if(!activityListService.validateUnion(params)) {
                return false;
            }
            _.each(params.assembleInfo,function(n) {
                n.leaders = activityListService.parseUser(n.leaders);
            });
            var _params = {opType:3,activityId:params.union.id,
                assembleInfo:JSON.stringify(params.assembleInfo),
                consultInfo:JSON.stringify(activityListService.parseUser(params.consultInfo))};
            activityListService.enterUnion(_params,function(data){
                $scope._cur_act_detail.activityInfo.assembleInfo = JSON.stringify(params.assembleInfo);
                $scope._cur_act_detail.activityInfo.consultInfo = JSON.stringify(params.consultInfo);
            },function(err){
                TipService.add('error','编辑联盟失败',3000);
            });
        }

        /**
         * 修改发出的联盟信息
         */
        $scope.editJoinUnion = function() {
            vcModalService({
                retId:'params',
                backdropCancel: false,
                title: '修改联盟信息',
                css: {height: '415px',width: '400px'},
                templateUrl: 'app/templates/activity/modify_join_union_activity.html',controller: 'modifyJoinUnionActivityController',
                success: {label: '确定',fn: editUnion}
            },{
                union:$scope._cur_act_detail.activityInfo
            });
        }

        /**
         * 下线活动
         */
        $scope.activityOffline = function() {
            window.vcAlert({
                title:"提示",
                text: "确定下线此活动？",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonText: "取消",
                confirmButtonText: "确定",
                closeOnConfirm: true,
                html: false
            }, offlineAction);
        }
        function offlineAction() {
            activityListService.offline({activityId:$scope._cur_act_detail.activityInfo.id}, function(data) {
                if(!data) {
                    TipService.add('success','下线成功',3000);
                    //CommTabService.next($scope.$vcTabInfo, $scope.lastTabIndex, {});
                    CommTabService.next($scope.$vcTabInfo, 'online',{}, ['online','offline']);
                }else {
                    var _resp = JSON.parse(data);
                    if(_resp && _resp.managers) {
                        var _html = [];
                        for(var e in _resp.managers) {
                            _html.push("<p>"+_resp.managers[e]+"</p>");
                        }
                        vcModalService({
                            title: '<p style="text-align: center;">请联系一下社团停止联盟</p>',
                            template: _html.join("")
                        });
                    }else {
                        TipService.add('success','下线成功',3000);
                        //CommTabService.next($scope.$vcTabInfo, $scope.lastTabIndex, {'open':true});
                        CommTabService.next($scope.$vcTabInfo, 'online',{}, ['online','offline']);
                    }
                }
            }, function(err) {
                TipService.add('error','下线活动出错:'+err.msg,3000);
            });
        }
    }
    ActivityDetailController.inject = ['$scope','$state','CacheService','actionActivity','dateTimeService',
        'activityJoinListLayoutService','cycleActivityJoinListLayoutService','contestActivityJoinListLayoutService',
        'activityListService','vcModalService','CommTabService','TipService'];

    /**
     * 活动列表ctrl
     * @param $scope
     * @param getList
     * @param clickList
     * @param ModuleUtils
     * @param bannerTabService
     * @constructor
     */
    function ActivityListController($scope, actionActivity,$timeout, activityListService, tenYears,contestActivityJoinListLayoutService,bannerTabService,
                                    dateTimeService,activityJoinListLayoutService, cycleActivityJoinListLayoutService,
                                    vcModalService,CacheService,CommTabService,TipService) {
        $scope.vcTabOnload = function(data,lastTabInfo) {
            if ($scope.$dirty){
                if(data && data.init === true) {
                    $scope.search(true);
                }else {
                    activityListService.refresh($scope.data,function(num) {
                        $scope.params.pageNumber = ($scope.params.pageNumber+num)<1? 1:($scope.params.pageNumber+num);
                        $scope.search(false);
                    });
                }
                $scope.$dirty = false;
                $scope.lastTabInfo = lastTabInfo;
            }
        }
        /**
         * 给页面初始值
         */
        function init_page_data() {
            //查询条件是否显示
            $scope.opt_show = false;
            $scope.params = {pageSize:10,pageNumber:1,status:1};//查询对象
            $scope.data = [];
            $scope.search_text = activityListService.baseData.search_text;
            $scope.search_text_show_ = '';
            $scope.offlinePerminssion = CacheService.hasPermission('activity:offline');
            $scope.joinlistPerminssion = CacheService.hasPermission('activity:joinlist');

            $scope._act_sub_type = activityListService.baseData._act_sub_type;
            $scope._type = activityListService.baseData._type;
            $scope._union_type = activityListService.baseData._union_type;
            $scope._levels = activityListService.baseData._levels;
            $scope._search_date = activityListService.baseData._search_date;
        }
        init_page_data();
        /**
         * 查询标签条件
         */
        function tagEventInit() {
            $scope.subTag = null;
            $scope.checkSubType = function(sub) {
                $scope.subTag = activityListService.tagEvent(sub,$scope._act_sub_type);
                $scope.search(true);
            }
            $scope.search_type = null;
            $scope.checkType = function(type) {
                $scope.search_type = activityListService.tagEvent(type,$scope._type);
                $scope.search(true);
            }
            $scope.checkLevel = function(level) {
                $scope.search_level = activityListService.tagEvent(level,$scope._levels);
                $scope.search(true);
            }
            $scope.search_date = null;
            $scope.checkDate = function(date) {
                $scope.search_date = activityListService.tagEvent(date,$scope._search_date);
                $scope.search(true);
            }
            /**
             * 输入框回车查询
             * @param e
             */
            $scope.searchByTitle = function(e) {
                if(e.which === 13) {
                    $scope.search(true);
                    e.preventDefault();
                }
            }
        }
        tagEventInit();

        $scope.goPage = function(num){
            $scope.params.pageNumber = num;
            $scope.search();
        }

        /**
         * 执行查询
         */
        $scope.search = function (_new) {
            if(_new) {
                $scope.params.pageNumber = 1;
            }
            if($scope.subTag && $scope.subTag.val) {
                $scope.params.subType = $scope.subTag.val;
                $scope.search_text_show_ = activityListService.searchTextShow('add','活动方式',$scope.subTag.name,$scope.search_text);
            }else {
                $scope.params.subType = null;
                $scope.search_text_show_ = activityListService.searchTextShow('remove','活动方式','活动方式',$scope.search_text);
            }
            if($scope.search_type && $scope.search_type.val) {
                $scope.params.activityTags = $scope.search_type.val;
                $scope.search_text_show_= activityListService.searchTextShow('add','活动类型',$scope.search_type.name,$scope.search_text);
            }else {
                $scope.params.activityTags = null;
                $scope.search_text_show_ = activityListService.searchTextShow('remove','活动类型','活动类型',$scope.search_text);
            }
            if($scope.search_level && $scope.search_level.val !== -1) {
                $scope.params.level = $scope.search_level.val;
                $scope.search_text_show_ = activityListService.searchTextShow('add','难易程度',$scope.search_level.name,$scope.search_text);
            }else {
                $scope.params.level = null;
                $scope.search_text_show_ = activityListService.searchTextShow('remove','难易程度','难易程度',$scope.search_text);
            }
            if($scope.search_date && $scope.search_date.val != null) {
                $scope.params.createTime = dateTimeService.getTimeUpToNow($scope.search_date.val);
                $scope.search_text_show_ = activityListService.searchTextShow('add','发布时间',$scope.search_date.name,$scope.search_text);
            }else {
                $scope.params.createTime = null;
                $scope.search_text_show_ = activityListService.searchTextShow('remove','发布时间','发布时间',$scope.search_text);
            }
            if($scope.query_key) {
                $scope.params.queryKey = $scope.query_key;
            }else {
                $scope.params.queryKey = null;
            }

            $scope.$parent.loading = true;
            activityListService.list($scope.params, function(data) {
                $scope.data = data;
                $scope.$parent.loading = false;
            });
        };

        var ul_h = 0;
        $scope.showOpts = function() {
            if($scope.opt_show === false) {
                $scope.opt_show = true;
                if (ul_h == 0) {
                    $("#act-list-screening_box ul").each(function () {
                        ul_h += $(this).outerHeight();
                    });
                }
                $("#act-list-screening_box").height(ul_h);
            }else {
                $scope.opt_show = false;
                $("#act-list-screening_box").height(0);
            }
            //调整mCustomScroll
            $scope.$vcUpdateTabScroller();
        };

        /**
         * 拖动完成
         * @param cur
         * @param prev
         * @param next
         */
        $scope.dragSuccess = function(cur, prev, next) {
            var cur_act = activityListService.findDataById($scope.data.content, cur);
            var prev_act = null;
            var next_act = null;
            //上下都有
            if(prev && next) {
                prev_act = activityListService.findDataById($scope.data.content, prev);
                next_act = activityListService.findDataById($scope.data.content, next);
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
                            activityListService.sort(next,next_act.updateTime-1,function() {
                                activityListService.updateTopByUpdateTime(cur_act,next_act.updateTime-1);
                            });
                            return;
                        }
                    }
                    activityListService.sort(cur,_update_time,function() {
                        cur_act.updateTime = _update_time;
                        activityListService.updateTopByUpdateTime(cur_act,_update_time);
                    });
                    return;
                }
            }
            //只有下一条
            if(next) {
                next_act = activityListService.findDataById($scope.data.content, next);
                if(next_act && next_act.updateTime) {
                    activityListService.sort(cur,next_act.updateTime+50,function() {
                        cur_act.updateTime = next_act.updateTime+50;
                        activityListService.updateTopByUpdateTime(cur_act,next_act.updateTime+50);
                    });
                }
            }
            //只有上一条
            if(prev) {
                prev_act = activityListService.findDataById($scope.data.content, prev);
                if(prev_act && prev_act.updateTime) {
                    activityListService.sort(cur,prev_act.updateTime-50,function() {
                        cur_act.updateTime = prev_act.updateTime-50;
                        activityListService.updateTopByUpdateTime(cur_act,prev_act.updateTime-50);
                    });
                }
            }
        }

        /**
         * 置顶
         */
        $scope.toTop = function(act) {
            var _cur = new Date();
            var _update_time = _cur.getTime() + tenYears;//当前时间加上十年
            activityListService.sort(act.id, _update_time,function() {
                $scope.search(false);
            });
        }

        /**
         * 取消置顶
         * @param act
         */
        $scope.downTop = function(act) {
            activityListService.sort(act.id, 0,function() {
                $scope.search(false);
            });
        }

        /**
         * 报名列表
         */
        $scope.activityJoin = function(act) {

            //var _curTime = new Date().getTime();
            //var z_index = _curTime - dateTimeService.getTimeUpToNow(0);

            if(act.subType === 1) {
                activityJoinListLayoutService.activate({activity_id:act.id,activity:act}/*,{'z-index':z_index}*/);
            }else if(act.subType === 2) {
                cycleActivityJoinListLayoutService.activate({activity_id:act.id,subTags:act.subTags,activity:act}/*,
                    {'z-index':z_index}*/);
            }else if(act.subType ===3) {
                contestActivityJoinListLayoutService.activate({activity_id:act.id,eventGroupInfo:act.eventGroupInfo,activity:act}/*,
                    {'z-index':z_index}*/);
            }
        }
        var _cur_activity = null;
        /**
         * 添加联盟或取消联盟
         * @param act
         */
        $scope.switchUnion = function(act) {
            if(act.activityStatus !== 1) {
                TipService.add('error','活动已报名截止',3000);
                return ;
            }
            _cur_activity = act;
            activityListService.joinOrCancelUnion(act,unionOpt,unUnion);
        }
        /**
         * 确认取消联盟
         */
        function unUnion() {
            activityListService.cancelUnion({activityId:_cur_activity.id},function(data){
                try {
                    var _resp = JSON.parse(data);
                    if(_resp.tips) {
                        vcModalService({
                            title: '提示',
                            template: "<p style='text-align: center;'>"+_resp.tips+"</p>"
                        });
                        //_cur_activity.unionState = 2;//发出联盟取消
                        $scope.search();
                    }else if(_resp.managers) {
                        var _html = [];
                        for(var e in _resp.managers) {
                            _html.push("<p>"+_resp.managers[e]+"</p>");
                        }
                        vcModalService({
                            title: '请联系一下社团停止联盟',
                            template: _html.join("")
                        });
                    }else {
                        _cur_activity.unionState = 2;//发出联盟取消
                        $scope.search();
                    }
                }catch(err){ }
            },function(err){
                TipService.add('error','取消联盟失败:'+err.msg,3000);
            });
        }
        /**
         * 添加联盟确定
         * @param opt
         * @returns {boolean}
         */
        function unionOpt(opt) {
            var _opt = activityListService.validateAddUion(opt,_cur_activity);
            if(_opt) {
                activityListService.addUnion(_opt,function(data) {
                    _cur_activity.unionState = 1;
                },function(err) {
                    TipService.add('error', '加入联盟失败:'+err.msg,3000);
                    activityListService.refresh($scope.data,function(num) {
                        $scope.params.pageNumber = ($scope.params.pageNumber+num)<1? 1:($scope.params.pageNumber+num);
                        $scope.search(false);
                    });
                });
                return true;
            }
            return false;
        }

        /**
         * 下线活动
         * @param act
         */
        $scope.activityOffline = function(act) {
            _cur_activity = act;
            vcModalService({
                title:'提示',
                template:'<p style="text-align: center;">确定下线此活动？</p>',
                success:{label:'确定',fn:offlineAction}
            });
        }
        function offlineAction() {
            activityListService.offline({activityId:_cur_activity.id}, function(data) {
                if(!data) {
                    TipService.add('error','活动下线成功',3000);
                    offlineReload();
                    CommTabService.dirty($scope.$vcTabInfo,'offline', true);
                }else {
                    var _resp = JSON.parse(data);
                    if(_resp && _resp.managers) {
                        var _html = [];
                        for(var e in _resp.managers) {
                            _html.push("<p>"+_resp.managers[e]+"</p>");
                        }
                        vcModalService({
                            title: '请联系一下社团停止联盟',
                            template: _html.join("")
                        });
                    }else {
                        offlineReload();

                        CommTabService.dirty($scope.$vcTabInfo,'offline', true);
                    }
                }
            }, function(err) {
                TipService.add('error','下线活动出错:'+err.msg,3000);
            });
        }

        function offlineReload() {
            if(isLastData()) {
                $scope.params.pageNumber = $scope.params.pageNumber===1?$scope.params.pageNumber:$scope.params.pageNumber-1;
                $scope.search();
            }else {
                $scope.search();
            }
        }

        /**
         * 是否只剩一条数据
         */
        function isLastData() {
            if($scope.data && $scope.data.content && $scope.data.content.length > 1) {
                return false;
            }else {
                return true;
            }
        }

        /**
         * 编辑
         */
        $scope.toEdit = function(act) {
            _cur_activity = act;
            if(act.unionState === 3) {//来自其他世界的活动，编辑联盟信息
                vcModalService({
                    retId:'params',
                    backdropCancel: false,
                    title: '编辑联盟',
                    css: {height: '415px',width: '400px'},
                    templateUrl: 'app/templates/activity/enter_union_activity.html',controller: 'enterUnionActivityController',
                    success: {label: '确定',fn: editUnion}
                },{
                    union:act
                });
            }else {
                //跳到编辑页
                /*
                CommTabService.next($scope.$vcTabInfo, 1, {
                    operate: 'edit',
                    dataId: act.id
                }, 'actTabs');
                */
                CommTabService.next($scope.$vcTabInfo, 'act-tab-add', {
                    operate: 'edit',
                    dataId: act.id
                }, 'actTabs');
            }
        }

        /**
         * 编辑联盟到的活动信息
         */
        function editUnion(params) {
            if(!activityListService.validateUnion(params)) {
                return false;
            }
            _.each(params.assembleInfo,function(n) {
                n.leaders = activityListService.parseUser(n.leaders);
            });
            var _params = {opType:3,activityId:params.union.id,
                assembleInfo:JSON.stringify(params.assembleInfo),
                consultInfo:JSON.stringify(activityListService.parseUser(params.consultInfo))};
            activityListService.enterUnion(_params,function(data){
                _cur_activity.assembleInfo = JSON.stringify(params.assembleInfo);
                _cur_activity.consultInfo = JSON.stringify(params.consultInfo);
                TipService.add('success','编辑联盟信息成功',3000);
            },function(err){
                TipService.add('error','编辑联盟失败:'+err.msg,3000);
            });
        }

        $scope.search();

        //活动详情展示
        $scope.showDetail = function(actId){
            //CommTabService.next($scope.$vcTabInfo, 6, {actId:actId});
            CommTabService.next($scope.$vcTabInfo, 'act_detial', {actId:actId});
        };
    }

    ActivityListController.$inject = ['$scope','actionActivity','$timeout','activityListService','tenYears','contestActivityJoinListLayoutService',
        'bannerTabService','dateTimeService','activityJoinListLayoutService','cycleActivityJoinListLayoutService',
        'vcModalService','CacheService','CommTabService','TipService'];

    /**
     * 普通货周期活动，加入或取消联盟ctrl
     * @param $scope
     */
    function fJoinCancelUnionActivityController($scope) {
        function init() {
            $scope.params = {
                time:$scope.time,
                number:$scope.number,
                repay:$scope.repay,
                opt:$scope.opt
            };
            if($scope.activity.subType !== 2) {// 非周期活动
                $scope.otherConf={maxDate:moment($scope.activity.registEndTime||null).format('YYYY-MM-DD')};
            }
            $scope.unionType = function(type) {
                $scope.params.unionType = type;
            }
            if($scope.activity.unionState === 2 || $scope.activity.unionState === 1 || $scope.activity.unionState === 5) {//取消后再次加入,修改
                var _union_info = JSON.parse($scope.activity.unionInfo);
                _union_info.time = moment(_union_info.time).format('YYYY-MM-DD');
                $scope.params = _union_info;
                $scope.params.opt = $scope.opt;
                $scope.params.unionType = $scope.activity.unionType;
            }
        }
        init();
        $scope.$watch('params.number', function(newVal){
            try {
                var _new = parseInt(newVal);
                if(_new > $scope.activity.number) {
                    $scope.number_max_err = true;
                }else if($scope.activity.unionJoinNum && parseInt($scope.activity.unionJoinNum)>_new) {
                    $scope.number_max_err = true;
                    $scope.join_num_min = "最少"+parseInt($scope.activity.unionJoinNum)+",";
                }else {
                    $scope.number_max_err = false;
                }
            }catch(e){}
        });
        $scope.$watch('params.repay', function(newVal){
            try {
                if(parseFloat(newVal) > $scope.activity.cost) {
                    $scope.cost_max_err = true;
                }else {
                    $scope.cost_max_err = false;
                }
            }catch(e){}
        });
    }
    fJoinCancelUnionActivityController.$inject = ['$scope'];

    /**
     * 赛事活动加入或取消加入联盟，ctrl
     * @param $scope
     */
    function fJoinCancelUnionContestActivityController($scope) {
        function init() {
            $scope.params = {
                time:$scope.time,
                number:$scope.number
            };
            //日历配置
            $scope.otherConf={maxDate:moment($scope.activity.registEndTime).format('YYYY-MM-DD')};
            $scope.unionType = function(type) {
                $scope.params.unionType = type;
            }

            try {
                $scope.eventGroupInfo = JSON.parse($scope.activity.eventGroupInfo);
                $scope._enjoin = JSON.parse($scope.activity.unionJoinNum);
                $scope.params.group = $scope.eventGroupInfo;
                if($scope.activity.unionState === 2 || $scope.activity.unionState === 1 || $scope.activity.unionState === 5) {//取消后再次加入,修改
                    var _union_info = JSON.parse($scope.activity.unionInfo);
                    _union_info.time = moment(_union_info.time).format('YYYY-MM-DD');
                    $scope.params = _union_info;
                    $scope.params.opt = $scope.opt;
                    $scope.params.unionType = $scope.activity.unionType;
                    $scope.params.group = $scope.eventGroupInfo;
                    var _union_group_num = JSON.parse(_union_info.groupNumber);//每个分组名额
                    for(var g in $scope.params.group) {
                        $scope.params.group[g].repay = _union_group_num[$scope.params.group[g].name];
                    }
                }
            }catch(e){
                console.log('parse event activity error,',e);
            }
        }
        init();

        $scope.repay = function(group) {
            if(!group.price) {
                if(parseInt(group.repay) !== 0) {
                    group.cost_max_err = true;
                    return ;
                }else {
                    group.cost_max_err = false;
                    return ;
                }
            }
            if(parseInt(group.repay) > parseInt(group.price)) {
                group.cost_max_err = true;
            }else {
                group.cost_max_err = false;
            }
        }
        $scope.number = function(group) {
            var _new = parseInt(group._number);
            if(parseInt(group.number) < _new) {
                group._number_err = true;
            }else if(!_.isEmpty($scope._enjoin)) {
                if($scope._enjoin[group.name] && parseInt($scope._enjoin[group.name])>_new) {
                    group._number_err = true;
                    group.group_join_num = "最少"+parseInt($scope._enjoin[group.name])+"人，";
                }else {
                    group._number_err = false;
                }
            }else {
                group._number_err = false;
            }
        }
        /*
         $scope.$watch('params.number', function(newVal){
         try {
         if(parseInt(newVal) > $scope.activity.number) {
         $scope.number_max_err = true;
         }else {
         $scope.number_max_err = false;
         }
         }catch(e){}
         });
         */
    }
    fJoinCancelUnionContestActivityController.$inject = ['$scope'];

    /**
     * 修改发布的联盟信息
     * @param $scope
     */
    function fModifyJoinUnionActivityController($scope) {
        function init() {
            if($scope.union.unionType === 1) {
                $scope._uionType = '返点';
            }else {
                $scope._uionType = '拼车';
            }
        }
        init();
    }
    fModifyJoinUnionActivityController.$inject = ['$scope'];
})();