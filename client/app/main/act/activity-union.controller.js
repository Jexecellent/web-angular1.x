/**
 * Created by hxl on 2015/11/18.
 */
;(function(){
    'use strict'
    angular.module('main.act')
        .controller('UnionActivityController',fUnionActivityController)
        .controller('enterUnionActivityController',fEnterUnionActivityController);

    /**
     * 联盟活动列表
     * @param $scope
     */
    function fUnionActivityController($scope,activityListService,dateTimeService,vcModalService,
                                      TipService,CommTabService) {
        $scope.vcTabOnload = function(data) {
            if($scope.$dirty) {
                search(false);
                $scope.$dirty = false;
            }
        }

        var _cur_union = null;
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
                search(true);
            }
            $scope.search_type = null;
            $scope.checkType = function(type) {
                $scope.search_type = activityListService.tagEvent(type,$scope._type);
                search(true);
            }
            $scope.checkuType = function(uType) {
                $scope.search_uType = activityListService.tagEvent(uType,$scope._union_type);
                search(true);
            }
            $scope.search_date = null;
            $scope.checkDate = function(date) {
                $scope.search_date = activityListService.tagEvent(date,$scope._search_date);
                search(true);
            }
            /**
             * 输入框回车查询
             * @param e
             */
            $scope.searchByTitle = function(e) {
                if(e.which === 13) {
                    search(true);
                    e.preventDefault();
                }
            }
        }
        tagEventInit();

        $scope.goPage = function(num) {
            $scope.params.pageNumber = num;
            search(false);
        }

        $scope._search = function() {
            search(false);
        }

        /**
         * 执行查询
         */
        function search(_new) {
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
            if($scope.search_uType && $scope.search_uType.val !== 0) {
                $scope.params.unionType = $scope.search_uType.val;
                $scope.search_text_show_ = activityListService.searchTextShow('add','联盟方式',$scope.search_uType.name,$scope.search_text);
            }else {
                $scope.params.unionType = null;
                $scope.search_text_show_ = activityListService.searchTextShow('remove','联盟方式','联盟方式',$scope.search_text);
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
            activityListService.unionList($scope.params, function(data) {
                console.log('union activiyt list.',data);
                $scope.data = data;
            })
        }

        var ul_h = 0;
        $scope.showOpts = function() {
            if($scope.opt_show === false) {
                $scope.opt_show = true;
                if (ul_h == 0) {
                    $("#act-union-screening_box ul").each(function () {
                        ul_h += $(this).outerHeight();
                    });
                }
                $("#act-union-screening_box").height(ul_h);
            }else {
                $scope.opt_show = false;
                $("#act-union-screening_box").height(0);
            }

            //调整mCustomScroll
            $scope.$vcUpdateTabScroller();
        }

        /**
         * 加入此联盟
         * @param union
         */
        $scope.enterUnion = function(union) {
            _cur_union = union;
            vcModalService({
                retId:'params',
                backdropCancel: false,
                title: '加入联盟',
                css: {height: '440px',width: '383px'},
                templateUrl: 'app/templates/activity/enter_union_activity.html',controller: 'enterUnionActivityController',
                success: {label: '确定',fn: enterUnionCall}
            },{
                union:union
            });
        }

        /**
         * 加入联盟回调
         * @param params
         * @returns {boolean}
         */
        function enterUnionCall(params) {
            if(!activityListService.validateUnion(params)) {
                return false;
            }
            _.each(params.assembleInfo,function(n) {
                n.leaders = activityListService.parseUser(n.leaders);
            });
            //params.assembleInfo.leaders = activityListService.parseUser(params.assembleInfo.leaders);
            var _params = {opType:1,activityId:params.union.id,
                assembleInfo:JSON.stringify(params.assembleInfo),
                consultInfo:JSON.stringify(activityListService.parseUser(params.consultInfo))};
            activityListService.enterUnion(_params,function(data){
                search();
                TipService.add('success','成功加入该联盟活动',3000);
                //CommTabService.next($scope.$vcTabInfo,1,{'open':false},'manage');
                //CommTabService.dirty($scope.$vcTabInfo,'online','manage');
                CommTabService.next($scope.$vcTabInfo,'online',{'open':false},'manage',['online']);
            },function(err){
                TipService.add('error','加入联盟失败:'+err.msg,3000);
                search();
            });
        }

        search();
    }
    fUnionActivityController.$inject = ['$scope','activityListService','dateTimeService','vcModalService',
        'TipService','CommTabService'];

    /**
     * 加入到某个联盟ctrl
     * @param $scope
     * @param vcModalService
     */
    function fEnterUnionActivityController($scope,vcModalService) {
        function init() {
            $scope.dateConf = {dateFmt:'yyyy-MM-dd HH:mm'};
            if($scope.union.unionState === 3) {//来自其他世界的活动,编辑
                $scope.subGroup = JSON.parse($scope.union.assembleInfo);
                if($scope.subGroup) {
                    _.each($scope.subGroup,function(n){
                        if($scope.union.subType === 2){
                            n.time = moment(n.time).format('hh:mm');
                        }else {
                            n.time = moment(n.time).format('YYYY-MM-DD HH:mm');
                        }
                    });
                }
                $scope.agent = JSON.parse($scope.union.consultInfo);
                touch();
            }else {
                try {
                    var _assembleInfo = JSON.parse($scope.union.assembleInfo);
                    var _address = '';
                    if(_assembleInfo && _assembleInfo.length) {
                        _address = _assembleInfo[0].address;
                    }
                    _.each(_assembleInfo,function(g){
                        g.id = g.time+Math.random();
                        if($scope.union.subType === 2) {
                            g.time = moment(g.time).format('HH:mm');
                        }else {
                            g.time = moment(g.time).format('YYYY-MM-DD HH:mm');
                        }
                        g.leaders = [];
                    });
                }catch(err){}
                //$scope.subGroup = [{id:new Date().getTime(),address:_address,time:null,leaders:[]}];
                $scope.subGroup = _assembleInfo;
                $scope.agent = [];
                touch();
            }
            if($scope.union.subType === 2) {//周末活动
                /*
                var _disabledDate = [];
                for(var t in $scope.union.subTags) {
                    if(0 === $scope.union.subTags[t]) {
                        _disabledDate.push(parseInt(t));
                    }
                }
                if(_disabledDate.length > 0) {
                    $scope.dateConf.disabledDays = _disabledDate;
                    $scope.dateConf.firstDayOfWeek = 1;
                }
                */
                $scope.dateConf = {dateFmt:'HH:mm'};
            }else {
                $scope.dateConf.maxDate = moment($scope.union.registEndTime).format('YYYY-MM-DD');
            }
        }
        init();

        /**
         * 添加集合地和领队
         */
        $scope.addSubGroup = function() {
            $scope.subGroup.push({id:new Date().getTime(),address:'',time:null,leaders:[]});
        }

        /**
         * 移除集合地和领队
         * @param group
         */
        $scope.removeSubGroup = function(group) {
            _.remove($scope.subGroup,function(n){
                return n.id === group.id;
            });
        }

        var _cur_group = null;
        $scope.choiceUser = function(type, group) {
            _cur_group = group;
            var title = (type === 2)? '选择领队':'选择咨询';
            vcModalService({
                retId: 'selectedUser',
                backdropCancel: false,
                title: title,
                css: {height: '500px',width: '400px'},
                templateUrl: 'app/templates/common/tplSelectAppUsers.html',
                controller: 'SelectAppUserController',
                success: {label: '确定',fn: (2 === type) ? leaderList : sonsultList}
            }, {
                op:'1,2',
                isMulitSelect: true,
                selectedUser:(2 === type)?_cur_group.leaders:$scope.agent
            });
        }
        function leaderList(user) {
            _cur_group.leaders = user;
            touch();
        }
        function sonsultList(user) {
            $scope.agent = user;
            touch();
        }

        /**
         * 移除一个领队
         * @param user
         * @param group
         */
        $scope.removeUser = function(user, group) {
            _.remove(group.leaders, function(u) {
                return u.id === user.id;
            });
            touch();
        }

        /**
         * 移除咨询
         */
        $scope.removeAgent = function(user) {
            _.remove($scope.agent, function(u) {
                return u.id === user.id;
            });
            touch();
        }

        function touch() {
            $scope.params = {assembleInfo:$scope.subGroup,consultInfo:$scope.agent, union:$scope.union};
        }
    }
    fEnterUnionActivityController.$inject = ['$scope','vcModalService'];
})();