import { isPrimitive, parseAbi, NearContractAbi } from '../index';

describe('isPrimitive', () => {
  it.each(['string', 'number', 'boolean', 'void', 'unknown'])('returns true for primitive %p', (type) => {
    expect(isPrimitive(type as never)).toBe(true);
  });

  it.each(['SomeType', 'object', '', 'any'])('returns false for non-primitive %p', (type) => {
    expect(isPrimitive(type as never)).toBe(false);
  });
});

describe('parseAbi', () => {
  it('parses a valid ABI json into an object', () => {
    const abi: NearContractAbi = {
      contractName: 'HelloNear',
      methods: {
        view: [{ name: 'get_greeting', returnType: { type: 'string', name: 'return' } }],
        call: [{ name: 'set_greeting', isPayable: false, isPrivate: false }],
      },
      byteCode: '',
    };

    const parsed = parseAbi(JSON.stringify(abi));

    expect(parsed).toEqual(abi);
    expect(parsed.contractName).toBe('HelloNear');
    expect(parsed.methods.view).toHaveLength(1);
    expect(parsed.methods.call).toHaveLength(1);
  });

  it('throws on malformed json', () => {
    expect(() => parseAbi('{ not valid json')).toThrow();
  });
});
