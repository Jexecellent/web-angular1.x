/**
 * Created by wayky on 15/10/21.
 */
;
(function () {
    'use strict';

    angular.module('main.storeIndex')
        .controller('StoreIndexController', fIndexController)
        .controller('StoreMainController', fMainController)
        .controller('StoreAddComponentController', fStoreAddComponentController)
        .controller('StoreEditComponent1Controller', StoreEditComponent1Controller)
        .controller('StoreEditComponent2Controller', StoreEditComponent2Controller)
        .controller('StoreEditComponent4Controller', StoreEditComponent4Controller)
        .controller('StoreEditComponent8Controller', StoreEditComponent8Controller)
        .controller('StoreEditComponent9Controller', StoreEditComponent9Controller);

    function fIndexController($scope) {
        $scope.loading = false;
    }

    fMainController.$inject = ['$scope','$timeout', 'vcModalService', 'StoreIndexService','TipService',
        'AuditService','CommTabService','INDEX_COMPONENT_TYPES'];
    function fMainController($scope,$timeout, vcModalService, StoreIndexService,TipService,AuditService,
                             CommTabService, INDEX_COMPONENT_TYPES) {
        $scope.loadData = function (is_show_loading) {
            if(is_show_loading) {
                $scope.$parent.loading = true;
            }
            StoreIndexService.getPageShow({},function(data) {
                dataProcess(data);
                $scope.$parent.loading = false;
            });
        };
        /**
         * 处理后端数据，入口有两个：线上数据、审核数据
         * @param data
         */
        function dataProcess(data) {
            var _components = null;
            if(!data) {
                _components = StoreIndexService.getCompTemplate();
            }else {
                _components = StoreIndexService.parseToViewData(data);
            }
            $scope.components_foot = [];
            $scope.components_body = [];
            if(!_components) {
                return;
            }
            _.each(_components,function(com){
                if(com.type === 9) {
                    $scope.components_foot.push(com);
                }else {
                    $scope.components_body.push(com);
                }
            });
        }
        init();
        function init() {
            $scope.components_body = [];
            $scope.components_foot = [];
            //$scope.loadData();
            $scope.audit = {};
        }
        var swiper = null;
        $scope.initSwiper = function() {
            $(".swiper-container").each(function(i){
                new Swiper (angular.element(this), {
                    autoplay: 3000,
                });
            });
            $(".sh_mod_HRoll_r").each(function(){
                new Swiper(angular.element(this),{slidesPerView: 4});
            });
            resetContentWidth();
        };

        function resetContentWidth() {
            setTimeout(function(){
                angular.element(".sh_mod_HRoll_r .swiper-slide.upload").width('70px');
            },30);
        }

        $scope.vcTabOnload = function (data) {
            if ($scope.$dirty) {
                $scope.loadData(true);
                $scope.$dirty = false;
                $scope.op_state = null;
            }
            if(data && data.operate === 'editAudit') {
                console.log('onload data',data);
                getAudit(data.dataId);
                $scope.op_state = 2;
            }
        };

        function getAudit(id) {
            AuditService.getAudit({auditId:id},function(data) {
                console.log('get page_show audit data ', data);
                dataProcess(data.content);
            });
        }

        $scope.hasPermission = function(perm) {
            return StoreIndexService.permission.hasPermission(perm);
        }

        $scope.save = function() {
            if(StoreIndexService.permission.hasPermission('pageshow:save')) {
                if(StoreIndexService.validateComponents($scope.components_body,$scope.components_foot)) {
                    var _pageShow_content = StoreIndexService.pageShowConstruct($scope.components_body,$scope.components_foot);
                    StoreIndexService.savePageShow({'content':JSON.stringify(_pageShow_content)},function(data){
                        TipService.add('success','保存首页配置成功',3000);
                    });
                }
            }else {
                toAudit();
            }
        }

        /**
         * 首页待审核
         */
        function toAudit() {
            if(StoreIndexService.validateComponents($scope.components_body,$scope.components_foot)) {
                buildAudit();
                AuditService.save($scope.audit,function(data){
                    TipService.add('success','提交审核成功',3000);
                    CommTabService.next($scope.$vcTabInfo,'myaudit',{open:true},'storeIndexTabs',['myaudit','audit']);
                    $scope.loadData();
                });
            }
        }

        function buildAudit() {
            var _pageShow_content = StoreIndexService.pageShowConstruct($scope.components_body,$scope.components_foot);
            if(_pageShow_content.length === 0) {
                TipService.add('error','首页内容不能为空',3000);
                return;
            }
            $scope.audit.bizId = StoreIndexService.curUser.iid;
            $scope.audit.bizType = 10;
            $scope.audit.status = 1;
            $scope.audit.auditType = 1;//都是上线审核
            $scope.audit.title = '配置首页待审核';
            $scope.audit.thumbnail = _pageShow_content[0].content[0].image;
            $scope.audit.content = JSON.stringify(_pageShow_content);
        }

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
                CommTabService.next($scope.$vcTabInfo, 'myaudit', {},'storeIndexTabs',[]);
                resetToOnline();
            });
        }

        function resetToOnline() {
            $scope.loadData();
            $scope.op_state = null;
        }

        /**
         * 添加组件
         */
        $scope.addComponent = function () {
            vcModalService({
                title: '添加可用组件',
                retId: 'res_component_types',
                css: {'width': '360px', 'height': '480px'},
                templateUrl: 'app/templates/storeIndex/add_component.html',
                controller: 'StoreAddComponentController',
                success: {label: '确定', fn: addComponentCallBack}
            },{
                unUse:unUseComponentsTypeArray()
            });
        }
        function addComponentCallBack(res_component_types) {
            if (angular.isArray(res_component_types)) {
                _.each(res_component_types, function (n) {
                    var _cur_comp = StoreIndexService.components[n]();
                    if (n === 9) {
                        $scope.components_foot.push(_cur_comp);
                    } else {
                        $scope.components_body.push(_cur_comp);
                    }
                });
            }
        }

        /**
         * 不可添加的组件类型
         */
        function unUseComponentsTypeArray() {
            var _unUse = [];
            if($scope.components_foot && $scope.components_foot.length > 0) {
                _unUse.push(9);
            }
            return _unUse;
        }

        /**
         * 删除预览中的组件
         * @param comp
         */
        $scope.remove = function (comp) {
            window.vcAlert({
                title:"删除组件",
                text: "确认删除该组件以及添加的所有内容吗？",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonText: "取消",
                confirmButtonText: "确定",
                closeOnConfirm: true,
                html: false
            }, function() {
                _.remove($scope.components_body, function (n) {
                    return n.__id === comp.__id;
                });
                _.remove($scope.components_foot, function (n) {
                    return n.__id === comp.__id;
                });
                $scope.$digest();
            });
        }

        /**
         * 编辑预览中的组件
         * @param comp
         */
        $scope.edit = function (comp) {
            StoreIndexService.curComponent = comp;
            vcModalService({
                title: '编辑组件',
                retId: 'component',
                css: {'width': '360px', 'height': '480px'},
                templateUrl: 'app/templates/storeIndex/edit_type_' + comp.type + '.html',
                controller: 'StoreEditComponent' + comp.type + 'Controller',
                success: {label: '确定', fn: editComponentCallBack}
            }, {
                component: comp
            });
        }
        function editComponentCallBack(comp) {
            if(!comp.content || comp.content.length === 0){
                if(comp.type === INDEX_COMPONENT_TYPES.STORE_WATERFALL) {
                    window.vcAlert('至少选择一种！');
                }else {
                    window.vcAlert('内容不能为空');
                }
                return false;
            }

            //增加链接是否配置的判断
            if (comp.type !== INDEX_COMPONENT_TYPES.STORE_WATERFALL && comp.content.length > 0) {
                var allLinkHasConfiged = true;
                _.each(comp.content, function(c){
                    if (!c.action || (c.action && !c.action.p)) {
                        allLinkHasConfiged = false;
                        return false;
                    }
                });

                if (allLinkHasConfiged == false) {
                    if (!confirm("您有图片未配置链接，继续么？")) {
                        return false;
                    }
                }
            }

            if(comp && comp.content.length === 0 && comp.type === INDEX_COMPONENT_TYPES.TOW_COLUMN) {
                //删除
                _.remove($scope.components_body,function(n){
                    return n.__id === comp.__id;
                });
            }

            angular.copy(comp,StoreIndexService.curComponent);

            if (comp.type === INDEX_COMPONENT_TYPES.SWIPER_BANNER) {
                $scope.initSwiper();
            }
        }

        /**
         * 图片上传
         * @constructor
         */
        function ImageUpload() {
            $timeout(function(){
                var uploader = WebUploader.create(StoreIndexService.upload.conf);
                uploader.on('uploadProgress',StoreIndexService.upload.progress);
                uploader.on('uploadSuccess', fUploadSuccess);
                uploader.on('uploadComplete',StoreIndexService.upload.complete);
                uploader.on('error',fUploadError);
                function fUploadSuccess(file, response) {
                    $scope.$apply(function() {
                        if (response && response.code === 0) {
                            if(StoreIndexService.curContent) {
                                StoreIndexService.curContent.image = response.t;
                            }else if(StoreIndexService.curEditComponent.type === 8 || StoreIndexService.curEditComponent.type === 4){
                                var _baseContent = StoreIndexService.getBaseContent();
                                _baseContent.image = response.t;
                                StoreIndexService.curEditComponent.content.push(_baseContent);
                            }
                        }
                    });
                }
                function fUploadError(type) {
                    if(type == 'Q_EXCEED_SIZE_LIMIT') {
                        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                            $scope.$apply(function() {
                                TipService.add('warning','图片大小超过限制，最大2M',3000);
                            });
                        }else {
                            TipService.add('warning','图片大小超过限制，最大2M',3000);
                        }
                        return;
                    }
                    if(type == 'Q_TYPE_DENIED') {
                        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                            $scope.$apply(function() {
                                TipService.add('warning','图片类型不正确。',3000);
                            });
                        }else {
                            TipService.add('warning','图片类型不正确。',3000);
                        }
                        return;
                    }
                }
            },0);
        }
        ImageUpload();

        /**
         * 拖动完成
         * @param cur
         * @param pre
         * @param next
         * @param all_ids
         */
        $scope.dragSuccess = function(cur, pre, next, all_ids){
            $scope.$apply(function(){
                var _new_components = [];
                _.each(all_ids, function(i){
                    _.each($scope.components_body,function(c) {
                        if(c.__id == i){
                            _new_components.push(c);
                        }
                    });
                });
                if(_new_components.length > 0) {
                    $scope.components_body = _new_components;
                    $scope._random = Math.random();
                }
            });
        }
    }

    /**
     * 添加组件ctrl
     * @param $scope
     */
    fStoreAddComponentController.$inject = ['$scope', 'StoreIndexService'];
    function fStoreAddComponentController($scope, StoreIndexService) {
        $scope.res_component_types = [];
        $scope.selectComp = function (type) {
            var _index = _.indexOf($scope.res_component_types, type);
            if (-1 === _index) {
                $scope.res_component_types.push(type);
            } else {
                $scope.res_component_types.splice(_index,1);
            }
        }
        $scope.isUseComp = function(type) {
            return $scope.unUse.indexOf(type) === -1? true:false;
        }
    }

    /**
     * 编辑组件一
     * @constructor
     */
    StoreEditComponent1Controller.$inject = ['$scope', 'StoreIndexService'];
    function StoreEditComponent1Controller($scope, StoreIndexService) {
        StoreIndexService.commonOpBind($scope,StoreIndexService);
        $scope.addImg = function () {
            if ($scope.component.content) {
                $scope.component.content.push(StoreIndexService.getBaseContent());
            }
        }
        $scope.removeImg = function (content) {
            _.remove($scope.component.content, function (n) {
                return n.__id === content.__id;
            });
        }
    }

    /**
     * 编辑组件二
     * @constructor
     */
    StoreEditComponent2Controller.$inject = ['$scope', 'StoreIndexService'];
    function StoreEditComponent2Controller($scope, StoreIndexService) {
        StoreIndexService.editHeadBind($scope);
        StoreIndexService.commonOpBind($scope,StoreIndexService);
        $scope.clear = function(com, $event){
            $event.stopPropagation();
            com.image = null;
            com.action = null;
            return true;
        }
    }

    /**
     * 编辑组件四
     * @constructor
     */
    StoreEditComponent4Controller.$inject = ['$scope', 'StoreIndexService'];
    function StoreEditComponent4Controller($scope, StoreIndexService) {
        StoreIndexService.editHeadBind($scope);
        StoreIndexService.commonOpBind($scope,StoreIndexService);
        $scope.newContent = function() {
            $scope.fileClick();
        }
        $scope.remove = function(con, $event) {
            _.remove($scope.component.content,function(n){
                return n.__id === con.__id;
            });
        }
    }

    /**
     * 编辑组件八
     * @constructor
     */
    StoreEditComponent8Controller.$inject = ['$scope', 'StoreIndexService'];
    function StoreEditComponent8Controller($scope, StoreIndexService) {
        StoreIndexService.editHeadBind($scope);
        StoreIndexService.commonOpBind($scope,StoreIndexService);

        $scope.newContent = function() {
            $scope.fileClick();
        }

        $scope.remove = function(con, $event) {
            //$event.stopPropagation();
            _.remove($scope.component.content,function(n){
                return n.__id === con.__id;
            });
        }
    }

    /**
     * 编辑组件九
     * @constructor
     */
    StoreEditComponent9Controller.$inject = ['$scope', 'StoreIndexService'];
    function StoreEditComponent9Controller($scope, StoreIndexService) {
        StoreIndexService.commonOpBind($scope,StoreIndexService);
        function unSelect() {

            var _unSelect = [];
            _.each(StoreIndexService.streamStore,function(n){
                var _include = false;
                _.each($scope.component.content,function(v){
                    if(v.title === n.title) {
                        _include = true;
                    }
                    v.ischeck = true;
                });
                n.ischeck = _include;
                if(!_include) {
                    _unSelect.push(n);
                }
            });
            $scope.allStream = $scope.component.content.concat(_unSelect);
        }
        unSelect();

        $scope.dragSuccess = function(cur, prev, next,all_ids) {
            sort(all_ids);
            searchChecked();
        }

        $scope.checkLi = function(con) {
            if(con.ischeck) {
                con.ischeck = false;
            }else {
                con.ischeck = true;
            }
            searchChecked();
        }

        function sort(ids) {
            var _new_allStream = [];
            _.each(ids, function(i){
                _.each($scope.allStream,function(a){
                    if(a.__id == i) {
                        _new_allStream.push(a);
                        return;
                    }
                });
            });
            $scope.allStream = _new_allStream;
        }

        function searchChecked() {
            var _content = [];
            _.each($scope.allStream, function(n){
                if(n.ischeck) {
                    _content.push(n);
                }
            });
            $scope.component.content = _content;
        }
    }
})();