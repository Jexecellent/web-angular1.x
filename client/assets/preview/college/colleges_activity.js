/**
 * Created by hxl on 2015/12/29.
 */
;(function(){
    'use strict'
    angular.module('previewApp',['ngSanitize'])
        .controller('CollegesActivityPreviewController',fCollegesActivityPreviewController);

    function fCollegesActivityPreviewController(){

        this.activity = store.get('preview_college');
        if(this.activity.introduce) {
            this.activity.introduce = htmlDecode(this.activity.introduce);
        }
        //详情需要htmlDecode
        function htmlDecode(str) {
            var div = document.createElement("div");
            div.innerHTML = str;
            var txt = div.innerText || div.textContent;
            div = null;
            return txt;
        };
        if(this.activity.payType === 1) {
            this.activity.costV2 = "免费";
        }else {
            this.activity.costV2 = "￥"+this.activity.cost;
        }
    }
    fCollegesActivityPreviewController.$inject = [];
})();