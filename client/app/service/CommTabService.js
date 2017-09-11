/**
 * 供vcTabsirective的广播共用存取数据
 * Created by wayky on 15/11/11.
 */
;(function() {
    'use strict';
    angular.module('open.service')
        .factory('CommTabService', ['$rootScope', 'vcTabsBroadcastKey', CommTabService]);

    function CommTabService($rootScope, vcTabsBroadcastKey) {

        return {

            /**
             * 通知Tab设置$dirty，Tab待下次激活时可以重载页面
             * @param $vcTabInfo
             * @param tags 数组格式
             * @param realTargetRoot 允许不传，默认值为$vcTabInfo.root
             * @autoReload 是否需要自动调用vcTabOnload方法
             */
            dirty: function ($vcTabInfo, tags, realTargetRoot, autoReload) {
                if ($vcTabInfo && $vcTabInfo.root && !!tags && (_.isString(tags) || _.isArray(tags))) {
                    var dirtyTags = [];
                    if (_.isString(tags)) {
                        dirtyTags.push(tags);
                    }
                    else {
                        dirtyTags = tags;
                    }

                    if (_.isBoolean(realTargetRoot)) {
                        autoReload = realTargetRoot;
                        realTargetRoot = null; //don't forget!
                    }

                    if (_.isUndefined(autoReload)) {
                        autoReload = false;
                    }

                    realTargetRoot = realTargetRoot || $vcTabInfo.root;

                    var scope = angular.element("#" + realTargetRoot).scope();
                    if (scope) {
                        scope.$broadcast(vcTabsBroadcastKey, {
                            dirty: dirtyTags,
                            root: realTargetRoot,
                            reload: autoReload,
                            from: $vcTabInfo
                        });
                    }
                }
            },

            //放直接传递给Tab页的数据
            //标准化消息协议构造
            /*
             {
             from : 上次停留的Tab索引
             next : 新Tab索引
             content : 传递给新页面的业务数据或请求参数, 选含 action 进入新Tab页面后要做的动作
             root : vcTabs控件的ID
             }
             */
            /**
             * 通知Tab切换，Tab一定会被激活
             * @param $vcTabInfo        当前Tab的信息
             * @param nextTabIndexOrTag 支持传index或tag名，建议将tag取名有意义化，以支持dirty的需要
             * @param queryData         会被tab的vcTabOnload方法接收的传递值，将被放在content字段内
             * @param realTargetRoot    字符串格式，真正要跳转的Tabs的ID 允许不传
             * @param withDirty         通知的同时让这些的tabs变成dirty的 [数组格式]
             * @returns
             */
            next: function ($vcTabInfo, nextTabIndexOrTag, queryData, realTargetRoot/*withDirtys*/, withDirtys) {
                //基本检查
                if (!$vcTabInfo || !$vcTabInfo.root || !nextTabIndexOrTag) {
                    return;
                }

                var targetRoot = $vcTabInfo.root;//同宗Tab

                if (!!realTargetRoot && _.isString(realTargetRoot) && (realTargetRoot !== $vcTabInfo.root)) {
                    //非同宗Tab
                    targetRoot = realTargetRoot;
                }

                //btw：call dirty
                if (_.isArray(realTargetRoot)) {
                    withDirtys = realTargetRoot;
                }

                if (_.isArray(withDirtys)) {
                    this.dirty($vcTabInfo, withDirtys, targetRoot);
                }

                //找到正确的scope,不用rootScope
                var scope = angular.element("#" + targetRoot).scope();
                if (scope) {
                    scope.$broadcast(vcTabsBroadcastKey, {
                        from: $vcTabInfo,
                        next: (_.isNumber(nextTabIndexOrTag) ? '$INDEX$_' : '$TAG$_') + nextTabIndexOrTag,
                        content: (queryData || {}),
                        root: targetRoot
                    });
                }
            }
        };
    }
})();