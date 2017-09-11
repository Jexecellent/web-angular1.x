/**
 * Created by Administrator on 2016/1/15.
 */
;(function(){
    'use strict'
    angular.module('openApp')
        .factory('openEditorService', fOpenEditorService);

    function fOpenEditorService() {
        var _upload = {
            conf:{
                auto: true,
                swf: 'http://imgcache.varicom.im/js/webupload/Uploader.swf',
                server: '/api/base/fileupload',
                pick: '#edit_img_upload__',
                resize: false,
                fileSizeLimit: 2048000,
                accept: {
                    title: 'Images',
                    extensions: 'gif,jpg,jpeg,bmp,png',
                    mimeTypes: 'image/*'
                }
            },
            progress: function (file, percentage) {
                console.log('upload progress ' + percentage);
                var _li = angular.element('#propress_bar');
                _li.css({'width': '100%', 'z-index': 1});
                var _$parent = _li.find('.progress .progress-bar');
                if (!_$parent.length) {
                    _$parent = angular.element('<div class="progress progress-striped active" style="border: 1px solid #0BABE5;">' +
                        '<div class="progress-bar" role="progressbar" style="width: 0%;background-color: #0BABE5;">' +
                        '</div>' +
                        '</div>').appendTo(_li).find('.progress-bar');
                }
                _$parent.css('width', percentage * 100 + '%');
            },
            complete: function () {
                this.reset();
                angular.element('#propress_bar').find('.progress').remove();
            }
        };
        var _editor_tool = {
            font_size:['12px','14px','16px','18px','20px','22px','24px'],
            line_height:[1,1.2,1.4,1.6,1.8,2,2.2,2.4,2.6,2.8,3]
        };
        var _base = {type:null, subType:[],style:[], content:{con:''}};
        var _title_class = {
            key:'ed_titleStyle',
            getClass:function(type) {
                return this.key+type;
            }
        };

        function setId(comp) {
            comp.__id = Date.now() + parseInt(Math.random()*1000);
        }
        //解析数据为编辑器数据
        function parseContent(content) {
            _.each(content, function(con) {
                setId(con);
                con.__class = con.subType.join(' ');
                if(con.type === 2) {
                    parseType2(con);
                }
            });
            return content;
        }
        //解析为文本编辑的数据
        function parseType2(con) {
            var _styleObj = {};
            _.each(con.style, function(s) {
                var styleArr = s.split(":");
                var value = parseFloat(styleArr[1]);
                if(!isNaN(value) && /^[0-9]+.?[0-9]*$/.test(styleArr[1])) {
                    _styleObj[styleArr[0]] = value;
                }else {
                    _styleObj[styleArr[0]] = styleArr[1];
                }
                con.__style = getContentStyle;
            });
            con.styleObj = _styleObj;
        }
        function getContentStyle() {
            var _style = "";
            var obj = this.styleObj;
            for(var i in obj) {
                if(obj.hasOwnProperty(i)) {
                    _style +=(i+":"+obj[i]+";");
                }
            }
            return _style;
        }
        //根据类型获取组件
        function getBase(type) {
            var co = angular.copy(_base);
            setId(co);
            co.type = type;
            if(type === 2) {
                //设置获取样式字符串的方法
                co.__style = getContentStyle;
                //配置默认选中样式
                co.styleObj = {
                    'font-size':'14px',
                    'line-height':1.2
                };
            }
            return co;
        }

        var _service = {
            titleClass  :   _title_class,
            curComponent:null,
            curComponentId:null,
            upload: _upload,
            editorTools:_editor_tool,
            getBase :   getBase,
            parseToEidtor : function(content) {
                return parseContent(content);
            }
        };
        return _service;
    }
})();