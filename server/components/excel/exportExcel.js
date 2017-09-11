/**
 * Created by wayky on 2015/11/11
 */
var nodeExcel = require('excel-export');
var underscore = require('underscore');
var path = require('path');
var fs = require('fs');
var uuid = require('node-uuid');
var moment = require('moment');
var util = require('util');

var config = {
    tmpExcelPath: '',
    lastCleanDate: ''
};

var excelExport = {};

excelExport.setTmpPath = function(path){
    config.tmpExcelPath = path;
};

var deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);

            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

/**
 * 导出Excel功能
 * @param cols excel头
 * @param data 真实的列表数据（提取cols里包含的字段）
 * @param method 可选：file(默认)返回文件名 | stram 返回文件流
 */
excelExport.export = function(cols, data, res, exprot_file_name) {

    var method = "binary";
    var conf = {};

    try {
        /* eg:
         [
         {id:'idx',caption:'排名', type:'number'},
         {id:'id',caption:'openid', type:'string'},
         {id:'nick_name',caption:'名称', type:'string'},
         {id:'score',caption:'投票数', type:'number'}
         ];
         */
        var ids = underscore.pluck(cols, 'id'); //取出字段
        //console.log('ids:'+ids);
        var m_data = [];
        //遍历，根据ids含有的字段整理数组
        underscore.each(data, function (d) {
            var o = underscore.pick(d, ids);
            var arry = underscore.values(o);
            //console.log(util.inspect(arry));
            m_data.push(arry);
        });

        conf.cols = cols;
        conf.rows = m_data;

        //console.log('m_data:%j\r\n,data:%j\r\n,cols:%j', m_data,data,cols);

        var result = nodeExcel.execute(conf);

        //生成临时文件再返回链接地址，供用户下载
        var tmpExcelName = 'export_' + uuid.v1() + '.xlsx';
        if (typeof exprot_file_name !== "undefined") {
            tmpExcelName = exprot_file_name+".xlsx";
        }

        if (method == "file") {
            //创建今日目录
            var today = moment().format('YYYYMMDD');
            var excelSavePath = path.join(config.tmpExcelPath, today);
            if (!fs.existsSync(excelSavePath)) {
                fs.mkdirSync(excelSavePath);
            }

            //清除历史目录
            if (config.lastCleanDate != today) {
                fs.readdir(config.tmpExcelPath, function (err, dirs) {
                    dirs.forEach(function(dir){
                        fs.stat(config.tmpExcelPath + '/' + dir, function(err, stat){
                           if (stat.isDirectory() && dir !== today){
                               deleteFolderRecursive(config.tmpExcelPath + '/' + dir);
                           }
                        });
                    });
                    config.lastCleanDate = today;
                });
            }

            fs.writeFileSync(excelSavePath + '/' + tmpExcelName, result, 'binary');
            var down = {success: true, t: {ret: 0, excel: '/' + today + '/' + tmpExcelName}};
            res.end(JSON.stringify(down));
        }
        else{
            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader("Content-Disposition", "attachment; filename=" + encodeURI(tmpExcelName));
            res.end(result, 'binary');
        }
    }
    catch(e){
        console.log("ExportExcel Error:%j", e.stack);
        if (method == "file") {
            res.end(JSON.stringify({success: true, t: {ret: -1, err: e.message}}));
        }
    }
};

module.exports = excelExport;
