var path = require('path');

var apos = require('apostrophe')({
  shortName: 't-bio',

  // See lib/modules for basic project-level configuration of our modules
  // responsible for serving static assets, managing page templates and
  // configuring user accounts.

  modules: {


    // Apostrophe module configuration

    // Note: most configuration occurs in the respective
    // modules' directories. See lib/apostrophe-assets/index.js for an example.

    // However any modules that are not present by default in Apostrophe must at
    // least have a minimal configuration here: `moduleName: {}`

    // Setup

    // Instantiate apostrophe-templates module and give it a fallback directory to better separate
    // apostrophe customization from totally project-specific templates.
    //
    // Apostrophe will try to serve a template from the module rendering it before falling back
    // to this global `/views` folder.

    'apostrophe-templates': { viewsFolderFallback: path.join(__dirname, 'views') },

    // This module adds Nunjucks "helper functions" and helper data useful in all templates.
    //
    // Some uses include special template functions that go outside the depth of nunjucks,
    // often by exporting lodash functions, and reusable, centralized apos.area configurations.
    //
    // The module also contains useful library .js files containing ready-made options
    // for areas and the like, which other modules `require` to avoid redundancy.
    'helpers': { extend: 'apostrophe-module' },

    // apostrophe-seo adds custom meta data to the HEAD tag of a page, per page https://github.com/apostrophecms/apostrophe-seo
    // This is not automatic, see also views/layout.html
    'apostrophe-seo': {},

    // apostrophe-open-graph adds custom OG meta data to the HEAD tag of a page, per page https://github.com/apostrophecms/apostrophe-open-graph
    // This is not automatic, see also views/layout.html
    'apostrophe-open-graph': {},

    // apostrophe-pieces-import lets you turn on an CSV import interface per piece type https://github.com/apostrophecms/apostrophe-pieces-import
    'apostrophe-pieces-import': {},

    'apostrophe-headless': {},

    // apostrophe-favicons adds an interface for controlling a favicon for your site and outputs the proper link tags https://github.com/apostrophecms/apostrophe-favicons
    'apostrophe-favicons': {},
    // apostrophe-favicons arrives as a bundle of modules, apostrophe-favicons-global is the
    // specific one we want to activate
    'apostrophe-favicons-global': {},

    'apostrophe-forms': {},
    'apostrophe-forms-widgets': {},
    // Enable only the field widgets that your application needs to make it
    // easier for application/website managers.
    'apostrophe-forms-text-field-widgets': {},
    'apostrophe-forms-textarea-field-widgets': {},
    'apostrophe-forms-file-field-widgets': {},
    'apostrophe-forms-select-field-widgets': {},
    'apostrophe-forms-radio-field-widgets': {},
    'apostrophe-forms-checkboxes-field-widgets': {},
    'apostrophe-forms-boolean-field-widgets': {},
    'apostrophe-forms-conditional': {},
    'apostrophe-forms-conditional-widgets': {},
    // END of field widgets
    'apostrophe-email': {
      // See the email tutorial for required configuration.
      // https://docs.apostrophecms.org/apostrophe/tutorials/howtos/email
    },
    'apostrophe-permissions': {
      construct: function(self, options) {
        // Required if you want file fields to work on public pages.
        self.addPublic([ 'edit-attachment' ]);
      }
    },

    // Custom schema fields in "Page Settings" for the "default" page type
    'default-pages': { extend: 'apostrophe-custom-pages' },

    // Categorical "meta" piece types
    'category-object-types': { extend: 'apostrophe-pieces' },

    'articles': { extend: 'apostrophe-blog', restApi: true },
    'articles-pages': { extend: 'apostrophe-pieces-pages', restApi: true },
    'articles-widgets': { extend: 'apostrophe-pieces-widgets', restApi: true },
    'articles-featured-widgets': { extend: 'apostrophe-widgets', restApi: true },

    'people': { extend: 'apostrophe-pieces' },
    'people-pages': { extend: 'apostrophe-pieces-pages' },

    'profiles' : {},
    'profiles-pages': { extend: 'apostrophe-pieces-pages', restApi: true },

    // Content Widgets
    'image-widgets': { extend: 'apostrophe-widgets' },
    'slideshow-widgets': { extend: 'apostrophe-widgets' },
    'link-widgets': { extend: 'apostrophe-widgets' },
    'marquee-widgets': { extend: 'apostrophe-widgets' },
    'feature-widgets': { extend: 'marquee-widgets' },
    'two-panel-widgets': { extend: 'apostrophe-widgets' },
    'content-widgets': { extend: 'apostrophe-widgets' },

    // Layout Widgets
    'columns-widgets': { extend: 'apostrophe-widgets' },

    'comments': {},
    'comments-widgets': {},

  }
});
