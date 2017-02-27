jQuery(document).ready(function() {
  var solutionBlock = jQuery(".solution");

  solutionBlock.wrap('<div></div>');
  solutionBlock.before('<button  type="button" class = "teaser">Solution</button>');
  solutionBlock.hide();
  jQuery(document).on('click', '.teaser', function() {
    jQuery(this).next(".solution").slideToggle(500);
  });
});