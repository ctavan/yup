import { SynchronousPromise } from 'synchronous-promise';

import { object, string } from '../src';

describe('Sync', () => {
  it('should validate', () => {
    const schema = object().shape({
      name: string().required(),
      email: string().email(),
    });
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    let result, error;
    schema.validate(data, {
      sync: true,
    }).then((res) => {
      result = res;
    }).catch((err) => {
      error = err;
    });

    expect(result).to.deep.equal(data);
    expect(error).to.be.undefined;
  });

  it('should throw', () => {
    const schema = object().shape({
      email: string().email(),
    });
    const data = {
      email: 'johnexample.com',
    };

    let result, error;
    schema.validate(data, {
      sync: true,
    }).then((res) => {
      result = res;
    }).catch((err) => {
      error = err;
    });

    expect(result).to.be.undefined;
    expect(error.name).to.equal('ValidationError');
    expect(error.path).to.equal('email');
  });
});
