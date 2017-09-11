/**
 * Created by wayky on 16/1/5.
 */
;(function () {
    'use strict';
    var app = angular.module('openApp');

    //选择资源（迁移自选择资讯）
    app.controller('SelectArtController', ['$scope', 'CommRestService', 'CacheService', SelectArtController]);
    function SelectArtController($scope, CommRestService, CacheService) {

        //初始化参数
        $scope.queryParams = {
            pageSize: 10,
            pageNumber: 0,
            status: 3
        };

        $scope.dataList = []; //数据列表
        $scope.selectedData = {}; //选中的资讯
        $scope.lastPage = false;
        $scope.loading = false;
        $scope.totalPage = 1;

        $scope.modules = CacheService.getModules();

        if ($scope.modules && $scope.modules.length > 0) {
            $scope.moduleId = $scope.moduleId || $scope.modules[0].moduleId;
        }

        var reqUrl = '',
            dataType = '';
        //当前操作类型的moduleId
        $scope.queryParams.moduleId = $scope.moduleId;
        //筛选不同栏目类型切换对应数据
        $scope.$watch('moduleId', function (newValue) {
            //1.取出当前登录者的所有module信息
            var mType = 0;
            _.each(CacheService.getModules(), function (data) {
                //2.根据mid匹配,取出对应的mType
                if (newValue === data.moduleId) {
                    mType = data.moduleType;
                    //3.根据约定moduleType对应的类型查相应的数据
                    switch (mType) {
                        case 1:
                            dataType = 'article';
                            $scope.queryParams.status = 3;
                            $scope.queryParams.moduleId = newValue; //资讯需要传入moduleId
                            reqUrl = 'article/list';
                            break;
                        case 4:
                            dataType = 'colleges_act';
                            $scope.queryParams.status = 1;
                            delete $scope.queryParams.moduleId;
                            reqUrl = 'college/list';
                            break;
                        case 9:
                            dataType = 'activity';
                            $scope.queryParams.status = 1;
                            delete $scope.queryParams.moduleId;
                            reqUrl = 'activity/getActivityList';
                            break;
                        case 10:
                            dataType = 'mate';
                            $scope.queryParams.status = 1;
                            delete $scope.queryParams.moduleId;
                            reqUrl = 'mate/list';
                            break;
                        case 11:
                            dataType = 'note';
                            $scope.queryParams.status = 3;
                            delete $scope.queryParams.moduleId;
                            reqUrl = 'notes/list';
                            break;

                    }
                    clearParam();
                    $scope.getData();
                }

            });

        });

        $scope.getData = function () {
            if (!reqUrl) {
                //禁止无效的请求
                return;
            }
            if ($scope.queryParams.pageNumber < $scope.totalPage) {
                $scope.loading = true;
                $scope.queryParams.pageNumber++;
                CommRestService.post(reqUrl, $scope.queryParams, function (result) {

                    $scope.loading = false;
                    if (result.content && result.content.length > 0) {
                        $scope.totalPage = result.totalPages;
                        //各列表首图字段不一致
                        _.each(result.content, function (r) {
                            if (!r.thumbnail && r.poster) {
                                r.thumbnail = r.poster;
                            }
                        });
                        Array.prototype.push.apply($scope.dataList, result.content);
                        //如果需要分页码，可取result里的totalPages值
                    }

                    //如已是最后一页，则滚动时停止请求
                    if ($scope.queryParams.pageNumber === $scope.totalPage) {
                        $scope.lastPage = true;
                    }


                }, function (err) {
                    $scope.loading = false;
                });

            } else {
                $scope.lastPage = true;
            }
        };

        function clearParam() {
            $scope.queryParams.pageNumber = 0;
            $scope.dataList = [];
            $scope.lastPage = false;
            $scope.loading = false;
            $scope.totalPage = 1;
        }

        //选择资讯 - 直接当前scope的返回
        $scope.selectArt = function (art) {
            art.$checked = !art.$checked;
            bulidSelectedLink(art);
        };


        //构建不同类型返回link
        function bulidSelectedLink(selectedObj) {

            var userConfig = CacheService.getObject('current_user');
            //初始化各类型link前缀地址
            var linkUrl = {
                article: 'http://api.varicom.im/v1/views/article_',
                activity: 'http://www.varicom.im/site/app/ngfact/index.html?pid=ngfact&aid=',
                mate: 'http://www.varicom.im/site/app/act/index.html?pid=act&aid=',
                notes: 'http://www.varicom.im/site/app/note/index.html?aid=',
                college_act: 'http://www.varicom.im/site/app/college/index.html?pid=college&aid='
            };
            switch (dataType) {
                case 'note': //手记
                    $scope.selectedData = {
                        link: linkUrl.notes + selectedObj.hashId + '&iid=' + userConfig.iid,
                        aidType: 22,
                        title: selectedObj.title
                    };
                    break;
                case 'article': //资讯
                    $scope.selectedData = {
                        link: linkUrl.article + selectedObj.hashId + '_0_' + userConfig.iid,
                        aidType: 13,
                        title: selectedObj.title
                    };
                    break;
                case 'activity': //活动
                    $scope.selectedData = {
                        link: linkUrl.activity + selectedObj.id + '&iid=' + userConfig.iid,
                        aidType: 20,
                        title: selectedObj.title
                    };
                    break;
                case 'mate': //相约
                    $scope.selectedData = {
                        link: linkUrl.mate + selectedObj.id + '&iid=' + userConfig.iid,
                        aidType: 21,
                        title: selectedObj.title
                    };
                    break;
                case 'colleges_act':
                    $scope.selectedData = {
                        link: linkUrl.college_act + selectedObj.id + '&iid=' + userConfig.iid,
                        aidType: 23,
                        title: selectedObj.title
                    };
                    break;
            }
        }
    }

})();