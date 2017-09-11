;(function($){
    /**
     * 时间格式处理 demo:new Date(1439887497484).Format("yyyy-MM-dd HH:mm:ss")
     * @param fmt
     * @returns {*}
     * @constructor
     */
    Date.prototype.Format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "H+": this.getHours(), //24小时
            "h+": this.getHours()>12?this.getHours()-12:this.getHours(), //12小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    // 不依赖gmu
    if (typeof($.parseTpl) === "undefined") {
        $.parseTpl = function( str, data ) {
            var tmpl = 'var __p=[];' + 'with(obj||{}){__p.push(\'' +
                    str.replace( /\\/g, '\\\\' )
                        .replace( /'/g, '\\\'' )
                        .replace( /<%=([\s\S]+?)%>/g, function( match, code ) {
                            return '\',' + code.replace( /\\'/, '\'' ) + ',\'';
                        } )
                        .replace( /<%([\s\S]+?)%>/g, function( match, code ) {
                            return '\');' + code.replace( /\\'/, '\'' )
                                    .replace( /[\r\n\t]/g, ' ' ) + '__p.push(\'';
                        } )
                        .replace( /\r/g, '\\r' )
                        .replace( /\n/g, '\\n' )
                        .replace( /\t/g, '\\t' ) +
                    '\');}return __p.join("");',

            /* jsbint evil:true */
                func = new Function( 'obj', tmpl );

            return data ? func( data ) : func;
        };
    }
})(Zepto);

