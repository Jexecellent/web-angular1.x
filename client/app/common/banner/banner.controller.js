/**
 * Created by wayky on 15/11/13.
 */
'use strict';

var app = angular.module('open.common');

app.controller('BannerController', ['$scope', 'CommTabService', 'CacheService', function ($scope, CommTabService, CacheService) {

    $scope.aid = 0;
    $scope.moduleType = 0;

    $scope.pageStatus = {
        isEditing: false,
        lastTabIndex: 1
    };

    $scope.bannerEditTabIndex = 5;
    var banners = [];
    $scope.$on('bannerList', function (event, data) {
        $scope.bannerLen = data.length;
        banners = data;
    });

    //控制index.html中的清空按钮
    $scope.opType=null;
    $scope.$on('bannerOp',function (event, data) {
        switch(data){
            case 'edit':
            case 'editAudit':
            case 'editOffline':
             $scope.opType =false;
             break;
            default:
             $scope.opType =true;
             break;
        }
    });

    //主页上的几个操作按钮
    $scope.beginEdit = function () {
        var addPermission = CacheService.hasPermission('banneradd:bizType' + $scope.moduleType);

        if ($scope.bannerLen >= 2 && addPermission) {
            window.vcAlert('线上广告位不能超过2个,请知悉');
        } else {
            $scope.pageStatus.isEditing = true;
            CommTabService.next($scope.$vcTabInfo, $scope.bannerEditTabIndex, {operate: 'add'}, 'commBannerTabs');
        }

    };

    $scope.endEdit = function () {
        //提示下
        vcAlert({
            title: "提示",
            text: "当前操作尚未保存，您确认放弃已有修改吗？",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            cancelButtonText: "取消",
            confirmButtonText: "确定",
            closeOnConfirm: true,
            html: false
        }, function () {
            $scope.pageStatus.isEditing = false;
            //清空当前表单的状态
            $scope.clearEditBanner();
            CommTabService.next($scope.$vcTabInfo, $scope.pageStatus.lastTabIndex, {}, 'commBannerTabs');
        });
    };

    $scope.auditEditBanner = function () {
        CommTabService.next($scope.$vcTabInfo, $scope.bannerEditTabIndex, {
            operate: 'audit'
        }, 'commBannerTabs');
    };

    $scope.distEditBanner = function () {
        CommTabService.next($scope.$vcTabInfo, $scope.bannerEditTabIndex, {
            operate: 'dist'
        }, 'commBannerTabs');
    };

    $scope.clearEditBanner = function () {
        CommTabService.next($scope.$vcTabInfo, $scope.bannerEditTabIndex, {
            operate: 'clear'
        }, 'commBannerTabs');
    };

    //统一loading
    $scope.loading = false;
}]);

