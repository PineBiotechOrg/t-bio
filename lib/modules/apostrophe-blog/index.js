module.exports = {
  addFields: [
    {                           
      name: '_author',          
      label: 'Author',          
      type: 'joinByOne',        
      withType: 'profile',      
      idField: 'userProfileId'  
    }                           
  ],
};