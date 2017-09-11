/**
 * Created by hxl on 2015/10/28.
 */
;(function() {
  'use strict';
  angular.module('openApp')
    .directive('imgUploader', ['$timeout', fImgUploader]);

  function fImgUploader($timeout) {
    return {
      'restrict': 'AE',
      scope: {
        vcPicture: '='
      },
      replace: true,
      templateUrl: 'components/directives/img-uploader/imgUploader.html',
      link: function(scope) {
        var uploader = WebUploader.create({
          auto: true, 
          swf: 'http://imgcache.varicom.im/js/webupload/Uploader.swf',
          server: '/api/base/fileupload',
          pick: '#poster',
          resize: false,
          fileSizeLimit: 2097152, //2M
          accept: {
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            mimeTypes: 'image/*'
          }
        });

        uploader.on('uploadProgress', uploadProgress);
        uploader.on('uploadSuccess', uploadSuccess);
        uploader.on('uploadComplete', uploadComplete);
        uploader.on('error', uploadError);
        var timeout;

        function uploadProgress(file, percentage) {
          var _li = angular.element('#propress_bar');
          _li.css('width', angular.element('.webuploader-container').width());
          var _$parent = _li.find('.progress .progress-bar');
          if (!_$parent.length) {
            _$parent = angular.element('<div class="progress progress-striped active">' +
              '<div class="progress-bar" role="progressbar" style="width: 0%">' +
              '</div>' +
              '</div>').appendTo(_li).find('.progress-bar');
          }
          _li.find('.progress-bar').text('上传中...');
          _$parent.css('width', percentage * 100 + '%');
        }

        function uploadSuccess(file, response) {
          if (response && response.code === 0) {
            timeout = $timeout(function() {
              scope.vcPicture = response.t;
            }, 500);
          } else {
            scope.uploadMsg = '上传失败';
          }
        }

        //当图片validate不通过时
        function uploadError(handler) {

          if (handler === 'Q_EXCEED_SIZE_LIMIT') {
            window.vcAlert('图片大小已超过2M，请重新上传');
          }
          if (handler === 'Q_TYPE_DENIED') {
            window.vcAlert('图片类型无效，请重新上传');
          }
        }

        function uploadComplete() {
          this.reset();
          angular.element('#propress_bar').find('.progress').remove();
          angular.element('.poster_img').css({
            'max-height': '300px'
          });
        }
      }
    };
  }
})();