// This is a manifest file that'll be compiled into including all the files listed below.
// Add new JavaScript/Coffee code in separate files in this directory and they'll automatically
// be included in the compiled file accessible from http://example.com/assets/application.js
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
//= require jquery
//= require jquery_ujs
//= require angular
//= require spree/backend
//= require fancybox
//= require_tree .
//= stub spree/backend/dashboard
//= stub spree/backend/salestotal
//= stub spree/backend/topproduct
//= stub spree/backend/returning_customer
//= stub spree/backend/topcities
//= stub spree/backend/traffic_referrer
//= stub spree/backend/upload-image-pr
//= require spree/backend/spree_i18n
//= require spree/backend/spree_multi_domain
//= require spree/backend/spree_volume_pricing
//= require ./custom
//= require spree/backend/spree_reviews
//= require highcharts


// Shipments AJAX API
$(document).ready(function () {
  'use strict';

  // handle variant selection, show stock level.
  $('#add_variant_id').change(function(){
    var variant_id = $(this).val();

    var variant = _.find(window.variants, function(variant){
      return variant.id == variant_id
    })
    $('#stock_details').html(variantStockTemplate({variant: variant}));
    $('#stock_details').show();

    $('button.add_variant').click(addVariantFromStockLocation);

    // Add some tips
    $('.with-tip').powerTip({
      smartPlacement: true,
      fadeInTime: 50,
      fadeOutTime: 50,
      intentPollInterval: 300
    });

  });

  //handle edit click
  $('a.edit-item').click(toggleItemEdit);

  //handle cancel click
  $('a.cancel-item').click(toggleItemEdit);

  //handle split click
  $('a.split-item').click(startItemSplit);

  //handle save click
  $('a.save-item').click(function(){
    var save = $(this);
    var shipment_number = save.data('shipment-number');
    var variant_id = save.data('variant-id');

    var quantity = parseInt(save.parents('tr').find('input.line_item_quantity').val());

    toggleItemEdit();
    adjustShipmentItems(shipment_number, variant_id, quantity);
    return false;
  });

  //handle delete click
  $('a.delete-item').click(function(event){
    if (confirm(Spree.translations.are_you_sure_delete)) {
      var del = $(this);
      var shipment_number = del.data('shipment-number');
      var variant_id = del.data('variant-id');

      toggleItemEdit();
      adjustShipmentItems(shipment_number, variant_id, 0);
    }
    return false;
  });

  // handle ship click
  $('[data-hook=admin_shipment_form] a.ship').on('click', function () {
    var link = $(this);
    var shipment_number = link.data('shipment-number');
    var url = Spree.url(Spree.routes.shipments_api + '/' + shipment_number + '/ship.json');
    $.ajax({
      type: 'PUT',
      url: url
    }).done(function () {
      
      $('table.line-items').load(location.href + ' table.line-items')
      console.log("Handle ship click")
    }).error(function (msg) {
      console.log(msg);
    });
  });

  // handle shipping method edit click
  $('a.edit-method').click(toggleMethodEdit);
  $('a.cancel-method').click(toggleMethodEdit);

  // handle shipping method save
  $('[data-hook=admin_shipment_form] a.save-method').on('click', function (event) {
    event.preventDefault();

    var link = $(this);
    var shipment_number = link.data('shipment-number');
    var selected_shipping_rate_id = link.parents('tbody').find("select#selected_shipping_rate_id[data-shipment-number='" + shipment_number + "']").val();
    var unlock = link.parents('tbody').find("input[name='open_adjustment'][data-shipment-number='" + shipment_number + "']:checked").val();
    var url = Spree.url(Spree.routes.shipments_api + '/' + shipment_number + '.json');

    $.ajax({
      type: 'PUT',
      url: url,
      data: {
        shipment: {
          selected_shipping_rate_id: selected_shipping_rate_id,
          unlock: unlock
        }
      }
    }).done(function () {
   
      console.log("Handle shipping method save")
      $('table.line-items').load(location.href + ' table.line-items')
    }).error(function (msg) {
      console.log(msg);
    });
  });

  var toggleTrackingEdit = function(event) {
    event.preventDefault();

    var link = $(this);
    link.parents('tbody').find('tr.edit-tracking').toggle();
    link.parents('tbody').find('tr.show-tracking').toggle();
  }

  // handle tracking edit click
  $('a.edit-tracking').click(toggleTrackingEdit);
  $('a.cancel-tracking').click(toggleTrackingEdit);

  // handle tracking save
  $('[data-hook=admin_shipment_form] a.save-tracking').on('click', function (event) {
    event.preventDefault();

    var link = $(this);
    var shipment_number = link.data('shipment-number');
    var tracking = link.parents('tbody').find('input#tracking').val();
    var url = Spree.url(Spree.routes.shipments_api + '/' + shipment_number + '.json');

    $.ajax({
      type: 'PUT',
      url: url,
      data: {
        shipment: {
          tracking: tracking
        }
      }
    }).done(function (data) {
      link.parents('tbody').find('tr.edit-tracking').toggle();
      var show = link.parents('tbody').find('tr.show-tracking');
      show.toggle();
      show.find('.tracking-value').html($("<strong>").html("Theo doi: ")).append(data.tracking);
    });
  });
});

adjustShipmentItems = function(shipment_number, variant_id, quantity){
    var shipment = _.findWhere(shipments, {number: shipment_number + ''});
    var inventory_units = _.where(shipment.inventory_units, {variant_id: variant_id});

    var url = Spree.routes.shipments_api + "/" + shipment_number;

    var new_quantity = 0;
    if(inventory_units.length<quantity){
      url += "/add"
      new_quantity = (quantity - inventory_units.length);
    }else if(inventory_units.length>quantity){
      url += "/remove"
      new_quantity = (inventory_units.length - quantity);
    }
    url += '.json';

    if(new_quantity!=0){
      $.ajax({
        type: "PUT",
        url: Spree.url(url),
        data: { variant_id: variant_id, quantity: new_quantity }
      }).done(function( msg ) {
        
        console.log("adjustShipmentItems")
        $('table.line-items').load(location.href + ' table.line-items')
      });
    }
}

