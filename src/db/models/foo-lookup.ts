import { Model, DataTypes } from 'sequelize';
import { dbSequelize as sequelize } from './sequelize';
export class FooLookUp extends Model {
  public numericCode!: number;
  public countryCode!: number;
  public name!: string;
  public alpha2Code!: string;
  public alpha3Code!: string;
  public geoId!: number;
  public isPaymentCountry!: boolean;
  public uniqueCodeEUR!: number;
}

FooLookUp.init(
  {
    numericCode: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alpha2Code: {
      type: DataTypes.CHAR(2),
      allowNull: false,
    },
    alpha3Code: {
      type: DataTypes.CHAR(3),
      allowNull: false,
    },
    geoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    isPaymentCountry: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    uniqueCodeEUR: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    tableName: 'country_lookup',
    timestamps: true,
    freezeTableName: true,
  },
);

export default FooLookUp;
