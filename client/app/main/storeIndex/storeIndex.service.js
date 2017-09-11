/**
 * Created by hxl on 2015/12/31.
 */
;
(function () {
    'use strict'
    angular.module('main.storeIndex')
        .factory('StoreIndexService', fStoreIndexService);

    /**
     * 配置首页service
     */
    fStoreIndexService.$inject = ['INDEX_COMPONENT_TYPES','CommRestService', 'TipService', 'CacheService', 'vcModalService'];
    function fStoreIndexService(INDEX_COMPONENT_TYPES,CommRestService, TipService, CacheService, vcModalService) {
        var _curUser = getUser();
        //基础内容对象
        var base_content = {
            title: '', desc: '', image: null, action: {},
            sortColumn: null, contentType: null, key: null
        };
        /**
         * 对应组件的样式
         * @type {{1: string, 2: string, 4: string, 8: string, 9: string}}
         * @private
         */
        var _class = {
            1 : "sh_mod_banner sh_mod_banner_r swiper-container",
            2: "sh_mod_twoColumn",
            4: "sh_mod_square",
            8: "sh_mod_HRoll sh_mod_HRoll_r",
            9: "sh_mod_product",
            setClass: function (component) {
                component.__class = this[component.type];
            }
        };

        //多张卡片
        var cards_one_line = {
            title: null, content: [getBaseContent()], type: 1,
            __class: _class[1]
        };
        //两列风格，左大右三小
        var two_line = {
            title: null, content: [getBaseContent(), getBaseContent(), getBaseContent(),
                getBaseContent()], type: 2,
            __class: _class[2]
        };
        //矩形多列
        var square_multi_line = {
            title: null, content: [getBaseContent(), getBaseContent(), getBaseContent(),
                getBaseContent()], type: 4,
            __class: _class[4]
        };
        //矩形一行，只显示四列
        var square_one_line = {
            title: null, content: [getBaseContent()], type: 8,
            __class: _class[8]
        };
        //瀑布流可选内容
        var _new = getBaseContent({title: '最新', sortColumn: 1});
        var _hot = getBaseContent({title: '人气', sortColumn: 2});
        var _boutique = getBaseContent({title: '精品', sortColumn: 3});
        var _recommend = getBaseContent({title: '推荐', sortColumn: 4});
        //瀑布流组件
        var recommend_stream = {
            title: null, content: [
                _new,
                _hot,
                _boutique], type: 9,
            __class: _class[9]
        };
        //瀑布流可选块
        var stream_store = [_new, _hot, _boutique, _recommend];

        //可用组件集合对象, key:类型,value:复制的对象
        var components = {
            1: function () {
                var _c = angular.copy(cards_one_line)
                setId(_c);
                return _c;
            },
            2: function () {
                var _c = angular.copy(two_line)
                setId(_c);
                return _c;
            },
            4: function () {
                var _c = angular.copy(square_multi_line)
                setId(_c);
                return _c;
            },
            8: function () {
                var _c = angular.copy(square_one_line)
                setId(_c);
                return _c;
            },
            9: function () {
                var _c = angular.copy(recommend_stream)
                setId(_c);
                return _c;
            }
        };
        var _upload = {
            conf: {
                auto: true,
                swf: 'http://imgcache.varicom.im/js/webupload/Uploader.swf',
                server: '/api/base/fileupload',
                pick: '#_type_img_upload',
                resize: false,
                fileSizeLimit: 2048000,
                accept: {
                    title: 'Images',
                    extensions: 'gif,jpg,jpeg,bmp,png',
                    mimeTypes: 'image/*'
                }
            },
            progress: function (file, percentage) {
                console.log('upload progress ' + percentage);
                var _li = angular.element('#propress_bar');
                _li.css({'width': '100%', 'z-index': 1});
                var _$parent = _li.find('.progress .progress-bar');
                if (!_$parent.length) {
                    _$parent = angular.element('<div class="progress progress-striped active" style="border: 1px solid #0BABE5;">' +
                        '<div class="progress-bar" role="progressbar" style="width: 0%;background-color: #0BABE5;">' +
                        '</div>' +
                        '</div>').appendTo(_li).find('.progress-bar');
                }
                _$parent.css('width', percentage * 100 + '%');
            },
            complete: function () {
                this.reset();
                angular.element('#propress_bar').find('.progress').remove();
            }
        };
        var _permission = {
            save     :   permission('pageshow:save'),
            list  :   permission('pageshow:list'),
            audit    :   permission('audit:10'),
            hasPermission:function(perm){
                return permission(perm);
            }
        };
        function permission(perm) {
            return CacheService.hasPermission(perm);
        }
        /**
         * 首页模板，key：世界类型
         */
        var _component_template = {
            12: [components[1](), components[8](), components[2](), components[4]()]
        };
        //生成随机id
        function setId(obj) {
            if (angular.isObject(obj)) {
                obj.__id = (new Date().getTime()) + parseInt(Math.random() * 1000);
            }
        }

        /**
         * 获取组件的内容对象
         * @param opt
         * @returns {*}
         */
        function getBaseContent(opt) {
            var _base = angular.copy(base_content);
            if (opt) {
                angular.extend(_base, opt);
            }
            setId(_base);
            return _base;
        }

        function getUser() {
            return CacheService.getObject('current_user');
        }

        /**
         * 解析后台pageShow对象的content内容
         * @param content
         */
        function parsePageShowContent(content) {
            try {
                var _content = JSON.parse(content);
                if (angular.isArray(_content)) {
                    _.each(_content, function (component) {
                        setId(component);
                        _class.setClass(component);
                        parseComponentContent(component.content);
                    });
                } else {
                    console.log('current pageShow content is not an array.');
                }
                return _content;
            } catch (err) {
                console.log('parse pageShowContent error');
            }
        }

        /**
         * 解析后台组件的content内容
         */
        function parseComponentContent(component_content) {
            try {
                //var _content = JSON.parse(component_content);
                var _content = component_content;
                if (angular.isArray(_content)) {
                    _.each(_content, function (content) {
                        setId(content);
                    });
                } else {
                    console.log('current component content is not an array.', component_content);
                }
            } catch (err) {
                console.log('parse component content error', component_content)
            }
            ;
        }

        /**
         * 构造后端需要的数据
         */
        function constructPageShowByComponent(component) {
            var _component = angular.copy(component);
            delete _component.__id;
            delete _component.__class;
            _.each(_component.content, function (_con) {
                delete _con.__id;
                if (component.type !== 9) {
                    delete _con.sortColumn;
                }
            });
            return _component;
        }

        /**
         * 验证component_body数据
         * @param componentBody
         */
        function validateComponentBody(componentBody) {
            for (var i = 0; i < componentBody.length; i++) {
                if (!componentBody[i].type) {
                    TipService.add('error', '存在非法组件', 3000);
                    return false;
                }
                for (var j = 0; j < componentBody[i].content.length; j++) {
                    if (!componentBody[i].content[j].image) {
                        TipService.add('error', '有缺少图片', 3000);
                        return false;
                    }
                }
            }
            return true;
        }

        /**
         * 验证component_foot数据
         * @param componentFoot
         */
        function validateComponentFoot(componentFoot) {
            return true;
        }

        //打开对话框，根据当前世界类型
        function openModalByInterestType(callback) {
            if (!_curUser) {
                _curUser = getUser();
            }
            if (_curUser.itype === 12) {//户外
                openOutterModal(callback);
            } else if (_curUser.itype === 15) {
                openGoodsModal(callback);
            } else {
                console.log('curUser itype ', _curUser.itype);
            }
        }

        //选择户外可选择的跳转
        function openOutterModal(callback) {
            vcModalService({
                retId: 'selectedData',
                backdropCancel: false,
                title: '选择条目',
                css: {
                    height: '500px',
                    width: '600px'
                },
                templateUrl: 'app/templates/common/tplArticle.html',
                controller: 'SelectArtController',
                success: {
                    label: '确定',
                    fn: callback
                }
            }, {});
        }

        //选择电商可选的跳转
        function openGoodsModal(callback) {
            vcModalService({
                retId: 'selectedLinkData',
                backdropCancel: false,
                title: '选择商品',
                css: {
                    height: '500px',
                    width: '600px'
                },
                templateUrl: 'app/templates/common/tplSelectGoods.html',
                controller: 'SelectGoodsController',
                success: {
                    label: '确定',
                    fn: callback
                }
            });
        }

        var _curContent = null, _component_title = null;
        var _service = {
            components: components,
            curComponent: null,//当前编辑的component
            curEditComponent: null,//当前弹出框编辑的component
            curContent: _curContent,//当前操作的content
            getBaseContent: getBaseContent,
            streamStore: stream_store,
            curUser: _curUser,
            upload: _upload,
            permission:_permission,
            editHeadBind: function (scope) {
                scope.activate_title = false;
                scope.activateTitle = function () {
                    if (scope.activate_title) {
                        scope.activate_title = false;
                        _component_title = scope.component.title;
                        scope.component.title = null;
                    } else {
                        scope.activate_title = true;
                        scope.component.title = _component_title;
                    }
                }
                if (scope.component.title && scope.component.title.text) {
                    scope.activate_title = true;
                    _component_title = scope.component.title;
                } else {
                    _component_title = null;
                }
                scope.titlelinkOp = function (com) {
                    if (!scope.component.title || !scope.component.title.text) {
                        return;
                    }
                    scope.linkOp(null);
                }
            },
            commonOpBind: function (scope, service) {
                service.curEditComponent = scope.component;
                scope.fileClick = function (con) {
                    service.curContent = con;
                    angular.element(".webuploader-element-invisible").click();
                    return true;
                }
                scope.linkOp = function (con, $event) {
                    if ($event) {
                        $event.stopPropagation();
                    }
                    service.curContent = con;
                    openModalByInterestType(function (linkObj) {
                        var _params = {url: linkObj.link, aidType: linkObj.aidType};
                        service.constructProtocol(_params, function (data) {
                            var _action = JSON.parse(data);
                            if (!service.curContent) {
                                if (service.curEditComponent.title) {
                                    service.curEditComponent.title._linkName = linkObj.title || '';
                                } else {
                                    service.curEditComponent.title = {'_linkName': linkObj.title || ''};
                                }
                                service.curEditComponent.title.action = _action;
                            } else {
                                service.curContent.action = _action;
                            }
                        });
                    });
                }
            },
            getCompTemplate: function (type) {
                if (!type) {
                    type = _curUser.itype;
                }
                return _component_template[type];
            },
            getPageShow: function (params, callback, failure) {
                CommRestService.post('pageshow/get', params, callback, failure || function (err) {
                        TipService.add('error', '获取首页配置失败:' + err.msg, 3000);
                    });
            },
            savePageShow: function (params, callback, failure) {
                CommRestService.post('pageshow/save', params, callback, failure || function (err) {
                        TipService.add('err', '保存首页配置失败:' + err.msg, 3000);
                    });
            },
            constructProtocol: function (params, callback, failure) {
                CommRestService.post('base/jumpprotocol', params, callback, failure || function (err) {
                        TipService.add('err', '构建协议失败:' + err.msg, 3000);
                    });
            },
            parseToViewData: function (obj) {
                var _components = parsePageShowContent(obj);
                return _components;
            },
            validateComponents: function (component_body, component_foot) {
                return validateComponentBody(component_body) && validateComponentFoot(component_foot);
            },
            pageShowConstruct: function (component_body, component_foot) {
                var _pageShow_content = [];
                _.each(component_body, function (com) {
                    _pageShow_content.push(constructPageShowByComponent(com));
                });
                _.each(component_foot, function (com) {
                    _pageShow_content.push(constructPageShowByComponent(com));
                });
                return _pageShow_content;
            }
        };
        return _service;
    }

})();