;(function(){
    Act = {
        option:{

        },
        init:function(){
            this.getDataFromCache(this.render);
        },
        //{"id":1396,"iid":1907,"title":"朝朝胡的测试活动","address":"木渎","startTime":1450435560000,"endTime":1450566000000,"poster":"http://f1.varicom.im/37414,0dafca2951bd29","createTime":1449139631399,"updateTime":1449139631399,"activityType":2,"leaderHead":"http://f1.varicom.im/37411,0d7f92a8f2e2d0.96x96","leaderName":"管理员","leaderPhone":"13577770019","leaderSex":1,"leaderUid":7136,"leaderRid":78533,"number":22,"joinNumber":0,"cost":0,"costType":1,"payType":1,"introduce":"<p>下雨啦<img src=\"http://f1.varicom.im/37410,0dafcbe5594311\" title=\"\" alt=\"c.png\"/></p>","registNotice":"","activityNotice":"1.活动的费用请在活动现场交付领队。2.报名后如无法参加活动，请在活动开始前联系领队。","registEndTime":1450349160000,"begAddr":"出发","activityTags":3,"mateTags":3,"isTop":0,"activityStatus":1,"praiseNum":0,"subType":1,"subTag":0,"subTags":[0,0,0,0,0,0,0],"tripDur":3,"eventGroupInfo":"[]","assembleInfo":"[{\"address\":\"想起\",\"time\":1450435560000,\"leaders\":[]}]","consultInfo":"[{\"uid\":6990,\"name\":\"胡昭昭\",\"imgPath\":\"http://f1.varicom.im/37410,0dadce145f3049.908x908\",\"sex\":2,\"id\":78620,\"label\":\"测试\",\"phone\":\"15012751021\"}]","prePay":"0","tags":"老咯啊打","unionState":2,"unionType":2,"unionInfo":"{\"number\":1000,\"repay\":null,\"groupNumber\":\"{}\",\"time\":1449356400000,\"iid\":1907,\"iname\":\"户外019\"}","unionJoinNum":"0","parent":1396,"level":2,"times":0,"iname":"户外019","isNeedIdCode":0,"isNeedCheck":0}
        getDataFromCache:function(cb){
            if (store.enabled){
                (function (data) {
                    //data.id = 1000;
                    if(data.subType == 3){
                        data.remInfo = {"全程":100,"半程":50};
                    }else{
                        data.remInfo = 50;
                    }

                    //data.joinList = [];
                    //vc.invokeCallback(cb, {activityInfo:data});
                    cb(data);
                })(store.get('preview_activity'));
            }
        },
        render:function(info){
            //title
            $("title").text(info.title);

            //$("#banner_img").attr("src",info.poster+".640x426");
            var _poster,_head = [];
            //活动海报
            var _img = info.poster,_index = _img.lastIndexOf(".");
            if(_index != -1){
                var suffix = _img.substring(_img.lastIndexOf("."),_img.length);
                if(suffix.indexOf("im") != -1){
                    _poster = info.poster+"."+ parseInt($(window).width()/3)*2+"x300";
                }else{
                    var l = _img.substring(0,_img.lastIndexOf("."));
                    _poster = l+"."+ parseInt($(window).width()/3)*2+"x300";
                }
            }else {
                _poster = info.poster+"."+ parseInt($(window).width()/3)*2+"x300";
            }

            _head.push('<div class="banner">');
            _head.push('<img src="'+_poster+'" alt="" id="banner_img">');
            _head.push('</div>');
            _head.push('<div class="activity_info head_info">');
            _head.push('<dl>');
            _head.push('<dd class="activity_time">');
            _head.push('<p>'+ new Date(info.startTime).Format("yyyy-MM-dd HH:mm") +'</p>');
            _head.push('</dd>');
            _head.push('<dd class="activity_peopleNumber">');

            _head.push('<p>'+ (info.joinNumber==0 ? "暂时没有人报名" : "已报 <b>"+info.joinNumber+"</b> 人")+' </p>');
            _head.push('</dd>');
            _head.push('<dt class="activity_title">');
            _head.push('<p>');
            if(typeof(info.mateType)!="undefined"){
                if(info.mateType==1){
                    _head.push('男女均可');
                }else if(info.mateType==2){
                    _head.push('限男生');
                }else{
                    _head.push('限女生');
                }
            }else{
                _head.push('没定义');
            }
            _head.push('</p>');
            _head.push('<div class="cost_tag">');
            if(info.costType==1){
                _head.push('<span>普通</span>');
            }else if(info.costType==2){
                _head.push('<b>AA</b><span>制</span>');
            }else if(info.costType==3){
                _head.push('<span>TA请</span>');
            }else{
                _head.push('<span>TA蹭</span>');
            }
            _head.push('</div>');
            _head.push('</dt>');
            _head.push('</dl>');
            _head.push('</div>');
            $(".page_head").html(_head.join(""));
            //设置图片高度
            $(".banner").css("height",$(".activity_info").height());
            //放大图片
            if (vc.currentApp == "varicom") {
                $("#banner_img").on('tap', function (e) {
                    e.stopPropagation();
                    var src = $(this).attr('src');
                    vcg.showLargeImage(src);
                });
            }

            //活动详情
            var _tpl = '<dl>\
                            <dd class="activity_address ">\
                                <p><%=address%></p>\
                            </dd>\
                            <dd class="activity_initiator">\
                                <p class="tag">发起人</p>\
                                <p class="photo" style="z-index:2;"><a href="http://_varicom.im/aid/14/?roleId=<%=leaderRid%>" id="leaderHeadBtn"></a></p>\
                                <div class="initiator_info">\
                                    <a href="javascript:;" id="contactLeader"><%=leaderName%>\
                                        <%if(typeof(label)!="undefined"){%><b class="user_label"><%=label%><%}%></b>\
                                    </a>\
                                </div>\
                                <div class="initiator_tel" <%if(leaderPhone=="" || leaderPhone == null){%> style="display:none;"<%}%>>\
                                    <p><a href="tel:<%=leaderPhone%>"><%=leaderPhone%></a></p>\
                                </div>\
                                </dd>\
                            </dl>';
            var html = $.parseTpl(_tpl, info);
            $("#activity_info").html(html);

            //活动介绍
            if (info.introduce) {
                var _introduce = info.introduce.replace(/src/g,"data-url");
                _introduce = _introduce.replace(/img/ig,"img class='ui-imglazyload' style='width:100%'");
                $("#actContent").html('<p>' + _introduce + '</p>');

            }
        }
    }
})();
Act.init();