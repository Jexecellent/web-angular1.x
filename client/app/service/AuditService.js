/**
 * Created by wayky on 15/11/24.
 */
;(function() {
    'use strict';
    angular.module('open.service')
        .factory('AuditService', ['CommRestService', '$filter', AuditService]);

    function AuditService(CommRestService, $filter) {

        return {
            getList: getList,
            getAudit: getAudit,
            deleteAudit: delAudit,
            noPass: noPass,
            pass: pass,
            save: save
        };


        function getList(params, cb, failCb) {
            CommRestService.post('audit/list', params, cb, failCb);
        }

        function getAudit(params, cb, failCb) {
            CommRestService.post('audit/get', params, cb, failCb);
        }


        function delAudit(params, cb, failCb) {
            CommRestService.post('audit/del', params, cb, failCb);
        }

        function noPass(params, cb, failCb) {
            CommRestService.post('audit/nopass', params, cb, failCb);
        }

        /**
         * 提交审核
         * @param audit
         * @param cb
         */
        function save(audit, cb, failCb) {
            //1215 修改为一个save接口
            if (validate(audit)) {
                CommRestService.post('audit/save', audit, cb, failCb);
            }
        }

        //todo : 检验审核表
        function validate(audit) {
            return true;
        }

        //暂时是将现有的审核业务统一在这里处理
        /**
         * 审核通过
         * @param auditData
         * @param cb 返回null表示成功
         */
        function pass(auditData, cb) {
            if (validate(auditData)) {
                var bizApi = $filter('bizTypeAPI')(auditData.bizType);
                var action = !!auditData.bizId ? "update" : "add";
                CommRestService.post(bizApi + '/' + action, auditData, function () {
                    cb(null);
                }, function (err) {
                    cb(err);
                });
            }
            else {
                cb(new Error("审核内容不合法"));
            }
        }
    }
})();
