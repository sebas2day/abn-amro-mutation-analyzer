System.config({
  baseURL: "/",
  defaultJSExtensions: true,
  transpiler: false,
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },

  map: {
    "angular": "github:angular/bower-angular@1.4.8",
    "angular-material": "github:angular/bower-material@1.0.1",
    "highcharts": "npm:highcharts@4.2.1",
    "highcharts-ng": "npm:highcharts-ng@0.0.11",
    "jquery": "github:components/jquery@2.1.4",
    "github:angular/bower-angular-animate@1.4.8": {
      "angular": "github:angular/bower-angular@1.4.8"
    },
    "github:angular/bower-angular-aria@1.4.8": {
      "angular": "github:angular/bower-angular@1.4.8"
    },
    "github:angular/bower-material@1.0.1": {
      "angular": "github:angular/bower-angular@1.4.8",
      "angular-animate": "github:angular/bower-angular-animate@1.4.8",
      "angular-aria": "github:angular/bower-angular-aria@1.4.8",
      "css": "github:systemjs/plugin-css@0.1.20"
    },
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.3.0"
    },
    "github:jspm/nodelibs-process@0.1.2": {
      "process": "npm:process@0.11.2"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:highcharts-ng@0.0.11": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:highcharts@4.2.1": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:process@0.11.2": {
      "assert": "github:jspm/nodelibs-assert@0.1.0"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    }
  }
});
