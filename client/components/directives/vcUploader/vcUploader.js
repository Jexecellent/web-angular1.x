/**
 * Created by wayky on 15/12/14.
 */
;
(function () {
    'use strict';

    angular.module('openApp')
        .directive('vcUploader', ['$templateCache', '$timeout', vcUploader]);

    function vcUploader($templateCache, $timeout) {

        //模板Html
        $templateCache.put('vc-uploader.html', '<label><img ng-src="{{vcPicture || defaultImage}}" style="{{imgStyle || defaultStyle}}" alt=""><div class="hidden"></div></label>');

        return {
            'restrict': 'AE',
            'scope': {
                imgStyle: '@',
                defaultImage: '@',
                afterUpload: '&',
                vcPicture: '='
            },
            replace: true,
            templateUrl: 'vc-uploader.html',
            link: function (scope, element) {
                if (!WebUploader) {
                    return;
                }

                scope.defaultStyle = 'width:100px;height:100px';

                var imgBtn = element.find("img");
                var fileDiv = element.find("div");

                var uploader = WebUploader.create({
                    auto: true,
                    pick: fileDiv,
                    swf: 'http://imgcache.varicom.im/js/webupload/Uploader.swf',
                    server: '/api/base/fileupload',
                    resize: false,
                    fileSizeLimit: 2048000,
                    accept: {
                        title: 'Images',
                        extensions: 'gif,jpg,jpeg,bmp,png',
                        mimeTypes: 'image/*'
                    }
                });

                //统一的图片上传响应处理方法
                var imgUploadHandler = {
                    //上传进度条
                    progress: function (file, percentage) {
                        //var _li = angular.element('#propress_bar');
                        //_li.css('width', angular.element('.webuploader-container').width());
                        //var _$parent = _li.find('.progress .progress-bar');
                        //if (!_$parent.length) {
                        //    _$parent = angular.element('<div class="progress progress-striped active">' +
                        //        '<div class="progress-bar" role="progressbar" style="width: 0%">' +
                        //        '</div>' +
                        //        '</div>').appendTo(_li).find('.progress-bar');
                        //}
                        //_li.find('.progress-bar').text('上传中...');
                        //_$parent.css('width', percentage * 100 + '%');
                    },

                    //上传成功
                    success: function (file, response) {
                        if (response && response.code === 0) {
                            scope.$apply(function () {
                                scope.vcPicture = response.t;

                                if (typeof scope.afterUpload == 'function') {
                                    scope.afterUpload(response.t);
                                }
                            });
                        }
                    },

                    //上传失败
                    error: function (type) {
                        if (type == 'Q_EXCEED_SIZE_LIMIT') {
                            vcAlert('图片大小超过限制，最大2M');
                        }
                        if (type == 'Q_TYPE_DENIED') {
                            vcAlert('图片类型不正确。');
                        }
                    },

                    //上传完成
                    complete: function () {
                        //angular.element('#propress_bar').find('.progress').remove();
                    }
                };

                uploader.on('uploadProgress', imgUploadHandler.progress);
                uploader.on('uploadComplete', imgUploadHandler.complete);
                uploader.on('uploadSuccess', imgUploadHandler.success);
                uploader.on('error', imgUploadHandler.error);


                imgBtn.bind('click', function (e) {
                    e.preventDefault();
                    var fileInput = element.find("input");
                    fileInput.click();
                });
            }
        };
    }
})();