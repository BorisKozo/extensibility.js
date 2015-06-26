var Handlebars = require("handlebars");module.exports = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<header class=\"js-dashboard-chart-handle dashboard-chart-handle panel-heading\">\n    <span class=\"panel-title\">"
    + this.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "</span>\n</header>\n<main class=\"panel-body\">\n    <div class=\"js-dashboard-chart-container\"></div>\n</main>\n<!--<footer class=\"panel-footer\">-->\n\n<!--</footer>-->\n\n";
},"useData":true});