UE.registerUI('button2', function(editor, uiName) {
    //注册按钮执行时的command命令，使用命令默认就会带有回退操作
    editor.registerCommand(uiName, {
        execCommand: function() {
        	var insertHtml = '<section class="notes_progress">'
	        					+'<div class="n_pros">'
					                +'<div class="pros_title" ><span></span>这里输入第X天及游玩地址“例如第一天 - 深圳”</div>'
					                +'<div class="pros_content">'
					                    +'<img src="http://imgcache.varicom.im/images/notes/notes_default.png"/>'
					                    +'<p>'
					                         +'这里输入当天具体的游记内容'
					                    +'</p>'
					                +'</div>'
					            +'</div>'
				            +'</section>';
		    var currentHtml = editor.getContent();
		    if(currentHtml == "" || currentHtml.length < 0){
		    	editor.setContent(insertHtml);
		    }else{
		    	editor.setContent(editor.getContent() + insertHtml);
		    }
        }
    });
    //创建一个button
    var btn = new UE.ui.Button({
        //按钮的名字
        name: "addNoteModel",
        //提示
        title: "添加手记模版",
        //添加额外样式，指定icon图标，这里默认使用一个重复的icon
        cssRules: 'background-position: -339px -40px;',
        //点击时执行的命令
        onclick: function() {
            //这里可以不用执行命令,做你自己的操作也可
            editor.execCommand(uiName);
        }
    });
    //当点到编辑内容上时，按钮要做的状态反射
    editor.addListener('selectionchange', function() {
        var state = editor.queryCommandState(uiName);
        if (state == -1) {
            btn.setDisabled(true);
            btn.setChecked(false);
        } else {
            btn.setDisabled(false);
            btn.setChecked(state);
        }
    });
    //因为你是添加button,所以需要返回这个button
    return btn;
});