/**
 * Created by hxl on 2015/11/9.
 */
;(function(){
    'use strict'
    angular.module('openApp')
        .directive('dragDrop', fDragDrop);

    function fDragDrop() {
        return {
            restrict :   'AE',
            scope   :   {
                type  :   '@',//拖动类型
                callback:    '&',
                top :   '=',
                left    :   '=',
                able:   '=',
                allSort: '='
            },
            link    :   function(scope, element, attrs) {
                var container = $(element).parent()[0];
                var _float_id = 'varicom_drop_widget_holder';
                if(scope.able === false) {
                    //指定able并指定为false
                    return false;
                }
                $(container).children().off("mousedown").on('mousedown',function(e) {
                    if(e.which != 1 || $(e.target).is("input, textarea,a,b")) return;
                    var _$this = this;
                    var _begin_drag = setTimeout(function(){
                        doDrag(e,_$this);
                    },200);
                    $(document).on('mouseup', function(){
                        clearTimeout(_begin_drag);
                    });
                    function doDrag(e,_tag) {
                        var x = e.pageX;//鼠标相对x轴坐标
                        var y = e.pageY;//鼠标相对y轴坐标
                        var _this = $(_tag);//被点击对象,要移动的对象
                        var w = _this.width();//移动对象的宽
                        var h = _this.height();//移动对象的高
                        var w2 = w/2;//取中间值
                        var h2 = h/2;
                        var p = _this.offset();//获取移动对象相对文档的偏移量
                        var left = p.left;
                        var top = p.top;

                        var _top = parseInt(scope.top), _left = parseInt(scope.left);//获取配置的差量值

                        //构造虚框
                        if(scope.type == 'tr') {
                            var _tr_html = [];
                            _tr_html.push('<tr id="'+_float_id+'">');
                            var _children = _this.children();

                            for(var i=0; i<_children.length; i++) {
                                _tr_html.push('<td></td>');
                                $(_children[i]).width($(_children[i]).width());
                            }
                            _tr_html.push('</tr>');
                            _this.before(_tr_html.join(''));
                        }else {
                            _this.before('<div id="'+_float_id+'"></div>');
                        }

                        var wid = $("#"+_float_id);//虚框对象
                        wid.css({"border":"2px dashed #ccc", "height":_this.outerHeight(true)-4});
                        //使被拖动对象浮动， 为的是跟随鼠标移动
                        _this.css({"width":w, "height":h, "position":"absolute", opacity: 0.8, "z-index": 999, "left":left+_left, "top":top+_top});

                        var _wid_offset_y = wid.offset().top;

                        $(document).off('mousemove').on('mousemove',function(e) {
                            e.preventDefault();

                            var l = left - x + e.pageX;//计算被拖动对象要在x轴移动的距离(e.pageX-x)
                            var t = top - y + e.pageY;
                            //_this.css({"left":l+_left, "top":t+_top});
                            _this.css({"top":t+_top,"left":0});//只能上下移动
                            var middleleft = l+w2;
                            var moddletop = t+h2;

                            /**
                             * 从列表中查找出虚框,并判断上下移动
                             */
                            $(container).children().not(_this).not(wid).each(function(i) {
                                var obj = $(this);
                                var p = obj.offset();
                                var curleft = p.left;
                                var curleft2 = p.left + obj.width();
                                var curtop = p.top;
                                var curtop2 = p.top + obj.height();

                                if(curleft < middleleft && middleleft < curleft2 && curtop < moddletop && moddletop < curtop2) {
                                    if(!obj.next("#"+_float_id).length) {
                                        wid.insertAfter(this);//
                                    }else{
                                        wid.insertBefore(this);
                                    }
                                    return;
                                }
                            });
                        });

                        $(document).mouseup(function() {
                            $(document).off('mouseup').off('mousemove');
                            var p = wid.offset();
                            _this.animate({"left":p.left+_left, "top":p.top+_top}, 100, function(e) {
                                _this.removeAttr("style");
                                wid.replaceWith(_this);
                                //console.log('old_offset_y, new_offset_y',_wid_offset_y, p.top);
                                if(_wid_offset_y+2 === p.top || _wid_offset_y === p.top) {//判断虚框在y轴上是否有相对偏移, +2是因为边框宽度是1px
                                    return;
                                }
                                var _next_node = $(_this).next(),
                                    _prev_node = $(_this).prev();
                                var _return_data = {
                                    cur:$(_this).attr('sort-id'),
                                };
                                if(_prev_node) {
                                    _return_data.prev = $(_prev_node).attr('sort-id');
                                }
                                if(_next_node) {
                                    _return_data.next = $(_next_node).attr('sort-id');
                                }
                                if(scope.allSort) {
                                    var _all_ids = [];
                                    $(container).children().each(function(){
                                        _all_ids.push($(this).attr('sort-id'));
                                    });
                                    _return_data.all_ids = _all_ids;
                                }
                                if(scope.callback && typeof(scope.callback) == 'function') {
                                    scope.callback.call(_tag,_return_data);
                                }
                            });
                        });
                    }
                });
            }
        };
    }
})();