// 列表
app.controller('BannerListController', ['$scope', 'CommRestService', 'CommTabService', 'BannerService', 'CacheService', 'previewModalService', 'TipService', function ($scope, CommRestService, CommTabService, BannerService, CacheService, previewModalService, TipService) {

    //查询条件
    $scope.params = {
        status: 0, //状态：1.下线 2.上线 3.下线待审核 4.上线待审核
        pageSize: 10,
        pageNumber: 0
    };

    //页面数据
    $scope.data = [];

    //分页数据
    $scope.pager = {};

    $scope.bannerEditTabIndex = 5;
    
     //加载数据
    $scope.loadData = function (pageNo) {
        $scope.$parent.loading = true;
        pageNo ? (this.params.pageNumber = parseInt(pageNo)) : this.params.pageNumber++;
        CommRestService.post('banner/list', this.params, function (data) {
            if (data.content) {
                _.each(data.content, function (de) {
                    var link = JSON.parse(de.bannerclick);
                    //重新取出手动填入链接
                    if(link.aid === 2){
                     de.bannerclick = link.p;   
                    }else{
                      de.bannerclick = link.link;  
                    }
                    
                    de.aid = link.aid;
                });

                $scope.data = data.content;
                //线上banner
                if ($scope.params.status === 2) {
                    //通知最外层,已有banner个数
                    $scope.$emit('bannerList', $scope.data);
                }

                $scope.pager = {
                    firstPage: data.firstPage,
                    lastPage: data.lastPage,
                    totalPages: data.totalPages,
                    pageNumber: data.pageNumber
                };
            }
            $scope.$parent.loading = false;
        }, function (err) {
            $scope.$parent.loading = false;
        });
    };

    //供Tab调用的重新刷新页面接口
    $scope.vcTabOnload = function (query, from) {
        if ($scope.$dirty) {
            this.params.pageNumber = 0;
            this.loadData();
            $scope.$dirty = false;
        }
    };

    //编辑banner
    $scope.edit = function (banner, type) {
        var op = '';
        //1209 根据传入参数判断编辑类型(线上编辑/下线编辑)
        type === 1 ? op = 'editOffline' : op = 'edit';
        $scope.pageStatus.isEditing = true;
        CommTabService.next($scope.$vcTabInfo, $scope.bannerEditTabIndex, {
            operate: op,
            data: banner
        });
    };

    //下线banner
    $scope.offline = function (banner) {
        window.vcAlert({
            title: '下线广告位',
            text: '确认下线此广告位吗?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            cancelButtonText: '取消',
            confirmButtonText: '确定',
            closeOnConfirm: true,
            html: false
        }, function () {
            $scope.$parent.loading = true;
            CommRestService.post('banner/offline', {
                bannerId: banner.id,
                moduleType: $scope.moduleType  //下线时传入业务类型,后台判断权限
            }, function (data) {
                $scope.$parent.loading = false;
                TipService.add('success', '下线成功', 3000);
                CommTabService.next($scope.$vcTabInfo, 4, {
                    reload: true
                });
                $scope.params.pageNumber = 0;
                $scope.loadData();

            }, function (err) {
                $scope.$parent.loading = false;
                TipService.add('danger', err.msg, 3000);
            });
            //}

        });
    };

    //删除下线banner
    $scope.del = function (id) {
        window.vcAlert({
            title: '删除广告位',
            text: '确认删除此广告位吗?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            cancelButtonText: '取消',
            confirmButtonText: '确定',
            closeOnConfirm: true,
            html: false
        }, function () {
            $scope.$parent.loading = true;
            CommRestService.post('banner/del', {
                bannerId: id,
                moduleType: $scope.moduleType
            }, function (data) {
                $scope.$parent.loading = false;
                TipService.add('success', '删除成功', 3000);
                CommTabService.next($scope.$vcTabInfo, 4, {
                    reload: true
                });
                $scope.params.pageNumber = 0;
                $scope.loadData();

            }, function (err) {
                $scope.$parent.loading = false;
                TipService.add('danger', err.msg, 3000);
            });
        });
    };

    //表格拖动排序
    $scope.dragSuccess = function (cur, prev, next) {
        //var curNote = BannerService.findDataById($scope.data, cur);
        var preNote = null;
        var nextNote = null;
        //上下都有

        if (prev && next) {
            preNote = BannerService.findDataById($scope.data, prev);
            nextNote = BannerService.findDataById($scope.data, next);
            var currentTime = new Date().getTime();
            if (preNote && preNote.updateTime) {
                var updateTime = null;
                if (nextNote.updateTime === preNote.updateTime) {

                } else if (preNote.updateTime > currentTime && nextNote.updateTime < currentTime) {
                    //如果前面一条是置顶，后面一条不是置顶，则
                    updateTime = currentTime - 50; //显示在所有未置顶的第一条
                } else {
                    var _mid = (preNote.updateTime - nextNote.updateTime) / 2;
                    updateTime = nextNote.updateTime + parseInt(_mid);
                    if (updateTime === nextNote.updateTime) {
                        //如果计算出的中间值为0
                        BannerService.req('base/sort', {
                            bizId: next,
                            updateTime: nextNote.updateTime - 1,
                            type: 5
                        }, function () {
                        });
                    }
                }
                BannerService.req('base/sort', {
                    bizId: cur,
                    updateTime: updateTime,
                    type: 5
                }, function () {
                });
                return;
            }
        }
        //只有下一条
        if (next) {
            nextNote = BannerService.findDataById($scope.data, next);
            if (nextNote && nextNote.updateTime) {
                BannerService.req('base/sort', {
                    bizId: cur,
                    updateTime: nextNote.updateTime + 50,
                    type: 5
                }, function () {
                });
            }
        }
        //只有上一条
        if (prev) {
            preNote = BannerService.findDataById($scope.data, prev);
            if (preNote && preNote.updateTime) {
                BannerService.req('base/sort', {
                    bizId: cur,
                    updateTime: preNote.updateTime - 50,
                    type: 5
                }, function () {
                });
            }
        }
    };

    //预览
    $scope.preview = function (appname, banner) {

        var type = '';
        switch ($scope.moduleType) {
            case 3:
                type = '资讯';
                break;
            case 4:
                type = '活动';
                break;
            case 5:
                type = '手记';
                break;
            case 7:
                type = '约伴';
                break;
            case 8:
                type = '高校活动';
                break;
            default:
                break;
        }
        var banners = {
            app: appname,
            type: type,
            content: banner
        };

        CacheService.putObject('preview_banner', banners);
        var curTime = new Date().getTime();
        previewModalService.activate({
            f_src: '/assets/preview/banner/index.html?r=' + curTime
        });

    };
}]);

