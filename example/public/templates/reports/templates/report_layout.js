var Handlebars = require("handlebars");module.exports = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div>\n    <h1>Report: "
    + this.escapeExpression(((helper = (helper = helpers.reportName || (depth0 != null ? depth0.reportName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"reportName","hash":{},"data":data}) : helper)))
    + "</h1>\n    <section class=\"js-report-form-container\"></section>\n    <section class=\"js-report-graph-container\"></section>\n    <section class=\"js-report-table-container\"></section>\n</div>\n";
},"useData":true});