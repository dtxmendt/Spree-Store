class AddStateToReports < ActiveRecord::Migration
  def change
    add_column :reports, :state, :string

  end
end
