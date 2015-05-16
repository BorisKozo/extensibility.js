var Handlebars = require("handlebars");module.exports = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div>Hello "
    + this.escapeExpression(((helper = (helper = helpers.world || (depth0 != null ? depth0.world : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"world","hash":{},"data":data}) : helper)))
    + "!!</div>\n";
},"useData":true});