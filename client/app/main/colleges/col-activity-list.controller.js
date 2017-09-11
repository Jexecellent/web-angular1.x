/**
 * Created by hxl on 2015/12/21.
 */
;(function(){
    'use strict'
    angular.module('main.college')
        .controller('colActivityListController',fColActivityListController);

    /**
     * 活动列表ctrl
     * @param $scope
     */
    function fColActivityListController($scope,colActivityServices, CommTabService,TipService,vcModalService,
                                        tenYears,dateTimeService,CacheService,previewModalService) {

        $scope.vcTabOnload = function(data, fromIndex) {
            $scope.search_text = colActivityServices.list_query_data_init.search_text;
            if($scope.$dirty) {
                if($scope.data) {
                    colActivityServices.onlineRefresh($scope.data.content, function() {
                        search(false);
                    });
                }else {
                    search(true);
                }
                $scope.$dirty = false;
            }
            if(!$scope.data) {
                search(true);
            }
            $scope.sparams = colActivityServices.list_params;
            $scope._type = colActivityServices.list_query_data_init._type;
            $scope._search_date = colActivityServices.list_query_data_init._search_date;
        }

        /**
         * 查询数据
         * @param _new 是否从第一页开始查
         */
        function search(_new) {
            if(_new) {
                colActivityServices.list_params.pageNumber = 1;
            }
            var _params = colActivityServices.getListQueryParams();
            if($scope.search_type && $scope.search_type.val) {
                _params.activityTags = $scope.search_type.val;
                $scope.search_text_show_= colActivityServices.searchTextShow('add','活动类型',$scope.search_type.name,$scope.search_text);
            }else {
                _params.activityTags = null;
                $scope.search_text_show_ = colActivityServices.searchTextShow('remove','活动类型','活动类型',$scope.search_text);
            }
            if($scope.search_date && $scope.search_date.val != null) {
                _params.createTime = dateTimeService.getTimeUpToNow($scope.search_date.val);
                $scope.search_text_show_ = colActivityServices.searchTextShow('add','发布时间',$scope.search_date.name,$scope.search_text);
            }else {
                _params.createTime = null;
                $scope.search_text_show_ = colActivityServices.searchTextShow('remove','发布时间','发布时间',$scope.search_text);
            }
            colActivityServices.list(_params,function(data) {
                $scope.data = data;
            });
        }

        $scope.toEdit = function(act) {
            CommTabService.next($scope.$vcTabInfo,'col-act-tab-add',{
                op_type : 1,
                dataId  : act.id
            },'col_actTabs',[]);
        }
        var _cur_activity = null;
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
            colActivityServices.offline({activityId:_cur_activity.id},function(){
                colActivityServices.onlineRefresh($scope.data, function() {
                    colActivityServices.onlineRefresh($scope.data.content, function() {
                        search(false);
                    });
                });
                TipService.add('success','活动下线成功',3000);
                CommTabService.dirty($scope.$vcTabInfo, 'offline', 'manage', true);
            });
        }

        $scope.toTop = function(act) {
            var _cur = new Date();
            var _update_time = _cur.getTime() + tenYears;//当前时间加上十年
            colActivityServices.sort(act.id,_update_time,function() {
                search(false);
                TipService.add('success','置顶成功',3000);
            });
        }
        $scope.cancelTop = function(act) {
            colActivityServices.sort(act.id,0,function() {
                search(false);
                TipService.add('success','取消置顶成功',3000);
            });
        }
        /**
         * 拖动完成
         * @param cur
         * @param prev
         * @param next
         */
        $scope.dragSuccess = function(cur, prev, next) {
            var _update_time = colActivityServices.calculateUpdateTime(cur,prev,next,$scope.data.content);
            if(_update_time) {
                colActivityServices.sort(cur,_update_time,function() {
                    TipService.add('success','拖动完成',3000);
                    search(false);
                });
            }else {
                console.log('计算不出拖动的更新时间',cur, prev, next);
            }
        }

        /**
         * 活动详情
         * @param act
         */
        $scope.showDetail = function(act) {
            CommTabService.next($scope.$vcTabInfo, 'act_detial', {actId:act.id});
        }

        /**
         * 名单管理
         */
        $scope.activityJoin = function(act) {
            CommTabService.next($scope.$vcTabInfo, 'act_join_list', {act:act});
        }

        var ul_h = 0;
        $scope.opt_show = false;
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
        $scope.search = function() {
            colActivityServices.query_params.queryKey = $scope.query_key;
            search(true);
        }
        function tagEventInit() {
            $scope.search_type = null;
            $scope.checkType = function(type) {
                $scope.search_type = colActivityServices.tagEvent(type,$scope._type);
                search(true);
            }
            $scope.search_date = null;
            $scope.checkDate = function(date) {
                $scope.search_date = colActivityServices.tagEvent(date,$scope._search_date);
                search(true);
            }
            $scope.preview = function(act) {
                colActivityServices.get({activityId:act.id},function(data) {
                    var _cur_time = new Date().getTime();
                    CacheService.putObject('preview_college', data.activityInfo);
                    previewModalService.activate({
                        f_src:'/assets/preview/college/index.html?r='+_cur_time
                    });
                });
            }
        }
        tagEventInit();

        $scope.goPage = function(num) {
            $scope.sparams.pageNumber = num;
            search(false);
        }

        function permissionBind() {
            $scope.pms = colActivityServices.permission;
        }
        permissionBind();
    }
    fColActivityListController.$inject = ['$scope','colActivityServices','CommTabService','TipService',
    'vcModalService','tenYears','dateTimeService','CacheService','previewModalService'];
})();