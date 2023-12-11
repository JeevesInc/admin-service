import { getAllFoo, createFoo } from '@repositories';

export const getAllFooLookUp = () => getAllFoo();

export const createFooLookUp = (lookupInput) => createFoo(lookupInput);
