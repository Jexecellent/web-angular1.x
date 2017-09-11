/**
 * Created by Administrator on 2016/1/8.
 */
;(function(){
    'use strict'
    angular.module('previewApp',['ngSanitize'])
        .controller('pageShowController',fPageShowController)
        .filter('imagecut', fimagecut);

    function fPageShowController() {
        var _class = {
            1:"sh_mod_banner sh_mod_banner_r swiper-container",
            2:"sh_mod_twoColumn",
            4:"sh_mod_square",
            8:"sh_mod_HRoll sh_mod_HRoll_r",
            9:"sh_mod_product",
            setClass:function(component){
                component.__class = this[component.type];
            }
        };
        var _pageShow = store.get('preview_pageshow');
        if(typeof(_pageShow) === 'string') {
            this.comps = JSON.parse(_pageShow);
        }else {
            this.comps = _pageShow;
        }
        var _comps = this.comps;
        parseComponents();
        function parseComponents() {
            _comps.forEach(function(n){
                n.__class = _class[n.type];
            });
            console.log('preview data ', _comps);
        }
        setTimeout(initSwiper,300);
        function initSwiper() {
            $(".swiper-container").each(function(i){
                new Swiper (angular.element(this), {
                    autoplay: 3000,
                });
            });
            $(".sh_mod_HRoll_r").each(function(){
                new Swiper(angular.element(this),{slidesPerView: 4});
            });
            resetContentWidth();
        };

        function resetContentWidth() {
            setTimeout(function(){
                angular.element(".sh_mod_HRoll_r .swiper-slide.upload").width('70px');
            },30);
        }
    }
    function fimagecut() {
        return function(imgUrl, size){
            return !!imgUrl && imgUrl.indexOf('http://f1.varicom.im')==0 ? imgUrl.replace(/(\.)+(\d)*x(\d)*/g,'') + (!!size ? size : '') : imgUrl;
        };
    }
})();