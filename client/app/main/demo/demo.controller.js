/**
 *  demo Module
 *
 * 基础组件示例 Description
 */
;(function() {
	'use strict';

	var demoApp = angular.module('main.demo');

	//电商管理演示专用
	demoApp.controller('StoreDemoController', ['$scope', 'vcModalService', '$timeout', function($scope, vcModalService, $timeout){

		//demo1 : swiper 滚动
		$scope.swiperList = [
			{src:'http://imgcache.varicom.im/images/site/open_v3.1/ec_home_banner.jpg'},
			{src:'http://imgcache.varicom.im/images/site/open_v3.1/occupied_1080_540.gif'}];

		var swiper = null;
		$scope.initSwiper = function() {
			if (swiper == null) {
				console.log('init swiper...');
				swiper = new Swiper ('.swiper-container', {
					autoplay: 3000,
					pagination: '.swiper-pagination'
				});
			}
		};

		$scope.goodsLink = "";
		$scope.selectGoodsInModal = function(){
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
					fn: function(linkObj){
						$scope.goodsLink = JSON.stringify(linkObj);
					}
				}
			});
		};

		//demo2 : 模式窗口内点击上传图片
		$scope.uploadInModal = function(){
			vcModalService({
				retId: 'upList',
				backdropCancel: false,
				title: '编辑组件',
				css: {
					height: '500px',
					width: '600px'
				},
				templateUrl: 'app/main/demo/pages/upload.html',
				controller: 'StoreUploadController',
				success: {
					label: '确定',
					fn: $scope.showImgList
				}
			});
		};
		$scope.showImgList = function(imgList) {
			vcAlert(JSON.stringify(imgList));
		};

		//demo3
		$scope.uploadImg = '';

	}]);

	demoApp.controller('StoreUploadController', ['$scope', function($scope){

		var index = 0;

		$scope.upList = [];

		$scope.addUpList = function(){
			$scope.upList.push({id:'up'+(++index),img:''});
		}

		$scope.getUpList = function(){
			alert(JSON.stringify($scope.upList));
		}
	}]);

	demoApp
		.controller('TestTabController', ['$scope', 'vcTabsBroadcastKey', 'CommTabService', 'vcModalService', function ($scope, vcTabsBroadcastKey, CommTabService, vcModalService) {


			$scope.getPicture = function () {
				console.log($scope.picture);
			};
			$scope.gotoTab1 = function (type) {
				CommTabService.next($scope.$vcTabInfo, 1, {from: "Tab2"}, (type == 0 ? null : ["tab1"]));
			};

			$scope.gotoTab2 = function () {
				CommTabService.next($scope.$vcTabInfo, 2, {from: "Tab-No-Index"});
			};

			$scope.goToTabNoIndex = function () {
				CommTabService.next($scope.$vcTabInfo, 5, {from: "Tab2"});
			};

			$scope.ueditorContent = "";

			$scope.reloadTimes = 0;
			$scope.paramsModel = "";

			function loadData() {
				$scope.reloadTimes++;
			}

			$scope.vcTabOnload = function () {
				if ($scope.$dirty) {
					console.log("tab2 is dirty...");
					loadData();
					$scope.$dirty = false;
				}
			};

			$scope.vcTabOnUnload = function () {

			};

			//初始化对象
			$scope.initConfigs = {};

			$scope.selectDate = '';

			$scope.banner = {
				bannername: "",
				aidType: 11,
				bannerclick: ""
			};

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
						fn: $scope.article
					}
				}, {
					moduleId: $scope.moduleId
				});
			};

			$scope.article = function (article) {
				$scope.banner.bannerclick = article.link;
				//1204 选择不同资源banne的aidType需对应资源的aid
				$scope.banner.aidType = article.aidType;
				//1204 选择后带回标题
				$scope.banner.bannername = article.title;
			};
		}])
		.controller("TestModalController", function ($scope, $timeout) {
			$scope.lastPage = false;

			//Test 分页
			$scope.pgData = {totalPages: 10, pageNumber: 1};

			$scope.pgData.list = [];
			$scope.loading = false;

			var lastIndex = 0;
			$scope.getData = function () {
				$scope.loading = true;
				$timeout(function () {
					for (var i = 0; i < 10; i++) {
						lastIndex++;
						$scope.pgData.list.push("Test" + lastIndex);
					}
					$scope.pgData.pageNumber++;
					$scope.loading = false;
				}, 2000);
			};
		});

	demoApp.controller('DemoController', DemoController);
	function DemoController($stateParams, $timeout, CommTabService) {
		var targetTab = $stateParams.tab;
		var targetTag = $stateParams.tag;

		if (!!targetTag) {
			//只能延迟点处理
			$timeout(function () {
				console.log('targetTab=' + targetTab + ',targetTag=' + targetTag);
				CommTabService.next({
					index: 1,
					tag: 'tab1',
					root: 'demoTabs'
				}, targetTag, {}, (targetTab || 'demoTabs'));
			}, 500);
		}
	}

	//含上传、编辑器代码示例
	demoApp.controller('TestDemoController', TestDemoController);
	function TestDemoController($scope, TipService, vcModalService, CommTabService, $timeout, CommRestService, CacheService) {

		//选择完用户后的处理
		$scope.selectCallBack = function (article) {
			console.log(article);
			//http://api.varicom.im/v1/views/article_2L9zm_0_3?from=singlemessage
			//$scope.groupMessage.location = "http://api.varicom.im/v1/views/article_"+article.hashId+"_0_"+article.iid;
		};


		$scope.addTips = function () {
			TipService.add('success', 'add success');
		};

		$scope.alert = function () {
			vcAlert('这是一个对话框！');
		};

		$scope.confirm = function () {
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
				alert('你点了确定');
			});
		};

		$scope.imageData = '';
		$scope.imageMessage = '';
		var uploader = WebUploader.create({
			auto: true,
			swf: 'http://imgcache.varicom.im/js/webupload/Uploader.swf',
			server: '/api/base/fileupload',
			pick: '#filePicker',
			resize: false,
			fileSizeLimit: 20971520,
			accept: {
				title: 'Images',
				extensions: 'gif,jpg,jpeg,bmp,png',
				mimeTypes: 'image/*'
			}
		});

		uploader.on('uploadSuccess', fUploadSuccess);

		function fUploadSuccess(file, response) {
			if (response && response.code === 0) {

				$scope.$apply(function () {
					$scope.imageMessage = '上传成功';
					$scope.imageData = response.t;
				});
			} else {
				$scope.$apply(function () {
					$scope.imageMessage = '上传失败';
				});
			}
		}

		console.log($scope.picture);
		//默认日期
		$scope.selectDate = '';

		//默认权限
		$scope.myPermission = 'article:add';

		//编辑器
		$scope.ueditorId = 'my-ueditor';
		$scope.note = {};

		//下拉选
		$scope.demo = {
			type: 2,
			role: 1
		};
		//ng-model的属性
		$scope.types = [{
			id: 1,
			name: '资讯'
		}, {
			id: 2,
			name: '位置资讯'
		}, {
			id: 3,
			name: '视频'
		}];

		//Modal窗口
		$scope.selectedUsers = [];
		$scope.toggleModal = function (index) {
			if (index == 1) {
				vcModalService({
					title: '提示-模式窗口内滚动',
					template: '<ul><p>我是一个很随意的Html</p><br/><p>我是一个很随意的Html</p><br/><p>我是一个很随意的Html</p><br/><p>我是一个很随意的Html</p><br/><p>我是一个很随意的Html</p><br/><p>我是一个很随意的Html</p><br/><p>我是一个很随意的Html</p><br/><p>我是一个很随意的Html</p><br/><p>我是一个很随意的Html</p><br/><p>我是一个很随意的Html</p><br/><p>我是一个很随意的Html</p><br/><p>我是一个很随意的Html</p><br/><p>我是一个很随意的Html</p><br/><p>我是一个很随意的Html</p><br/><p>我是一个很随意的Html</p><br/></ul>'
				});
			}
			else if (index == 4) {
				vcModalService({
					title: '提示-模式窗口嵌套',
					template: '<p><a ng-click="openModal()">点我再打开新的</a></p>',
					controller: 'ComplexModalController'
				});
			}
			else if (index == 2) {
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
						fn: $scope.users
					}
				}, {
					queryParams: {
						pageSize: 10
					},
					isMulitSelect: true,
					selectedUser: $scope.selectedUsers
				});
			}
			else if (index == 3) {
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
						fn: $scope.resourceLink
					}
				}, {
					queryParams: {
						pageSize: 10
					}
				});
			}
			else if (index == 5) {
				vcModalService({
					scope: $scope,
					backdropCancel: false,
					title: '测试',
					css: {
						height: '500px',
						width: '600px'
					},
					templateUrl: 'app/main/demo/distributeList.html',
					controller: 'TestModalController'
				});
			}
			/*else if (index == 6) {
			 vcModalService({
			 retId:'checkedOuser',
			 backdropCancel: false,
			 title: '选择组织架构成员',
			 css: {
			 height: '500px',
			 width: '400px'
			 },
			 templateUrl: 'tplSelectOpenUsers.html',
			 controller: 'SelectOpenUserController',
			 success: {
			 label: '确定',
			 fn: $scope.selectedOpenUser
			 }
			 }, {
			 queryParams : {
			 pageSize: 10
			 },
			 isMulitSelect: true,
			 reqFrom:'user'
			 });
			 }*/
		};
		//选择后的用户
		$scope.users = function (users) {
			console.log(users);
			$scope.selectedUsers = users;
			//$scope.selectedUsers = _.pluck(users, "nickname").join(';');
		};

		//选择后的资源(链接)
		$scope.resourceLink = function (link) {
			console.log(link);
		};

		//选择后的组织架构成员
		$scope.selectedOpenUser = function (openuser) {
			console.log(openuser);
		};
		//tab组件依赖
		$scope.getLocals = function (tag) {
			if (tag == "tab2") {
				var locals = {
					initParams: {
						query: {
							pageSize: 10
						}
					}
				};
				return locals;
			}
			return null;
		};

		//典型：通知更新并跳转
		$scope.newNext = function () {
			//可以合二为一，也可以单独通知
			//CommTabService.dirty($scope.$vcTabInfo, ['myaudit','online','offline'], 'commBannerTabs');
			//CommTabService.next($scope.$vcTabInfo, 'offline', {}, 'commBannerTabs', ['myaudit','online','offline']);
			//CommTabService.next($scope.$vcTabInfo, 'tab4', {}, ['tab1','tab4']);
			//CommTabService.dirty($scope.$vcTabInfo, 'tab2', true);
			//CommRestService.post('audit/update', {}, function(){});

			CacheService.clear();
		};

		$scope.goToTab2 = function () {
			CommTabService.next($scope.$vcTabInfo, 2);
		};

		$scope.goToTabNoIndex = function () {
			CommTabService.next($scope.$vcTabInfo, 5, {from: 'DemoController'}, $scope.$vcTabInfo.root, 'tab2');
		};

		$scope.goToTabWithTab = function () {
			CommTabService.next($scope.$vcTabInfo, 4);
		};

		$scope.goToTabWithTab4 = function () {
			$scope.note = {};
			CommTabService.next($scope.$vcTabInfo, $scope.lastTabInfo.index, {}, $scope.lastTabInfo.root);
			//CommTabService.next($scope.$vcTabInfo, 4, {}, "commBannerTabs", ["offline"]);
		};

		$scope.reloadTimes = 0;
		$scope.paramsModel = "";

		$scope.lastTabInfo = null;
		$scope.vcTabOnload = function (query, lastTabInfo) {
			if ($scope.$dirty) {
				console.log('tab1 is dirty....');
				$scope.paramsModel = JSON.stringify(query);
				$scope.reloadTimes++;
				$scope.$dirty = false;
				$scope.lastTabInfo = lastTabInfo || $scope.$vcTabInfo;

				$timeout(function () {
					$scope.note = {ueditorContent: '<p>wayky ueditor content</p>'};
				}, 1500);
			}
		};

		$scope.getUeditorContent = function () {
			var _error = angular.element('form[name="demoForm"]').scope().demoForm.$error;
			if (_error && !_.isEmpty(_error)) {
				_.each(_error, function (n) {
					_.each(n, function (e) {
						//TipService.add('error', '非法值:'+e.$modelValue,3000);
						alert('非法值:' + e.$modelValue);
					});
				});
			}

			vcAlert($scope.note.ueditorContent);
		};

		$scope.demoInitConfigs = {initConfigs: {test: 'init by demo'}};


		// 简单传入moduleId足够
		$scope.bannerConfig = {
			moduleId: 123
		};
	}

	demoApp
		.factory('SampleFactory', function () {
			return {
				getData: function () {
					console.log('get data from server.');
				}
			};
		})
		.controller('ComplexModalController', ['$scope', 'SampleFactory', 'vcModalService',
			function ($scope, SampleFactory, vcModalService) {
				SampleFactory.getData();
				$scope.openModal = function () {
					vcModalService({
						title: '提示-模式窗口内滚动',
						template: '<p>我是一个新的的Html</p>',
						css: {
							height: '300px',
							width: '200px'
						}
					});
				}
			}
		]);
})();


