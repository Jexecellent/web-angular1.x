;(function () {

    'use strict';

    var app = angular.module('openApp');

    //选择App用户
    app.controller('SelectAppUserController', ['$scope', 'CommRestService', SelectAppUserController]);

    function SelectAppUserController($scope, CommRestService) {
        //初始化参数
        $scope.queryParams = {
            pageSize: 10,
            pageNumber: 0,
            departmentIds: ''
        };

        $scope.userList = []; //用户列表
        $scope.lastPage = false;
        $scope.totalPage = 1;
        $scope.loading = false;

        //1207 过滤组织架构中的用户（领队、咨询）
        if ($scope.op) {
            $scope.queryParams.op = $scope.op;
        }
        $scope.getData = function () {
            if ($scope.queryParams.pageNumber < $scope.totalPage) {
                $scope.queryParams.pageNumber++;
                $scope.loading = true;

                CommRestService.post('user/list', $scope.queryParams, function (data) {
                    $scope.loading = false;
                    if (data.content && data.content.length > 0) {
                        $scope.totalPage = data.totalPages;
                        //$scope.userList = data.content;
                        Array.prototype.push.apply($scope.userList, data.content);
                        if (_.isArray($scope.selectedUser) && $scope.selectedUser.length !== 0) {
                            _.each($scope.userList, function (user) {
                                _.each($scope.selectedUser, function (appuser) {
                                    //匹配勾选
                                    if (user.id === appuser.id) {
                                        user.$checked = true;

                                    }
                                });
                            });
                        } else if (angular.isObject($scope.selectedUser)) {
                            _.each($scope.userList, function (user) {
                                if (user.id === $scope.selectedUser.id) {
                                    user.$checked = true;
                                }
                            });
                        }

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

        $scope.loadQueryData = function () {
            $scope.queryParams.pageNumber = 0;
            $scope.userList = [];
            $scope.getData();
        };

        //选择用户
        $scope.checkedUser = function (user) {
            user.$checked = !user.$checked;
            if (!$scope.isMulitSelect) {
                $scope.selectedUser = user;
            } else {
                //多选
                if (user.$checked) {
                    $scope.selectedUser.push(user);
                } else {
                    _.remove($scope.selectedUser, function (n) {
                        return n.id === user.id;
                    });
                    console.log($scope.selectedUser)
                }
            }
        };

        $scope.$watch('queryParams.departmentIds', function (newValue, oldValue) {
            $scope.loadQueryData();
            /*if(!angular.isUndefined(newValue)){

             }*/
        });
    }

})();