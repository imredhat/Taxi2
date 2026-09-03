(function ($) {
    ("use strict");


	
	
	
	
	
    $(document).ready(function() {

      $(".vehicle-list-wapper .select-year-parts").change(function(){
        $('.vehicle-list-wapper .select-make-parts').prop('disabled', false);
      });

      $(".vehicle-list-wapper .select-make-parts").change(function(){
        $('.vehicle-list-wapper .select-model-parts').prop('disabled', false);
      });

      $(".vehicle-list-wapper .select-model-parts").change(function(){
        $('.vehicle-list-wapper .select-engine-parts').prop('disabled', false);
      });

      $(".conexi-parts-search-box-area .select-year-parts").change(function(){
        $('.conexi-parts-search-box-area .select-make-parts').prop('disabled', false);
      });

      $(".conexi-parts-search-box-area .select-make-parts").change(function(){
        $('.conexi-parts-search-box-area .select-model-parts').prop('disabled', false);
      });

      $(".conexi-parts-search-box-area .select-model-parts").change(function(){
        $('.conexi-parts-search-box-area .select-engine-parts').prop('disabled', false);
      });

    });

  //   $("#makemodel").on('change',function(){
  //     var makemodel_name = $(this).val();
  //     $.ajax({
  //         type: 'post', 
  //         url: conexi_ajax_localize.ajax_url, 
  //         dataType: 'html',
  //         data: {
  //             action: 'conexi_makemodel_name_select',
  //             makemodel_name: makemodel_name,
  //         }, 
  //         success: function( res ) {
  //             $('#submodel').empty('');
  //             $('#submodel').html(res);
  //         }
  //     })
  //  });


    $('.cat-list_item').on('click', function() {
      $('.cat-list_item').removeClass('active');
      $(this).addClass('active');
      
      product_grid_type =  $('#product_grid_type').val();
      product_per_page =  $('#product_per_page').val();
      product_order_by =  $('#product_order_by').val();
      product_order =  $('#product_order').val();
      catagory_name =  $('#catagory_name').val();
      product_style =  $('#product_style').val();

      $.ajax({
        type: 'POST',
        url: conexi_ajax_localize.ajax_url,
        dataType: 'html',
        data: {
          action: 'conexi_tab_filter_products',
          category: $(this).data('slug'),
          product_grid_type: product_grid_type,
          product_per_page: product_per_page,
          product_order_by: product_order_by,
          product_order: product_order,
          catagory_name: catagory_name,
          product_style: product_style,
        },
        beforeSend: function() {
          $('.project-tiles .splide__slide').html('<div class="prd-grid-custom-svg-loader"><svg xmlns="http://www.w3.org/2000/svg" width="275" height="455" viewBox="0 0 275 455"><g transform="translate(-731 -1194)"><g transform="translate(731 1194)" fill="#fff" stroke="#e5e5e5" stroke-width="0"><rect width="275" height="455" rx="2" stroke="none"></rect><rect x="0.5" y="0.5" width="274" height="454" rx="1.5" fill="none"></rect></g><rect width="232" height="213" rx="3" transform="translate(753 1216)" fill="#f4f4f8"></rect><rect width="35" height="15" rx="3" transform="translate(753 1468)" fill="#f4f4f8"></rect><rect width="205" height="39" rx="3" transform="translate(753 1493)" fill="#f4f4f8"></rect><rect width="165" height="15" rx="3" transform="translate(753 1542)" fill="#f4f4f8"></rect><rect width="79" height="20" rx="3" transform="translate(753 1605)" fill="#f4f4f8"></rect><rect width="50" height="20" rx="3" transform="translate(838 1605)" fill="#f4f4f8"></rect></g></svg></div>');
        },
        success: function(res) {
          $('.project-tiles').html(res);
          let elms = document.getElementsByClassName('splide');
          if (elms.length > 0) {
              for (let i = 0, len = elms.length; i < len; i++) {
                  new Splide(elms[i]).mount();
              }
          }
        }
      })
    });


    $("#clearvehicle").on('click',function(){
        $.ajax({
            type: 'post', 
            url: conexi_ajax_localize.ajax_url, 
            dataType: 'html',
            data: {
                action: 'conexi_clearvehicle',
            }, 
            success: function( res ) {
               $('.vehicle-list').empty('');
               $('.vehicle-list').addClass('empty');
            }
        })
    });  


    $('.conexi-product-single-item-area').append('<div class="prd-grid-custom-svg-loader"><svg xmlns="http://www.w3.org/2000/svg" width="275" height="455" viewBox="0 0 275 455"><g transform="translate(-731 -1194)"><g transform="translate(731 1194)" fill="#fff" stroke="#e5e5e5" stroke-width="0"><rect width="275" height="455" rx="2" stroke="none"></rect><rect x="0.5" y="0.5" width="274" height="454" rx="1.5" fill="none"></rect></g><rect width="232" height="213" rx="3" transform="translate(753 1216)" fill="#f4f4f8"></rect><rect width="35" height="15" rx="3" transform="translate(753 1468)" fill="#f4f4f8"></rect><rect width="205" height="39" rx="3" transform="translate(753 1493)" fill="#f4f4f8"></rect><rect width="165" height="15" rx="3" transform="translate(753 1542)" fill="#f4f4f8"></rect><rect width="79" height="20" rx="3" transform="translate(753 1605)" fill="#f4f4f8"></rect><rect width="50" height="20" rx="3" transform="translate(838 1605)" fill="#f4f4f8"></rect></g></svg></div>')

    $(window).load(function() {
      $('body').addClass('loading-frame');
      $('.prd-grid-custom-svg-loader').delay(500).fadeOut(200);
    });

  })(jQuery);
