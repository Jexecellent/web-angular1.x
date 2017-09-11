/**
 *  main.goodsMgr Module
 *
 * 发布商品 Description
 */
;
(function () {
    'use strict';
    angular.module('main.goodsMgr')
        .controller('GoodsReleaseController', GoodsReleaseController);

    function GoodsReleaseController($scope, CommRestService, vcModalService, GoodsTypeService, TipService, CommTabService, AuditService, CacheService, $filter, previewModalService) {

        //规格默认数据(备份数据,不与view交互)
        var specDefaultTh = [{
            key: '原价',
            require: false
        }, {
            key: '现价',
            require: true
        }, {
            key: '库存',
            require: true
        }];

        var specDefaultTd = {
            data: [{
                key: '原价',
                value: '',
                type: 'price',
                require: false
            }, {
                key: '现价',
                value: '',
                type: 'price',
                require: true
            }, {
                key: '库存',
                value: '',
                type: 'number',
                require: true
            }],
            image: ''
        };

        var LevelNodes = [], audit = {};

        //初始化分类
        //商品分类、品牌
        GoodsTypeService.goodsTypeTrie(function (gt) {
            $scope.parentLevel = gt;
            LevelNodes = angular.copy(gt);
        });
        GoodsTypeService.getGoodsBrand(function (data) {
            $scope.brandList = data;
        });

        $scope.show = {}; //view交互对象
        $scope.ueditorId = 'goods_ueditor_instance';
        $scope.spec = {}; //规格

        function baseData() {
            initUpload();
        }

        $scope.gotoBack = function () {
            window.vcAlert({
                title: '提示',
                text: '当前操作尚未保存，您确认放弃已有修改吗？',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                cancelButtonText: '取消',
                confirmButtonText: '确定',
                closeOnConfirm: true,
                html: false
            }, function () {
                $scope.clearGoodsForm();
                CommTabService.next($scope.$vcTabInfo, $scope.lastTabInfo.index, {}, $scope.lastTabInfo.root);
            });
        };

        $scope.vcTabOnload = function (query, lastTabInfo) { //lastTabInfo {index,tag,root}

            if (query && query.operate !== undefined) {
                $scope.show.editModel = query;
                $scope.show.op = query.operate;
                $scope.lastTabInfo = lastTabInfo || $scope.$vcTabInfo;
                loadEditData();
            } else {
                $scope.show.op = 'add';
                $scope.initGoodsForm();
            }
            baseData();
        };

        //初始化商品发布表单基础数据：商品分类、规格等
        $scope.initGoodsForm = function () {
            $scope.goods = {};
            $scope.show.ImgDetail = []; //商品展示图

            //$scope.parentLevel = $scope.$parent.parentLevel;
            //$scope.brandList = $scope.$parent.brandList;

            $scope.childLevel = [];

            //0115 如当前没有分类与品牌页面给予提示
            if (_.isUndefined($scope.parentLevel) || $scope.parentLevel.length === 0) {
                $scope.show.level = true;
                $scope.show.brand = false;
            } else if (_.isUndefined($scope.brandList) || $scope.brandList.length === 0) {
                $scope.show.level = false;
                $scope.show.brand = true;
            } else {
                $scope.show.level = false;
                $scope.show.brand = false;
            }

            //默认商品信息数据
            $scope.show.attributes = [{
                name: '',
                attr: ''
            }];


            specDefaultTh = _.last(specDefaultTh, 3);
            specDefaultTd.data = _.last(specDefaultTd.data, 3);
            $scope.selectedSpecList = [];
            //默认规格(页面显示)
            $scope.spec.th = angular.copy(specDefaultTh);
            $scope.spec.td = [angular.copy(specDefaultTd)];

            //分类默认提示
            if ($scope.parentLevel) {
                if (!_.find($scope.parentLevel, function (pl) {
                        return pl.id === 0;
                    })) {
                    $scope.parentLevel.unshift({
                        id: 0,
                        name: '请选择一级分类'
                    });
                }
            }
            //品牌默认提示
            if ($scope.brandList) {
                if (!_.find($scope.brandList, function (bl) {
                        return bl.id === 0;
                    })) {
                    $scope.brandList.unshift({
                        id: 0,
                        name: '请选择品牌'
                    });
                }
            }
            $scope.show.typeId = 0;
            $scope.goods.brandId = 0;

            $scope.goods.isRecommend = 0;
        };


        function loadEditData() {
            if ($scope.show.op === 'edit' || $scope.show.op === 'editOffline') {
                $scope.$parent.loading = true;
                CommRestService.post('goods/get', {
                    goodsId: $scope.show.editModel.dataId
                }, function (data) {
                    $scope.$parent.loading = false;
                    parseEditGoods(data);
                }, function (err) {
                    $scope.$parent.loading = false;
                    window.vcAlert(err.msg);
                });

            } else if ($scope.show.op === 'editDraft' || $scope.show.op === 'editAudit') {
                $scope.$parent.loading = true;
                AuditService.getAudit({
                    auditId: $scope.show.editModel.dataId
                }, function (data) {
                    $scope.$parent.loading = false;
                    audit = data;
                    var goodsContent = JSON.parse(data.content);
                    goodsContent.auditId = data.id;
                    parseEditGoods(goodsContent);
                }, function (err) {
                    $scope.$parent.loading = false;
                    window.vcAlert(err.msg);
                });
            }
        }

        var uploader = null,
            imgUploadPickDomId = '#gImgDetail';

        function initUpload() {
            //避免重复初始化
            if (!!uploader) {
                return;
            }

            uploader = WebUploader.create({
                auto: true,
                swf: 'http://imgcache.varicom.im/js/webupload/Uploader.swf',
                server: '/api/base/fileupload',
                pick: {
                    id: imgUploadPickDomId
                },
                /*thumb:{
                 width: 110,
                 height: 110,
                 // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
                 allowMagnify: true,
                 // 是否允许裁剪。
                 crop: true
                 },
                 compress:{
                 width: 100,
                 height: 100,
                 // 图片质量，只有type为`image/jpeg`的时候才有效。
                 quality: 90,
                 // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
                 allowMagnify: false,
                 // 是否允许裁剪。
                 crop: true,
                 // 是否保留头部meta信息。
                 preserveHeaders: true,
                 // 如果发现压缩后文件大小比原来还大，则使用原来图片
                 // 此属性可能会影响图片自动纠正功能
                 noCompressIfLarger: false,
                 // 单位字节，如果图片大小小于此值，不会采用压缩。
                 compressSize: 0
                 },*/
                resize: false,
                fileSizeLimit: 2048000,
                fileNumLimit: 6, //最多上传6张
                accept: {
                    title: 'Images',
                    extensions: 'gif,jpg,jpeg,bmp,png',
                    mimeTypes: 'image/*'
                }
            });

            uploader.on('uploadSuccess', uploadSuccess);
            uploader.on('uploadComplete', uploadComplete);
            uploader.on('error', uploadError);


            //上传成功后
            function uploadSuccess(file, response) {

                $scope.$parent.loading = false;
                if (response && response.code === 0) {
                    $scope.$apply(function () {
                        //0115 页面上传公用,此处根据当前上传类型来赋值
                        switch ($scope.show.imgType) {
                            //规格示意图
                            case 'specImage':
                                for (var i = 0, td = $scope.spec.td; i <= td.length; i++) {
                                    if ($scope.show.specIndex === i) {
                                        td[i].image = response.t;
                                        break;
                                    }
                                }
                                return;
                            case 'image':
                                $scope.goods.image = response.t;
                                return;
                            case 'posterImg':
                                $scope.goods.posterImg = response.t;
                                return;
                            case 'detail':
                                $scope.show.ImgDetail.push({
                                    img: response.t
                                });
                                return;
                        }

                    });
                }
            }

            //当图片validate不通过时
            function uploadError(handler) {
                $scope.$parent.loading = false;
                if (handler === 'Q_EXCEED_NUM_LIMIT') {
                    window.vcAlert('商品展示图最多可添加6张');
                }
                if (handler === 'Q_EXCEED_SIZE_LIMIT') {
                    window.vcAlert('图片大小已超过2M，请重新上传');
                }
                if (handler === 'Q_TYPE_DENIED') {
                    window.vcAlert('图片类型无效，请重新上传');
                }
            }

            //重置状态(可重复上传已在队列中的图片)
            function uploadComplete() {
                this.reset();
            }

        }

        $scope.beginToUpload = function (type, currentIndex) {
            $scope.show.imgType = type; //记录当前上传图片的触发方
            //如是规格示意图,则记录当前规格id
            if (currentIndex !== undefined) {
                $scope.show.specIndex = currentIndex;
            }
            //0115 商品列表图最多只可上传6张
            if (_.isArray($scope.show.ImgDetail) && $scope.show.ImgDetail.length < 6) {
                var fileInput = angular.element(imgUploadPickDomId).find("input");
                if (fileInput && fileInput.length > 0) {
                    fileInput.click();
                }
            }
        };

        //分类联动查询(选择一级下的二级分类)
        $scope.changeParentLevel = function (info) {
            $scope.childLevel = GoodsTypeService.getChildLevel(LevelNodes, info.value);
            if ($scope.childLevel) {
                //二级分类默认提示
                if (!_.find($scope.childLevel, function (pl) {
                        return pl.id === 0;
                    })) {
                    $scope.childLevel.unshift({
                        id: 0,
                        name: '请选择二级分类'
                    });
                    $scope.show.childTypeId = 0;
                }
            }
        };

        //操作商品信息
        $scope.operateAttributes = function (list, index) {
            var op = '';
            list.length - 1 === index ? op = '添加一组' : op = '删除一组';
            if (op === '删除一组') {
                window.vcAlert({
                    title: '删除商品信息',
                    text: '确认删除此组商品信息吗?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    cancelButtonText: '取消',
                    confirmButtonText: '确定',
                    closeOnConfirm: true,
                    html: false
                }, function () {
                    $scope.$apply(function () {
                        list.splice(index, 1);
                    });
                });

            } else {
                list.push({
                    name: '',
                    attr: ''
                });
            }
        };

        //删除商品详情图片
        $scope.removeImg = function (img) {
            _.each($scope.show.ImgDetail, function (d) {
                if (d.img === img) {
                    $scope.show.ImgDetail.splice(d.img, 1);
                }
            });
        };

        //添加规格(打开选择规格弹窗)
        $scope.editGoodsSpecPlus = function () {
            var title = '';
            if ($scope.selectedSpecList.length === 0) {
                title = '添加规格';
            } else {
                title = '修改规格';
            }
            vcModalService({
                retId: 'selectedSpec',
                backdropCancel: false,
                title: title,
                css: {
                    height: '300px',
                    width: '400px'
                },
                templateUrl: 'app/templates/common/tplSelectGoodsSpec.html',
                controller: 'SelectGoodsSpecController',
                success: {
                    label: '确定',
                    fn: function (spec) {
                        //已选择的自定义规格
                        //自定义规格都是require的
                        _.each(spec, function (_s_) {
                            angular.extend(_s_, {
                                require: true
                            });
                        });

                        $scope.selectedSpecList = angular.copy(spec);

                        //可重用方法 - begin
                        function addNewSpec(_spec) {

                            _.each(_spec, function (newSpec) {

                                //添加头部
                                $scope.spec.th.unshift({
                                    key: newSpec.name || newSpec.key,
                                    require: true
                                });

                                //添加默认
                                var det = {
                                    key: newSpec.name || newSpec.key,
                                    value: '',
                                    type: $filter('specTypeToWord')(newSpec.type),
                                    require: true
                                };

                                specDefaultTd.data.unshift(det);

                                //添加已有td
                                _.each($scope.spec.td, function (td) {
                                    td.data.unshift(angular.copy(det));
                                });
                            });
                        }

                        function removeOldSpec(_spec) {
                            _.each(_spec, function (oddSpec) {
                                //删除头部
                                $scope.spec.th = _.filter($scope.spec.th, function (th) {
                                    return th.key !== oddSpec.key;
                                });

                                specDefaultTd.data = _.filter(specDefaultTd.data, function (data) {
                                    return data.key !== oddSpec.key;
                                });

                                //删除已有td
                                _.each($scope.spec.td, function (td) {
                                    td.data = _.filter(td.data, function (data) {
                                        return data.key !== oddSpec.key;
                                    });
                                });
                            });
                        }

                        //可重用方法 - end

                        //准备工作
                        //取出newTh
                        var newTh = [];
                        _.each(spec, function (newSpec) {
                            newTh.push({
                                key: newSpec.name || newSpec.key
                            });
                        });

                        //调整th
                        var oldThLen = $scope.spec.th.length;
                        //取原来已添加的自定义头部分
                        var oldTh = oldThLen > 3 ? (_.first($scope.spec.th, oldThLen - 3)) : [];

                        if (oldTh.length == 0) {
                            //直接添加
                            addNewSpec(spec);
                        } else {
                            //需要去重
                            //分2部分
                            // 1：需要增加的
                            var needAddSpec = [];
                            _.each(newTh, function (_newTh) {
                                if (!_.find(oldTh, function (_oldTh) {
                                        return _oldTh.key === _newTh.key;
                                    })) {
                                    var _newSpec = _.find(spec, function (_spec) {
                                        return _spec.name === _newTh.key;
                                    });
                                    if (_newSpec) {
                                        needAddSpec.push(_newSpec);
                                    }
                                }
                            });

                            // 2：需要移除的
                            var needRemoveSpec = [];
                            _.each(oldTh, function (_oldTh) {
                                if (!_.find(newTh, function (_newTh) {
                                        return _oldTh.key === _newTh.key;
                                    })) {
                                    var _oldSpec = _.find(specDefaultTd.data, function (_spec) {
                                        return _spec.key === _oldTh.key;
                                    });
                                    if (_oldSpec) {
                                        needRemoveSpec.push(_oldSpec);
                                    }
                                }
                            });

                            //先删再加
                            removeOldSpec(needRemoveSpec);
                            addNewSpec(needAddSpec);
                        }
                    }
                }
            }, {
                selectedSpec: $scope.selectedSpecList
            });
        };

        //添加一组规格
        $scope.addSpecGroup = function () {
            //追加一行
            $scope.spec.td.push(angular.copy(specDefaultTd));
        };

        //移除一组规格
        $scope.removeSpec = function (index) {
            window.vcAlert({
                title: '删除规格',
                text: '确认删除此组规格数据吗?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                cancelButtonText: '取消',
                confirmButtonText: '确定',
                closeOnConfirm: true,
                html: false
            }, function () {
                $scope.$apply(function () {
                    $scope.spec.td.splice(index, 1);
                });
            });
        };

        //解析商品编辑信息
        function parseEditGoods(detail) {
            //移除多余的部分(还原备份数据)
            specDefaultTh = _.last(specDefaultTh, 3);
            specDefaultTd.data = _.last(specDefaultTd.data, 3);

            $scope.spec.th = angular.copy(specDefaultTh);
            $scope.spec.td = [angular.copy(specDefaultTd)];

            if (!_.isUndefined(detail.isRecommend)) {
                detail.isRecommend === false ? detail.isRecommend = 0 : detail.isRecommend = 1;
            }

            //运费
            if (parseInt(detail.carriage) === 0) {
                $scope.show.carriageType = 1; //包邮
            } else {
                $scope.show.carriageType = 2; //需要运费
            }

            //分类
            var levelIds = GoodsTypeService.getParentLevelByTypeId(detail.typeId);
            $scope.childLevel = GoodsTypeService.getChildLevel(LevelNodes, levelIds[1]);
            $scope.show.typeId = levelIds[1];
            $scope.show.childTypeId = levelIds[0];

            //商品展示图
            $scope.show.ImgDetail = [];
            if (detail.images) {
                var imgs = JSON.parse(detail.images);
                _.each(imgs, function (i) {
                    var o = {};
                    o.img = i;
                    $scope.show.ImgDetail.push(o);
                });
            }

            //商品规格
            if (angular.isUndefined(detail.skus)) {
                //无自定义规格 - 则只有一行
                if ($scope.spec.td[0]) {
                    var _data = $scope.spec.td[0].data;
                    if (_data.length === 3) {
                        _data[0].value = detail.price;
                        _data[1].value = detail.realPrice;
                        _data[2].value = detail.number;
                    }
                }
            } else {
                //含自定义规格
                var skus = JSON.parse(detail.skus);
                //取field
                var skus_field = skus.field;
                skus_field.reverse();
                _.each(skus_field, function (field) {
                    //默认头
                    specDefaultTh.unshift({
                        key: field,
                        require: true
                    });
                    //默认Td
                    specDefaultTd.data.unshift({
                        key: field,
                        value: '',
                        type: 'text',
                        require: true
                    });
                });
                //修改th
                $scope.spec.th = angular.copy(specDefaultTh);

                //重新还原 选中的规格
                $scope.selectedSpecList = specDefaultTh.length > 3 ? (_.first(specDefaultTh, specDefaultTh.length - 3)) : [];

                //取values
                var _index = 0;
                var newTd = [];
                _.map(skus.values, function (value, key) {
                    var images = value.images;
                    //给td加数据
                    var aTd = {
                        data: [],
                        image: ''
                    };
                    aTd.image = images;

                    //对key进行解析
                    var keyValues = key.split('/');
                    if (skus_field.length == keyValues.length) {
                        console.log(keyValues);
                        _.each(keyValues, function (kv, index) {
                            aTd.data.push({
                                key: skus_field[index],
                                value: kv,
                                type: 'text',
                                require: true
                            });
                        });
                    }

                    //对value进行解析
                    var price = value.price;
                    aTd.data.push({
                        key: '原价',
                        value: price,
                        type: 'price',
                        require: false
                    });

                    var realPrice = value.realPrice;
                    aTd.data.push({
                        key: '现价',
                        value: realPrice,
                        type: 'price',
                        require: true
                    });

                    var num = value.num;
                    aTd.data.push({
                        key: '库存',
                        value: num,
                        type: 'number',
                        require: true
                    });

                    newTd.push(aTd);

                    _index++;
                });

                if (newTd.length > 0) {
                    $scope.spec.td = newTd;
                }
            }

            //商品信息
            if (!_.isUndefined(detail.attributes)) {
                $scope.show.attributes = JSON.parse(detail.attributes);

                if (_.isObject($scope.show.attributes) && $scope.show.attributes !== {}) {
                    var attrs = _.pairs($scope.show.attributes);
                    $scope.show.attributes = [];
                    for (var i = 0; i < attrs.length; i++) {
                        var attrObj = {};
                        attrObj.name = attrs[i][0];
                        attrObj.attr = attrs[i][1];
                        $scope.show.attributes.push(attrObj);
                    }
                } else {
                    //0115 默认显示一组
                    $scope.show.attributes = [{
                        name: '',
                        attr: ''
                    }];
                }
            }
            //商品详情
            detail.detailinfo = htmlDecode(detail.detailinfo);
            //将解析后的数据赋给view中绑定的商品对象
            $scope.goods = angular.copy(detail);
        }

        //保存表单
        var formData = {};
        $scope.saveGoods = function (valid) {
            var formState = formValid();
            if (valid && formState) {
                if (!CacheService.hasPermission('goods:add') || !CacheService.hasPermission('goods:update')) {
                    saveAudit();
                } else {
                    var flag = packageFormData();
                    if (flag === false) {
                        return false;
                    }
                    var postUri = 'goods/add',
                        msg = '商品添加成功';
                    if ($scope.goods.id) {
                        postUri = 'goods/update';
                        msg = '商品编辑成功';
                    }
                    CommRestService.post(postUri, formData, function (data) {
                        window.vcAlert(msg);
                        CommTabService.next($scope.$vcTabInfo, 'online', {}, 'manager', ['online', 'draft', 'audit', 'offline']);
                        $scope.clearGoodsForm();
                    });
                }
            }
        };

        function formValid() {
            if (parseInt($scope.show.carriageType) === 2 && (!$scope.goods.carriage || $scope.goods.carriage === 'null')) {
                TipService.add('warning', '请输入邮费', 3000);
                return false;
            } else if ($scope.show.childTypeId === 0) {
                TipService.add('warning', '请选择分类', 3000);
                return false;
            } else if ($scope.goods.brandId === 0) {
                TipService.add('warning', '请选择品牌', 3000);
                return false;
            } else if (!$scope.goods.image) {
                TipService.add('warning', '请添加商品封面图', 3000);
                return false;
            } else if (!$scope.goods.posterImg) {
                TipService.add('warning', '请添加瀑布流图标', 3000);
                return false;
            } else if ($scope.show.ImgDetail.length === 0) {
                TipService.add('warning', '请至少添加一张商品展示图', 3000);
                return false;
            } else if ($scope.spec.th.length > 3) {
                var isTure = true;
                _.each($scope.spec.td, function (t) {
                    if (t.image === '') {
                        TipService.add('warning', '请添加规格示意图', 3000);
                        isTure = false;
                        return false; //跳出循环
                    }
                });
                if (!isTure) {
                    return false;
                }
            }

            return true;
        }

        //清空
        $scope.clearGoodsForm = function () {
            $scope.show = {};
            formData = {};
            $scope.initGoodsForm();
        };

        //组装表单数据
        function packageFormData() {
            //不污染页面显示
            formData = angular.copy($scope.goods);

            //商品分类(必须选到二级分类)，存二级分类的typeId
            if (!_.isUndefined($scope.show.typeId) && !_.isUndefined($scope.show.childTypeId)) {
                formData.typeId = GoodsTypeService.getTypeIdById(store.get('goodsType'), $scope.show.childTypeId);
            }

            //商品规格
            if ($scope.spec.th.length === 3) {
                //未添加规格时
                if ($scope.spec.td.length >= 1) {
                    var arr = _.pluck($scope.spec.td[0].data, 'value');

                    formData.price = parseFloat(arr[0] || 0);
                    formData.realPrice = parseFloat(arr[1]);
                    formData.number = parseInt(arr[2]);
                    //如未添加规格,库存字段则不能传
                    if (formData.skus) {
                        delete formData.skus;
                    }
                }
            } else {
                //添加规格后的skus JSON格式
                //{"field":["颜色","大小"],
                //"values":{"中牛仔蓝/L":
                //{"images":"images","num":1,"price":10,"reaPrice":20},"浅牛仔蓝/S":{"images":"images1","num":0,"price":10}}}
                formData.skus = {};
                var oldTh = $scope.spec.th.length > 3 ? (_.first($scope.spec.th, $scope.spec.th.length - 3)) : [];
                formData.skus.field = _.pluck(oldTh, 'key'); //filed

                var ltArr = [],
                    rgArr = [],
                    retBoolean = true;

                _.each($scope.spec.td, function (td, index) {
                    //添加的规格
                    var lt = td.data.length > 3 ? (_.first(td.data, td.data.length - 3)) : [];

                    // ["规格1","规格2"]
                    var ltArray = _.pluck(lt, 'value');
                    //判断每列规格是否有重复
                    if (ltArray.length > _.uniq(ltArray).length) {
                        TipService.add('warning', '第'+(index+1)+'行不同规格列数据有重复，请仔细填写', 3000);
                        retBoolean = false;
                        return false;
                    }

                    // ["规格1/规格2",]
                    var ltString = ltArray.join('/');
                    // 判断每行规则组合是否重复
                    if (_.indexOf(ltArr, ltString) != -1){
                        TipService.add('warning', '规格有重复，请仔细填写', 3000);
                        retBoolean = false;
                        return false;
                    }

                    ltArr.push(ltString);

                    //默认
                    var rg = _.rest(td.data, lt.length);
                    var rgStr = {};
                    var arr = _.pluck(rg, 'value');
                    rgStr.price = parseFloat(arr[0]);
                    rgStr.realPrice = parseFloat(arr[1]);
                    rgStr.num = parseInt(arr[2]);
                    rgStr.images = td.image;
                    rgArr.push(rgStr);
                    //默认字段：添加规格后存第一组数
                    if (index === 0) {
                        formData.price = parseFloat(arr[0] || 0);
                        formData.realPrice = parseFloat(arr[1]);
                        formData.number = parseInt(arr[2]);
                    }
                });

                if (retBoolean === false) {
                    return false;
                }

                var obj = {};
                for (var z = 0; z < ltArr.length; z++) {
                    obj[ltArr[z]] = rgArr[z];
                }
                formData.skus.values = obj;
                formData.skus = JSON.stringify(formData.skus);
            }

            if (_.isUndefined(formData.isRecommend)) {
                formData.isRecommend = false;
            } else {
                parseInt(formData.isRecommend) === 0 ? formData.isRecommend = false : formData.isRecommend = true;
            }

            formData.carriage = parseFloat(formData.carriage) || 0;
            formData.commission = parseFloat(formData.commission);

            //商品信息
            var attrKey = _.pluck($scope.show.attributes, 'name');
            var attrValue = _.pluck($scope.show.attributes, 'attr');
            var attrObj = {};
            if (_.isArray(attrKey) && attrKey.length !== 0) {
                for (var j = 0; j < attrKey.length; j++) {
                    attrObj[attrKey[j]] = attrValue[j];
                }
                formData.attributes = JSON.stringify(attrObj);
            }

            //商品列表图  images
            formData.images = JSON.stringify(_.pluck($scope.show.ImgDetail, 'img'));

            formData.isRecommend = formData.isRecommend || false;

            var content = UE.getEditor($scope.ueditorId).getContent();
            formData.detailinfo = htmlEncode(content);
        }


        //保存到草稿
        $scope.saveDraft = function () {
            //至少需要填写商品名称
            if (_.isUndefined($scope.goods.name) || $scope.goods.name === '') {
                TipService.add('warning', '请至少填写商品名称再保存草稿', 3000);
                return;
            }
            var flag = bulidAudit();
            if (flag === false) {
                return false;
            }
            $scope.$parent.loading = true;
            AuditService.save(audit, function (res) {
                if (angular.isNumber(res)) {
                    audit.id = res;
                    $scope.$parent.loading = false;
                    //页面不跳转,通知草稿列表数据变化
                    CommTabService.dirty($scope.$vcTabInfo, ['draft'], 'manager', true);
                    TipService.add('success', '草稿保存成功', 3000);
                }
            }, function (err) {
                $scope.$parent.loading = false;
                window.vcAlert(err.msg);
            });
        };

        //提交审核
        function saveAudit() {
            var flag = bulidAudit();
            if (flag === false) {
                return false;
            }
            audit.status = 1;
            //如线上编辑则提交线上修改审核
            $scope.show.op === 'edit' ? audit.auditType = 2 : audit.auditType = 1;
            AuditService.save(audit, function (res) {
                if (angular.isNumber(res)) {
                    window.vcAlert('提交审核成功');
                    $scope.clearGoodsForm();
                    CommTabService.next($scope.$vcTabInfo, 'myaudit', {}, 'manager', ['myaudit', 'draft']);
                }
            }, function (err) {
                window.vcAlert(err.msg);
            });
        }

        function bulidAudit() {
            $scope.goods.detailinfo = UE.getEditor($scope.ueditorId).getContent();
            var flag = packageFormData(); //解析后的表单数据
            if (flag === false) {
                return false;
            }
            var _goods = angular.copy(formData);
            audit.bizId = _goods.id;
            audit.bizType = 9;
            //默认就是草稿
            audit.status = 0;
            audit.auditType = 0;
            audit.title = _goods.name;
            audit.thumbnail = _goods.image;
            audit.content = JSON.stringify(_goods);
        }

        $scope.preview = function () {
            packageFormData();
            CacheService.putObject('preview_goods', formData);
            var curTime = new Date().getTime();
            previewModalService.activate({
                f_src: '/assets/preview/goods/index.html?r=' + curTime
            });
        };
    }

    GoodsReleaseController.$inject = ['$scope', 'CommRestService', 'vcModalService', 'GoodsTypeService', 'TipService', 'CommTabService', 'AuditService', 'CacheService', '$filter', 'previewModalService'];
})();