/**
 *  main.activity Module
 *
 * 发布活动 Description
 */

;
(function () {
    'use strict';
    angular.module('main.act')
        .controller('ActivityReleaseController', ActivityReleaseController);


    function ActivityReleaseController($scope, $timeout, vcModalService, CacheService, TipService,
                                       previewModalService, AuditService, $interval, $stateParams, ActReleaseService,
                                       CommTabService, AuthService) {
        //编辑器对象
        $scope.ueditorId = 'activity_ueditor_instance';
        $scope.isNewEditor = false;
        $scope.switchEditor = function(type){
            $scope.isNewEditor = (type === 1? true : false);
        }
        $scope.editor = {};
        var audit={};
        $scope.vcTabOnload = function (data,lastTabInfo) {
            if (!$scope.activity) {
                initObj();
                baseInitInput();
                digestComplete();
                autoDraft();//默认是添加
                $stateParams.type = 'add';
                doEvalAsync();
            }

            if (data) {
                if (data && data.operate === 'edit') {
                    $stateParams.type = 'update';
                    $stateParams.id = data.dataId;
                    $scope.op_state = 2;//操作状态,2表示编辑
                } else if (data && data.operate === 'editAudit') {
                    $stateParams.type = 'updateAudit';
                    $stateParams.id = data.dataId;
                    $scope.op_state = 3;//表示编辑审核
                } else if (data && data.operate === 'editDraft') {
                    $stateParams.type = 'updateDraft';
                    $stateParams.id = data.dataId;
                    $scope.op_state = 3;
                } else if (data && data.operate === 'offlineEdit') {//下线编辑
                    $stateParams.type = 'updateOffline';
                    $stateParams.id = data.dataId;
                    $scope.op_state = 3;//操作状态
                }

                $scope.initActivityForm();

                $scope.lastTabInfo = lastTabInfo;
            }
        }

        //离开tab时触发
        $scope.vcTabOnUnload = function() {
            if ($scope.draftInterval) {
                $interval.cancel($scope.draftInterval);
            }
        }
        $scope.typeChange = function(value){
            if($scope.op_state !== 2) {
                _.each($scope.assembleGroupList,function(n){
                    if(n && n.time) {
                        n.time = null;
                    }
                });
            }
        }
        /***初始化工作-begin**/
        function initObj() {
            //控制显示隐藏的对象
            $scope.display = {};

            //控制表单字段是否可修改的对象
            $scope.required = {};
            //表单验证信息对象
            $scope.formError = {};
            //活动对象(表单对象)
            $scope.activity = {
                subType: 1,
                level: 1,//难易程度
                isNeedIdCode: 0, //保险
                isNeedCheck: 0, //审核
                consultInfo: [], //咨询人信息
                activityTags: -1,
                payType: 1//收费方式
            };
            $scope.selectLeaderList = [];
            $scope.selectSonsultList = [];
            //集合地
            $scope.assembleGroupList = [{
                address: '',
                time: '',
                addButton: 'icon_plus',
                removeButton: 'hidden',
                label: '领队',
                leaders: [],
                leaButton: '管理领队'
            }];

            //赛事活动
            $scope.eventGroupList = [{
                name: '',
                price: '',
                prepay: '',
                number: '',
                addButton: 'icon_plus',
                removeButton: 'hidden',
            }];
            //报名须知
            $scope.activity.registNotice = '1.活动的费用请在活动现场交付领队。2.报名后如无法参加活动，请在活动开始前联系领队。';
            $scope.activity.poster = '';

            $scope.display.currentOperation = 'add';

            //当前用户的活动权限显示菜单
            $scope.perminssion = CacheService.hasPermission('activity:add');
        }

        function dateConf() {
            $scope.startDateConf = {'realDateFmt':'yyyy-MM-dd','realTimeFmt':'HH:mm','startDate':'%y-%M-{%d+7} %H:%m',maxDate:"#F{$dp.$D(\'end_time\')}"};
            $scope.endDateConf = {/*realDateFmt:'yyyy-MM-dd',realTimeFmt:'HH:mm',*/'startDate':'%y-%M-{%d+7} %H:%m','minDate':"#F{$dp.$D(\'startTime\')}"};
            $scope.regEndDateConf = {'realDateFmt':'yyyy-MM-dd','realTimeFmt':'HH:mm','startDate':'%y-%M-{%d+3} %H:%m','maxDate':"#F{$dp.$D(\'startTime\')}"};

            $scope.groupTimeConf = {'realDateFmt':'yyyy-MM-dd','realTimeFmt':'HH:mm','dateFmt':'yyyy-MM-dd HH:mm','minDate':"%y-%M-%d %H:%m",'startDate':'%y-%M-{%d+3} %H:%m'};
        }
        dateConf();

        $scope.initActivityForm = function () {
            //initObj();
            //baseInitInput();

            //判断当前的操作
            if (!$stateParams.type) {
                digestComplete();
                autoDraft();//默认是添加
                $stateParams.type = 'add';
            } else if ($stateParams.type !== 'add') {
                getUpdateActivity();
            } else {
                digestComplete();
                autoDraft();
            }
            /***初始化工作-end**/
        };
        /**
         * 基础的表单元素初始化(不与当前操作相关)
         * @method baseInitInput
         * @param
         * @return
         * author zyHu
         * date 15/11/12
         */
        function baseInitInput() {
            //活动类型
            $scope.typeList = [{
                id: 1, name: '普通活动'
            }, {
                id: 2, name: '周期活动'
            }, {
                id: 3, name: '赛事活动'
            }];

            //是否购买保险选项
            $scope.isCodeList = [{
                id: 0, name: '否'
            }, {
                id: 1, name: '是'
            }];
            //报名是否需要审核选项
            $scope.isCheckList = [{
                id: 0, name: '不需要'
            }, {
                id: 1, name: '需要'
            }];
            //活动所属分类
            $scope.actiTypeList = [{
                id: -1, name: '选择活动所属分类'
            }, {
                id: 1, name: '户外'
            }, {
                id: 2, name: '休闲'
            }, {
                id: 3, name: '骑行'
            }, {
                id: 4, name: '自驾'
            }, {
                id: 5, name: '摄影'
            }, {
                id: 6, name: '亲子'
            }];
            $scope.payTypeList = [{id: 1, name: '免费'}, {id: 2, name: '线上收定金'}
                , {id: 3, name: '线上收全款'}, {id: 4, name: '线下收全款'}];
            //周期活动的开始时间选项
            $scope.weekList = [{
                id: 0, name: '周一',state:0
            }, {
                id: 1, name: '周二',state:0
            }, {
                id: 2, name: '周三',state:0
            }, {
                id: 3, name: '周四',state:0
            }, {
                id: 4, name: '周五',state:0
            }, {
                id: 5, name: '周六',state:0
            }, {
                id: 6, name: '周天',state:0
            }];
        }


        /******表单基础数据-begin******/

        //当前$digest完成时
        function digestComplete(opt) {
            if(angular.element('.activity_release_img .webuploader-container').length > 0) {
                //文件上传已经初始化过就不用再执行
                return;
            }
            $timeout(function () {
                //活动封面
                var uploader = WebUploader.create({
                    auto: true,
                    swf: 'http://imgcache.varicom.im/js/webupload/Uploader.swf',
                    server: '/api/base/fileupload',
                    pick: '#poster',
                    resize: false,
                    fileSizeLimit: 2048000,
                    accept: {
                        title: 'Images',
                        extensions: 'gif,jpg,jpeg,bmp,png',
                        mimeTypes: 'image/*'
                    }
                });

                uploader.on('uploadSuccess', fUploadSuccess);
                uploader.on('error',fUploadError);
                uploader.on('uploadProgress',fUploadProgress);
                uploader.on('uploadComplete',fUploadComplete)
            }, 0,false);
            //上传进度条
            function fUploadProgress (file, percentage) {
                var _li = angular.element('#propress_bar');
                _li.css('width',angular.element('.webuploader-container').width());
                var _$parent = _li.find('.progress .progress-bar');
                if(!_$parent.length) {
                    _$parent = angular.element('<div class="progress progress-striped active">' +
                            '<div class="progress-bar" role="progressbar" style="width: 0%">' +
                            '</div>' +
                        '</div>').appendTo(_li).find('.progress-bar');
                }
                _li.find('.progress-bar').text('上传中...');
                _$parent.css('width', percentage * 100 + '%');
            }
            function fUploadSuccess(file, response) {
                if (response && response.code === 0) {
                    $scope.$apply(function () {
                        $scope.activity.poster = response.t;
                    });
                }
            }
            function fUploadError(type) {
                if(type == 'Q_EXCEED_SIZE_LIMIT') {
                    $scope.$apply(function() {
                        TipService.add('warning','图片大小超过限制，最大2M',3000);
                    });
                    return;
                }
                if(type == 'Q_TYPE_DENIED') {
                    $scope.$apply(function() {
                        TipService.add('warning','图片类型不正确。',3000);
                    });
                    return;
                }
            }
            function fUploadComplete() {
                this.reset();
                angular.element('#propress_bar').find('.progress').remove();
                angular.element('.activity_poster_img').css({'max-height':'300px'});
            }
            if(!opt) {
                $timeout(function(){
                    watch();
                },0);
            }
        }

        /**
         * 当前digest或者下次digest时执行
         */
        function doEvalAsync() {
            $scope.$evalAsync(function(){
                console.log('do $evalAsync');
                if(!$scope.assembleGroupList || $scope.assembleGroupList.length === 0){
                    //集合地
                    $scope.assembleGroupList = [{
                        address: '',
                        time: '',
                        addButton: 'icon_plus',
                        removeButton: 'hidden',
                        label: '领队',
                        leaders: [],
                        leaButton: '管理领队'
                    }];
                }
            });
        }

        //获取修改数据
        function getUpdateActivity() {
            $scope.readonly = {};  //编辑时不可修改的对象
            if(!_.isObject($scope.display)) {
                $scope.display = {};
            }
            /*修改线上活动、下线活动时获取当前修改的活动信息*/
            if ($stateParams.type === 'update' || $stateParams.type === 'updateOffline') {
                ActReleaseService.actReq('activity/get', {
                    activityId: $stateParams.id
                }, function (data) {
                    //联盟状态为2,代表当前联盟过来的修改请求
                    data.unionState === 2 ? $scope.display.currentOperation = 'updateUnion' : $scope.display.currentOperation = 'update';
                    $scope.activity = data.activityInfo;
                    packageUpdateInput();
                });

            } else {
                $stateParams.type === 'updateDraft' ? $scope.display.currentOperation = 'updateDraft' : $scope.display.currentOperation = 'updateAudit';
                //请求审核表
                AuditService.getAudit({
                    auditId: $stateParams.id
                }, function (data) {
                    audit = data;
                    if (!angular.isUndefined(data.content)) {
                        try {
                            var activityContent = JSON.parse(data.content);
                            activityContent.auditId = data.id;
                            activityContent.poster = data.thumbnail;
                            $scope.activity = activityContent;
                            packageUpdateInput();
                        } catch (e) {
                            new Error(e);
                        }
                        //如当前是编辑草稿则启动自动保存草稿功能
                        $stateParams.type === 'updateDraft' ? autoDraft() : '';
                    }

                });

            }
            //packageUpdateInput();
        }


        /**
         * 处理修改的数据
         * @method packageUpdateInput
         * @param
         * @return
         * author zyHu
         * date 15/11/12
         */
        function packageUpdateInput() {
            digestComplete();
            //1.控制当前操作时不可修改的字段
            switch ($stateParams.type) {
                //当修改线上活动、待审核活动时
                case 'update':
                    $scope.readonly = {
                        type: true,
                        activityTags: true,
                        startTime: true,
                        number: true,
                        cost: true
                    };
                    break;
                //修改草稿、审核、线下活动时不做控制
                default:
                    break;
            }
            //2. 转换数据
            updateActivityInfo();
        }


        //活动修改信息(需重新组装的数据)
        function updateActivityInfo() {
            //debugger
            if (!angular.isUndefined($scope.activity) && $scope.activity !== {}) {
                if($scope.activity.startTime){
                    $scope.activity.startTime = moment($scope.activity.startTime).format('YYYY-MM-DD HH:mm');
                }
                if($scope.activity.endTime) {
                    $scope.activity.endTime = moment($scope.activity.endTime).format('YYYY-MM-DD');
                }
                if($scope.activity.registEndTime) {
                    $scope.activity.registEndTime = moment($scope.activity.registEndTime).format('YYYY-MM-DD HH:mm');
                }
                //集合地
                if (typeof $scope.activity.assembleInfo === 'string') {
                    $scope.assembleGroupList = parseJson($scope.activity.assembleInfo);
                } else {
                    $scope.assembleGroupList = $scope.activity.assembleGroupInfo;
                }
                //如果集合地存在
                if ($scope.assembleGroupList) {
                    //重新组装回领队
                    for (var i = 0, group = $scope.assembleGroupList; i < group.length; i++) {
                        if ($scope.assembleGroupList.length === 1) {
                            group[i].addButton = 'icon_plus';
                            group[i].removeButton = 'hidden';
                        } else {
                            group[0].addButton = 'icon_reduce_1';
                            group[0].removeButton = 'hidden';
                            group[i].addButton = 'icon_plus';
                            group[i].removeButton = 'icon_reduce_1';
                        }
                        group[i].label = '领队';
                        group[i].leaButton = '管理领队';
                        if(_.isNumber(group[i].time)) {
                            if($scope.activity.subType === 2) {
                                group[i].time = moment(group[i].time).format('HH:mm');
                            }else {
                                group[i].time = group[i].time?moment(group[i].time).format('YYYY-MM-DD HH:mm'):'';
                            }
                        }
                    }
                }else {
                    //没有集合地，默认给个空的，防止页面什么都不显示
                    $scope.assembleGroupList = [{
                        address: '',
                        time: '',
                        addButton: 'icon_plus',
                        removeButton: 'hidden',
                        label: '领队',
                        leaders: [],
                        leaButton: '管理领队'
                    }];
                }
                if (typeof $scope.activity.consultInfo === 'string') {
                    $scope.selectSonsultList = parseJson($scope.activity.consultInfo);
                } else {
                    $scope.selectSonsultList = $scope.activity.consultInfo;
                }
                if (typeof $scope.activity.eventGroupInfo === 'string') {
                    $scope.eventGroupList = parseJson($scope.activity.eventGroupInfo);
                } else {
                    $scope.eventGroupList = $scope.activity.eventGroupInfo;
                }
                //活动分组
                if ($scope.eventGroupList && $scope.eventGroupList.length > 0) {
                    for (var j = 0, eve = $scope.eventGroupList; j < eve.length; j++) {
                        if ($scope.eventGroupList.length === 1) {
                            eve[j].addButton = 'icon_plus';
                            eve[j].removeButton = 'hidden';
                        } else {
                            eve[0].addButton = 'icon_reduce_1';
                            eve[0].removeButton = 'hidden';
                            eve[j].addButton = 'icon_plus';
                            eve[j].removeButton = 'icon_reduce_1';
                        }
                    }
                }else {
                    //草稿可能分组信息是空数组，给默认值
                    $scope.eventGroupList = [{
                        name: '',
                        price: '',
                        prepay: '',
                        number: '',
                        addButton: 'icon_plus',
                        removeButton: 'hidden',
                    }];
                }
                if($scope.activity.subTags) {
                    subTagsProcess($scope.activity.subTags);
                }

                //活动介绍：data for ueditor
                $scope.activity.introduce = htmlDecode( $scope.activity.introduce);
            }
            isFormValidate();
            setFlag();
            doEvalAsync();
        }

        function parseJson(obj) {
            if (!angular.isUndefined(obj) && obj !== null) {
                return JSON.parse(obj);
            }
        }
        /******表单基础数据-end******/

        /******表单基础元素显示隐藏判断-begin******/
        var weekNum = 0;  //周期活动的开始时间
        $scope.getWeekIds = function (id) {
            weekNum += Math.pow(2, id);
        };

        //选择领队
        var selectType = '', leaIndex = 0;
        $scope.openUser = function (type, index) {
            selectType = type;
            leaIndex = index;  //记录当前添加的是哪组集合地的领队
            var title = '';
            if ('leader' === type) {
                title = '选择领队';
            } else {
                title = '选择咨询';
            }

            vcModalService({
                retId: 'selectedUser',
                backdropCancel: false,
                title: title,
                css: {height: '500px',width: '400px'},
                templateUrl: 'app/templates/common/tplSelectAppUsers.html',controller: 'SelectAppUserController',
                success: {
                    label: '确定',fn: ('leader' === type) ? $scope.leaderList : $scope.sonsultList
                }
            }, {
                'op':'1,2',
                isMulitSelect: true,
                selectedUser: ('leader' === type) ? $scope.assembleGroupList[leaIndex].leaders : $scope.selectSonsultList
            });
        };

        //选中领队的集合
        $scope.leaderList = function (user) {
            $scope.assembleGroupList[leaIndex].leaders = user;
        };
        $scope.sonsultList = function (user) {
            $scope.selectSonsultList = user;

        };

        //移除领队/咨询
        $scope.removeUser = function (removeType, idx, parentIdx) {
            if ('leader' === removeType) {
                $scope.assembleGroupList[parentIdx].leaders.splice(idx, 1);
            } else {
                $scope.selectSonsultList.splice(idx, 1);
            }
        };

        //添加一组集合地/赛事活动的分组
        $scope.operateGroup = function (addType, list, index) {
            //如当前操作的默认一组且存在其他组,则屏蔽默认组的新增动作,改为移除
            if (index === 0 && list[0].addButton === 'icon_reduce_1') {
                $scope.removeGroup(list, index);
                return;
            }
            var obj = {};
            if ('event' === addType) {
                obj = {
                    name: '',
                    price: '',
                    prepay: '',
                    number: ''
                };
                addInputGroup(obj, $scope.eventGroupList);
            } else if ('assemble' === addType) {
                obj = {
                    address: '',
                    time: '',
                    label: '领队',
                    leaders: [],
                    leaButton: '管理领队'
                };
                addInputGroup(obj, $scope.assembleGroupList);

            }
        };

        function addInputGroup(obj, list) {
            obj.addButton = 'icon_plus';
            obj.removeButton = 'icon_reduce_1';
            //新增多个分组后将第一个改为移除操作
            list[0].addButton = 'icon_reduce_1';
            list.push(obj);
        }

        //移除一组集合地/赛事活动的分组
        $scope.removeGroup = function (list, index) {
            list.splice(index, 1);
            if (list.length === 1) {
                list[0].addButton = 'icon_plus';
                list[0].removeButton = 'hidden';
            }
        };
        /******表单基础元素显示判断-end******/

        /******表单验证-begin******/
        function validEndTime() {
            //if(typeof $scope.activity.endTime === 'string') {
            //    return;
            //}
            //活动返程时间不能早于出发时间
            var _end_time = moment($scope.activity.endTime)._d.getTime()+82800000;//加个数值是要到晚上11点
            if($scope.activity.startTime) {
                var _start_time = moment($scope.activity.startTime)._d.getTime();
                if((_end_time) < _start_time) {
                    $scope.formError.endTime = true;
                    return;
                }
            }
            $scope.formError.endTime = false;

            if($scope.activity.registEndTime) {
                var _reg_time = moment($scope.activity.registEndTime)._d.getTime();
                if(_reg_time > _end_time) {
                    $scope.formError.regEndTimeE = true;
                    $scope.formError.regEndTimeS = false;
                    return;
                }
            }
            $scope.formError.regEndTimeE = false;
            $scope.formError.regEndTimeS = false;
        }

        $scope.isValid = true;
        /**
         * 表单数据校验
         */
        $scope.validFormData = function () {
            if(!$scope.activity.poster) {
                TipService.add('warning', '缺少活动封面', 3000);
                $scope.isValid = false;
                return;
            }
            if(!$scope.selectSonsultList || $scope.selectSonsultList.length === 0) {
                TipService.add('warning', '至少选择一个咨询人员', 3000);
                $scope.isValid = false;
                return;
            }
            var _cur_time = new Date().getTime();
            if($scope.activity.payType === 2 && $scope.display.subType !== 'event') {//线上全款，定金,不等于赛事活动
                if(!$scope.activity.cost || $scope.activity.cost === 'null') {
                    TipService.add('warning', '缺少全款金额', 3000);
                    $scope.isValid = false;
                    return;
                }
                if(!$scope.activity.prePay || $scope.activity.prePay === 'null') {
                    TipService.add('warning', '缺少定金', 3000);
                    $scope.isValid = false;
                    return;
                }
                if(parseInt($scope.activity.cost) < 0) {
                    TipService.add('error','全款金额不能是负数',3000);
                    $scope.isValid = false;
                    return;
                }
                if(parseInt($scope.activity.prePay) < 0) {
                    TipService.add('error','定金金额不能是负数',3000);
                    $scope.isValid = false;
                    return;
                }
            }
            if(($scope.activity.payType === 3 || $scope.activity.payType === 4) && $scope.display.subType !== 'event') {
                if(!$scope.activity.cost || $scope.activity.cost === 'null') {
                    TipService.add('warning', '缺少全款金额', 3000);
                    $scope.isValid = false;
                    return;
                }
                if(parseInt($scope.activity.cost) < 0) {
                    TipService.add('error','全款金额不能是负数',3000);
                    $scope.isValid = false;
                    return;
                }
            }
            //验证全款，和定金
            if ($scope.display.subType !== 'event' && parseFloat($scope.activity.prePay) > parseFloat($scope.activity.cost)) {
                $scope.formError.money = true;
                TipService.add('warning', '定金不可大于全款', 3000);
                angular.element('input[ng-model="activity.prePay"]').focus();
                $scope.isValid = false;
                return;
            } else if (!$scope.selectSonsultList && $scope.selectSonsultList.length < 1) {
                TipService.add('warning', '请至少选择一个咨询人员', 3000);
                $scope.isValid = false;
                return;
            }else {
                $scope.isValid = true;
            }
            //验证集合地, 编辑状态不验证集合地信息
            if ($scope.op_state !== 2 && $scope.assembleGroupList.length > 0) {
                _.each($scope.assembleGroupList, function (as) {
                    if (as.address && as.time) {
                        if($scope.display.subType === 'week' && as.time && as.time.length > 6) {
                            //周期活动，集合时间是小时和分钟
                            TipService.add('warning','周期活动，集合时间格式不正确',3000);
                            $scope.isValid = false;
                            return ;
                        }else if($scope.display.subType !== 'week' && as.time && as.time.length < 6) {
                            //非周期活动，集合时间是待日期的
                            TipService.add('warning','集合时间格式不正确',3000);
                            $scope.isValid = false;
                            return ;
                        }else if($scope.display.subType !== 'week' && (moment(as.time)._d.getTime()) < _cur_time) {//非周期活动集合时间不能小于当前时间
                            TipService.add('warning','集合时间不能小于当前时间',3000);
                            $scope.isValid = false;
                            return ;
                        }
                        $scope.isValid = true;
                    } else {
                        TipService.add('warning', '缺少集合地信息', 3000);
                        $scope.isValid = false;
                        return;
                    }
                });
            }
            if(!$scope.isValid) {
                //_.each return 只是跳出遍历？
                return;
            }
            //周期活动
            if ($scope.display.subType === 'week') {
                if (weekNum === 0) {
                    $scope.weekStartTimeError = true;
                    $scope.isValid = false;
                    TipService.add('warning','缺少周期日期',3000);
                    return;
                } else {
                    $scope.weekStartTimeError = false;
                    $scope.isValid = true;
                }
                if($scope.activity.tripDur && parseInt($scope.activity.tripDur) > 0) {
                    $scope.isValid = true;
                    $scope.weekDayError = false;
                }else if(parseInt($scope.activity.tripDur) <= 0){
                    $scope.isValid = false;
                    $scope.weekDayError = true;
                    TipService.add('warning','行程天数必须是正整数',3000);
                    return;
                } else{
                    $scope.isValid = false;
                    $scope.weekDayError = true;
                    TipService.add('warning','缺少行程天数',3000);
                    return;
                }
            }else {
                //非周期活动，验证出发，返程，截止时间
                var _cur_time = (new Date().getTime()) + 2000;
                if(!$scope.activity.startTime) {
                    TipService.add('warning','缺少出发时间',3000);
                    $scope.isValid = false;
                    return;
                }else if(moment($scope.activity.startTime)._d.getTime() < _cur_time) {
                    TipService.add('warning','出发时间不能小于当前时间',3000);
                    $scope.isValid = false;
                    return;
                }
                if(!$scope.activity.endTime) {
                    TipService.add('warning','缺少返程时间',3000);
                    $scope.isValid = false;
                    return;
                }
                if(!$scope.activity.registEndTime) {
                    TipService.add('warning','缺少报名截止时间',3000);
                    $scope.isValid = false;
                    return;
                }else if(moment($scope.activity.registEndTime)._d.getTime() < _cur_time) {
                    TipService.add('warning','报名截止时间不能小于当前时间',3000);
                    $scope.isValid = false;
                    return;
                }
                if(moment($scope.activity.startTime)._d.getTime() > (moment($scope.activity.endTime)._d.getTime()+82800000)){
                    TipService.add('error','出发时间不能大于返程时间',3000);
                    $scope.isValid = false;
                    return;
                }
            }
            //非赛事活动
            if($scope.display.subType !== 'event') {
                if ($scope.activity.activityTags === -1) {
                    TipService.add('error', '请选择活动分类',3000);
                    $scope.isValid = false;
                    return;
                }
                if(!$scope.activity.number) {
                    TipService.add('error','缺少活动名额人数',3000);
                    $scope.isValid = false;
                    return;
                }
                if($scope.op_state === 2) {//编辑操作
                    if($scope.activity.unionState === 0 && $scope.activity.joinNumber > parseInt($scope.activity.number)){//未联盟
                        TipService.add('error','活动名额不能少于已报名人数',3000);
                        $scope.isValid = false;
                        return;
                    }else if(parseInt($scope.activity.number)<(parseInt($scope.activity.joinNumber))+parseInt($scope.activity.unionJoinNum)) {
                        TipService.add('error','活动名额不能少于已报名人数+已联盟人数',4000);
                        $scope.isValid = false;
                        return;
                    }
                }
            } else if ($scope.display.subType === 'event') {//赛事活动
                $scope.activity.prePay = null;//不传该预付款信息
                var _unionJoinNum = null;
                if($scope.op_state === 2) {
                    _unionJoinNum = JSON.parse($scope.activity.unionJoinNum);
                }
                _.each($scope.eventGroupList, function (ev) {
                    if (!ev.name|| !ev.number) {
                        TipService.add('error', '缺少活动分组信息', 3000);
                        $scope.isValid = false;
                        return;
                    } else if($scope.activity.payType === 2 && (parseFloat(ev.price) < parseFloat(ev.prePay))) {//定金和全款
                        TipService.add('error', '定金不可大于全款', 3000);
                        $scope.isValid = false;
                        return;
                    }else {
                        $scope.isValid = true;
                    }
                    if($scope.op_state === 2 && !_.isEmpty(_unionJoinNum)) {
                        //流程未处理
                    }
                    if(parseInt(ev.number) < 1) {
                        TipService.add('error', '分组人数不能小于0', 3000);
                        $scope.isValid = false;
                        return;
                    }
                });
            };
            if(!$scope.isNewEditor && !$scope.activity.introduce) {
                TipService.add('error','请输入活动详情',3000);
                $scope.isValid = false;
                return;
            }else if($scope.isNewEditor && !$scope.editor.validate()){
                $scope.isValid = false;
                return;
            }
        };
        /******表单验证-end******/

        /******表单数据组装-begin******/
        function parseSaveData(_activity) {
            _activity.assembleGroupInfo = []; //集合地信息
            _activity.eventGroupInfo = []; //赛事活动分组信息
            _activity.consultInfo = [];
            //组装赛事分组信息
            if ('event' === $scope.display.subType) {
                var num = 0;
                _.each($scope.eventGroupList, function (ev) {
                    _activity.eventGroupInfo.push({
                        name: ev.name,
                        price: ev.price,
                        prePay: ev.prePay,
                        number: ev.number
                    });
                    num += ev.number; //赛事活动活动名额为所有分组人数之和
                });
                _activity.number = num;
                _activity.level = 0;//赛事活动无难易程度
            }else {
                _activity.level = validUndefined($scope.activity.level, parseInt($scope.activity.level));
            }

            //组装咨询人字段信息
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

            //组装集合地信息
            _.each($scope.assembleGroupList, function (as) {
                //剔除掉无效数据
                if (as.address === '' && as.time === '') {
                    window.ArrayRemove($scope.assembleGroupList,as);
                }
                //组装领队
                //phone:re.phone, 暂无此字段,后续补上
                var leaderInfo = [];
                _.each(as.leaders, function (re) {
                    leaderInfo.push({
                        uid: re.uid,
                        name: re.nickname || re.name,
                        imgPath: re.imgPath,
                        sex: re.sex,
                        id: re.id,
                        label: re.label || '',
                        phone: re.loginName||re.phone
                    });
                });
                _activity.assembleGroupInfo.push({
                    address: as.address,
                    time: as.time,
                    leaders: leaderInfo
                });

            });

            $scope.unionState = 0; //默认未联盟
            _activity.subTag = weekNum;  //处理后的周期时间


            //类型转换
            _activity.startTime = validUndefined($scope.activity.startTime, moment($scope.activity.startTime)._d.getTime());
            _activity.endTime = validUndefined($scope.activity.endTime, (moment($scope.activity.endTime)._d.getTime())+82800000);
            _activity.registEndTime = validUndefined($scope.activity.registEndTime, moment($scope.activity.registEndTime)._d.getTime());
            //报名截止时间不填默认为出发日期前一天
            if ($scope.display.subType !== 'week' && $scope.activity.registEndTime === null) {
                _activity.registEndTime = new Date($scope.activity.startTime - 24 * 60 * 60 * 1000);
            }
            _activity.subType = validUndefined($scope.activity.subType, parseInt($scope.activity.subType));
            _activity.activityTags = validUndefined($scope.activity.activityTags, parseInt($scope.activity.activityTags));
            if(!$scope.isNewEditor) {
                _activity.introduce = UE.getEditor($scope.ueditorId).getContent();
            }else {
                _activity.introduce = $scope.editor.getContent();
            }
            if(!_activity.registNotice) {
                _activity.registNotice = "VARICOM_123456";
            }
            if(!_activity.activityNotice) {
                _activity.activityNotice = "VARICOM_123456";
            }
        }

        function validUndefined(validInfo, doInfo) {
            if (!angular.isUndefined(validInfo) && validInfo !== null && validInfo !== '') {
                return doInfo;
            } else {
                return '';
            }
        }

        /******表单数据组装-end******/

        /******提交表单-begin******/
        $scope.saveActivityForm = function () {
            subTagsProcess();
            //验证输入是否合法
            $scope.validFormData();
            //表单验证通过才发请求enterUnionActivityController
            if ($scope.isValid === true) {
                //parseSaveData();
                //如有审核权限,直接提交
                if ($scope.perminssion) {
                    submitActivity();
                } else {
                    $scope.submitAudit();
                }

            } else {
                //提示
                //TipService.add('error','表单未填写完整',3000);
            }
        };

        /**
         * 周期活动，周期处理
         * @param subTags
         */
        function subTagsProcess(subTags) {
            if(subTags) {
                for(var i in subTags){
                    if(subTags[i] === 1) {
                        $scope.weekList[i].state = 1;
                    }
                }
            }else {
                var _has = false;
                weekNum = 0;
                //保存处理
                for(var n in $scope.weekList) {
                    if($scope.weekList[n].state === 1) {
                        _has = true;
                        weekNum += Math.pow(2, $scope.weekList[n].id);
                    }
                }
                if(!_has) {
                    weekNum = 0;
                }
                return weekNum;
            }
        }

        /**
         *格式化对象为字符串
         */
        function obj2JsonStr() {
            var _activity = angular.copy($scope.activity);
            parseSaveData(_activity);
            var _g_time = null;
            for (var g in _activity.assembleGroupInfo) {
                _g_time = _activity.assembleGroupInfo[g].time;
                if(_g_time && _g_time.length < 6) {//周期活动，集合时间只有小时和分钟
                    _g_time = moment(new Date().getTime()).format('YYYY-MM-DD') + ' '+_g_time;
                }
                _activity.assembleGroupInfo[g].time = moment(_g_time)._d.getTime();
            }
            _activity.assembleInfo = JSON.stringify(_activity.assembleGroupInfo);
            _activity.consultInfo = JSON.stringify(_activity.consultInfo);
            if (_activity.eventGroupInfo) {
                _activity.eventGroupInfo = JSON.stringify(_activity.eventGroupInfo);
            }
            if(!$scope.isNewEditor){
                //活动的详情需要编码
                _activity.introduce = htmlEncode(_activity.introduce);
            }

            return _activity;
        }

        /**
         * 发布，提交活动信息
         */
        function submitActivity() {
            var msg = '活动发布成功';
            //下线活动编辑同新增;或编辑草稿后提交发布, 下线的活动编辑下线是复制活动功能
            if (typeof $stateParams.type === 'undefined' || $stateParams.type === 'add'|| $stateParams.type ==='updateOffline'
                || $stateParams.type === 'updateDraft' || $stateParams.type === 'updateAudit') {
                var _activity = obj2JsonStr();
                _activity.subTag = weekNum;
                ActReleaseService.actReq('activity/add', _activity, function (data) {
                    if (!angular.isUndefined(data)) {

                        if ($stateParams.type === 'updateOffline') {
                            msg = '活动修改成功';
                        }
                        //TipService.add('success', msg, 3000);
                        window.vcAlert('活动上线成功');
                        reset2New();
                        isAuditSubmit();
                        isDraftSubmit();
                        isOfflineSubmit();
                        //CommTabService.next($scope.$vcTabInfo,1,{open:true,init:true},'manage');
                        CommTabService.next($scope.$vcTabInfo, 'online', {open:true,init:true}, 'manage',['online','audit','draft','offline']);
                    }
                }, function (err) {
                    TipService.add('error', '保存失败:'+err.msg, 3000);
                });
            }
            else {
                var _activity = obj2JsonStr();
                _activity.subTag = weekNum;
                ActReleaseService.actReq('activity/update', _activity, function (data) {
                    TipService.add('success','活动修改成功',3000);
                    reset2New();
                    //CommTabService.next($scope.$vcTabInfo,1,{open:true},'manage');
                    CommTabService.next($scope.$vcTabInfo, 'online', {open:true,init:true}, 'manage',['online']);
                }, function (err) {
                    TipService.add('error','活动修改失败:'+err.msg, 3000);
                });
            }
        }

        /******提交表单-end******/


        /********提交待审核*begin************/
        $scope.submitAudit = function () {
            buildDraft();
            var msg = '';

            if ($stateParams.type === 'updateAudit') {
                audit.bizId = $scope.activity.id;
                msg = '活动已成功重新提交审核';
                AuditService.save(audit,function(data) {
                    
                    TipService.add('success', msg,3000);
                    reset2New();
                    CommTabService.next($scope.$vcTabInfo, 'myaudit', {open:true}, 'manage',['myaudit','audit']);
                });
            } else {
                msg = '活动发布审核提交成功';
                AuditService.save(audit, function (data) {
                    TipService.add('success', msg, 3000);
                    
                    reset2New();
                    isDraftSubmit();
                    CommTabService.next($scope.$vcTabInfo, 'myaudit', {open:true}, 'manage',['myaudit','audit']);
                });

            }

        };

        function isAuditSubmit() {
            if($stateParams.type === 'updateAudit') {
                //如果是草稿提交审核，则草稿列表刷新数据,放在timeout里是防止事件被合并，因为key都是相同的
                $timeout(function(){
                    //CommTabService.next($scope.$vcTabInfo,2,{open:false},'manage');
                    CommTabService.dirty($scope.$vcTabInfo, 'audit', 'manage', true);
                },0);
            }
        }

        function isDraftSubmit() {
            if($stateParams.type === 'updateDraft') {
                //如果是草稿提交审核，则草稿列表刷新数据,放在timeout里是防止事件被合并，因为key都是相同的
                $timeout(function(){
                    //CommTabService.next($scope.$vcTabInfo,5,{open:false},'manage');
                    CommTabService.dirty($scope.$vcTabInfo, 'draft', 'manage', true);
                },0);
            }
        }

        function isOfflineSubmit() {
            if($stateParams.type === 'updateOffline') {
                //如果是下线编辑提交上线，则下线列表刷新数据,放在timeout里是防止事件被合并，因为key都是相同的
                $timeout(function(){
                    //CommTabService.next($scope.$vcTabInfo,4,{open:false},'manage');
                    CommTabService.dirty($scope.$vcTabInfo, 'offline', 'manage', true);
                },0);
            }
        }

        /**
         * 构建草稿/待审核信息
         * @returns {{id: *, bizId: (*|string), bizType: number, title: *, thumbnail: (string|*), status: number, auditType: number, remark: string, content}}
         */
        function buildDraft() {
            //var _activity = angular.copy($scope.activity);
            //parseSaveData(_activity);
            var _activity = obj2JsonStr();
            /**保存周期活动**/
            var _subTags = [];
            for(var s in $scope.weekList) {
                _subTags.push($scope.weekList[s].state);
            }
            _activity.subTags = _subTags;
            /**周期活动end**/
            audit.bizId = $scope.activity.id || '';
            audit.bizType = 4;
            audit.status = 1;
            if($scope.activity && $scope.activity.id) {
                audit.auditType = 2;
            }else {
                audit.auditType = 1;
            }
            audit.title= $scope.activity.title;
            audit.thumbnail= $scope.activity.poster;

            //fix by wayky : 当提交审核时，需要把提交人(leader)的信息带上
            var currUser = AuthService.getUserInfo();
            _activity.leaderUid = currUser.uid;
            _activity.leaderRid = currUser.rid;
            _activity.leaderName = currUser.userName;
            _activity.leaderPhone = currUser.loginName;
            _activity.leaderHead = currUser.imgPath;
            _activity.leaderSex = currUser.sex || 0;

            audit.content = JSON.stringify(_activity);
        }

        /***********提交审核**end***********/


        /***********保存草稿**begin***********/
        $scope.saveDraft = function () {
            if(!$scope.activity || !$scope.activity.introduce) {
                return;
            }
            buildDraft();
            audit.status = 0;
            audit.auditType = 0;
            audit.remark = '';
            if ($stateParams.type !== 'updateDraft') {
                AuditService.save(audit, function (data) {
                    audit.id = data;
                    TipService.add('add','草稿保存成功',2000);
                    //CommTabService.next($scope.$vcTabInfo,5,{open:false},'manage');
                    CommTabService.dirty($scope.$vcTabInfo, 'draft', 'manage', true);
                },function(err) {
                    TipService.add('add','草稿保存失败:'+err.msg,2000);
                });
            } else {
                AuditService.save(audit, function (data) {
                    audit.id = data;
                    TipService.add('add','草稿修改成功',2000);
                    //CommTabService.next($scope.$vcTabInfo,5,{open:false},'manage');
                    CommTabService.dirty($scope.$vcTabInfo, 'draft', 'manage', true);
                },function(err) {
                    TipService.add('add', '草稿修改失败:'+err.msg, 2000);
                });
            }
        };
        /*********保存草稿**end************/


        /*********自动保存草稿*begin***********/
        function autoDraft() {
            if($scope.draftInterval) {
                return;
            }
            $scope.draftInterval = $interval(function () {
                var isSaveDraft = $scope.saveDraft();
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
        /*********自动保存草稿*end***********/
        //清空表单
        $scope.clearActivityForm = function () {
            var _display_operation = null;
            if($scope.display.currentOperation) {
                _display_operation = $scope.display.currentOperation;
            }
            initObj();
            if(_display_operation) {
                $scope.display.currentOperation = _display_operation;
            }
            $scope.activity.assembleGroupInfo = [];
            $scope.activity.eventGroupInfo = [];
            //digestComplete({op_type:2});
        };

        /**
         * 重置为新增活动状态
         */
        function reset2New() {
            audit={};
            $stateParams.type = 'add';
            $scope.op_state = 1;//重置为新增
            $scope.clearActivityForm();
            $scope.readonly = {};
            $scope.display.currentOperation = 'add';
            $scope.hasJoinNumber = 0;
            //$scope.initActivityForm();
        }

        /**
         * 编辑活动，返回按钮
         */
        $scope.goBack = function() {
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
                //CommTabService.next($scope.$vcTabInfo, 2, {});
                var _tag = $scope.lastTabInfo?$scope.lastTabInfo.tag:'online';
                var _root = $scope.lastTabInfo?$scope.lastTabInfo.root:'manage';
                CommTabService.next($scope.$vcTabInfo, _tag, {open:true}, _root);
            });
        }

        function watch() {
            //不同活动类型发布活动内容有所不同
            $scope.$watch('activity.subType', function () {
                switch ($scope.activity.subType) {
                    case 2:
                        $scope.display.subType = 'week';
                        $scope.required.startTime = false;
                        $scope.required.endTime = false;
                        $scope.required.num = true;
                        $scope.groupTimeConf = {dateFmt:'HH:mm'};
                        if($scope.op_state !== 2) {
                            //周期活动的开始时间选项
                            $scope.weekList = [{
                                id: 0, name: '周一',state:0
                            }, {
                                id: 1, name: '周二',state:0
                            }, {
                                id: 2, name: '周三',state:0
                            }, {
                                id: 3, name: '周四',state:0
                            }, {
                                id: 4, name: '周五',state:0
                            }, {
                                id: 5, name: '周六',state:0
                            }, {
                                id: 6, name: '周天',state:0
                            }];
                        }
                        break;
                    case 3:
                        $scope.display.subType = 'event';
                        $scope.required.startTime = false;
                        $scope.required.endTime = false;
                        $scope.required.num = false;
                        $scope.groupTimeConf = {realDateFmt:'yyyy-MM-dd',realTimeFmt:'HH:mm',dateFmt:'yyyy-MM-dd HH:mm',minDate:"%y-%M-%d %H:%m",startDate:'%y-%M-{%d+3} %H:%m'};
                        break;
                    default:
                        $scope.display.subType = 'default';
                        $scope.required.startTime = true;
                        $scope.required.endTime = false;
                        $scope.required.num = true;
                        $scope.groupTimeConf = {realDateFmt:'yyyy-MM-dd',realTimeFmt:'HH:mm',dateFmt:'yyyy-MM-dd HH:mm',minDate:"%y-%M-%d %H:%m",startDate:'%y-%M-{%d+3} %H:%m'};
                }
            });
            //验证出发时间
            $scope.$watch('activity.startTime', function (newVal) {
                if(!newVal) {
                    return;
                }
                validEndTime();
                if(newVal && !$scope.activity.registEndTime) {//报名截止时间没有值时才自动给值
                    var _date =moment(newVal)._d.getTime();
                    var _day_before = _date - 86400000;//前一天
                    if(_day_before < (new Date().getTime())) {
                        //如果前一天时间小于当前时间
                        $scope.activity.registEndTime = newVal;
                    }else {
                        $scope.activity.registEndTime = moment(_day_before).format('YYYY-MM-DD HH:mm');
                    }
                }
            });
            ///返程时间
            $scope.$watch('activity.endTime', function (newVal) {
                if(!newVal) {
                    return;
                }
                validEndTime();
            });
            //报名截止时间
            $scope.$watch('activity.registEndTime', function (newVal) {
                if(!newVal){
                    return;
                }
                try {
                    var _reg_time = moment($scope.activity.registEndTime)._d.getTime();
                    if($scope.activity.startTime) {
                        var _start_time = moment($scope.activity.startTime)._d.getTime();
                        if (_reg_time > _start_time) {
                            $scope.formError.regEndTimeS = true;
                            $scope.formError.regEndTimeE = false;
                            return;
                        }
                    }
                    if($scope.activity.endTime) {
                        var _end_time = moment($scope.activity.endTime)._d.getTime()+82800000;
                        if(_reg_time > _end_time) {
                            $scope.formError.regEndTimeE = true;
                            $scope.formError.regEndTimeS = false;
                            return;
                        }
                    }
                    $scope.formError.regEndTimeS = false;
                    $scope.formError.regEndTimeE = false;
                }catch(err){}
            });
        }

        /**
         * 预览
         */
        $scope.preview = function() {
            //1218 每次预览前获取最新数据
            var preData={};
                preData= obj2JsonStr();
                var subTags = [];
                    for(var s in $scope.weekList) {
                        subTags.push($scope.weekList[s].state);
                    }
                preData.subTags = subTags; 
            
            if(!$scope.activity.introduce) {
                TipService.add('warning','请填写必要信息',3000);
                return;
            }
            CacheService.putObject('preview_activity', preData);
            var _cur_time = new Date().getTime();
            previewModalService.activate({
                f_src:'/assets/preview/activity/index.html?r='+_cur_time
            });
        }

        /**
         * 表单是否有$error
         */
        function isFormValidate() {
            /*
            $timeout(function(){
                try {
                    var _error = angular.element('form[name="activityForm"]').scope().activityForm.$error;
                    if(_error && !_.isEmpty(_error)) {
                        _.each(_error,function(n) {
                            _.each(n,function(e) {
                                TipService.add('error', '非法值:'+e.$modelValue,3000);
                            });
                        });
                    }
                }catch(err){}
            },500);
            */
        }

        /**
         * 更新活动设置标示位,方便判断某些字段是否可以编辑
         */
        function setFlag() {
            if($scope.activity.joinNumber && $scope.activity.joinNumber > 0 && $scope.op_state === 2) {
                $scope.hasJoinNumber = 1;
            }
            //是否联盟过，见面过的话分组都不能改
            if($scope.activity.unionState !== 0) {
                $scope.isUnion = true;
            }else {
                $scope.isUnion = false;
            }
        }
    }

    ActivityReleaseController.$inject = ['$scope', '$timeout', 'vcModalService', 'CacheService', 'TipService', 'previewModalService',
        'AuditService', '$interval', '$stateParams', 'ActReleaseService','CommTabService', 'AuthService'];


})();