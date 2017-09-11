/**
 *  main.notes Module
 *
 *  手记管理 Description
 */

;(function() {
	'use strict';
	angular.module('main.notes')
		.controller('NotesController', ['$scope', '$stateParams', '$timeout', 'CommTabService', NotesController])
		.controller('NoteMgrController', ['$scope', 'CacheService', 'CommTabService', NoteMgrController])
		.controller('NotesListController', NotesListController)
		.controller('NoteEditController', NoteEditController);

	// 首页
	function NotesController($scope, $stateParams, $timeout, CommTabService) {
		$scope.moduleId = parseInt($stateParams.moduleId) || 0;

		$scope.loading = false;

		var targetTab = $stateParams.tab;
		var targetTag = $stateParams.tag;

		if (!!targetTag) {
			//只能延迟点处理
			$timeout(function() {
				CommTabService.next({
					index: 2,
					tag: 'manage',
					root: 'noteTabs'
				}, targetTag, {}, (targetTab || 'noteTabs'));
			}, 500);
		}
	}

	//管理页
	function NoteMgrController($scope) {
		$scope.loading = false;
	}


	//列表
	function NotesListController($scope, NotesService, CommTabService, tenYears, CacheService, AuditService, $stateParams, TipService, previewModalService) {

		//状态
		$scope.status = 0;

		$scope.params = {
			pageSize: 10,
			pageNumber: 0
		};

		$scope.data = [];
		$scope.pager = {};

		//加载数据
		$scope.loadData = function(pageNo) {
			this.params.pageNumber = 0;
			var now = new Date();
			$scope.$parent.loading = true;
			pageNo ? (this.params.pageNumber = parseInt(pageNo)) : this.params.pageNumber++;
			//init
			if (!this.params.status) {
				this.params.status = this.status;
			}

			NotesService.req('notes/list', $scope.params, function(data) {
				if (data.content) {
					$scope.data = data.content;
					_.each($scope.data, function(d) {
						//如果修改时间大于当前时间+5年,则认为是置顶数据
						if (d.updateTime > now.getTime() + 155520000000) {
							d.isTop = true;
						}
					});
					$scope.pager = {
						firstPage: data.firstPage,
						lastPage: data.lastPage,
						totalPages: data.totalPages,
						pageNumber: data.pageNumber
					};
				}
				$scope.$parent.loading = false;
			}, function(err) {
				$scope.$parent.loading = false;
			});
		};

		//供Tab调用的页面刷新接口
		$scope.vcTabOnload = function(data, fromIndex) {
			if ($scope.$dirty) {
				$scope.loadData();
				$scope.$dirty = false;
			}
		};

		//预览
		$scope.preview = function(note) {
			//1210 取出该条手记详情(调取详情手记)
			var rid = null,
				preData = {};
			NotesService.req('notes/get', {
				aid: note.id
			}, function(data) {
				preData = data;
				//1221 取出发布人
				var index = note.tags.lastIndexOf('#');
				if (index !== -1) {
					rid = note.tags.substr(index + 1);
				}
				NotesService.req('user/get', {
					rid: rid
				}, function(res) {
					preData.create = {
						name: res.nickname,
						imgPath: res.imgPath
					};
					CacheService.putObject('preview_notes', preData);
					var curTime = new Date().getTime();
					previewModalService.activate({
						f_src: '/assets/preview/notes/index.html?r=' + curTime
					});
				});
			});

		};

		//编辑
		$scope.edit = function(note, type) {
			CommTabService.next($scope.$vcTabInfo, 1, {
				operate: type,
				data: note
			}, 'noteTabs');
		};

		//列表上的几个操作按钮
		//置顶
		$scope.setTop = function(noteId) {
			var cur = new Date(),
				updateTime = cur.getTime() + tenYears; //当前时间加上十年

			NotesService.req('base/sort', {
				bizId: noteId,
				updateTime: updateTime,
				type: 5
			}, function() {
				$scope.loadData();
			});
		};

		/**
		 * 取消置顶
		 * @param act
		 */
		$scope.downTop = function(noteId) {
			var cur = new Date();
			NotesService.req('base/sort', {
				bizId: noteId,
				updateTime: cur.getTime() - 50,
				type: 5
			}, function() {
				$scope.loadData(1);
			});
		};


		//下线
		$scope.offline = function(noteId) {
			window.vcAlert({
				title: '下线手记',
				text: '确认下线此篇手记吗?',
				type: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#DD6B55',
				cancelButtonText: '取消',
				confirmButtonText: '确定',
				closeOnConfirm: true,
				html: false
			}, function() {
				NotesService.req('notes/offline', {
					aid: noteId,
					status: 4
				}, function() {
					TipService.add('success', '下线成功', 3000);
					//通知下线列表和线上列表数据更新
					CommTabService.next($scope.$vcTabInfo, 'online', {}, ['online', 'offline']);
				}, function(err) {
					TipService.add('danger', err.msg, 3000);
				});
			});
		};

		//删除下线
		$scope.del = function(noteId) {
			window.vcAlert({
				title: '删除手记',
				text: '确认删除此篇手记吗?',
				type: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#DD6B55',
				cancelButtonText: '取消',
				confirmButtonText: '确定',
				closeOnConfirm: true,
				html: false
			}, function() {
				NotesService.req('notes/del', {
					aid: noteId,
					status: 4
				}, function() {
					TipService.add('success', '删除成功', 3000);
					$scope.loadData(1);
				}, function(err) {
					TipService.add('danger', err.msg, 3000);
				});

			});
		};


		//表格拖动排序
		$scope.dragSuccess = function(cur, prev, next) {
			var curNote = NotesService.findDataById($scope.data, cur);
			var preNote = null;
			var nextNote = null;
			//上下都有
			if (prev && next) {
				preNote = NotesService.findDataById($scope.data, prev);
				nextNote = NotesService.findDataById($scope.data, next);
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
							NotesService.req('base/sort', {
								bizId: next,
								updateTime: nextNote.updateTime - 1,
								type: 5
							}, function() {
								//如果修改时间大于当前时间,则认为是置顶数据
								if (nextNote.updateTime - 1 > currentTime) {
									curNote.isTop = true;
								}
							});
						}
					}
					NotesService.req('base/sort', {
						bizId: cur,
						updateTime: updateTime,
						type: 5
					}, function() {
						//如果修改时间大于当前时间,则认为是置顶数据
						if (updateTime > currentTime) {
							curNote.isTop = true;
						}
					});
					return;
				}
			}
			//只有下一条
			if (next) {
				nextNote = NotesService.findDataById($scope.data, next);
				if (nextNote && nextNote.updateTime) {
					NotesService.req('base/sort', {
						bizId: cur,
						updateTime: nextNote.updateTime + 50,
						type: 5
					}, function() {
						//如果修改时间大于当前时间,则认为是置顶数据
						if (nextNote.updateTime + 50 > currentTime) {
							curNote.isTop = true;
						}
					});
				}
			}
			//只有上一条
			if (prev) {
				preNote = NotesService.findDataById($scope.data, prev);
				if (preNote && preNote.updateTime) {
					NotesService.req('base/sort', {
						bizId: cur,
						updateTime: preNote.updateTime - 50,
						type: 5
					}, function() {
						//如果修改时间大于当前时间,则认为是置顶数据
						if (preNote.updateTime - 50 > currentTime) {
							curNote.isTop = true;
						}
					});
				}
			}
		};

	}

	//新增或编辑
	function NoteEditController($scope, NotesService, CommTabService, AuditService, $interval, CacheService, TipService, previewModalService, AuthService) {

		$scope.note = {}; //手记
		$scope.paramsModel = {};
		$scope.operate = 'add'; //当前操作类型,默认是新增
		$scope.ueditorId = 'note_ueditor_instance';

		var saveDratTime = '',
			audit = {},
			rid = null, //查询发布人
			create = {}; //发布人  

		$scope.vcTabOnload = function(query, lastTabInfo) { //lastTabInfo {index,tag,root}
			if (query) {
				$scope.paramsModel = query;
				$scope.operate = query.operate;
				$scope.lastTabInfo = lastTabInfo || $scope.$vcTabInfo;
				loadData();
			}
		};

		$scope.vcTabOnUnload = function() {
			if ($scope.draftInterval) {
				$interval.cancel($scope.draftInterval);
				rid = null;
				create = {};
			}
		};

		$scope.gotoBack = function() {
			if ($scope.noteForm.noteTitle.$pristine && $scope.noteForm.artDesc.$pristine) {
				$scope.clear();
				CommTabService.next($scope.$vcTabInfo, $scope.lastTabInfo.index, {}, $scope.lastTabInfo.root);
			} else {
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
				}, function() {
					//清空当前表单的状态
					$scope.clear();
					$scope.hasNewData = false;
					CommTabService.next($scope.$vcTabInfo, $scope.lastTabInfo.index, {}, $scope.lastTabInfo.root);
				});
			}
		};

		var loadData = function() {
			//编辑时拉取数据
			if ($scope.operate === 'edit' || $scope.operate === 'editOffline') {
				$scope.$parent.loading = true;
				NotesService.req('notes/get', {
					aid: $scope.paramsModel.data.id
				}, function(data) {
					$scope.$parent.loading = false;
					$scope.note = data;
				}, function(err) {
					$scope.$parent.loading = false;
					vcAlert(err.msg);
				});
				//1221 取出该手记的发布人信息
				var value = $scope.paramsModel.data.tags,
					index = value.lastIndexOf('#');
				if (index !== -1) {
					rid = value.substr(index + 1);
				}
				getCurrentUser(rid);

			} else if ($scope.operate === 'editDraft' || $scope.operate === 'editAudit') {
				$scope.$parent.loading = true;
				AuditService.getAudit({
					auditId: $scope.paramsModel.dataId
				}, function(data) {
					$scope.$parent.loading = false;
					rid = data.applyRid;
					getCurrentUser(rid);
					audit = data;
					var noteContent = JSON.parse(data.content),
						idx = noteContent.tags.indexOf('#');
					if (idx !== -1) {
						noteContent.tags = noteContent.tags.substr(0, idx);
					}
					noteContent.auditId = data.id;
					$scope.note = noteContent;
				}, function(err) {
					$scope.$parent.loading = false;
					vcAlert(err.msg);
				});

			}

		};

		//获取发布人信息
		function getCurrentUser(rid) {
			if (rid) {
				NotesService.req('user/get', {
					rid: rid
				}, function(data) {
					create = {
						name: data.nickname,
						imgPath: data.imgPath
					};
				});
			}
		}

		$scope.$watch('operate', function() {
			//如当前是编辑草稿/新增手记则启动自动保存草稿功能
			if ($scope.operate === 'editDraft' || $scope.operate === 'add') {
				autoDraft();
			}
		});

		//操作按钮
		//保存手记/待审核
		$scope.saveNote = function(valid) {
			//1205 避免编辑器中图片还未上传完成时发布手记 实现不好,需修改
			var content = UE.getEditor($scope.ueditorId).getContent();
			if (content.indexOf('正在上传') !== -1) {
				TipService.add('warning', '手记详情图片正在上传中，请稍候...', 3000);
				return;
			}

			//验证图片是否上传
			if (angular.isUndefined($scope.note.thumbnail)) {
				TipService.add('warning', '封面图不能为空', 3000);
				return;
			} else {
				if (!CacheService.hasPermission('note:add')) {
					$scope.saveAudit();
				} else {
					var postUri = 'notes/add',
						msg = '手记新增成功';
					if ($scope.note.id) {
						postUri = 'notes/update';
						msg = '手记编辑成功';
					}

					if (valid) {
						$scope.$parent.loading = true;
						$scope.note.articleContent = UE.getEditor($scope.ueditorId).getContent() //htmlEncode();
						NotesService.req(postUri, $scope.note, function() {
							$scope.$parent.loading = false;
							window.vcAlert(msg);
							//根据不同操作返回相应列表
							switch ($scope.operate) {
								case 'editDraft':
									CommTabService.next($scope.$vcTabInfo, 'draft', {}, 'manage', ['online', 'draft']);
									break;
								case 'editAudit':
									CommTabService.next($scope.$vcTabInfo, 'audit', {}, 'manage', ['online', 'audit']);
									break;
								case 'editOffline':
									CommTabService.next($scope.$vcTabInfo, 'offline', {}, 'manage', ['online', 'offline']);
									break;
								default:
									//回到线上列表页
									CommTabService.next($scope.$vcTabInfo, 'online', {}, 'manage', ['online', 'draft', 'audit', 'offline']);
							}
							$scope.clear();

						}, function(err) {
							$scope.$parent.loading = false;
							$scope.note.articleContent = UE.getEditor($scope.ueditorId).getContent();
							TipService.add('error', err.msg, 3000);
						});
					}
				}
			}

		};

		//保存到草稿
		$scope.saveDraft = function(type) {
			saveDratTime = moment().format('YYYY-MM-DD hh:mm');
			if (_.isUndefined($scope.note.title) || $scope.note.title === '') {
				return;
			}
			$scope.bulidAudit();
			$scope.$parent.loading = true;

			AuditService.save(audit, function(res) {
				if (angular.isNumber(res)) {
					audit.id = res;
					$scope.$parent.loading = false;
					//通知草稿列表数据变化
					CommTabService.dirty($scope.$vcTabInfo, ['draft'], 'manage', true);
					if (type === 'auto') {
						TipService.add('success', '您好，我们将每5分钟为您自动保存一次手记，上次保存时间:' + saveDratTime, 3000);
					} else {
						TipService.add('success', '草稿操作成功', 3000);
					}
				}
			}, function(err) {
				$scope.$parent.loading = false;
				window.vcAlert(err.msg);
			});
		};

		//提交审核
		$scope.saveAudit = function() {
			$scope.bulidAudit();
			audit.status = 1;
			//1216 如是线上编辑则提交线上修改审核
			$scope.operate === 'edit' ? audit.auditType = 2 : audit.auditType = 1;
			AuditService.save(audit, function(res) {
				if (angular.isNumber(res)) {
					window.vcAlert('审核操作成功');
					$scope.clear();
					//回到myaudit列表页
					CommTabService.next($scope.$vcTabInfo, 'myaudit', {}, 'manage', ['myaudit', 'draft']);
				}
			}, function(err) {
				window.vcAlert(err.msg);
			});
		};

		$scope.bulidAudit = function() {
			$scope.note.articleContent = UE.getEditor($scope.ueditorId).getContent();
			//1223 提交审核时模拟发布时间,以便预览
			$scope.note.createTime = moment()._d.getTime();

			var _note = angular.copy($scope.note);
			audit.bizId = _note.id;
			audit.bizType = 5;
			//默认就是草稿
			audit.status = 0;
			audit.auditType = 0;
			audit.title = _note.title;
			audit.thumbnail = _note.thumbnail;

			//var auditNode = angular.copy($scope.note);
			//auditNode.articleContent = htmlEncode(auditNode.articleContent);

			//fix by wayky : 当提交审核时，需要把提交人(leader)的信息带上
			var currUser = AuthService.getUserInfo();
			_note.tags = _note.tags + '#' + currUser.rid;

			audit.content = JSON.stringify(_note);

		};

		//清空
		$scope.clear = function() {
			$scope.validNum($scope.note.tags);
			$scope.note = {};
			$scope.paramsModel = {};
			$scope.operate = 'add';
			audit = {};
			rid = null;
			create = {};
			if ($scope.draftInterval) {
				$interval.cancel($scope.draftInterval);
			}
		};

		$scope.validNum = function(num) {
			if (!new RegExp(/^[0-9]*[1-9][0-9]*$/).test(num)) {
				$scope.note.tags = 0;
			}
		};


		//预览
		$scope.preview = function() {
			$scope.note.create = {};
			if (!$scope.note.articleContent) {
				TipService.add('warning', '请填写必要信息', 3000);
				return;
			} else {
				//取出编辑器内容
				var content = UE.getEditor($scope.ueditorId).getContent();
				if (content.indexOf('正在上传') !== -1) {
					TipService.add('warning', '手记详情图片正在上传中，请稍候...', 3000);
					return;
				} else {
					$scope.note.articleContent = content;
				}
			}
			//发布人信息
			if ($scope.operate === 'add') {
				$scope.note.create = {
					name: CacheService.getObject('current_user').userName,
					imgPath: CacheService.getObject('current_user').imgPath
				};
				//1223 新增时模拟发布时间,以便预览
				$scope.note.createTime = moment()._d.getTime();
			} else {
				$scope.note.create = create;
			}

			CacheService.putObject('preview_notes', $scope.note);
			var curTime = new Date().getTime();
			previewModalService.activate({
				f_src: '/assets/preview/notes/index.html?r=' + curTime
			});
		};

		//每5分钟自动保存草稿
		function autoDraft() {
			if (_.isUndefined($scope.draftInterval)) {
				$scope.draftInterval = $interval(function() {
					$scope.saveDraft('auto');
				}, 300000);

				//销毁定时器
				$scope.$on('$destroy', function() {
					if ($scope.draftInterval) {
						$interval.cancel($scope.draftInterval);
					}
				});
			}
		}
	}

	NotesListController.$inject = ['$scope', 'NotesService', 'CommTabService', 'tenYears', 'CacheService', 'AuditService', '$stateParams', 'TipService', 'previewModalService'];
	NoteEditController.$inject = ['$scope', 'NotesService', 'CommTabService', 'AuditService', '$interval', 'CacheService', 'TipService', 'previewModalService', 'AuthService'];

})();