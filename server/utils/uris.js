/**
 * Created by wayky on 15/10/15.
 */
module.exports = {

    BASE_LOGIN : "/api/login",
    BASE_LOGOUT : "/api/logout",
    BASE_AUTH : "/api/authorization",
    BASE_BASE_INFO : "/api/baseinfo",
    BASE_FILE_UPLOAD : "/api/upload",
    BASE_CONFIG : "/api/config",
    BASE_MODULE_LIST : "/api/module/list",
    BASE_SORT : "/api/sort",
    BASE_APP_INFO : "/api/appInfo",
    BASE_APP_UPDATE : "/api/customization/update",
    BASE_STAT_TIPS: "/api/statistics/tips",
    BASE_STAT_APP: "/api/statistics/app",
    BASE_JUMP_PROTOCOL:"/api/jumpprotocol/app",

    OPEN_ACTIVITY_LIST:"/api/activity/list",
    OPEN_ACTIVITY_ADD:"/api/activity/add",
    OPEN_ACTIVITY_GET:"/api/activity/get",
    OPEN_ACTIVITY_EXPORT:"/api/activity/export", //Todo
    OPEN_ACTIVITY_UPDATE:"/api/activity/update", //Todo
    OPEN_ACTIVITY_OFFLINE:"/api/activity/offline",

    OPEN_ACTIVITY_JOIN_LIST:"/api/activity/join/list",
    OPEN_ACTIVITY_JOIN_UPDATE:"/api/activity/join/update",

    OPEN_ACTIVITY_UNION_LIST:"/api/activity/union/list",
    OPEN_ACTIVITY_UNION_ADD:"/api/activity/union/add",
    OPEN_ACTIVITY_UNION_CANCEL:"/api/activity/union/cancel",

    OPEN_ACTIVITY_UNION_ENTER:"/api/activity/union/enter",

    OPEN_APPUER_LIST:"/api/appuser/list",
    OPEN_APPUER_lUPDATELEVEL:"/api/appuser/updatelevel",
    
    OPEN_USER_LIST : "/api/user/list",
    OPEN_USER_ADDADMIN : "/api/user/add/admin",
    OPEN_USER_UPDATEADMIN : "/api/user/update/admin",
    OPEN_USER_DELETEADMIN : "/api/user/delete/admin",
    OPEN_USER_GETADMIN : "/api/user/get/admin",
    OPEN_USER_GET : "/api/user/get",
    OPEN_USER_UPDATE : "/api/user/update",
    OPEN_USER_ROLELIST : "/api/user/role/list",

    OPEN_GROUPMSG_LIST:"/api/groupmsg/list",
    OPEN_GROUPMSG_ADD :"/api/groupmsg/add",
    OPEN_GROUPMSG_UPDATE :"/api/groupmsg/update",
    OPEN_GROUPMSG_GET :"/api/groupmsg/get",
    OPEN_GROUPMSG_DEL :"/api/groupmsg/delete",
    OPEN_GROUPMSG_OFFLINE :"/api/groupmsg/offline",

    OPEN_ARTICLE_LIST:"/api/article/list",
    OPEN_ARTICLE_ADD :"/api/article/add",
    OPEN_ARTICLE_UPDATE:"/api/article/update",
    OPEN_ARTICLE_GET :"/api/article/get",
    OPEN_ARTICLE_DELETE :"/api/article/delete",
    OPEN_ARTICLE_OFFLINE:"/api/article/offline",

    OPEN_MATE_LIST:"/api/mate/list",
    OPEN_MATE_ADD:"/api/mate/add",
    OPEN_MATE_OFFLINE:'/api/mate/offline',
    OPEN_MATE_GET:'/api/mate/get',

    OPEN_NOTES_LIST:'/api/note/list',
    OPEN_NOTES_ADD:'/api/note/add',
    OPEN_NOTES_GET:'/api/note/get',
    OPEN_NOTES_UPDATE:'/api/note/update', 
    OPEN_NOTES_OFFLINE:'/api/note/offline', 
    OPEN_NOTES_DEL:'/api/note/delete', 


    OPEN_MODULE_LIST:'/api/module/list',
    OPEN_MODULE_UPDATE:'/api/module/update',

    OPEN_BANNER_LIST:'/api/banner/list',
    OPEN_BANNER_ADD:'/api/banner/add',
    OPEN_BANNER_UPDATE:'/api/banner/update',
    OPEN_BANNER_OFFLINE:'/api/banner/offline',
    OPEN_BANNER_GET:'/api/banner/get',
    OPEN_BANNER_DEL:'/api/banner/delete',

    OPEN_AUDIT_LIST:'/api/audit/list',
    OPEN_AUDIT_ADD:'/api/audit/add',
    OPEN_AUDIT_UPDATE:'/api/audit/update',
    OPEN_AUDIT_GET:'/api/audit/get',
    OPEN_AUDIT_DEL:'/api/audit/delete',
    OPEN_AUDIT_NOPASS:'/api/audit/nopass',
    OPEN_AUDIT_SAVE:'/api/audit/save',

    OPEN_DEPARTMENT_LIST:'/api/department/list',
    OPEN_DEPARTMENT_GET:'/api/department/get',
    OPEN_DEPARTMENT_DEL:'/api/department/delete',
    OPEN_DEPARTMENT_ADD:'/api/department/add',    
    OPEN_DEPARTMENT_UPDATE:'/api/department/update',

    OPEN_MYINDEX_GET:'/api/module/get/homepage',
    OPEN_MYINDEX_UPDATE :'/api/module/update/homepage',

    OPEN_COL_ACTIVITY_LIST: '/api/activity/college/list',
    OPEN_COL_ACTIVITY_GET : '/api/activity/college/get',
    OPEN_COL_ACTIVITY_ADD : '/api/activity/college/add',
    OPEN_COL_ACTIVITY_UPDATE : '/api/activity/college/update',
    OPEN_COL_ACTIVITY_OFFLINE : '/api/activity/college/offline',
    OPEN_COL_ACTIVITY_JOIN_LIST : '/api/activity/college/join/list',


    /********begin  二期电商平台   ********/
    
     //商品分布、列表
    OPEN_GOODS_LIST:'/api/goods/list',
    OPEN_GOODS_ONLINE:'/api/goods/online',
    OPEN_GOODS_OFFLINE:'/api/goods/offline',
    OPEN_GOODS_ADD:'/api/goods/add',
    OPEN_GOODS_GET:'/api/goods/get',
    OPEN_GOODS_UPDATE:'/api/goods/update',  
    OPEN_GOODS_DEL:'/api/goods/delete',
    OPEN_GOODS_UPDATE_BASE:'/api/goods/update/base',

    //商品分类
    OPEN_GOODS_TYPELIST:'/api/goods/type/list',
    OPEN_GOODS_TYPEADD:'/api/goods/type/add',
    OPEN_GOODS_TYPEGET:'/api/goods/type/get',
    OPEN_GOODS_TYPEUPDATE:'/api/goods/type/update',  
    OPEN_GOODS_TYPEDEL:'/api/goods/type/delete',

    //商品分类推荐
    OPEN_GOODS_TYPE_RECOMMAND_LIST:'/api/goods/recommend/type/list',
    OPEN_GOODS_TYPE_RECOMMAND_ADD:'/api/goods/recommend/add',
    OPEN_GOODS_TYPE_RECOMMAND_DELETE:'/api/goods/recommend/delete',

    //商品品牌
    OPEN_GOODS_BRANDLIST:'/api/goods/brand/list',
    OPEN_GOODS_BRANDADD:'/api/goods/brand/add',
    OPEN_GOODS_BRANDGET:'/api/goods/brand/get',  
    OPEN_GOODS_BRANDDEL:'/api/goods/brand/delete',
    OPEN_GOODS_BRANDUPDATE:'/api/goods/brand/update',
    
    //商品规格
    OPEN_GOODS_SPECIFICATIONLIST:'/api/goods/specification/list',
    OPEN_GOODS_SPECIFICATIONADD:'/api/goods/specification/add',
    OPEN_GOODS_SPECIFICATIONGET:'/api/goods/specification/get',  
    OPEN_GOODS_SPECIFICATIONDEL:'/api/goods/specification/delete',
    OPEN_GOODS_SPECIFICATIONUPDATE:'/api/goods/specification/update',

    /*分销管理*/
    OPEN_DISTRIBUTE_TYPELIST:'/api/distributor/list',
    OPEN_DISTRIBUTE_DISAPPLY_TYPELIST:'/api/distributor/disapply/list',
    OPEN_DISTRIBUTE_SELLERCODE_TYPEGEN:'/api/distributor/sellercode/gen',
    OPEN_DISTRIBUTE_DISPERCENT_TYPEGET:'/api/distributor/dispercent/get',
    OPEN_DISTRIBUTE_DISPERCENT_TYPEADD:'/api/distributor/dispercent/add',
    OPEN_DISTRIBUTE_AUDIT:'/api/distributor/audit',
    OPEN_DISTRIBUTE_COMMISSION_TYPELIST:'/api/distributor/commission/list',
    OPEN_DISTRIBUTE_COMMISSION_TYPEGET:'/api/distributor/commission/get',
    OPEN_DISTRIBUTE_PAYOFF_TYPELIST:'/api/distributor/payoff/list',
    OPEN_DISTRIBUTE_BONUS_TYPELIST:'/api/distributor/bonus/list',
    OPEN_DISTRIBUTE_BONUS_TYPEGET:'/api/distributor/bonus/get',
    OPEN_DISTRIBUTE_COMMISSION_PAY:'/api/distributor/commission/payoff',
    OPEN_DISTRIBUTE_BONUS_PAY:'/api/distributor/bonus/payoff',

    /**订单管理*/
    OPEN_ORDER_TYPE_LIST : '/api/order/list',
    OPEN_ORDER_TYPE_GET : '/api/order/get',
    OPEN_LOGISTICSCOMPANY_TYPE_List : '/api/order/logisticscompany/list',
    OPEN_TRANSPORT_TYPE_ADD : '/api/order/transport/add',
    OPEN_ORDER_REFUND : '/api/order/refund',
    OPEN_ORDER_RECEIVE_UPDATE : '/api/order/receive/update',
    OPEN_ORDER_CITY_LIST : '/api/order/city/list',
    OPEN_ORDER_CANCEL : '/api/order/cancel',
    OPEN_LOGISTICS_GET : '/api/order/logistics/get',
    OPEN_ORDER_ADDRESS_LIST : '/api/order/city/address/list',

    /*首页*/
    OPEN_PAGESHOW_GET   :   '/api/pageshow/get',
    OPEN_PAGESHWO_SAVE  :   '/api/pageshow/save',

    OPEN_LOG_LIST   :   '/api/log/list'
};