// 新增或编辑
app.controller('BannerEditController', ['$scope', 'CommRestService', 'CommTabService', 'vcModalService', 'AuditService', function ($scope, CommRestService, CommTabService, vcModalService, AuditService) {

    //由实际业务注入过来的
    $scope.moduleType = 0;
    $scope.moduleId = 0;
    $scope.aid = 0;

    $scope.banner = {};
    var uploader = null;
    var audit = {};

    //上传成功后
    function uploadSuccess(file, response) {
        $scope.$parent.loading = false;
        if (response && response.code === 0) {
            $scope.$apply(function () {
                $scope.banner.bannerimage = response.t;
            });
        }
    }

    //当图片validate不通过时
    function uploadError(handler) {
        $scope.$parent.loading = false;
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

    var currentOperate = '',edit=false;
    $scope.vcTabOnload = function (data, lastTabInfo) {
     
        $scope.$emit('bannerOp', data.operate);

        if (uploader === null) {
            //init - 初始化上传组件
            uploader = WebUploader.create({
                auto: true,
                swf: 'http://imgcache.varicom.im/js/webupload/Uploader.swf',
                server: '/api/base/fileupload',
                pick: '#bannerImgPicker',
                resize: false,
                fileSizeLimit: 2048000,
                accept: {
                    title: 'Images',
                    extensions: 'gif,jpg,jpeg,bmp,png',
                    mimeTypes: 'image/*'
                }
            });
            uploader.on('uploadStart', function () {
                $scope.$parent.loading = true;
            });
            uploader.on('uploadSuccess', uploadSuccess);
            uploader.on('uploadComplete', uploadComplete);
            uploader.on('error', uploadError);
        }

        if (data) {
            if(data.operate === 'edit'){
               edit=true;
            }
            currentOperate = data.operate;
            switch (data.operate) {
                case 'clear':
                    clearBanner();
                    break;
                case 'edit':
                case 'editOffline':
                    $scope.banner = data.data;
                    break;
                case 'editAudit':
                    //调整父级别的编辑状态
                    $scope.pageStatus.isEditing = true;
                    //编辑审核中的内容
                    $scope.$parent.loading = true;

                    var params = {auditId: data.dataId, bizType: data.bizType, bizId: data.bizId};
                    AuditService.getAudit(params, function (res) {
                        $scope.$parent.loading = false;
                        audit = res;
                        var bannerContent = JSON.parse(res.content);
                        bannerContent.auditId = data.id;
                        $scope.banner = bannerContent;

                    }, function (err) {
                        $scope.$parent.loading = false;
                        vcAlert('出错了：' + err.msg);
                    });
                    break;
                case 'audit':
                case 'dist':
                    submitBanner(data.operate);
                    break;
            }
        }
    };
    var cacheLink='';
    $scope.selectLink = function () {
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
                fn: function (article) {
                    //1204 选择不同资源banne的aidType需对应资源的aid
                    $scope.banner.aidType = article.aidType;
                    $scope.banner.bannername = article.title;
                    $scope.banner.bannerclick = article.link;
                    cacheLink=article.link;
                }
            }
        }, {
            moduleId: $scope.moduleId
        });
    };

    //提交Banner数据
    function submitBanner(opType) {
        var isValid = validBanner();
        if (isValid) {
            //组装请求参数
            /*1210 后台接口调整,增加moduleType:为实际业务,做权限用; bizType:2代表是banner*/
            $scope.banner.aidType = $scope.banner.aidType || 2;
            $scope.banner.moduleType = $scope.moduleType;
            $scope.banner.moduleid = $scope.moduleId;

            if (currentOperate === 'dist' && !$scope.banner.id) {
                req(opType, 'banner/add');
            } else {
                req(opType, 'banner/update');
            }

        }
    }

    function req(type, url) {
        //提交Banner
        if (type === 'audit') {
            //提交审核
            audit.bizId = $scope.banner.id || '';
            audit.bizType = 2;
            audit.moduleId = $scope.moduleId;
            audit.title = $scope.banner.bannername;
            audit.thumbnail = $scope.banner.bannerimage;
            audit.status = 1;
            //1216 如是线上编辑则提交线上修改审核
            edit === true ? audit.auditType = 2 : audit.auditType = 1;
      
            audit.remark = '';
            audit.content = JSON.stringify($scope.banner);

            $scope.$parent.loading = true;
            AuditService.save(audit, function (data) {
                $scope.$parent.loading = false;
                window.vcAlert('提交审核操作成功');
                $scope.pageStatus.isEditing = false;
                clearBanner();
                CommTabService.next($scope.$vcTabInfo, 'myaudit', {}, ['myaudit','online']);
            }, function (err) {
                $scope.$parent.loading = false;
                vcAlert(err.msg);
            });

        }
        else {
            //直接发布
            $scope.$parent.loading = true;
            CommRestService.post(url, $scope.banner, function (data) {
                $scope.$parent.loading = false;
                //操作成功跳回线上列表页面
                $scope.pageStatus.isEditing = false;
                clearBanner();
                CommTabService.next($scope.$vcTabInfo, $scope.pageStatus.lastTabIndex, {}, ["online", "offline"]);
            }, function (err) {
                $scope.$parent.loading = false;
                vcAlert(err.msg);
            });
        }
    }

    //避免选择完线上数据后删除,重新手动输入链接
    $scope.linkChange =function (){
        if($scope.banner.bannerclick && $scope.banner.bannerclick !== cacheLink){
            $scope.banner.aidType =2;
        }
    };

    function validBanner() {
        var url=/^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
        var test =url.test($scope.banner.bannerclick);
        if (_.isUndefined($scope.banner.bannerimage)) {
            $scope.imgError = true;
            $scope.linkError = false;
            return false;
        } else if (_.isUndefined($scope.banner.bannerclick) || !test) {
            $scope.linkError = true;
            $scope.imgError = false;
            return false;
        } else {
            $scope.linkError = false;
            $scope.imgError = false;
            return true;
        }
    }

    //清空banner
    function clearBanner() {
        $scope.banner = {};
        $scope.linkError = false;
        $scope.imgError = false;
        audit = {};
    }
}]);