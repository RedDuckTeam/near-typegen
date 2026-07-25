import fs from 'fs';
import os from 'os';
import path from 'path';
import { NearContractAbi } from '@neargen-js/core';
import { parseTsFile } from '../index';

const CONTRACT_PATH = path.resolve(__dirname, '../../../contracts/test_contract.ts');

describe('parseTsFile', () => {
  let outDir: string;
  let abi: NearContractAbi;

  beforeAll(async () => {
    outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'neargen-abigen-'));
    await parseTsFile({ tsFilesPath: CONTRACT_PATH, abisOutputPath: outDir });
    abi = JSON.parse(fs.readFileSync(path.join(outDir, 'TestContract.abi.json'), 'utf-8'));
  });

  afterAll(() => {
    fs.rmSync(outDir, { recursive: true, force: true });
  });

  it('writes an abi file named after the @NearBindgen contract class', () => {
    expect(abi.contractName).toBe('TestContract');
  });

  it('ignores classes without the @NearBindgen decorator', () => {
    // Only TestContract is a contract; SomeClass / NestedClass etc. must be skipped.
    const files = fs.readdirSync(outDir);
    expect(files).toEqual(['TestContract.abi.json']);
  });

  it('collects all @view methods', () => {
    const viewNames = abi.methods.view.map((m) => m.name).sort();
    expect(viewNames).toEqual(
      [
        'test_view_explicit_return',
        'test_view_implicit_return',
        'test_view_return_class',
        'test_view_return_class_array',
        'test_view_return_class_with_nesting',
        'test_view_with_primitive_return',
        'test_view_with_primitive_return_array',
        'test_view_with_return_void',
      ].sort(),
    );
  });

  it('collects @call methods and appends the @initialize method as a call', () => {
    const callNames = abi.methods.call.map((m) => m.name);
    expect(callNames).toContain('test_call_private');
    expect(callNames).toContain('test_call_payable_with_implicit_return');
    expect(callNames).toContain('test_initializer_method');
  });

  it('marks the initializer method with isInitializer', () => {
    const initializer = abi.methods.call.find((m) => m.name === 'test_initializer_method');
    expect(initializer?.isInitializer).toBe(true);
  });

  it('reads payable / private flags from the @call decorator arguments', () => {
    const priv = abi.methods.call.find((m) => m.name === 'test_call_private');
    const payable = abi.methods.call.find((m) => m.name === 'test_call_payable_with_implicit_return');

    expect(priv?.isPrivate).toBe(true);
    expect(priv?.isPayable).toBe(false);
    expect(payable?.isPayable).toBe(true);
    expect(payable?.isPrivate).toBe(false);
  });

  it('resolves primitive argument types', () => {
    const explicit = abi.methods.view.find((m) => m.name === 'test_view_explicit_return');
    expect(explicit?.args?.type).toMatchObject({ a: { type: 'string' } });
  });

  it('resolves primitive view return types', () => {
    const view = abi.methods.view.find((m) => m.name === 'test_view_with_primitive_return');
    expect(view?.returnType?.type).toBe('string');
    expect(view?.returnType?.isArray).toBe(false);
  });

  it('flags array return types', () => {
    const view = abi.methods.view.find((m) => m.name === 'test_view_with_primitive_return_array');
    expect(view?.returnType?.type).toBe('string');
    expect(view?.returnType?.isArray).toBe(true);
  });

  it('resolves class return types into nested object shapes', () => {
    const view = abi.methods.view.find((m) => m.name === 'test_view_return_class');
    // SomeClass has a single `testField: string` property.
    expect(view?.returnType?.type).toMatchObject({ testField: { type: 'string' } });
  });

  it('throws on duplicated contract names across files', async () => {
    const srcDir = fs.mkdtempSync(path.join(os.tmpdir(), 'neargen-abigen-dup-src-'));
    const outDup = fs.mkdtempSync(path.join(os.tmpdir(), 'neargen-abigen-dup-out-'));

    const contract = `import { NearBindgen, call } from 'near-sdk-js';
@NearBindgen({})
export class Dup {
  @call({}) foo() {}
}`;
    fs.writeFileSync(path.join(srcDir, 'a.ts'), contract);
    fs.writeFileSync(path.join(srcDir, 'b.ts'), contract);

    await expect(
      parseTsFile({ tsFilesPath: path.join(srcDir, '*.ts'), abisOutputPath: outDup }),
    ).rejects.toContain('Duplicated contract name');

    fs.rmSync(srcDir, { recursive: true, force: true });
    fs.rmSync(outDup, { recursive: true, force: true });
  });
});
