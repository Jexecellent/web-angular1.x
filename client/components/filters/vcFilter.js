;
(function () {

    /**
     * open下公共filter
     * Created by zyHu on 15/10/23.
     */
    'use strict';
    var app = angular.module('openApp');


    /**
     * 格式化性别
     * @method
     * @param oldValue 原本数据
     * @return newValue
     * author zyHu
     * date 15/10/23
     */
    app.filter('sex', function () {
        return function (oldValue) {
            oldValue = parseInt(oldValue);
            switch (oldValue) {
                case 1:
                    return '男';
                case 2:
                    return '女';
                default:
                    return '';
            }
        };
    });

//1：普通，2：成员，3：主管，4：负责人
    /**
     * 格式化用户身份
     * @method
     * @param oldValue 表数据
     * @return newValue
     * author zyHu
     * date 15/10/23
     */
    app.filter('uType', function () {
        return function (oldValue) {
            switch (oldValue) {
                case 1:
                    return '普通';
                case 2:
                    return '成员';
                case 3:
                    return '主管';
                case 4:
                    return '负责人';
                default:
                    return '';
            }
        };
    });

    /**
     * 格式化用户角色状态
     * @method
     * @param oldValue 原本数据
     * @return newValue
     * author zyHu
     * date 15/11/03
     */
    app.filter('status', function () {
        return function (oldValue) {
            switch (oldValue) {
                case 1:
                    return '正常';
                case 2:
                    return '冻结';
                case 3:
                    return '禁言';
                default:
                    return '';
            }
        };
    });

    /**
     * 格式化栏目名称
     * @input 栏目id
     */
    app.filter('moduleName', ['CacheService', function (CacheService) {
        var _modules = CacheService.getModules();
        return function (input) {
            var _return = '';
            _modules.forEach(function (e) {
                if (e.id === input) {
                    _return = e.moduleName;
                }
            });
            return _return;
        }
    }]);

    /**
     * 格式化活动、相约状态
     */
    app.filter('statusCN', function () {
        return function (input) {
            if (input === 1) {
                return '正在报名';
            } else if (input === 2) {
                return '报名截止';
            } else {
                return '活动结束';
            }
        };
    });

    /**
     * 格式化栏目状态
     * @method
     * @param oldValue 原本数据
     * @return newValue
     * author zyHu
     * date 15/10/29
     */
    app.filter('moduleStatus', function () {
        return function (oldValue) {
            switch (oldValue) {
                case 1:
                    return '下线';
                case 2:
                    return '上线';
                case 3:
                    return '下线待审核';
                case 4:
                    return '上线待审核';
                default:
                    return '';
            }
        };
    });

    /**
     * 格式化栏目类型
     * @method
     * @param oldValue 原本数据
     * @return newValue
     * author zyHu
     * date 15/10/29
     */
    app.filter('moduleType', function () {
        return function (oldValue) {
            switch (oldValue) {
                case 1:
                    return '资讯';
                case 2:
                    return '位置资讯';
                case 3:
                    return '视频';
                default:
                    return '';
            }
        };
    });

    app.filter('bizType', function () {
        return function (input,type) {
            switch (input) {
                case 1:
                    return '资讯';
                case 2:
                    return '栏目';
                case 3:
                    return 'Banner';
                case 4:
                    return '活动'+bizName(type);
                case 5:
                    return '手记'+bizName(type);
                case 6:
                    return '群发消息'+bizName(type);
                default:
                    return '未知';
            }
            function bizName (type) {
                //类型( 0、草稿 1、上线审核 2、线上修改审核 3、下线审核)
                switch (type) {
                case 1:
                    return '上线审核';
                case 2:
                    return '线上修改审核';
                case 3:
                    return '下线审核';
                default:
                    return '草稿';
                }
            }
        };
    });

    app.filter('bizTypeAPI', function () {
        return function (input) {
            switch (input) {
                case 1:
                    return 'module';
                case 2:
                    return 'banner';
                case 3:
                    return 'article';
                case 4:
                    return 'activity';
                case 5:
                    return 'notes';
                case 6:
                    return 'groupmsg';
                case 7:
                    return 'mate';
                case 8:
                    return 'college';
                case 9:
                    return 'goods';
                case 10:
                    return 'pageshow';
                default:
                    return '';
            }
        };
    });

    app.filter('iconModuleClass', function () {
        return function (input) {
            switch (input) {
                case 9:
                    return 'icon_horn';
                case 10:
                    return 'icon_users_1';
                case 11:
                    return 'icon_edit_2';
                default:
                    return 'icon_news';
            }
        };
    });

    /**
     * 报名审核状态
     */
    app.filter('join_act_audit', function () {
        return function (input) {
            switch (input) {
                case 0:
                    return '不用支付';
                case 1:
                    return '已付款';
                case 2:
                    return '付款后取消';
                case 3:
                    return '未支付';
                case 4:
                    return '等待审核';
                case 5:
                    return '未支付';
                case 11:
                    return '退款成功';
                case 12:
                    return '审核不通过';
                default:
                    return '';
            }
        };
    });

    /**
     * 报名审核状态
     */
    app.filter('join_activity_audit', function () {
        return function (input) {
            switch (input) {
                case 0:
                    return '审核通过';
                case 1:
                    return '已付款';
                case 2:
                    return '等待退款';
                case 3:
                    return '未支付';
                case 4:
                    return '等待审核';
                case 5:
                    return '已通过-未付款';
                case 11:
                    return '已退款';
                case 12:
                    return '审核不通过';
                default:
                    return '审核通过';
            }
        };
    });

    app.filter('auditType', function () {
        return function (input) {
            switch (input) {
                case 0:
                    return '草稿';
                case 1:
                    return '上线待审核';
                case 2:
                    return '线上修改待审核';
                case 3:
                    return '下线待审核';
            }
        };
    });
    app.filter('auditStatus', function () {
        return function (input) {
            switch (input) {
                case 0:
                    return '草稿';
                case 1:
                    return '待审核';
                case 2:
                    return '不通过';
                case 3:
                    return '通过';
                case 4:
                    return '已删除';
                default:
                    return '未知';
            }
        };
    });

    //过滤图片地址
    app.filter('origImg', function () {
        return function (imgUrl, size) {
            return !!imgUrl && imgUrl.indexOf('http://f1.varicom.im')==0 ? imgUrl.replace(/(\.)+(\d)*x(\d)*/g,'') + (!!size ? size : '') : imgUrl;
        }
    });

    //将 http://f1.varicom.im/37414,0dab689ed359ba.396x413.40x30
    //换成 http://f1.varicom.im/37414,0dab689ed359ba.100x100
    app.filter('cutImg100', function () {
        return function (imgUrl) {
            return !!imgUrl && imgUrl.indexOf('http://f1.varicom.im')==0 ? imgUrl.replace(/(\.)+(\d)*x(\d)*/g,'')+'.100x100' : imgUrl;
        }
    });
    app.filter('cutImg40', function () {
        return function (imgUrl) {
            return !!imgUrl && imgUrl.indexOf('http://f1.varicom.im')==0 ? imgUrl.replace(/(\.)+(\d)*x(\d)*/g,'')+'.40x40' : imgUrl;
        }
    });

    app.filter('inApp', function () {
        return function (oldValue) {
            oldValue = parseInt(oldValue);
            switch (oldValue) {
                case 0:
                    return '不推荐';
                case 1:
                    return '推荐';
                default:
                    return '';
            }
        };
    });

    //是否可创建圈子
    app.filter('clubCreate', function () {
        return function (oldValue) {
            //oldValue = parseInt(oldValue);
            switch (oldValue) {
                case true:
                    return '可以';
                default:
                    return '不可以';
            }
        };
    });

    /**
     * 字段数据没有时用替换数据代替
     * @method
     * @param oldValue 原本数据
     * @return oldValue  替换后(或原本)的数据
     * author zyHu
     * date 15/11/25
     */
    app.filter('replaceUndefined', function () {
        return function (oldValue,param) {
            
            if(_.isUndefined(oldValue)){
                oldValue=param;
            }
            return oldValue;
        };
    });


    /**
     * 截取特定符号前的字符串
     * @method
     * @param value: 原本数据 type: 特定符号
     * @return str  截取后的字符
     * author zyHu
     * date 15/11/26
     */
    app.filter('subTags', function() {
        return function(value, type) {

            var str = '';
            var index = value.indexOf(type);
            if (index !== -1) {
                str = value.substr(0, index);
            }
            return str;
        };
    });


    /**
     * 拼接用户管理中的账户字段
     * @method  replaceName
     * @param nickname: 昵称 remark: 备注
     * @return str  拼接后的字符
     * author zyHu
     * date 15/12/09
     */
    app.filter('replaceName', function() {
        return function(nickname, remark) {
            if(remark){
                return nickname+'('+remark+')';
            }
            return nickname;
        };
    });

    app.filter('activity_cost_$', function() {
        return function(cost) {
            if(!cost) {
                return '免费';
            }else {
                return '￥'+cost;
            }
        };
    });

    app.filter('formatGoodsType',function (GoodsTypeService) {
        return function (val) {
            var tName='',nodes=[];
            GoodsTypeService.goodsTypeTrie(function (res) {
                nodes=res;
                _.each(nodes,function (gt) {

                    //一级分类直接返回
                    if(gt.typeId === val){
                        tName='一级分类：'+gt.name;
                    }else{
                        //二级分类时还需带上所属父级的name
                        _.each(gt.child,function (c) {
                            if(c.typeId === val){
                                tName='一级分类：'+gt.name+';二级分类：'+c.name;
                            }
                        });
                    }
                });
            });
            return tName;
        };
    });

    //
    app.filter('specType',function () {
        return function (val) {
            //数值，价格，文本，下拉选择
             switch (val) {
                case 1:
                    return '数值';
                case 2:
                    return '价格';
                case 3:
                    return '文本';
                case 4:
                    return '下拉选择';
                default:
                    return '';
            }
        };
    });

    app.filter('specTypeToWord',function () {
        return function (val) {
            //'number','price','text','select'
             switch (val) {
                case 1:
                    return 'number';
                case 2:
                    return 'price';
                case 3:
                    return 'text';
                case 4:
                    return 'select';
                default:
                    return '';
            }
        };
    });

})();