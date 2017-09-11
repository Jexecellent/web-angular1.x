/**
 * Created by Administrator on 2016/1/15.
 */
;(function(){
    'use strict'
    angular.module('openApp')
        .controller('editorController', fEditorController)
        .controller('addTitleComponentController', fAddTitleComponentController)
        .controller('vedioAddressController', fVedioAddressController);

    fEditorController.$inject = ['$scope','$sce','$timeout','vcModalService','openEditorService','TipService'];
    function fEditorController($scope,$sce, $timeout,vcModalService,openEditorService,TipService) {
        $scope.components = [];
        $scope.editorTools = openEditorService.editorTools;
        /*
        $timeout(function(){
            console.log($scope.name, $scope.setContent);//只是为了证明， controller是在Link的时候被执行的。
        },0);
        */

        $scope.repeatDone = function() {
            setTimeout(function(){
                console.log('rebind click event');
                $(".vc_ed_addBlock").removeClass('open');
                $(".addBlock_btn").off('click').on("click", function() {
                    console.log('addBlock_btn click');
                    $(this).parent().toggleClass("open")
                })
            },200);
        };

        /**
         * 用于对外接口，获取编辑器的json数据
         */
        if(angular.isObject($scope.editor)){
            //配置获取编辑器json的方法
            $scope.editor.getContent = function() {
                var _contents = [];
                var _comp = null;
                _.each($scope.components,function(n) {
                    _comp = angular.copy(n);
                    delete _comp.__id;
                    delete _comp.__class;
                    delete _comp.$$hashKey;
                    if(_comp.type === 2) {
                        _comp.style = [];
                        for(var i in _comp.styleObj) {
                            _comp.style.push(i+":"+_comp.styleObj[i]);
                        }
                        delete _comp.styleObj;
                    }
                    _contents.push(_comp);
                });
                return JSON.stringify(_contents);
            };
            //配置设置编辑器内容的方法
            $scope.editor.setContent = function(content) {
                console.log('set editor content');
                if(typeof(content) === 'string') {
                    try {
                        content = JSON.parse(content);
                    }catch(err){
                        console.log('get error json content',content);
                    }
                }
                console.log('parse content', content);
                $scope.components = openEditorService.parseToEidtor(content);
            };
            //校验编辑器是否合法
            $scope.editor.validate = function() {
                if($scope.components.length === 0) {
                    TipService.add('error','缺少内容',3000);
                    return false;
                }
                for(var i=0; i< $scope.components.length; i++) {
                    if(!$scope.components[i].content.con){
                        var _text = null;
                        if($scope.components[i].type === 1){
                            _text = '标题缺少内容';
                        }else if($scope.components[i].type === 2){
                            _text = '缺少文字内容';
                        }else if($scope.components[i].type === 3){
                            _text = '缺少图片';
                        }else if($scope.components[i].type === 4) {
                            _text = '缺少视频';
                        }
                        TipService.add('error',_text,3000);
                        return false;
                    }
                }
                return true;
            }
        }else {
            throw new Error('need init editor object');
        }


        /**event bind**/
        /**
         * 添加组件方法，入口：1，最上面的菜单，2，每个组件的后面
         * @param type 需要添加的组件类型
         * @param __id 组件被添加到那个组件之后
         */
        this.addComponent = function(type, __id) {
            console.log('add components type:'+type+', __id:'+__id);
            openEditorService.curComponentId = __id;
            if(type === 1) {
                addTitleComponent(__id);
            }else {
                var _comp = openEditorService.getBase(type);
                pushToComponents(_comp);
            }
        }
        /**
         * 删除组件方法
         * @param __id
         */
        $scope.removeComponent = function(comp) {
            _.remove($scope.components, function(n){
                return comp.__id === n.__id;
            });
        }
        //点击上传图片事件
        $scope.upload = function(comp) {
            openEditorService.curComponent = comp;
            angular.element("#edit_img_upload__ .webuploader-element-invisible").click();
            return true;
        }
        //点击选着视频
        $scope.selectVedio = function(comp) {
            openEditorService.curComponent = comp;
            showVedioAddress();
        }
        //文本编辑器的设置样式
        $scope.setStyle = function(comp,styleName, styleValue) {
            if(comp) {
                if(comp.styleObj[styleName] === styleValue){
                    delete comp.styleObj[styleName];
                }else {
                    comp.styleObj[styleName] = styleValue;
                }
            }else {
                openEditorService.curComponent.styleObj[styleName] = styleValue;
            }
        }
        /**event bind end**/

        //可信的链接，用于iframe的ng-src设置
        $scope.trustSrc = function(comp) {
            var _url = comp.content.con||'http://imgcache.varicom.im/images/site/open_v3.1/banner.jpg';
            return $sce.trustAsResourceUrl(_url);
        }
        //添加组件到数组
        function pushToComponents(_comp) {
            if(openEditorService.curComponentId) {
                insertComponent(openEditorService.curComponentId, _comp);
            }else {
                $scope.components.push(_comp);
            }
            $scope.repeatDone();
        }
        //添加标题选着框
        function addTitleComponent(__id) {
            vcModalService({
                title: '标题样式选择',
                retId: 'title_class',
                css: {'width': '360px', 'height': '480px'},
                templateUrl: '/components/directives/open-editor/pages/addTitleComponent.html',
                controller: 'addTitleComponentController',
                success: {label: '确定', fn: addTitleComponentCallBack}
            });
        }
        function addTitleComponentCallBack(title_class) {
            var _title_class = openEditorService.titleClass.getClass(title_class);
            var _comp = openEditorService.getBase();
            _comp.subType.push(_title_class);
            _comp.type = 1;
            _comp.__class = _comp.subType.join(' ');
            pushToComponents(_comp);
        }
        //插入组件
        function insertComponent(id, comp) {
            var _index = null;
            for(var i=0; i< $scope.components.length; i++) {
                if(id === $scope.components[i].__id) {
                    _index = i;
                    break;
                }
            }
            var _newArrayList = [].concat($scope.components.slice(0,_index+1));
            _newArrayList.push(comp);
            for(var i=_index+1; i< $scope.components.length; i++ ) {
                _newArrayList.push($scope.components[i]);
            }
            $scope.components = _newArrayList;
            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                $scope.$digest();
            }
        }
        //弹出视频链接框
        function showVedioAddress() {
            vcModalService({
                title: '添加视频',
                retId: 'vedio_address',
                css: {'width': '600px', 'height': '220px'},
                templateUrl: '/components/directives/open-editor/pages/vedioAddress.html',
                controller: 'vedioAddressController',
                success: {label: '确定', fn: vedioAddressCallBack}
            });
        }
        function vedioAddressCallBack(address) {
            if(!address.vedioId) {
                TipService.add('error','请输入视频id',3000);
                return false;
            }
            openEditorService.curComponent.content.con = address.brand+address.vedioId;
        }

        initUpload();
        function initUpload() {
            $timeout(function() {
                var uploader = WebUploader.create(openEditorService.upload.conf);
                uploader.on('uploadProgress',openEditorService.upload.progress);
                uploader.on('uploadSuccess', fUploadSuccess);
                uploader.on('uploadComplete',openEditorService.upload.complete);
                uploader.on('error',fUploadError);
                function fUploadSuccess(file, response) {
                    $scope.$apply(function() {
                        if (response && response.code === 0) {
                            openEditorService.curComponent.content.con = response.t;
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
            },300);
        }
    }

    fAddTitleComponentController.$inject = ['$scope'];
    function fAddTitleComponentController($scope){
        $scope.check = function(type){
            console.log('checked type:'+type);
            $scope.checked = type;
            $scope.title_class = type;
        }
    }
    fVedioAddressController.$inject = ['$scope'];
    function fVedioAddressController($scope) {
         $scope._brand_url = {
            1:'http://v.qq.com/iframe/player.html?vid=',
            2:'http://www.tudou.com/programs/view/html5embed.action?code=',
            3:'http://player.youku.com/embed/'
        };
        $scope.vedio_address = {brand:$scope._brand_url[1],vedioId:''};
        $scope.checkBrand = function(brand) {
            $scope.vedio_address.brand = $scope._brand_url[brand];
        }

    }
})();