// This configures the apostrophe-users module to add an admin-level
// group by default:

module.exports = {
  addFields: [
    {
      name: 'thumbnail',
      type: 'singleton',
      widgetType: 'apostrophe-images',
      label: 'Profile Picture',
      options: {
        limit: 1,
        aspectRatio: [100, 100]
      }
    }
  ],
  groups: [
    {
      title: 'guest',
      permissions: [ ]
    },
    {
      title: 'admin',
      permissions: [ 'admin' ]
    }
  ]
};
