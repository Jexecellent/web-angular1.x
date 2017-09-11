/**
*  open Module
*
* open下的所有子模块 Description
*/
;(function () {
	'use strict';
	angular.module('open.main', [
		'main.myindex',
		'main.myapp',
		'main.act',
		'main.article',
		'main.groupmsg',
		'main.demo',
		'main.mate',
		'main.interestUser',
		'main.user',
		'main.notes',
		'main.home',
		'main.college',
		'main.storeIndex',
		'main.goodsType',
		'main.goodsMgr',
		'main.storeDistribute',
		'main.orderMgr',
		'main.log',
		'main.pageshow'

	]);

//主页
	angular.module('open.main').constant('tenYears', 315360000000).config(fHomeConfig);

	function fHomeConfig($stateProvider) {
		$stateProvider
			.state('main', {
				url: '/main',
				views: {
					'view': {
						templateUrl: 'app/main/main.html',
						controller: 'MainController'
					}
				},
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load(['app/main/main.controller.js'
						]);
					}]
				}
			})
			.state('pg_not_found', {
				url: '/pg_not_found',
				views: {
					'view': {
						templateUrl: 'app/main/404.html'
					}
				}
			});
	}
})();