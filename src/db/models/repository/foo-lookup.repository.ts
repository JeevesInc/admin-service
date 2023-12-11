import { FooLookUp } from '@models';

export const getAllFoo = () =>
  FooLookUp.findAll({
    attributes: ['numericCode', 'name', 'alpha3Code'],
  });

export const createFoo = (data) => FooLookUp.create(data);
