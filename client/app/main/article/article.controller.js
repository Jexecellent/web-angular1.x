/**
 *  open.article Module
 *
 * 资讯管理 Description
 */
;
(function () {
    'use strict';

    angular.module('main.article')
        .controller('ArticleController', ['$scope', '$stateParams', '$timeout','CommTabService', fArticleController])
        .controller('ArticleMgrController', ['$scope', 'CommTabService', fArticleMgrController])
        .controller('ArticleListController', ['$scope', 'CommRestService', 'CommTabService', 'articleService', 'AuditService', 'TipService','CacheService','previewModalService', fArticleListController])
        .controller('ArticleEditController', ['$scope', '$interval', 'articleService', 'CacheService', 'AuditService', 'CommTabService', 'TipService', fArticleEditController]);

    function fArticleController($scope, $stateParams, $timeout, CommTabService) {

        $scope.moduleId = parseInt($stateParams.moduleId) || 0;

        var targetTab = $stateParams.tab;
        var targetTag = $stateParams.tag;

        if (!!targetTag) {
            //只能延迟点处理
            $timeout(function(){
                CommTabService.next({index:2, tag:'manage', root:'articleTabs'}, targetTag, {}, targetTab);
            }, 500);
        }
    }

    function fArticleMgrController($scope, CommTabService) {
        $scope.loading = false;
    }

    function fArticleListController($scope, CommRestService, CommTabService, articleService, AuditService, TipService,CacheService,previewModalService) {

        $scope.params = {
            pageSize: 10,
            pageNumber: 0
        };

        $scope.offlinePermission = false;
        $scope.vcTabOnload = function (query, lastTabInfo) {
            if ($scope.$dirty) {
                $scope.data = [];
                $scope.page = {};

                $scope.params.status = $scope.status;
                $scope.params.moduleId = $scope.moduleId;

                $scope.offlinePermission = CacheService.hasPermission('article:offline'+$scope.moduleId);
                $scope.loadData(1);
                $scope.$dirty = false;
            }
        };

        /**
         * 查询群发消息列表
         * @param pageNo    页码
         */
        $scope.loadData = function (pageNo) {
            if (pageNo) {
                $scope.params.pageNumber = pageNo;
            } else {
                $scope.params.pageNumber++;
            }
            CommRestService.post('article/list', $scope.params, function (data) {
                if (data.content) {
                    $scope.data = data.content;
                    $scope.page = {
                        firstPage: data.firstPage,
                        lastPage: data.lastPage,
                        totalPages: data.totalPages,
                        pageNumber: data.pageNumber
                    };
                }
            }, function (err) {
            });
        };

        /**
         * 跳转页面
         */
        $scope.goToTab = function (toTag, params) {
            CommTabService.next($scope.$vcTabInfo, toTag, params, "articleTabs");
        };

        /**
         * 删除
         * @param article    资讯
         */
        $scope.deleteArticle = function (article) {
            if (article) {
                articleService.delete({aid: article.id,module:$scope.moduleId}, function (data) {
                    _.remove($scope.data, function (n) {
                        return n.id === article.id;
                    });
                    TipService.add('success', '删除成功' , 3000);
                }, function (err) {
                    TipService.add('warning', '删除失败:' + err.msg, 3000);
                });
            }
        };

        /**
         *下线申请
         */
        $scope.offline = function (article) {
            window.vcAlert({
                title: '下线资讯',
                text: '确认下线此篇资讯吗?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                cancelButtonText: '取消',
                confirmButtonText: '确定',
                closeOnConfirm: true,
                html: false
            }, function() {
                articleService.offline({
                    aid: article.id,
                    module:$scope.moduleId
                }, function() {
                    TipService.add('success', '下线成功', 3000);
                    //通知下线列表和线上列表数据更新
                    CommTabService.next($scope.$vcTabInfo, 'online', {}, ['online', 'offline']);
                }, function(err) {
                    TipService.add('danger', err.msg, 3000);
                });
            });
        };

        /**
        * 预览
        */
        $scope.preview =function (article) {
            CacheService.putObject('preview_article', article);
                var curTime = new Date().getTime();
                previewModalService.activate({
                    f_src: '/assets/preview/article/index.html?r=' + curTime
                });
        };
    }

    function fArticleEditController($scope, $interval, articleService, CacheService, AuditService, CommTabService, TipService) {

        $scope.ueditorId = 'article_ueditor_instance';

        var uploader = null;
        function fUploadSuccess(file, response) {
            if (response && response.code === 0) {
                $scope.$apply(function () {
                    $scope.imageMessage = '上传成功';
                    $scope.article.thumbnail = response.t;
                });
            } else {
                $scope.$apply(function () {
                    $scope.imageMessage = '上传失败';
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

        var _draftInterval = null;
        var audit = null;

        $scope.vcTabOnload = function (data, lastTabInfo) {
            if (data && data.operate) {
                $scope.operate = data.operate;
                $scope.initTab(data.operate, data.dataId);
                $scope.lastTabInfo = lastTabInfo || $scope.$vcTabInfo;
            } else {
                if (!$scope.article) {
                    $scope.operate = "add";
                    $scope.article = {moduleId : $scope.moduleId};
                    $scope.initTab("add");
                }
                else {
                    if ($scope.operate == "add" || $scope.operate === 'editDraft'){
                        autoDraft();
                    }
                }
            }

            if (!uploader) {
                uploader = WebUploader.create({
                    auto: true,
                    swf: 'http://imgcache.varicom.im/js/webupload/Uploader.swf',
                    server: '/api/base/fileupload',
                    pick: '#filePicker',
                    resize: false,
                    fileSizeLimit: 20971520,
                    accept: {title: 'Images', extensions: 'gif,jpg,jpeg,bmp,png', mimeTypes: 'image/*'}
                });
                uploader.on('uploadSuccess', fUploadSuccess);
                uploader.on('error', uploadError);
            }
        };

        $scope.vcTabOnUnload = function () {
            !!_draftInterval && $interval.cancel(_draftInterval);
        };

        $scope.clear = function () {
            $scope.operate = "add";
            $scope.article = {module : $scope.moduleId};
            audit = {bizType: 3, moduleId : $scope.moduleId};
            $("#_update_img").removeAttr("src");
            $scope.imageMessage = "";
        };

        $scope.initTab = function (operate, id) {

            if ("add" === $scope.operate) {
                autoDraft();
            } else if ("editDraft" === $scope.operate || "editAudit" == $scope.operate) {
                //审核or草稿编辑
                getAuditOrDraft(id);
                autoDraft();
            } else if ("edit" === $scope.operate) {
                //线上/下编辑
                articleService.get({aid: id}, function (data) {
                    $scope.article = data;
                    //$scope.article.articleContent = htmlDecode($scope.article.articleContent);
                    audit = {
                        moduleId : $scope.moduleId,
                        bizType: 3,
                        bizId: data.id || '',
                        status: 0,
                        auditType: 0
                    };
                });
            }
        };

        function autoDraft() {
            !_draftInterval && (_draftInterval = $interval(function () {
                $scope.saveDraft("auto");
            }, 300000));
        }

        function getAuditOrDraft(auditId) {
            //草稿/审核, 取草稿/审核内容
            AuditService.getAudit({auditId: auditId}, function (data) {

                audit = data;

                var auditContent = JSON.parse(audit.content);
                auditContent.auditId = data.id;

                $scope.article = auditContent;
                //$scope.article.articleContent = htmlDecode($scope.article.articleContent);
            });
        }

        function buildAudit(type) {
            //只有这样才能取到含图片地址的内容
            var articleContent = UE.getEditor($scope.ueditorId).getContent();
            var _article = angular.copy($scope.article);
            _article.articleContent = articleContent;//htmlEncode(articleContent);

            if (audit == null) {
                audit = {
                    module:$scope.moduleId,//TODO 待确认删除哪一个
                    moduleId: $scope.moduleId,
                    bizType: 3,
                    status: 0,
                    auditType: 0
                };
            }

            audit.bizId = _article.id || '';
            audit.title = _article.title;
            audit.thumbnail = _article.thumbnail;
            audit.content = JSON.stringify(_article);

            if (type === 'draft'){
                //提交草稿
                audit.auditType = 0;
                audit.status = 0;
            }
            else if (type === 'audit'){
                //提交审核
                audit.auditType = 1;
                audit.status = 1;
            }
        }

        function saveAudit(type) {
            AuditService.save(audit, function (data) {
                if (angular.isNumber(data)) {
                    audit.id = data;
                }

                if (type === 'draft'){
                    CommTabService.dirty($scope.$vcTabInfo, ['draft'], 'manage', true);
                }
                else if (type === 'audit'){
                    CommTabService.next($scope.$vcTabInfo, "myaudit", {}, 'manage', ["myaudit"]);
                }
            });
        }

        function validate() {
            if (!!$scope.article.title && !!$scope.article.articleContent) {
                if (!!$scope.article.thumbnail) {
                    return true;
                }

                $scope.imageMessage = "请上传首图";
            }
            return false;
        }

        /**
         * 保存草稿
         * @param type
         */
        $scope.saveDraft = function (type) {
            if (validate()) {
                buildAudit('draft');
                saveAudit('draft');
                if (type === 'auto') {
                    TipService.add('success', '草稿自动保存成功', 3000);
                } else {
                    TipService.add('success', '草稿操作成功', 3000);
                }
            }
            else {
                if (type !== 'auto') {
                    vcAlert("草稿保存失败，请检查数据后再提交。");
                }
            }
        };

        /**
         * 提交审核
         */
        var submitAudit = function () {
            if (validate()) {
                buildAudit('audit');
                saveAudit('audit');
            }
            else {
                vcAlert("提交审核失败，请检查数据后再提交。");
            }
        };

        /**
         * 返回
         */
        $scope.back = function () {
            $scope.clear();
            CommTabService.next($scope.$vcTabInfo, $scope.lastTabInfo.index, {}, $scope.lastTabInfo.root);
        };

        /**
         * 发布
         */
        var submitArticle = function () {//提交上线
            if (validate()) {
                var articleContent = UE.getEditor($scope.ueditorId).getContent()//htmlEncode( );
                var params = $scope.article;
                params.articleContent = articleContent;
                if (!params.module) {
                    params.module = $scope.moduleId;
                }
                if (!$scope.article.id) {//新增
                    articleService.save(params, function (data) {
                        $scope.clear();
                        CommTabService.next($scope.$vcTabInfo, "online", {}, 'manage', ["online", "offline","draft"]);
                    }, function (err) {
                        TipService.add('danger', "发布失败:" + err.msg, 3000);
                    });
                } else {//修改
                    articleService.update(params, function (data) {
                        $scope.clear();
                        CommTabService.next($scope.$vcTabInfo, "online", {}, 'manage', ["online", "offline"]);
                    }, function (err) {
                        TipService.add('danger', "发布失败:" + err.msg, 3000);
                    });
                }
            }
            else {
                vcAlert("发布失败，请检查数据后再提交。");
            }
        };

        $scope.submitData = function(){
            if (CacheService.hasPermission('article:add' + $scope.moduleId)){
                submitArticle();
            }
            else if (submitAudit){
                submitAudit();
            }
        }

    }
})();