module Spree
  module Admin
    module StockMovementsHelper
      def pretty_originator(stock_movement)
        if stock_movement.originator.respond_to?(:number)
          if stock_movement.originator.respond_to?(:order)
            link_to stock_movement.originator.number, [:edit, :admin, stock_movement.originator.order], :target => "_blank"
          else
            stock_movement.originator.number
          end
        else
          ""
        end
      end
        
      def type_movement(stock_movement)
        if stock_movement.originator.respond_to?(:number)
          if stock_movement.originator.respond_to?(:order)
            Spree.t(:order)
          else
            Spree.t(:stock_transfer)
          end
        else
          Spree.t(:enter_stock_location)
        end
      end

      def display_variant(stock_movement)
        variant = stock_movement.stock_item.variant
        output = variant.name
        output += "<br>(#{variant.options_text})" unless variant.options_text.blank?
        output.html_safe
      end
    end
  end
end