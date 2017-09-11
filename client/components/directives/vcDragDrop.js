/**
 * Created by hxl on 2015/11/9.
 */
;(function(){
    'use strict';

    angular.module('openApp').directive('vcDragDrop', vcDragDrop);

    function vcDragDrop() {
        return {
            restrict :   'AE',
            scope   :   {
                type  :   '@',//拖动类型
                callback:    '&',
                top :   '=',
                left    :   '=',
                able:   '='
            },
            link : function(scope, element, attrs) {

                var container = $(element).parent()[0];
                var _float_id = 'varicom_drop_widget_holder';

                if(scope.able === false) {
                    //指定able并指定为false
                    return false;
                }

                $(container).children().off("mousedown").on('mousedown',function(e) {
                    if(e.which != 1 || $(e.target).is("input, textarea,a,img,label,b")) return;

                    var _timeOut = setTimeout(function() {
                        var x = e.pageX;
                        var y = e.pageY;
                        var _this = $(element);//$(this);
                        var w = _this.width();
                        var h = _this.height();
                        var w2 = w / 2;
                        var h2 = h / 2;
                        var p = _this.offset();
                        var left = p.left;
                        var top = p.top;

                        var _top = parseInt(scope.top), _left = parseInt(scope.left);

                        //构造虚框
                        if (scope.type == 'tr') {
                            var _tr_html = [];
                            _tr_html.push('<tr id="' + _float_id + '">');
                            var _children = _this.children();

                            for (var i = 0; i < _children.length; i++) {
                                _tr_html.push('<td></td>');
                                $(_children[i]).width($(_children[i]).width());
                            }
                            _tr_html.push('</tr>');
                            _this.before(_tr_html.join(''));
                        } else {
                            _this.before('<div id="' + _float_id + '"></div>');
                        }

                        var wid = $("#" + _float_id);
                        wid.css({"border": "2px dashed #ccc", "height": _this.outerHeight(true) - 4});

                        _this.css({
                            "width": w,
                            "height": h,
                            "position": "absolute",
                            opacity: 0.8,
                            "z-index": 999,
                            "left": left + _left,
                            "top": top + _top
                        });

                        $(document).off('mousemove').on('mousemove', function (e) {
                            e.preventDefault();

                            var l = left - x + e.pageX;
                            var t = top - y + e.pageY;
                            _this.css({"left": l + _left, "top": t + _top});

                            var middleleft = l + w2;
                            var moddletop = t + h2;

                            $(container).children().not(_this).not(wid).each(function (i) {
                                var obj = $(this);
                                var p = obj.offset();
                                var curleft = p.left;
                                var curleft2 = p.left + obj.width();
                                var curtop = p.top;
                                var curtop2 = p.top + obj.height();

                                if (curleft < middleleft && middleleft < curleft2 && curtop < moddletop && moddletop < curtop2) {
                                    if (!obj.next("#" + _float_id).length) {
                                        wid.insertAfter(this);//
                                    } else {
                                        wid.insertBefore(this);
                                    }
                                    return;
                                }
                            });
                        });

                        $(document).on("mouseup", function () {
                            $(document).off('mouseup').off('mousemove');
                            /*
                             $(container).each(function() {
                             var obj = $(this).children();
                             var len = obj.length;
                             if(len == 1 && obj.is(_this)) {
                             $("<div></div>").appendTo(this).attr("class", "varicom_drop_widget_block").css({"height":100});
                             }else if(len == 2 && obj.is(".varicom_drop_widget_block")){
                             $(this).children(".varicom_drop_widget_block").remove();
                             }
                             });
                             */
                            var p = wid.offset();
                            _this.animate({"left": p.left + _left, "top": p.top + _top}, 100, function (e) {
                                _this.removeAttr("style");
                                wid.replaceWith(_this);
                                var _next_node = $(_this).next(),
                                    _prev_node = $(_this).prev();
                                var _return_data = {
                                    cur: $(_this).attr('sort-id')
                                };
                                if (_prev_node) {
                                    _return_data.prev = $(_prev_node).attr('sort-id');
                                }
                                if (_next_node) {
                                    _return_data.next = $(_next_node).attr('sort-id');
                                }
                                if (scope.callback && typeof(scope.callback) == 'function') {
                                    scope.callback.call(this, _return_data);
                                }
                            });
                        });

                    }, 500);

                    $(document).on('mouseup', function(){
                        clearTimeout(_timeOut);
                    });
                });
            }
        };
    }
})();