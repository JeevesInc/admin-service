import { Consumer } from 'sqs-consumer';
import { exampleConsumer } from '../example-consumer';

const consumerCreateSpy = jest
  .spyOn(Consumer, 'create')
  .mockReturnValue({ on: jest.fn() } as never);

describe('Example consumer', () => {
  it('should create a consumer', () => {
    expect(exampleConsumer).toBeDefined();
    consumerCreateSpy.mockRestore();
  });
});
