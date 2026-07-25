import { NearContractAbi } from '@neargen-js/core';
import { getContractTypeDefinition } from '../templates/contract';
import { getViewFunctionDefinition, getCallFunctionDefinition } from '../templates/functions';
import { getFullDefinitionFromAbi } from '../templates/definition';
import { generateIndexFile } from '../templates/imports';

const abi: NearContractAbi = {
  contractName: 'HelloNear',
  methods: {
    view: [
      { name: 'get_greeting', returnType: { type: 'string', name: 'return', isArray: false } },
      {
        name: 'greet',
        args: { type: { message: { type: 'string', name: 'message', isOptional: false } } },
        returnType: { type: 'string', name: 'return', isArray: false },
      },
    ],
    call: [
      {
        name: 'set_greeting',
        isPayable: false,
        isPrivate: false,
        args: { type: { message: { type: 'string', name: 'message', isOptional: false } } },
      },
      { name: 'admin_only', isPayable: false, isPrivate: true },
      { name: 'deposit', isPayable: true, isPrivate: false },
    ],
  },
  byteCode: '',
};

describe('getViewFunctionDefinition', () => {
  it('keeps the on-chain method name for both the exposed and contract method name', () => {
    // Method names are emitted verbatim; camelCase is only used for type names.
    const def = getViewFunctionDefinition(abi, abi.methods.view[0]);
    expect(def.fnName).toBe('get_greeting');
    expect(def.contractMethodName).toBe('get_greeting');
  });

  it('produces a Promise-wrapped primitive return signature with no args', () => {
    const def = getViewFunctionDefinition(abi, abi.methods.view[0]);
    expect(def.hasArgs).toBe(false);
    expect(def.signature).toBe('(): Promise<string>');
  });

  it('builds a named Input type when the view has args', () => {
    const def = getViewFunctionDefinition(abi, abi.methods.view[1]);
    expect(def.hasArgs).toBe(true);
    expect(def.argsType?.name).toBe('HelloNearGreetInput');
    expect(def.signature).toBe('(args: HelloNearGreetInput): Promise<string>');
  });
});

describe('getCallFunctionDefinition', () => {
  it('adds overrides and returns FinalExecutionOutcome', () => {
    const def = getCallFunctionDefinition(abi, abi.methods.call[0]);
    expect(def.signature).toBe(
      '(args: HelloNearSetGreetingInput, overrides?: CallOverrides): Promise<FinalExecutionOutcome>',
    );
    expect(def.isPrivate).toBe(false);
  });

  it('adds the payable overrides intersection for payable calls', () => {
    const def = getCallFunctionDefinition(abi, abi.methods.call[2]);
    expect(def.signature).toBe(
      '( overrides?: CallOverrides & CallOverridesPayable): Promise<FinalExecutionOutcome>',
    );
    expect(def.isPayable).toBe(true);
  });

  it('flags private calls', () => {
    const def = getCallFunctionDefinition(abi, abi.methods.call[1]);
    expect(def.isPrivate).toBe(true);
  });
});

describe('getContractTypeDefinition', () => {
  it('emits a class extending NearContractBase with a connect method', () => {
    const { contract } = getContractTypeDefinition(abi);
    expect(contract).toContain('class HelloNear extends NearContractBase');
    expect(contract).toContain('public connect(account: IAccount): HelloNear');
  });

  it('emits public view/call methods and groups private calls under privateCall', () => {
    const { contract } = getContractTypeDefinition(abi);
    expect(contract).toContain('public get_greeting');
    expect(contract).toContain('public async set_greeting');
    expect(contract).toContain('public privateCall = {');
    expect(contract).toContain("Signer is not a contract");
  });
});

describe('getFullDefinitionFromAbi', () => {
  it('includes imports, exported types, the class and a default export', () => {
    const out = getFullDefinitionFromAbi(abi);
    expect(out).toContain("import { FinalExecutionOutcome } from 'near-api-js/lib/providers';");
    expect(out).toContain('export type HelloNearSetGreetingInput');
    expect(out).toContain('export default HelloNear;');
  });
});

describe('generateIndexFile', () => {
  it('re-exports each generated contract', () => {
    const out = generateIndexFile(['HelloNear', 'Counter']);
    expect(out).toContain("import HelloNear from './HelloNear';");
    expect(out).toContain("import Counter from './Counter';");
    expect(out).toContain('export {HelloNear,\nCounter }');
  });
});
