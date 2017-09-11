/**
 * Created by hxl on 2015/12/22.
 */
;(function(){
    'use strict'
    angular.module('main.college')
        .controller('coActivityReleaseController',fCoActivityReleaseController);

    /**
     * 发布高校活动
     * @param $scope
     */
    function fCoActivityReleaseController($scope,$interval,colActivityServices,TipService,vcModalService,
                                          CommTabService,AuditService,previewModalService,CacheService) {
        //编辑器对象
        $scope.ueditorId = colActivityServices.ueditor_instance;
        var audit = {};//审核/草稿对象
        $scope.vcTabOnload = function(data, lastTabInfo) {
            if(!$scope.activity) {
                $scope.activity = {};
                colActivityServices.init($scope.activity);
                initPageFromButAct();
                permissionBind();
                autoDraft();
            }
            if(data) {
                $scope.lastTabInfo = lastTabInfo;
                if(data.op_type === colActivityServices.opType.EDIT) {
                    $scope.op_state = 2;//线上编辑
                }else if(data.op_type === colActivityServices.opType.AUDIT) {
                    $scope.op_state = 3;//审核编辑
                }else if(data.op_type === colActivityServices.opType.DRAFT || data.operate === 'editDraft') {
                    $scope.op_state = 4;//草稿编辑
                    autoDraft();
                }else if(data.op_type === colActivityServices.opType.OFFLINE) {
                    $scope.op_state = 5;//下线编辑
                }
                if(data && data.operate === 'editAudit'){
                    $scope.op_state = 3;
                }
                loadActivity(data.dataId);
            }
        }
        //离开tab时触发
        $scope.vcTabOnUnload = function() {
            if ($scope.draftInterval) {
                $interval.cancel($scope.draftInterval);
                $scope.draftInterval = null;
            }
        }
        /**
         * 初始化表单，无关活动属性,因为保存的数据结构不一样
         */
        function initPageFromButAct() {
            $scope.selectSonsultList = null;
            //支付类型
            $scope.payTypeList = colActivityServices.releaseBaseData.payTypeList;
            //活动所属分类
            $scope.actiTypeList = colActivityServices.releaseBaseData.actiTypeList;
            $scope.startDateConf = colActivityServices.releaseBaseData.start_date_conf;
            $scope._unModify = {};
        }

        /**
         * 权限绑定到scope
         */
        function permissionBind() {
            $scope.pms = colActivityServices.permission;
        }

        $scope.openUser = function() {
            vcModalService({
                retId: 'selectedUser',
                backdropCancel: false,
                title: '选择联系人',
                css: {height: '500px',width: '400px'},
                templateUrl: 'app/templates/common/tplSelectAppUsers.html',controller: 'SelectAppUserController',
                success: {
                    label: '确定',fn: sonsultList
                }
            }, {
                'op':'1,2',
                isMulitSelect: false,
                selectedUser: $scope.selectSonsultList
            });
        }

        function sonsultList(users) {
            $scope.selectSonsultList = users;
        }
        //移除咨询
        $scope.removeUser = function (removeType, idx, parentIdx) {
            $scope.selectSonsultList = null;
        };

        /**
         * 活动数据校验
         */
        function validateActivity(){
            var _cur_time = new Date().getTime();
            if(_cur_time > moment($scope.activity.startTime)._d.getTime()){
                TipService.add('error','出发时间不能小于当前时间',3000);
                return false;
            }
            if($scope.selectSonsultList === null) {
                TipService.add('error','请选择一个联系人',3000);
                return false;
            }
            if(!$scope.activity.poster){
                TipService.add('error','请上传活动封面',3000);
                return false;
            }
            if(parseInt($scope.activity.number) < parseInt($scope.activity.joinNumber)) {
                TipService.add('error','活动名额不能少于已报名人数',3000);
                return false;
            }
            return true;
        }

        /**
         * 提交审核或发布
         */
        $scope.saveActivityForm = function() {
            if(validateActivity()){
                if($scope.pms.add) {
                    submit();
                }else {
                    toAudit();
                }
            }
        }

        /**
         * 构建对于后台的activity对象
         */
        function constructActivity() {
            var _activity = angular.copy($scope.activity);
            _activity.consultInfo = [];
            _activity.startTime = moment(_activity.startTime)._d.getTime();
            //组装咨询人字段信息
            /*
            _.each($scope.selectSonsultList, function (re) {
                _activity.consultInfo.push({
                    uid: re.uid,
                    name: re.nickname || re.name,
                    imgPath: re.imgPath,
                    sex: re.sex,
                    id: re.id,
                    label: re.label || '',
                    phone:re.loginName||re.phone
                });
            });
            */
            if($scope.selectSonsultList){
                _activity.leaderHead = $scope.selectSonsultList.imgPath;
                _activity.leaderName = $scope.selectSonsultList.nickname||$scope.selectSonsultList.name;
                _activity.leaderPhone= $scope.selectSonsultList.loginName||$scope.selectSonsultList.phone;
                _activity.leaderRid  = $scope.selectSonsultList.id;
                _activity.leaderSex  = $scope.selectSonsultList.sex;
            }
            _activity.introduce = UE.getEditor($scope.ueditorId).getContent();
            if(!_activity.registNotice) {
                _activity.registNotice = "VARICOM_123456";
            }
            _activity.consultInfo = JSON.stringify(_activity.consultInfo);
            _activity.subTags = null;
            _activity.auditId = audit.id;
            //活动的详情需要编码
            _activity.introduce = htmlEncode(_activity.introduce);
            return _activity;
        }

        function submit() {
            var _activity = constructActivity();
            if($scope.op_state === 2){
                colActivityServices.update(_activity, function() {
                    TipService.add('success','活动编辑成功',3000);
                    CommTabService.next($scope.$vcTabInfo,'online',{open:true},'manage',['online','draft']);
                    $scope.clearActivityForm();
                });
            }else {
                colActivityServices.save(_activity, function() {
                    TipService.add('success','活动添加成功',3000);
                    CommTabService.next($scope.$vcTabInfo,'online',{open:true},'manage',['online','draft']);
                    $scope.clearActivityForm();
                });
            }
        }

        /**
         * 提交审核
         */
        function toAudit() {
            var _audit = buildDraft();
            _audit.status = 1;
            if($scope.op_state === 2) {
                _audit.auditType = 2;//线上修改审核
            }else {
                _audit.auditType = 1;//上线审核
                _audit.bizId = null;
            }
            AuditService.save(_audit,function(data){
                TipService.add('success','提交审核成功',3000);
                CommTabService.next($scope.$vcTabInfo,'myaudit',{open:true},'manage',['myaudit','draft']);
                $scope.clearActivityForm();
            });
        }

        /**
         * 保存草稿
         */
        $scope.saveDraft = function() {
            if(!$scope.activity || !$scope.activity.introduce) {
                return;
            }
            var _audit = buildDraft();
            _audit.auditType = 0;//表示草稿
            AuditService.save(_audit, function (data) {
                audit.id = data;
                TipService.add('success', '草稿保存成功', 3000);
            },function(err){
                TipService.add('error','草稿保存失败:'+err.msg,3000);
            });
            CommTabService.dirty($scope.$vcTabInfo, 'draft', 'manage', true);
        }

        function buildDraft() {
            var _activity = constructActivity();

            audit.bizId = $scope.activity.id || '';
            audit.bizType = 8;
            audit.status = 0;
            if($scope.activity && $scope.activity.id) {
                audit.auditType = 2;
            }else {
                audit.auditType = 1;
            }
            audit.title= $scope.activity.title;
            audit.thumbnail= $scope.activity.poster;
            audit.content = JSON.stringify(_activity);
            return audit;
        }

        function autoDraft() {
            if($scope.draftInterval) {
                return;
            }
            $scope.draftInterval = $interval(function () {
                $scope.saveDraft();
            }, 300000);
            /**
             * 销毁定时器
             */
            $scope.$on('$destroy', function () {
                if ($scope.draftInterval) {
                    $interval.cancel($scope.draftInterval);
                }
            });
        }

        function loadActivity(id) {
            $scope._unModify = {};
            if($scope.op_state === 2 || $scope.op_state === 5) {
                colActivityServices.get({activityId:id},function(data) {
                    $scope.activity = data.activityInfo;
                    parseActivityToForm();
                    unModifyProporty();
                });
            }else {//加载审核、草稿数据
                AuditService.getAudit({auditId:id},function(data){
                    audit = data;
                    if (!angular.isUndefined(data.content)) {
                        try {
                            var activityContent = JSON.parse(data.content);
                            activityContent.auditId = data.id;
                            activityContent.poster = data.thumbnail;
                            $scope.activity = activityContent;
                            parseActivityToForm();
                        } catch (e) {
                            new Error(e);
                        }
                        //如当前是编辑草稿则启动自动保存草稿功能
                        //$stateParams.type === 'updateDraft' ? autoDraft() : '';
                    }
                });
            }
        }

        /**
         * 不可修改的值
         */
        function unModifyProporty() {
            if($scope.activity.joinNumber) {//已有人报名活动
                $scope._unModify.startTime = true;
                $scope._unModify.payType = true;
                $scope._unModify.payCost = true;
            }
        }

        function parseActivityToForm() {
            /*
            if(typeof ($scope.activity.consultInfo) === 'string') {
                $scope.selectSonsultList = JSON.parse($scope.activity.consultInfo);
            }else {
                $scope.selectSonsultList = $scope.activity.consultInfo;
            }
            */
            $scope.selectSonsultList = {};
            $scope.selectSonsultList.imgPath = $scope.activity.leaderHead;
            $scope.selectSonsultList.nickname = $scope.activity.leaderName;
            $scope.selectSonsultList.loginName = $scope.activity.leaderPhone;
            $scope.selectSonsultList.id = $scope.activity.leaderRid;
            $scope.selectSonsultList.sex =$scope.activity.leaderSex;

            $scope.activity.startTime = moment($scope.activity.startTime).format('YYYY-MM-DD HH:mm');
            //活动介绍：data for ueditor
            $scope.activity.introduce = htmlDecode( $scope.activity.introduce);
        }

        $scope.goBack = function(){
            window.vcAlert({
                title:"提示",
                text: "当前操作尚未保存，您确认放弃已有修改吗？",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonText: "取消",
                confirmButtonText: "确定",
                closeOnConfirm: true,
                html: false
            }, function() {
                reset2New();
                var _tag = $scope.lastTabInfo?$scope.lastTabInfo.tag:'online';
                CommTabService.next($scope.$vcTabInfo, _tag, {},'manage',['online']);
                $scope.clearActivityForm();
            });
        };
        function reset2New() {
            $scope.op_state = null;
            colActivityServices.init($scope.activity);
            initPageFromButAct();
        }

        /**
         * 清除表单数据
         */
        $scope.clearActivityForm = function() {
            $scope.activity = {};
            colActivityServices.init($scope.activity);
            initPageFromButAct();
        }

        /**
         * 预览
         */
        $scope.preview = function() {
            if(validateActivity()) {
                var _activity = constructActivity();
                var _cur_time = new Date().getTime();
                CacheService.putObject('preview_college', _activity);
                previewModalService.activate({
                    f_src:'/assets/preview/college/index.html?r='+_cur_time
                });
            }
        }
    }
    fCoActivityReleaseController.$inject = ['$scope','$interval','colActivityServices','TipService','vcModalService',
    'CommTabService','AuditService','previewModalService','CacheService'];
})();