odoo.define('payment.transaction', function (require) {
"use strict";

var ajax = require('web.ajax');

$(document).ready(function () {
    // When choosing an acquirer, display its Pay Now button
    var $payment = $("#payment_method");
    $payment.on("click", "input[name='acquirer'], a.btn_payment_token", function (ev) {
            var ico_off = 'fa-circle-o';
            var ico_on = 'fa-dot-circle-o';

            var payment_id = $(ev.currentTarget).val() || $(this).data('acquirer');
            var token = $(ev.currentTarget).data('token') || '';

            $("div.o_payment_acquirer_button[data-id='"+payment_id+"']", $payment).attr('data-token', token);
            $("div.js_payment a.list-group-item").removeClass("list-group-item-info");
            $('span.js_radio').switchClass(ico_on, ico_off, 0);
            if (token) {
              $("div.o_payment_acquirer_button div.token_hide").hide();
              $(ev.currentTarget).find('span.js_radio').switchClass(ico_off, ico_on, 0);
              $(ev.currentTarget).parents('li').find('input').prop("checked", true);
              $(ev.currentTarget).addClass("list-group-item-info");
            }
            else{
              $("div.o_payment_acquirer_button div.token_hide").show();
            }
            $("div.o_payment_acquirer_button[data-id]", $payment).addClass("hidden");
            $("div.o_payment_acquirer_button[data-id='"+payment_id+"']", $payment).removeClass("hidden");

    })
    .find("input[name='acquirer']:checked").click();

    // When clicking on payment button: create the tx using json then continue to the acquirer
    $payment.on("click", 'button[type="submit"], button[name="submit"]', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var $form = $(ev.currentTarget).parents('form');
      var acquirer = $(ev.currentTarget).parents('div.o_payment_acquirer_button').first();
      var tx_data = acquirer.data();
      if (! tx_data.id || ! tx_data.callUrl) {
        return false;
      }

      var params = {"tx_type": tx_data.txType || acquirer.find('input[name="odoo_save_token"]').is(':checked') ? 'form_save': 'form'};
      var acquirer_token = acquirer.attr('data-token'); // !=data
      if (acquirer_token) {
        params.token = acquirer_token;
      }
      if (tx_data.access_token) {
        params.access_token = tx_data.access_token;
      }
      $form.off('submit');
      ajax.jsonRpc(tx_data.callUrl, 'call', params).then(function (data) {
          $(data).appendTo('body').submit();
      });
      return false;
    });

    $('div.oe_pay_token').on('click', 'a.js_btn_valid_tx', function() {
      $('div.js_token_load').toggle();

      var $form = $(this).parents('form');
      ajax.jsonRpc($form.attr('action'), 'call', $.deparam($form.serialize())).then(function (data) {
        if (data.url) {
          window.location = data.url;
        }
        else {
          $('div.js_token_load').toggle();
          if (!data.success && data.error) {
            $('div.oe_pay_token div.panel-body p').html(data.error + "<br/><br/>" + _('Retry ? '));
            $('div.oe_pay_token div.panel-body').parents('div').removeClass('panel-info').addClass('panel-danger');
          }
        }
      });

    });

});

});
