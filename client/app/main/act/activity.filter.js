/**
 * Created by hxl on 2015/10/16.
 */
;
(function () {
    'use strict'
    angular.module('main.act')
        .filter('isTop', function () {
            return function (input) {
                if (0 !== input) {
                    return '取消置顶';
                } else {
                    return '置顶';
                }
            };
        })
        .filter('subType', function () {
            return function (input) {
                switch (input) {
                    case 1:
                        return '普通活动';
                    case 2:
                        return '周期游';
                    case 3:
                        return '赛事';
                    default :
                        return '普通活动';
                }
            };
        })
        .filter('union_info_repay_for_list', function () {
            return function (input) {
                var _union = JSON.parse(input);
                if (_union) {
                    if (_union.groupRepay) {
                        var _group = JSON.parse(_union.groupRepay);
                        var _group_repay = '';
                        for (var g in _group) {
                            if (_group.hasOwnProperty(g)) {
                                _group_repay += "<p>"+g + ':￥' + _group[g] + "</p>";
                            }
                        }
                        return _group_repay;
                    } else if (null == _union.repay) {
                        return '拼车';
                    } else {
                        return '￥' + _union.repay;
                    }
                }
                return '';
            };
        })
        .filter('union_info_iname', function () {
            return function (input) {
                try {
                    var _union = JSON.parse(input);
                    if (_union && _union.iname) {
                        return _union.iname;
                    } else {
                        return '';
                    }
                } catch (err) {
                    return '';
                }
            };
        })
        .filter('union_info_number', function () {
            return function (input) {
                if (!input) {
                    return "";
                }
                if (input.number) {
                    return input.number + "人";
                } else {
                    var _html = "";
                    try {
                        var _union = JSON.parse(input.groupNumber);
                        for (var n in _union) {
                            if (_union.hasOwnProperty(n) && _union[n]) {
                                _html += n + ":" + _union[n] + "人<br/>";
                            }
                        }
                    } catch (err) {
                    }
                    return _html;
                }
            }
        })
        .filter('union_info_repay', function () {
            return function (input) {
                if (!input) {
                    return "";
                }
                try {
                    if (input.repay) {
                        return input.repay + "元/每人";
                    } else {
                        var _html = "";

                        var _union_repay = JSON.parse(input.groupRepay);
                        for (var n in _union_repay) {
                            if (_union_repay.hasOwnProperty(n)) {
                                _html +="<p>"+ n + ":" + _union_repay[n] + "元/每人</p>";
                            }
                        }
                        return _html;
                    }
                } catch (err) {
                }
            }
        });
})();