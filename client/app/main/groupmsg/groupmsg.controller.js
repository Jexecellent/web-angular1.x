/**
 * Created by hxl on 2015/10/22.
 */
;
(function () {
    'use strict';

    angular.module('main.groupmsg')
        .controller('GroupMsgController', ['$scope', '$stateParams', '$timeout', 'CommTabService', GroupMsgController])
        .controller('GroupMsgMgrController', ['$scope', GroupMsgMgrController])
        .controller('GroupMsgListController', ['$scope', 'CommRestService', 'CommTabService', 'TipService','CacheService', 'previewModalService', GroupMsgListController])
        .controller('GroupMsgEditController', ['$scope', 'CommRestService', 'vcModalService', 'AuditService', 'TipService', 'CommTabService','AuthService', GroupMsgEditController])
        .filter('groupMsgStatus', GroupMsgStatusFilter)
        .filter('groupMsgUsers', GroupMsgUsersFilter)
        .filter('GroupMsgContent', GroupMsgContentFilter)
        .filter('groupMsgType', GroupMsgTypeFilter);

    /**
     * 首页
     * @param $scope
     * @constructor
     */
    function GroupMsgController($scope, $stateParams, $timeout, CommTabService) {
        $scope.loading = false;
        var targetTab = $stateParams.tab;
        var targetTag = $stateParams.tag;

        if (!!targetTag) {
            //只能延迟点处理
            $timeout(function () {
                CommTabService.next({index: 2, tag: 'manage', root: 'groupmsgTabs'}, targetTag, {}, targetTab);
            }, 500);
        }
    }

    /**
     * 编辑
     * @param $scope
     * @param CommRestService
     * @param CommTabService
     * @param vcModalService
     * @param CommTabService
     */
    function GroupMsgEditController($scope, CommRestService, vcModalService, AuditService, TipService, CommTabService,AuthService) {

        //当前操作
        $scope.operate = 'add';

        var defaultGroupMessage = {
            type:1,
            aidType: 10,
            title:'',
            picture: '',
            location: '',
            content:'',
            desc:'',
            scheduleTime: ''
        };

        //群发消息实体,默认是文本消息
        $scope.groupMessage = angular.copy(defaultGroupMessage);

        //草稿或审核实体
        var audit = {};

        $scope.isSelectAll = true; //选择全部用户
        $scope.users = []; //选择的用户信息

        // 页面初始化
        var uploader = null;
        $scope.vcTabOnload = function (data, lastTabInfo) {
            if (data) {
                $scope.operate = data.operate;
                if ($scope.operate === 'edit') {
                    //编辑旧的数据
                    var msgId = data.dataId;
                    $scope.$parent.loading = true;
                    CommRestService.post('groupmsg/get', {id:msgId}, function (data) {
                        $scope.$parent.loading = false;
                        $scope.groupMessage = data;
                        if(data.scheduleTime){
                            $scope.groupMessage.scheduleTime = moment(data.scheduleTime).format('YYYY-MM-DD hh:mm');
                        }
                        if (data.type == 2) {
                            $scope.groupMessage.desc = $scope.groupMessage.content;
                            $scope.groupMessage.content = "";
                        } else {
                            $scope.groupMessage.desc = '';
                        }
                        if($scope.groupMessage.receiveId){
                            CommRestService.post('user/list', {rids: $scope.groupMessage.receiveId, pageSize: 1000, pageNumber: 1}, function (data) {
                                $scope.users = data.content;
                                if($scope.users.length > 0){
                                    $scope.isSelectAll = false;
                                }
                            });
                        }
                    }, function (err) {
                        $scope.$parent.loading = false;
                    });
                }
                else if ($scope.operate === 'editDraft' || $scope.operate === 'editAudit') {
                    //编辑草稿或审核
                    $scope.$parent.loading = true;
                    AuditService.getAudit({
                        auditId: data.dataId
                    }, function (data) {
                        $scope.$parent.loading = false;

                        //审核或草稿数据
                        audit = data;
                        var res = JSON.parse(data.content);
                        //审核或草稿里的业务数据
                        res.auditId = data.id; //附带上对应审核或草稿Id
                        if(res.scheduleTime){
                            res.scheduleTime = moment(res.scheduleTime).format('YYYY-MM-DD hh:mm');
                        }

                        if(res.type === 2){
                            res.desc = res.content;
                            res.content = '';
                        } else {
                            res.desc = '';
                        }
                        $scope.groupMessage = res;

                        if($scope.groupMessage.receiveId){
                            CommRestService.post('user/list', {rids: $scope.groupMessage.receiveId, pageSize: 1000, pageNumber: 1}, function (data) {
                                $scope.users = data.content;
                                if($scope.users.length > 0){
                                    $scope.isSelectAll = false;
                                }
                            });
                        }

                    }, function (err) {
                        $scope.$parent.loading = false;
                    });
                }

                $scope.lastTabInfo = lastTabInfo || $scope.$vcTabInfo;
            }
            if (uploader == null) {
                //上传图片组件初始化
                uploader = WebUploader.create({
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
                uploader.on('uploadComplete', uploadComplete);
                uploader.on('error', uploadError);
            }
        };

        function fUploadSuccess(file, response) {
            if (response && response.code === 0) {
                !$scope.$$phase && $scope.$apply(function () {
                    $scope.groupMessage.picture = response.t;
                });
            }
        }

        //当图片validate不通过时
        function uploadError(handler) {
            if (handler === 'Q_EXCEED_SIZE_LIMIT') {
                vcAlert('图片大小已超过2M，请重新上传');
            }
            if (handler === 'Q_TYPE_DENIED') {
                vcAlert('图片类型无效，请重新上传');
            }
        }

        //重置状态(可重复上传已在队列中的图片)
        function uploadComplete() {
            this.reset();
        }

        /**
         * 清空表单数据
         */
        $scope.clear = function () {
            delete $scope.groupMessage.desc;
            delete $scope.groupMessage.title;
            delete $scope.groupMessage.picture;
            delete $scope.groupMessage.location;
            delete $scope.groupMessage.content;
            delete $scope.groupMessage.scheduleTime;
            audit = {};
            $("#_img_show").removeAttr("src");
            $scope.isSelectAll = true;
            $scope.users = [];
        };

        $scope.init = function(){
            $scope.operate = "add";
            var _dMsg = angular.copy(defaultGroupMessage);
            _dMsg.type = $scope.groupMessage.type || 1;
            if (_dMsg.type == 2) {
                _dMsg.aidType = 11;
            }
            $scope.groupMessage = _dMsg;
            $scope.isSelectAll = true;
            audit = {};
            $("#_img_show").removeAttr("src");
            $scope.users = [];
        };

        $scope.back = function () {
            $scope.init();
            CommTabService.next($scope.$vcTabInfo, $scope.lastTabInfo.index, {}, $scope.lastTabInfo.root);
        };

        /**
         * 检验数据是否合法
         * @returns {boolean}
         */
        var validate = function () {
            if ($scope.groupMessage.type == 2) {
                if (!$scope.groupMessage.title || 0 === $scope.groupMessage.title.length) {
                    TipService.add('warning', '请输入标题', 3000);
                    return false;
                }
                if (!$scope.groupMessage.picture || 0 === $scope.groupMessage.picture.length) {

                    TipService.add('warning', '请上传图片', 3000);
                    return false;
                }

                //if ($scope.groupMessage.location && -1 !== $scope.groupMessage.location.indexOf("http://api.varicom.im")) {
                //    $scope.groupMessage.aidType = 13;
                //} else {
                //    $scope.groupMessage.aidType = 11;
                //}

                //若是自定义的连接则必须为11的aid
                if ($scope.groupMessage.aidType == 10) {
                    $scope.groupMessage.aidType = 11;
                }

                $scope.groupMessage.content = $scope.groupMessage.desc;
                delete $scope.groupMessage.desc;
                //$scope.groupMessage.desc = "";
            } else {
                if (0 === $scope.groupMessage.content.length) {
                    TipService.add('warning', '请输入您要推送的消息。', 3000);
                    return false;
                }
                $scope.groupMessage.aidType = 10;
                delete $scope.groupMessage.desc;
                delete $scope.groupMessage.title;
                delete $scope.groupMessage.picture;
                delete $scope.groupMessage.location;
            }

            if ($scope.users.length > 0) {
                var _reciverUid = [];
                var _reviverRid = [];
                $scope.users.forEach(function (e) {
                    _reciverUid.push(e.uid);
                    _reviverRid.push(e.id);
                });
                $scope.groupMessage.receiveUid = _reciverUid.join(',');
                $scope.groupMessage.receiveId = _reviverRid.join(',');
            }

            return true;
        };

        /**
         * 发送
         */
        $scope.submit = function (type) {
            if (!validate()) {
                return;
            }

            var params = $scope.groupMessage;

            if (params.scheduleTime) {
                params.scheduleTime = new Date(Date.parse(params.scheduleTime.replace(/-/g, '/'))).getTime();
                if(params.scheduleTime< new Date().getTime()){
                    params.scheduleTime = "";
                    TipService.add('warning', '发送时间不能小于当前时间', 3000);
                    return;
                }
            }

            delete params.createTime;
            delete params.updateTime;
            delete params.sendTime;

            $scope.userInfo = AuthService.getUserInfo();
            params.senderId = $scope.userInfo.uid;
            params.senderRid = $scope.userInfo.rid;

            if (1 === type) {
                //发送
                $scope.$parent.loading = true;
                var path = "";
                var toTag = "";
                if($scope.groupMessage.id){
                    path = 'groupmsg/update';
                    toTag = 'online';
                } else {
                    path = 'groupmsg/add';
                    toTag = 'online';
                }
                CommRestService.post(path, params, function (data) {
                    $scope.$parent.loading = false;
                    TipService.add('success', '提交成功', 3000);
                    $scope.clear();
                    CommTabService.next($scope.$vcTabInfo, toTag, {}, 'manage', ['online','offline']);
                }, function (err) {
                    $scope.$parent.loading = false;
                    $scope.groupMessage.scheduleTime = moment($scope.groupMessage.scheduleTime).format('YYYY-MM-DD hh:mm');
                    TipService.add('danger', err.msg, 3000);
                });
            } else if (2 === type) {
                //提交审核
                if (params.type == 1) {
                    audit.title = params.content;
                } else {
                    audit.title = params.title;
                    audit.thumbnail = params.picture;
                    audit.desc = params.content;
                }
                audit.content = JSON.stringify(params);
                audit.bizId = params.id;
                audit.bizType = 6;
                audit.status = 1;
                audit.auditType = 1;

                $scope.$parent.loading = true;
                AuditService.save(audit, function () {
                    $scope.$parent.loading = false;
                    TipService.add('success', '提交审核成功', 3000);
                    //回到列表页
                    $scope.clear();
                    CommTabService.next($scope.$vcTabInfo, 'myaudit', {}, 'manage', ['myaudit']);
                }, function (err) {
                    $scope.$parent.loading = false;
                    TipService.add('warning', err.msg, 3000);
                });
            }
        };


        /**
         * 选择用户
         */
        $scope.toggleModal = function (index) {
            if (index === 2) { //选择用户
                vcModalService({
                    retId: 'selectedUser',
                    backdropCancel: false,
                    title: '选择用户',
                    css: {
                        height: '500px',
                        width: '400px'
                    },
                    templateUrl: 'app/templates/common/tplSelectAppUsers.html',
                    controller: 'SelectAppUserController',
                    success: {
                        label: '确定',
                        fn: $scope.selectUser
                    }
                }, {
                    queryParams: {
                        pageSize: 10
                    },
                    isMulitSelect: true, //多选控制
                    selectedUser: $scope.users
                });
            } else if (index === 3) { //选择资讯
                vcModalService({
                    retId: 'selectedData',
                    backdropCancel: false,
                    title: '选择资讯',
                    css: {
                        height: '500px',
                        width: '600px'
                    },
                    templateUrl: 'app/templates/common/tplArticle.html',
                    controller: 'SelectArtController',
                    success: {
                        label: '确定',
                        fn: $scope.selectArticle
                    }
                }, {
                    queryParams: {
                        pageSize: 10
                    }
                });
            }
        };

        /**
         * 处理选择后的数据
         * @param users 选中的用户数据
         */
        $scope.selectUser = function (users) {
            $scope.users = users;
            if (users && users.length > 0) { //存在被选中的用户
                $scope.isSelectAll = false;
            } else { //没有选择任何用户
                $scope.isSelectAll = true;
            }
        };

        /**
         * 选择资讯
         * @param article   选中的资讯链接
         */
        $scope.selectArticle = function (article) {
            $scope.groupMessage.aidType = article.aidType;
            $scope.groupMessage.location = article.link;
            $scope.groupMessage.title = article.title;
            $scope.groupMessage.aidType = article.aidType;
        };

        /**
         * 移除一个选中的用户
         * @param id    选中用户的ID
         */
        $scope.removeOneUser = function (id) {
            _.remove($scope.users, function (n) {
                return n.id === id;
            });
            if (0 === $scope.users.length) {
                $scope.isSelectAll = true;
            }

        };
    }

    /**
     * 管理
     * @param $scope
     * @constructor
     */
    function GroupMsgMgrController($scope) {
        $scope.loading = false;
    }

    /**
     * 列表
     * @param $scope
     * @param CommRestService
     * @param CommTabService
     * @param TipService
     * @constructor
     */
    function GroupMsgListController($scope, CommRestService, CommTabService, TipService, CacheService, previewModalService) {

        //消息状态: 0 删除  1  待审核  2 发送中  3  审核不通过   4 发送成功   5 发送失败    6 待发送
        $scope.status = '2,6';

        $scope.params = {
            pageSize: 10,
            pageNumber: 0
        };

        $scope.vcTabOnload = function (data) {
            if ($scope.$dirty) {
                $scope.data = [];
                $scope.page = {};
                $scope.loadData(1);
                $scope.$dirty = false;
            }
        };


        $scope.loadData = function (pageNo) {
            if (pageNo) {
                $scope.params.pageNumber = pageNo;
            } else {
                $scope.params.pageNumber++;
            }
            if (!this.params.status) {
                this.params.status = this.status;
            }
            $scope.$parent.loading = true;
            CommRestService.post('groupmsg/list', $scope.params, function (data) {
                if (data.content) {
                    $scope.data = data.content;
                    $scope.page = {
                        firstPage: data.firstPage,
                        lastPage: data.lastPage,
                        totalPages: data.totalPages,
                        pageNumber: data.pageNumber
                    };
                }
                if (data.content && data.content.length > 0) {
                    //发送者？todo
                    var ids = "";
                    for (var i in data.content) {
                        if(data.content[i].senderRid){
                            ids = ids + data.content[i].senderRid + ",";
                        }
                    }
                    CommRestService.post('user/list', {rids: ids, pageSize: 10, pageNumber: 1}, function (data) {
                        $scope._sender = {};
                        for (var i in data.content) {
                            var rid = data.content[i].id;
                            $scope._sender[rid] = data.content[i];
                        }
                    });
                }
                $scope.$parent.loading = false;
            }, function (err) {
                $scope.$parent.loading = false;
                TipService.add('warning', err.msg, 3000);
            });
        };

        $scope.edit = function (msg) {
            CommTabService.next($scope.$vcTabInfo, 1, {operate: 'edit', dataId: msg.id}, 'groupmsgTabs');
        };

        $scope.offline = function (msg) {
            window.vcAlert({
                title: '取消发送',
                text: '确认取消发送此消息吗?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                cancelButtonText: '取消',
                confirmButtonText: '确定',
                closeOnConfirm: true,
                html: false
            }, function() {
                CommRestService.post('groupmsg/offline', {id: msg.id}, function (data) {
                    TipService.add('success', '取消发送成功', 3000);
                    $scope.loadData($scope.params.pageNumber);
                }, function (err) {
                    TipService.add('danger', err.msg, 3000);
                });
            });
        };

        $scope.delete = function (msg) {
            window.vcAlert({
                title: '删除消息',
                text: '确认删除此消息吗?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                cancelButtonText: '取消',
                confirmButtonText: '确定',
                closeOnConfirm: true,
                html: false
            }, function() {
                CommRestService.post('groupmsg/delete', {id: msg.id}, function (data) {
                    TipService.add('success', '删除成功', 3000);
                    $scope.loadData($scope.params.pageNumber);
                }, function (err) {
                    TipService.add('danger', err.msg, 3000);
                });
            });
        };

        $scope.preview =function (msg) {
            CacheService.putObject('preview_groupmsg', msg);
                var curTime = new Date().getTime();
                previewModalService.activate({
                    f_src: '/assets/preview/groupmsg/index.html?r=' + curTime
                });
        };

    }

    // 过滤器 - begin -

    function GroupMsgStatusFilter() {
        return function (input) {
            switch (input) {
                case 0:
                    return '删除';
                case 1:
                    return '待审核';
                case 2:
                    return '发送中';
                case 3:
                    return '审核不通过';
                case 4:
                    return '发送成功';
                case 5:
                    return '发送失败';
                case 6:
                    return '待发送';
                default:
                    return '发送中';
            }
        };
    }

    function GroupMsgUsersFilter() {
        return function (input) {
            if (input) {
                return "指定用户";
            } else {
                return "全体用户";
            }
        };
    }

    function GroupMsgTypeFilter() {
        return function (input) {
            switch (input) {
                case 2:
                    return '卡片';
                default:
                    return '文字';
            }
        };
    }
    function GroupMsgContentFilter() {
        return function (input) {
            return input.replace(/ /g, "&nbsp;").replace(/\n/g,"<br/>");
            //return input.replaceAll(" ","&nbsp;").replaceAll("\r","<br/>");
        };
    }

    //过滤器 - end -
})
();