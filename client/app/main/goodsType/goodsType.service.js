;(function() {
  'use strict';

  angular.module('main.goodsType')
    .factory('GoodsTypeService', GoodsTypeService);

  function GoodsTypeService(CommRestService) {

    return {
      goodsTypeTrie: goodsTypeTrie, //商品分类树
      getTypeIdById: getTypeIdById, //根据id匹配typeId
      getChildLevel: getChildLevel, //商品分类联动查询(二级)
      getTypeNameByTypeId: getTypeNameByTypeId, //根据typeId匹配分类名称
      getParentLevelByTypeId: getParentLevelByTypeId, //根据typeId匹配父级分类id
      getGoodsBrand: getGoodsBrand, //商品品牌
      getBrandNameById: getBrandNameById //根据品牌id匹配名称
    };

    function goodsTypeTrie(cb) {
      var goodsType = store.get('goodsType');
      var nodes = [];
      if (_.isUndefined(goodsType)) {
        CommRestService.post('goods/typeList', {}, function(res) {
          store.set('goodsType', res);
          cb(packTree(res));
        });
      } else {
        cb(packTree(goodsType));
      }


      function packTree(data) {
        _.each(data, function(d) {
          if (d.level === 1) {
            nodes.push(d);
          }
        });

        _.each(nodes, function(n) {
          var arr = [];
          _.each(data, function(da) {
            if (n.typeId === da.parentId) {
              arr.push(da);
            }
          });
          n.child = arr;
        });
        return nodes;
      }
    }


    function getTypeIdById(gtData, id) {
      var tid = 0;
      _.each(gtData, function(d) {
        if (d.id === id) {
          tid = d.typeId;
        }
      });
      return tid;
    }


    function getChildLevel(gtData, id) {
      var temp = [];
      _.each(gtData, function(d) {
        
        if (d.id === id) {
          temp = d.child;
        }else if(d.typeId === id){
          temp = d.child;
        }
      });
      
      return temp;
    }


    /**
     * 获取分类名数组
     * @param typeId
     * @returns {Array}
     */
    function getTypeNameByTypeId(typeId) {
      var tNames = [], nodes = [];
      goodsTypeTrie(function(res) {
        nodes = res;
        _.each(nodes, function(gt) {
          //一级分类直接返回
          if (gt.typeId === typeId) {
            tNames.push(gt.name);
          } else {
            //二级分类时还需带上所属父级的name
            _.each(gt.child, function(c) {
              if (c.typeId === typeId) {
                tNames.push(gt.name);
                tNames.push(c.name);
              }
            });
          }
        });
      });
      return tNames;
    }


    function getParentLevelByTypeId(typeId) {
      var levelIds = [];
      goodsTypeTrie(function(res) {
        _.each(res, function(gt) {
          var pId = 0;
          //匹配出当前(二级)typeId的parentId
          _.each(gt.child, function(c) {
            if (c.typeId === typeId) {
              pId = c.parentId;
              levelIds[0] = c.id;
            }
          });
          //找到该parentId对应的一级id
          if (pId === gt.typeId) {
            levelIds[1] = gt.id;
          }

        });
      });

      return levelIds;
    }


    function getGoodsBrand(cb) {
      var goodsBrand = store.get('goodsBrand');
      if (_.isUndefined(goodsBrand)) {
        CommRestService.post('goods/brandList', {}, function(res) {
          store.set('goodsBrand', goodsBrand);
          goodsBrand = res;
          if (_.isFunction(cb)) {
            cb(goodsBrand);
          }
        });
      } else {
        cb(goodsBrand);
      }
    }


    function getBrandNameById(brands, id) {
      var name = '';
      _.each(brands, function(bs) {
        if (bs.id === id) {
          name = bs.name;
        }
      });
      return name;
    }
  }

})();