toggleMethodEdit = function(){
  var link = $(this);
  link.parents('tbody').find('tr.edit-method').toggle();
  link.parents('tbody').find('tr.show-method').toggle();

  return false;
}

toggleItemEdit = function(){
  var link = $(this);
  link.parent().find('a.edit-item').toggle();
  link.parent().find('a.cancel-item').toggle();
  link.parent().find('a.split-item').toggle();
  link.parent().find('a.save-item').toggle();
  link.parent().find('a.delete-item').toggle();
  link.parents('tr').find('td.item-qty-show').toggle();
  link.parents('tr').find('td.item-qty-edit').toggle();

  return false;
}

startItemSplit = function(event){
  event.preventDefault();
  var link = $(this);
  link.parent().find('a.edit-item').toggle();
  link.parent().find('a.split-item').toggle();
  link.parent().find('a.delete-item').toggle();
  var variant_id = link.data('variant-id');

  var variant = {};
  $.ajax({
    type: "GET",
    async: false,
    url: Spree.url(Spree.routes.variants_api),
    data: {
      q: {
        "id_eq": variant_id
      }
    }
  }).success(function( data ) {
    variant = data['variants'][0];
  }).error(function( msg ) {
    console.log(msg);
  });

  var max_quantity = link.closest('tr').data('item-quantity');
  var split_item_template = Handlebars.compile($('#variant_split_template').text());
  link.closest('tr').after(split_item_template({ variant: variant, shipments: shipments, max_quantity: max_quantity }));
  $('a.cancel-split').click(cancelItemSplit);
  $('a.save-split').click(completeItemSplit);

  // Add some tips
  $('.with-tip').powerTip({
    smartPlacement: true,
    fadeInTime: 50,
    fadeOutTime: 50,
    intentPollInterval: 300
  });
  $('#item_stock_location').select2({ width: 'resolve', placeholder: Spree.translations.item_stock_placeholder });
}

completeItemSplit = function(event) {
  event.preventDefault();
  var link = $(this);
  var order_number = link.closest('tbody').data('order-number');
  var stock_item_row = link.closest('tr');
  var variant_id = stock_item_row.data('variant-id');
  var quantity = stock_item_row.find('#item_quantity').val();

  var stock_location_id = stock_item_row.find('#item_stock_location').val();
  var original_shipment_number = link.closest('tbody').data('shipment-number');

  var selected_shipment = stock_item_row.find($('#item_stock_location').select2('data').element);
  var target_shipment_number = selected_shipment.data('shipment-number');
  var new_shipment = selected_shipment.data('new-shipment');

  if (stock_location_id != 'new_shipment') {
    // first remove item(s) from original shipment
    $.ajax({
      type: "PUT",
      async: false,
      url: Spree.url(Spree.routes.shipments_api + "/" + original_shipment_number + "/remove.json"),
      data: { variant_id: variant_id, quantity: quantity }
    });

    if (new_shipment != undefined) {
      $.ajax({
        type: "POST",
        async: false,
        url: Spree.url(Spree.routes.shipments_api + "?shipment[order_id]=" + order_number),
        data: { variant_id: variant_id, quantity: quantity, stock_location_id: stock_location_id }
      }).done(function(msg) {
        advanceOrder();
      });
    } else {
      $.ajax({
        type: "PUT",
        async: false,
        url: Spree.url(Spree.routes.shipments_api + "/" + target_shipment_number + "/add.json"),
        data: { variant_id: variant_id, quantity: quantity }
      }).done(function(msg) {
        advanceOrder();
      });
    }
  }
}

advanceOrder = function() {
  $.ajax({
    type: "PUT",
    async: false,
    url: Spree.url(Spree.routes.checkouts_api + "/" + order_number + "/advance")
  }).done(function() {
    
    $('table.line-items').load(location.href + ' table.line-items')
    console.log("AdvanceOrder")
  });
}

cancelItemSplit = function(event) {
  event.preventDefault();
  var link = $(this);
  var prev_row = link.closest('tr').prev();
  link.closest('tr').remove();
  prev_row.find('a.edit-item').toggle();
  prev_row.find('a.split-item').toggle();
  prev_row.find('a.delete-item').toggle();
}

addVariantFromStockLocation = function(event) {
  event.preventDefault();
  console.log('addVariantFromStockLocation');
  $('#stock_details').hide();

  var variant_id = $('input.variant_autocomplete').val();
  var stock_location_id = $(this).data('stock-location-id');
  var quantity = $("input.quantity[data-stock-location-id='" + stock_location_id + "']").val();

  var shipment = _.find(shipments, function(shipment){
    return shipment.stock_location_id == stock_location_id && (shipment.state == 'ready' || shipment.state == 'pending');
  });

    if(shipment==undefined){
      $.ajax({
        type: "POST",
        url: Spree.url(Spree.routes.shipments_api + "?shipment[order_id]=" + order_number),
        data: { variant_id: variant_id, quantity: quantity, stock_location_id: stock_location_id }
      }).done(function( msg ) {
        console.log("done");
        console.log(msg)
       
      }).error(function( msg ) {
        console.log(msg);
      });
    }else{
      //add to existing shipment
      adjustShipmentItems(shipment.number, variant_id, quantity);
    }
  return 1
}
