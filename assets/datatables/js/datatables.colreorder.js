/*!
 ColReorder 1.3.1
 ©2010-2015 SpryMedia Ltd - datatables.net/license
*/
(function(f){"function"===typeof define&&define.amd?define(["jquery","datatables.net"],function(n){return f(n,window,document)}):"object"===typeof exports?module.exports=function(n,k){n||(n=window);if(!k||!k.fn.dataTable)k=require("datatables.net")(n,k).$;return f(k,n,n.document)}:f(jQuery,window,document)})(function(f,n,k,r){function p(a){for(var c=[],d=0,e=a.length;d<e;d++)c[a[d]]=d;return c}function o(a,c,d){c=a.splice(c,1)[0];a.splice(d,0,c)}function q(a,c,d){for(var e=[],b=0,f=a.childNodes.length;b<
f;b++)1==a.childNodes[b].nodeType&&e.push(a.childNodes[b]);c=e[c];null!==d?a.insertBefore(c,e[d]):a.appendChild(c)}var s=f.fn.dataTable;f.fn.dataTableExt.oApi.fnColReorder=function(a,c,d,e){var b,g,i,l,h,k=a.aoColumns.length,j;h=function(a,b,c){if(a[b]&&"function"!==typeof a[b]){var d=a[b].split("."),e=d.shift();isNaN(1*e)||(a[b]=c[1*e]+"."+d.join("."))}};if(c!=d)if(0>c||c>=k)this.oApi._fnLog(a,1,"ColReorder 'from' index is out of bounds: "+c);else if(0>d||d>=k)this.oApi._fnLog(a,1,"ColReorder 'to' index is out of bounds: "+
d);else{i=[];b=0;for(g=k;b<g;b++)i[b]=b;o(i,c,d);var m=p(i);b=0;for(g=a.aaSorting.length;b<g;b++)a.aaSorting[b][0]=m[a.aaSorting[b][0]];if(null!==a.aaSortingFixed){b=0;for(g=a.aaSortingFixed.length;b<g;b++)a.aaSortingFixed[b][0]=m[a.aaSortingFixed[b][0]]}b=0;for(g=k;b<g;b++){j=a.aoColumns[b];i=0;for(l=j.aDataSort.length;i<l;i++)j.aDataSort[i]=m[j.aDataSort[i]];j.idx=m[j.idx]}f.each(a.aLastSort,function(b,c){a.aLastSort[b].src=m[c.src]});b=0;for(g=k;b<g;b++)j=a.aoColumns[b],"number"==typeof j.mData?
j.mData=m[j.mData]:f.isPlainObject(j.mData)&&(h(j.mData,"_",m),h(j.mData,"filter",m),h(j.mData,"sort",m),h(j.mData,"type",m));if(a.aoColumns[c].bVisible){h=this.oApi._fnColumnIndexToVisible(a,c);l=null;for(b=d<c?d:d+1;null===l&&b<k;)l=this.oApi._fnColumnIndexToVisible(a,b),b++;i=a.nTHead.getElementsByTagName("tr");b=0;for(g=i.length;b<g;b++)q(i[b],h,l);if(null!==a.nTFoot){i=a.nTFoot.getElementsByTagName("tr");b=0;for(g=i.length;b<g;b++)q(i[b],h,l)}b=0;for(g=a.aoData.length;b<g;b++)null!==a.aoData[b].nTr&&
q(a.aoData[b].nTr,h,l)}o(a.aoColumns,c,d);b=0;for(g=k;b<g;b++)a.oApi._fnColumnOptions(a,b,{});o(a.aoPreSearchCols,c,d);b=0;for(g=a.aoData.length;b<g;b++){l=a.aoData[b];if(j=l.anCells){o(j,c,d);i=0;for(h=j.length;i<h;i++)j[i]&&j[i]._DT_CellIndex&&(j[i]._DT_CellIndex.column=i)}"dom"!==l.src&&f.isArray(l._aData)&&o(l._aData,c,d)}b=0;for(g=a.aoHeader.length;b<g;b++)o(a.aoHeader[b],c,d);if(null!==a.aoFooter){b=0;for(g=a.aoFooter.length;b<g;b++)o(a.aoFooter[b],c,d)}(new f.fn.dataTable.Api(a)).rows().invalidate();
b=0;for(g=k;b<g;b++)f(a.aoColumns[b].nTh).off("click.DT"),this.oApi._fnSortAttachListener(a,a.aoColumns[b].nTh,b);f(a.oInstance).trigger("column-reorder.dt",[a,{from:c,to:d,mapping:m,drop:e,iFrom:c,iTo:d,aiInvertMapping:m}])}};var h=function(a,c){var d=(new f.fn.dataTable.Api(a)).settings()[0];if(d._colReorder)return d._colReorder;!0===c&&(c={});var e=f.fn.dataTable.camelToHungarian;e&&(e(h.defaults,h.defaults,!0),e(h.defaults,c||{}));this.s={dt:null,init:f.extend(!0,{},h.defaults,c),fixed:0,fixedRight:0,
reorderCallback:null,mouse:{startX:-1,startY:-1,offsetX:-1,offsetY:-1,target:-1,targetIndex:-1,fromIndex:-1},aoTargets:[]};this.dom={drag:null,pointer:null};this.s.dt=d;this.s.dt._colReorder=this;this._fnConstruct();return this};f.extend(h.prototype,{fnReset:function(){this._fnOrderColumns(this.fnOrder());return this},fnGetCurrentOrder:function(){return this.fnOrder()},fnOrder:function(a,c){var d=[],e,b,g=this.s.dt.aoColumns;if(a===r){e=0;for(b=g.length;e<b;e++)d.push(g[e]._ColReorder_iOrigCol);return d}if(c){g=
this.fnOrder();e=0;for(b=a.length;e<b;e++)d.push(f.inArray(a[e],g));a=d}this._fnOrderColumns(p(a));return this},fnTranspose:function(a,c){c||(c="toCurrent");var d=this.fnOrder(),e=this.s.dt.aoColumns;return"toCurrent"===c?!f.isArray(a)?f.inArray(a,d):f.map(a,function(a){return f.inArray(a,d)}):!f.isArray(a)?e[a]._ColReorder_iOrigCol:f.map(a,function(a){return e[a]._ColReorder_iOrigCol})},_fnConstruct:function(){var a=this,c=this.s.dt.aoColumns.length,d=this.s.dt.nTable,e;this.s.init.iFixedColumns&&
(this.s.fixed=this.s.init.iFixedColumns);this.s.init.iFixedColumnsLeft&&(this.s.fixed=this.s.init.iFixedColumnsLeft);this.s.fixedRight=this.s.init.iFixedColumnsRight?this.s.init.iFixedColumnsRight:0;this.s.init.fnReorderCallback&&(this.s.reorderCallback=this.s.init.fnReorderCallback);for(e=0;e<c;e++)e>this.s.fixed-1&&e<c-this.s.fixedRight&&this._fnMouseListener(e,this.s.dt.aoColumns[e].nTh),this.s.dt.aoColumns[e]._ColReorder_iOrigCol=e;this.s.dt.oApi._fnCallbackReg(this.s.dt,"aoStateSaveParams",function(b,
c){a._fnStateSave.call(a,c)},"ColReorder_State");var b=null;this.s.init.aiOrder&&(b=this.s.init.aiOrder.slice());this.s.dt.oLoadedState&&("undefined"!=typeof this.s.dt.oLoadedState.ColReorder&&this.s.dt.oLoadedState.ColReorder.length==this.s.dt.aoColumns.length)&&(b=this.s.dt.oLoadedState.ColReorder);if(b)if(a.s.dt._bInitComplete)c=p(b),a._fnOrderColumns.call(a,c);else{var g=!1;f(d).on("draw.dt.colReorder",function(){if(!a.s.dt._bInitComplete&&!g){g=true;var c=p(b);a._fnOrderColumns.call(a,c)}})}else this._fnSetColumnIndexes();
f(d).on("destroy.dt.colReorder",function(){f(d).off("destroy.dt.colReorder draw.dt.colReorder");f(a.s.dt.nTHead).find("*").off(".ColReorder");f.each(a.s.dt.aoColumns,function(a,b){f(b.nTh).removeAttr("data-column-index")});a.s.dt._colReorder=null;a.s=null})},_fnOrderColumns:function(a){var c=!1;if(a.length!=this.s.dt.aoColumns.length)this.s.dt.oInstance.oApi._fnLog(this.s.dt,1,"ColReorder - array reorder does not match known number of columns. Skipping.");else{for(var d=0,e=a.length;d<e;d++){var b=
f.inArray(d,a);d!=b&&(o(a,b,d),this.s.dt.oInstance.fnColReorder(b,d,!0),c=!0)}this._fnSetColumnIndexes();c&&((""!==this.s.dt.oScroll.sX||""!==this.s.dt.oScroll.sY)&&this.s.dt.oInstance.fnAdjustColumnSizing(!1),this.s.dt.oInstance.oApi._fnSaveState(this.s.dt),null!==this.s.reorderCallback&&this.s.reorderCallback.call(this))}},_fnStateSave:function(a){var c,d,e,b=this.s.dt.aoColumns;a.ColReorder=[];if(a.aaSorting){for(c=0;c<a.aaSorting.length;c++)a.aaSorting[c][0]=b[a.aaSorting[c][0]]._ColReorder_iOrigCol;
var g=f.extend(!0,[],a.aoSearchCols);c=0;for(d=b.length;c<d;c++)e=b[c]._ColReorder_iOrigCol,a.aoSearchCols[e]=g[c],a.abVisCols[e]=b[c].bVisible,a.ColReorder.push(e)}else if(a.order){for(c=0;c<a.order.length;c++)a.order[c][0]=b[a.order[c][0]]._ColReorder_iOrigCol;g=f.extend(!0,[],a.columns);c=0;for(d=b.length;c<d;c++)e=b[c]._ColReorder_iOrigCol,a.columns[e]=g[c],a.ColReorder.push(e)}},_fnMouseListener:function(a,c){var d=this;f(c).on("mousedown.ColReorder",function(a){a.preventDefault();d._fnMouseDown.call(d,
a,c)})},_fnMouseDown:function(a,c){var d=this,e=f(a.target).closest("th, td").offset(),b=parseInt(f(c).attr("data-column-index"),10);b!==r&&(this.s.mouse.startX=a.pageX,this.s.mouse.startY=a.pageY,this.s.mouse.offsetX=a.pageX-e.left,this.s.mouse.offsetY=a.pageY-e.top,this.s.mouse.target=this.s.dt.aoColumns[b].nTh,this.s.mouse.targetIndex=b,this.s.mouse.fromIndex=b,this._fnRegions(),f(k).on("mousemove.ColReorder",function(a){d._fnMouseMove.call(d,a)}).on("mouseup.ColReorder",function(a){d._fnMouseUp.call(d,
a)}))},_fnMouseMove:function(a){if(null===this.dom.drag){if(5>Math.pow(Math.pow(a.pageX-this.s.mouse.startX,2)+Math.pow(a.pageY-this.s.mouse.startY,2),0.5))return;this._fnCreateDragNode()}this.dom.drag.css({left:a.pageX-this.s.mouse.offsetX,top:a.pageY-this.s.mouse.offsetY});for(var c=!1,d=this.s.mouse.toIndex,e=1,b=this.s.aoTargets.length;e<b;e++)if(a.pageX<this.s.aoTargets[e-1].x+(this.s.aoTargets[e].x-this.s.aoTargets[e-1].x)/2){this.dom.pointer.css("left",this.s.aoTargets[e-1].x);this.s.mouse.toIndex=
this.s.aoTargets[e-1].to;c=!0;break}c||(this.dom.pointer.css("left",this.s.aoTargets[this.s.aoTargets.length-1].x),this.s.mouse.toIndex=this.s.aoTargets[this.s.aoTargets.length-1].to);this.s.init.bRealtime&&d!==this.s.mouse.toIndex&&(this.s.dt.oInstance.fnColReorder(this.s.mouse.fromIndex,this.s.mouse.toIndex,!1),this.s.mouse.fromIndex=this.s.mouse.toIndex,this._fnRegions())},_fnMouseUp:function(){f(k).off("mousemove.ColReorder mouseup.ColReorder");null!==this.dom.drag&&(this.dom.drag.remove(),this.dom.pointer.remove(),
this.dom.drag=null,this.dom.pointer=null,this.s.dt.oInstance.fnColReorder(this.s.mouse.fromIndex,this.s.mouse.toIndex,!0),this._fnSetColumnIndexes(),(""!==this.s.dt.oScroll.sX||""!==this.s.dt.oScroll.sY)&&this.s.dt.oInstance.fnAdjustColumnSizing(!1),this.s.dt.oInstance.oApi._fnSaveState(this.s.dt),null!==this.s.reorderCallback&&this.s.reorderCallback.call(this))},_fnRegions:function(){var a=this.s.dt.aoColumns;this.s.aoTargets.splice(0,this.s.aoTargets.length);this.s.aoTargets.push({x:f(this.s.dt.nTable).offset().left,
to:0});for(var c=0,d=f(a[0].nTh).offset().left,e=0,b=a.length;e<b;e++)e!=this.s.mouse.fromIndex&&c++,a[e].bVisible&&"none"!==a[e].nTh.style.display&&(d+=f(a[e].nTh).outerWidth(),this.s.aoTargets.push({x:d,to:c}));0!==this.s.fixedRight&&this.s.aoTargets.splice(this.s.aoTargets.length-this.s.fixedRight);0!==this.s.fixed&&this.s.aoTargets.splice(0,this.s.fixed)},_fnCreateDragNode:function(){var a=""!==this.s.dt.oScroll.sX||""!==this.s.dt.oScroll.sY,c=this.s.dt.aoColumns[this.s.mouse.targetIndex].nTh,
d=c.parentNode,e=d.parentNode,b=e.parentNode,g=f(c).clone();this.dom.drag=f(b.cloneNode(!1)).addClass("DTCR_clonedTable").append(f(e.cloneNode(!1)).append(f(d.cloneNode(!1)).append(g[0]))).css({position:"absolute",top:0,left:0,width:f(c).outerWidth(),height:f(c).outerHeight()}).appendTo("body");this.dom.pointer=f("<div></div>").addClass("DTCR_pointer").css({position:"absolute",top:a?f("div.dataTables_scroll",this.s.dt.nTableWrapper).offset().top:f(this.s.dt.nTable).offset().top,height:a?f("div.dataTables_scroll",
this.s.dt.nTableWrapper).height():f(this.s.dt.nTable).height()}).appendTo("body")},_fnSetColumnIndexes:function(){f.each(this.s.dt.aoColumns,function(a,c){f(c.nTh).attr("data-column-index",a)})}});h.defaults={aiOrder:null,bRealtime:!0,iFixedColumnsLeft:0,iFixedColumnsRight:0,fnReorderCallback:null};h.version="1.3.1";f.fn.dataTable.ColReorder=h;f.fn.DataTable.ColReorder=h;"function"==typeof f.fn.dataTable&&"function"==typeof f.fn.dataTableExt.fnVersionCheck&&f.fn.dataTableExt.fnVersionCheck("1.10.8")?
f.fn.dataTableExt.aoFeatures.push({fnInit:function(a){var c=a.oInstance;a._colReorder?c.oApi._fnLog(a,1,"ColReorder attempted to initialise twice. Ignoring second"):(c=a.oInit,new h(a,c.colReorder||c.oColReorder||{}));return null},cFeature:"R",sFeature:"ColReorder"}):alert("Warning: ColReorder requires DataTables 1.10.8 or greater - www.datatables.net/download");f(k).on("preInit.dt.colReorder",function(a,c){if("dt"===a.namespace){var d=c.oInit.colReorder,e=s.defaults.colReorder;if(d||e)e=f.extend({},
d,e),!1!==d&&new h(c,e)}});f.fn.dataTable.Api.register("colReorder.reset()",function(){return this.iterator("table",function(a){a._colReorder.fnReset()})});f.fn.dataTable.Api.register("colReorder.order()",function(a,c){return a?this.iterator("table",function(d){d._colReorder.fnOrder(a,c)}):this.context.length?this.context[0]._colReorder.fnOrder():null});f.fn.dataTable.Api.register("colReorder.transpose()",function(a,c){return this.context.length&&this.context[0]._colReorder?this.context[0]._colReorder.fnTranspose(a,
c):a});return h});
