/**
 *  main.user Module
 *
 * 组织架构 Description
 */

;(function() {
	'use strict';
	angular.module('main.user')
		.controller('UserController', UserController)
		.controller('UserEditController', UserEditController)
		.controller('UserDepListController', UserDepListController)
		.controller('UserStaffController', UserStaffController);

	//首页
	function UserController($scope) {
		$scope.loading = false;

		$scope.root_DepList = [];
	}

	//部门列表
	function UserDepListController($scope, CommRestService, vcModalService, TipService, CommTabService) {

		//初始化参数
		$scope.queryParams = {
			pageSize: 5,
			pageNumber: 1
		};

		$scope.vcTabOnload = function(data, fromIndex) {
			if ($scope.$dirty) {
				$scope.loadDept();
				$scope.$dirty = false;
			}
		};

		$scope.loadDept = function() {
			$scope.$parent.loading = true;
			CommRestService.post('department/list', $scope.queryParams, function(data) {
				$scope.departmentList = $scope.$parent.root_DepList = data.content;
				if ($scope.departmentList.length >= 5) {
					$scope.disabledClass = 'grey';
				} else {
					$scope.disabledClass = 'green_btn icon_plus';
				}
				//1127:确认需求时去掉此功能
				/*_.each($scope.departmentList, function(dp) {
					if (dp.name === '咨询部' || dp.name === '领队部') {
						//如是系统创建的两个部门则置灰,且禁用操作
						dp.showDisabled = true;
					} else {
						dp.showDisabled = false;
					}
				});*/
				$scope.$parent.loading = false;
			});
			CommRestService.post('base/config', {
				'key': 'DepartmentType'
			}, function(types) {
				$scope._types = [];
				var j;
				for (var i in types) {
					j = types[i].key;
					$scope._types[j] = types[i];
				}
			}, function(err) {
				TipService.add('danger', err.msg, 3000);
			});
		};

		$scope.dept = {};
		$scope.type = ''; //部门当前的操作(新增/修改)

		//打开新增/修改部门弹出框
		$scope.openAddDept = function(type, detail) {
			//如部门信息不为空则带入编辑页面
			if (detail !== undefined) {
				$scope.dept = detail;
			} else {
				$scope.dept = {
					'type': 0
				};
			}
			var title = '';
			$scope.type = type;
			type === 'edit' ? title = '修改部门' : title = '新增部门';
			vcModalService({
				retId: 'dept',
				backdropCancel: false,
				title: title,
				css: {
					height: '390px',
					width: '400px'
				},
				templateUrl: 'app/main/user/pages/dep_edit.html',
				controller: 'UserEditController',
				success: {
					label: '确定',
					fn: addDept
				},
				cancel: {
					label: '取消',
					fn: $scope.cancel
				}
			}, {
				dept: $scope.dept,
				_types: $scope._types
			});

		};

		//删除部门
		$scope.delDept = function(id) {
			window.vcAlert({
				title: '删除部门',
				text: '确认删除此部门吗?',
				type: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#DD6B55',
				cancelButtonText: '取消',
				confirmButtonText: '确定',
				closeOnConfirm: true,
				html: false
			}, function() {
				CommRestService.post('department/del', {
					departmentId: id
				}, function() {
					TipService.add('success', '删除成功', 3000);
					$scope.loadDept();
					//通知人员列表中部门数据的变更
					CommTabService.dirty($scope.$vcTabInfo, ['staff']);
				}, function(err) {
					TipService.add('danger', err.msg, 3000);
				});
			});
		};

		//新增/修改部门
		function addDept(cbInfo) {
			var dept = {
				id: cbInfo.id,
				name: cbInfo.name,
				type: cbInfo.type,
				desc: cbInfo.desc
			};
			if (cbInfo.checkName) {
				return false;
			} else if (dept.name === '' || dept.name === undefined) {
				TipService.add('success', '部门名称不能为空', 3000);
				return false;
			} else {
				var url = '',
					msg = '';
				if ($scope.type === 'add') {
					url = 'department/add';
					msg = '部门新增成功';
				} else {
					url = 'department/update';
					msg = '部门修改成功';
				}
				CommRestService.post(url, dept, function() {
					TipService.add('success', msg, 3000);
					$scope.loadDept();
					//通知人员列表中部门数据的变更
					CommTabService.dirty($scope.$vcTabInfo, ['staff']);
				}, function(res) {
					TipService.add('warning', err.msg, 3000);
				});
				return true;
			}

		}

		//检查部门名称是否已存在
		$scope.checkName = function() {
			$scope.queryParams.queryKey = $scope.dept.name;
			CommRestService.post('department/list', $scope.queryParams, function(data) {

				if (data.content.length > 0) {
					$scope.errorName = true;
					$scope.dept.checkName = true;
				} else {
					$scope.errorName = false;
					$scope.dept.checkName = false;
				}
			});
		};
	}
	UserDepListController.$inject = ['$scope', 'CommRestService', 'vcModalService', 'TipService', 'CommTabService'];

	//人员列表
	function UserStaffController($scope, CommRestService, CommTabService, vcTabsBroadcastKey, vcModalService, TipService) {

		$scope.queryParams = {
			pageSize: 10,
			pageNumber: 0,
			departmentIds: ''
		};
		$scope.pager = {};

		var depart = [],
			role = [];
		var currentUser = store.get('user');
		$scope.queryDept = true;

		$scope.vcTabOnload = function(data, fromIndex) {
			if ($scope.$dirty) {
				loadDept();
				loadRoleList();
				$scope.loadStaff();
				$scope.$dirty = false;
			}
		};

		//监听部门值变化
		$scope.$watch('queryParams.departmentIds', function(newValue, oldValue, scope) {
			if (!newValue && !oldValue) {
				return;
			}
			_.each($scope.deptList, function(d) {
				//选择部门后改变左边列表头部值
				if (d.id === newValue) {
					if (d.id === '') {
						scope.currentDept = '全部人员'; //表头显示
						$scope.queryDept = true;
					} else {
						scope.currentDept = d.name;
						//部门筛选后则隐藏关键字筛选
						$scope.queryDept = false;
						delete $scope.queryParams.queryKey;
					}
				}
			});
			$scope.loadStaff();
		});

		//加载人员列表
		$scope.loadStaff = function(pageNo) {
			$scope.queryParams.op = '1,2';
			//1223 后台变化多传入inApp参数
			$scope.queryParams.inApp = true;
			//每次重新执行查询前清空页码和列表数据
			$scope.draftList = [];
			$scope.pager = {};
			$scope.queryParams.pageNumber = 0;
			if (pageNo) {
				$scope.queryParams.pageNumber = pageNo;
			} else {
				$scope.queryParams.pageNumber++;
			}
			$scope.$parent.loading = true;
			CommRestService.post('user/list', $scope.queryParams, function(data) {
				if (data.content) {
					$scope.draftList = data.content;
					$scope.pager = {
						firstPage: data.firstPage,
						lastPage: data.lastPage,
						totalPages: data.totalPages,
						pageNumber: data.pageNumber
					};
				}
				$scope.$parent.loading = false;
			});

		};

		//加载部门下拉数据
		function loadDept() {
			//fix by wayky : 部门页面已经加载过，并放到index的scope下，直接取就是
			/*
			CommRestService.post('department/list', {
				pageSize: 10,
				pageNumber: 0
			}, function(data) {
				//给部门列表增加一列假数据,用于默认显示(全部)
				if (data.content && data.content.length > 0) {
					depart = angular.copy(data.content); //用于详情
					$scope.deptList = data.content;
					$scope.deptList.splice(0, 0, {
						id: '',
						name: '全部'
					});
				} else {
					$scope.deptList = [{
						id: '',
						name: '全部'
					}];
				}
				$scope.currentDept = '全部人员'; //表头显示
				$scope.queryParams.departmentIds = '';
			});
			*/
			var data = $scope.$parent.root_DepList;
			//给部门列表增加一列假数据,用于默认显示(全部)
			if (data && data.length > 0) {
				depart = angular.copy(data); //用于详情
				$scope.deptList = angular.copy(data);
				$scope.deptList.splice(0, 0, {
					id: '',
					name: '全部'
				});
			} else {
				$scope.deptList = [{
					id: '',
					name: '全部'
				}];
			}
			$scope.currentDept = '全部人员'; //表头显示
			$scope.queryParams.departmentIds = '';
		}

		function loadRoleList() {
			//减少多次请求
			if (role && role.length == 0) {
				CommRestService.post('user/roleList', {}, function(data) {
					if (data && data.length > 0) {
						role = data;
					}
				});
			}
		}

		//进入新增页面
		$scope.gotoAddStaff = function() {
			$scope.$parent.loading = true;
			CommRestService.post('user/list', {
				op: '0',
				inApp: true,
				pageNumber: 1,
				pageSize: 10
			}, function(data) {
				if (data.content.length === 0) {
					window.vcAlert('当前没有APP用户,请知悉');
				} else {
					var pager = {
						firstPage: data.firstPage,
						lastPage: data.lastPage,
						totalPages: data.totalPages,
						pageNumber: data.pageNumber
					};
					_.each(data.content, function(d) {
						//如未绑定手机号,则不能进行成员操作
						if (d.loginName === '' || (d.loginName).length !== 11) {
							d.noLoginname = true;
						}
					});

					CommTabService.next($scope.$vcTabInfo, 'staffDetail', {
						type: 'add',
						data: data.content,
						pager: pager,
						dep: depart,
						role: role
					});
				}
				$scope.$parent.loading = false;
			});
		};

		//弹出删除确认框
		$scope.del = function(id, name) {
			if (name === currentUser.username) {
				vcAlert('当前登录(本人)用户不能删除');
				return;
			}
			window.vcAlert({
				title: '删除成员',
				text: '确认删除此成员?',
				type: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#DD6B55',
				cancelButtonText: '取消',
				confirmButtonText: '确定',
				closeOnConfirm: true,
				html: false
			}, function() {
				CommRestService.post('user/deleteAdmin', {
					rid: id
				}, function() {
					TipService.add('success', '删除成功', 3000);
					$scope.loadStaff(1);
				}, function(err) {
					TipService.add('danger', err.msg, 3000);
				});
			});
		};

		//打开修改人员弹出框
		$scope.edit = function(info) {
			vcModalService({
					retId: 'staff',
					backdropCancel: false,
					title: '编辑成员信息',
					css: {
						height: '400px',
						width: '460px'
					},
					templateUrl: 'app/main/user/pages/staff_edit.html',
					controller: 'UserEditController',
					success: {
						label: '确定',
						fn: editStaff
					}
				}, {
					staff: info,
					dep: depart,
					role: role
				}

			);

		};

		//点击确定发起编辑人员请求
		function editStaff(staff) {

			//构建update参数
			var subInfo = {};
			subInfo.rid = staff.id;
			subInfo.userName = staff.remark;
			subInfo.roleIds = staff.roleIds;
			subInfo.departmentIds = staff.deptIds;
			CommRestService.post('user/updateAdmin', subInfo, function() {
				TipService.add('success', '人员修改成功', 3000);
				$scope.loadStaff(1);
			}, function(err) {
				TipService.add('success', err.msg, 3000);
			});
		}

	}
	UserStaffController.$inject = ['$scope', 'CommRestService', 'CommTabService', 'vcTabsBroadcastKey', 'vcModalService', 'TipService'];

	//修改、新增
	function UserEditController($scope, CommTabService, CommRestService) {

		$scope.queryParams = {
			pageSize: 10,
			pageNumber: 0
		};
		$scope.pager = {};

		var deptIds = [],
			roleIds = [],
			userInfo = {}; //新增的用户对象
		var currentUser = store.get('user');
		var dep = [],
			role = [];

		//跳转过来前已经查询了一次用户列表
		$scope.vcTabOnload = function(data, fromIndex) {
			if (data) {
				dep = data.dep;
				role = data.role;
				$scope.userList = data.data;
				$scope.pager = data.pager;
				$scope.userList.depts = data.dep;
				$scope.userList.roles = data.role;
			}
		};

		//返回
		$scope.gotoBack = function() {
			CommTabService.next($scope.$vcTabInfo, 'staff');
		};

		//获取当前成员信息用于修改
		$scope.initStaffDetail = function() {

			CommRestService.post('user/getAdmin', {
				rid: $scope.staff.id
			}, function(data) {
				$scope.staff = data.userRole;
				$scope.staff.roleIds = [];
				$scope.staff.deptIds = [];
				//当前登录中所有部门和角色数据
				$scope.staff.depts = $scope.dep;
				$scope.staff.roles = $scope.role;
				//遍历所有部门和权限,匹配当前用户已有的值
				//权限
				_.each($scope.staff.roles, function(ro) {
					if (_.isArray(data.roleInfos)) {
						_.each(data.roleInfos, function(role) {

							//增加选中效果
							if (ro.roleId === role.roleId) {
								ro.$checked = true;
								//1204 如果是管理员数据,则不能编辑已有权限
								if ($scope.staff.loginName === currentUser.username) {
									ro.disabled = true;
								}
								roleIds.push(role.roleId);
								$scope.staff.roleIds.push(role.roleId);
							}

						});
					}
				});
				//部门
				_.each($scope.staff.depts, function(dp) {
					if (_.isArray(data.departments)) {
						_.each(data.departments, function(d) {
							//增加选中效果
							if (dp.id === d.id) {
								dp.$checked = true;
								deptIds.push(dp.id);
								$scope.staff.deptIds.push(dp.id);
							}
						});
					}
				});

				//组装编辑成员请求参数(选择后的权限)
				$scope.staff.roleIds.length === 0 ? $scope.staff.roleIds = '' : $scope.staff.roleIds.join(',');
				$scope.staff.deptIds.length === 0 ? $scope.staff.deptIds = '' : $scope.staff.deptIds.join(',');
			});
		};

		//编辑成员中的权限
		$scope.changeRole = function(role) {
			role.$checked = !role.$checked;
			if (role.$checked) {
				roleIds.push(role.roleId);
			} else {
				_.remove(roleIds, function(r) {
					return r === role.roleId;
				});
			}
			//组装编辑成员请求参数(选择后的权限)
			$scope.staff.roleIds = roleIds.join(',');
		};

		//编辑成员中的部门
		$scope.changeDept = function(dept) {
			dept.$checked = !dept.$checked;
			if (dept.$checked) {
				deptIds.push(dept.id);
			} else {
				_.remove(deptIds, function(d) {
					return d === dept.id;
				});
			}
			//组装编辑成员请求参数(选择后的部门)
			$scope.staff.deptIds = deptIds.join(',');
		};

		//查询或分页时获取的appuser列表
		$scope.loadUserList = function(pageNo) {
			//每次重新查询前清空已有数据
			$scope.userList = [];
			$scope.pager = {};
			$scope.queryParams.pageNumber = 0;
			$scope.queryParams.op = '0'; //过滤掉已存在的用户
			$scope.queryParams.inApp = true;
			//分页请求参数
			if (pageNo) {
				$scope.queryParams.pageNumber = pageNo;
			} else {
				$scope.queryParams.pageNumber++;
			}
			CommRestService.post('user/list', $scope.queryParams, function(data) {

				if (data.content && data.content.length > 0) {
					//构建页面展示数据(含部门与权限列表项)
					$scope.userList = data.content;
					$scope.userList.depts = dep;
					$scope.userList.roles = role;
					$scope.pager = {
						firstPage: data.firstPage,
						lastPage: data.lastPage,
						totalPages: data.totalPages,
						pageNumber: data.pageNumber
					};

				}
			});
		};

		//选中用户前的勾选按钮则打开对应的部门和角色选择
		$scope.show = function(user) {
			$scope.disabledDept = false; //是否可选择
			_.each($scope.userList, function(u) {

				if (u.id === user.id) {
					user.$checked = !user.$checked;
					//1211 此提示暂作废,现改为只要没绑定手机号就禁用此操作
					/*if (user.$checked) {

					 //1207 每次打开都清空已选的部门和权限
					 //roleIds = [], deptIds = [];

					 //没有绑定手机号的人 选择部门:领队部和咨询部不可选择
					 if (user.loginName === '') {
					 _.each($scope.userList.depts, function(dp) {
					 if (dp.name === '领队部' || dp.name === '咨询部') {
					 dp.disabledDept = true;
					 }
					 });
					 }
					 }*/
				} else {
					u.$checked = false;

					_.each($scope.userList.depts, function(dp) {
						dp.$checked = false;
					});
					_.each($scope.userList.roles, function(ro) {
						ro.$checked = false;
					});
				}

			});

		};

		//获取选中的部门id
		$scope.checkDept = function(dept) {
			dept.$checked = !dept.$checked;
			if (dept.$checked) {
				deptIds.push(dept.id);
			} else {
				_.remove(deptIds, function(n) {
					return n === dept.id;
				});
			}

		};

		//获取选中的角色id
		$scope.checkRole = function(role) {
			role.$checked = !role.$checked;
			if (role.$checked) {
				roleIds.push(role.roleId);
			} else {
				_.remove(roleIds, function(r) {
					return r === role.roleId;
				});
			}
		};

		//保存用户
		$scope.saveUser = function(user) {
			if (_.isArray(dep) && dep.length !== 0) {
				if (deptIds.length === 0) {
					window.vcAlert('请为人员: ' + user.nickname + ' 添加部门');
					return;
				}
			}
			if (_.isArray(role) && role.length !== 0) {
				if (roleIds.length === 0) {
					window.vcAlert('请为人员: ' + user.nickname + ' 添加权限');
					return;
				}
			}

			//封装新增数据
			userInfo.departmentIds = deptIds.join(',');
			userInfo.roleIds = roleIds.join(',');
			userInfo.userName = user.userName;
			userInfo.rid = user.id;

			CommRestService.post('user/addAdmin', userInfo, function() {
				//每次添加成功后提示用户且将此用户从当前APP列表剔除
				window.vcAlert('添加成功');
				window.ArrayRemove($scope.userList, user);
				$scope.cancelUser();
				//通知人员列表中部门数据的变更
				CommTabService.dirty($scope.$vcTabInfo, ['staff'], true);
				//如当前没有可添加的用户则返回人员列表页
				if ($scope.userList.length === 0) {
					$scope.gotoBack();
				}
			}, function(err) {
				window.vcAlert(err.msg);
			});
		};

		//取消当前新增操作
		$scope.cancelUser = function(user) {
			if (!_.isUndefined(user)) {
				user.$checked = false;
				user.userName = '';
			}

			deptIds = [];
			roleIds = [];
			//将部门与角色取消选中按钮
			_.each($scope.userList.depts, function(dp) {
				dp.$checked = false;
			});
			_.each($scope.userList.roles, function(ro) {
				ro.$checked = false;
			});
		};
	}
	UserEditController.$inject = ['$scope', 'CommTabService', 'CommRestService'];

})();