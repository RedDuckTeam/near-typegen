<p align="center">
  <a href="https://redduck.io">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset=".github/assets/redduck-logo-dark.svg">
      <img src=".github/assets/redduck-logo.svg" alt="RedDuck" width="240">
    </picture>
  </a>
</p>

<h1 align="center">neargen-js</h1>

<p align="center">
  <b>Typed NEAR contracts, end to end — from your TypeScript contract to a fully typed client.</b>
</p>

---

Writing a NEAR frontend usually means calling contract methods by string name, passing untyped
argument objects and hoping the response looks like you expect. `neargen-js` removes the guesswork:

```
contract.ts  ──abigen──▶  HelloNear.abi.json  ──typegen──▶  HelloNear.ts  ──▶  fully typed calls
```

1. **abigen** reads your `near-sdk-js` contract and extracts an ABI from the `@view` / `@call` decorators.
2. **typegen** turns that ABI into a TypeScript class with real method names, argument types and return types.
3. You call the contract like a normal object — autocomplete and type errors included.

## Built with

| Area | Technology |
| --- | --- |
| Monorepo | npm workspaces |
| Language | TypeScript |
| ABI extraction | `ts-morph`, `near-sdk-js`, `commander` |
| Type generation | `near-api-js`, `commander` |
| Runtime | `@near-wallet-selector/core`, `near-api-js` |
| Testing | Jest, ts-jest |
| Tooling | ESLint, Prettier |
| CI | GitHub Actions |

## Packages

| Package                                              | Description                                                            | Version                                                                                                           |
| ---------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [`@neargen-js/abigen`](./packages/abigen/README.md)   | Extracts ABIs from NEAR contracts written in TypeScript                | ![npm](https://img.shields.io/npm/v/@neargen-js/abigen?label=%20)                                                   |
| [`@neargen-js/typegen`](./packages/typegen/README.md) | Generates TypeScript contract definitions from those ABIs              | ![npm](https://img.shields.io/npm/v/@neargen-js/typegen?label=%20)                                                  |
| [`@neargen-js/core`](./packages/core/README.md)       | Runtime base classes & types used by the generated code (+ ABI schema) | ![npm](https://img.shields.io/npm/v/@neargen-js/core?label=%20)                                                     |
| [`@neargen-js/utils`](./packages/utils/README.md)     | Shared helpers for `abigen` and `typegen`                              | ![npm](https://img.shields.io/npm/v/@neargen-js/utils?label=%20)                                                    |

> `abigen` and `typegen` were previously published as
> [`near-abigen-js`](https://github.com/RedDuck-Software/near-abigen-js) and
> [`typechain-near`](https://github.com/RedDuck-Software/typechain-near). Both now live here.

## Quick start

Install the generators where your contract lives, and `core` where your app runs:

```bash
npm install --save-dev @neargen-js/abigen @neargen-js/typegen
npm install @neargen-js/core
```

**1. Write a contract as usual**

```ts
import { NearBindgen, near, call, view } from 'near-sdk-js';

@NearBindgen({})
class HelloNear {
  message: string = 'Hello';

  @view({})
  get_greeting(): string {
    return this.message;
  }

  @call({})
  set_greeting({ message }: { message: string }): void {
    near.log(`Saving greeting ${message}`);
    this.message = message;
  }
}
```

**2. Generate the ABI, then the types**

```bash
npx neargenjs-abigen  -c './src/contracts/**/*.ts' -o './abis/'
npx neargenjs-typegen -a './abis/**/*.abi.json'    -o './src/contracts/'
```

**3. Call the contract with full type safety**

```ts
import { WalletAccount } from '@neargen-js/core';
import { HelloNear } from './contracts';

const account = new WalletAccount(wallet.account, wallet.getJsonRpcProvider(), wallet.wallet);
const contract = new HelloNear(CONTRACT_ADDRESS, account);

const greeting = await contract.get_greeting();               // Promise<string>
await contract.set_greeting({ message: 'gm' });               // typed args
await contract.set_greeting({ message: 'gm' }, { gas: 3e13 }); // optional overrides
```

Wrong method name, missing argument or mistyped value? TypeScript catches it before you ever hit the RPC.

A complete runnable setup (contract + CRA frontend) lives in [examples/ts-cra](./examples/ts-cra).

## CLI reference

### `neargenjs-abigen`

| Flag                | Description                     | Default                    |
| ------------------- | ------------------------------- | -------------------------- |
| `-c, --contracts`   | Glob pattern of contract files  | `./src/contracts/**/*.ts`  |
| `-o, --output`      | Output folder for ABI files     | `./abis/`                  |

### `neargenjs-typegen`

| Flag             | Description                       | Default                    |
| ---------------- | --------------------------------- | -------------------------- |
| `-a, --abis`     | Glob pattern of ABI files         | `./abis/**/*.abi.json`     |
| `-o, --output`   | Output folder for generated types | `./neargen-types/`         |

> **Frontend note:** `typegen` needs `fs`, so keep it in `devDependencies` and ship
> `@neargen-js/core` as a regular dependency — that's the only package the generated code imports at runtime.

## ABI format

```ts
{
  contractName: string;             // name of the smart contract
  methods: {
    view: NearFunctionView[];       // read-only methods
    call: NearFunctionCall[];       // state-changing methods
  };
  byteCode: string;                 // contract bytecode (not implemented yet)
}
```

Full type definitions: [`packages/core/src/lib/abi`](./packages/core/src/lib/abi/index.ts).

### Current limitation

A contract method may take **one object parameter**. Positional parameters are not supported yet
and will produce an incorrect ABI:

```ts
@call({})
public some_method({ someValue }: { someValue: string }) {} // ok

@call({})
public some_method(someValue: string) {}                    // wrong
```

## Development

This is an npm-workspaces monorepo (Node 18+).

```bash
npm install
npm run build      # builds utils → core → abigen → typegen, in that order
npm test           # Jest across all packages
npm run lint
npm run format
```

| Command                | What it does                                |
| ---------------------- | ------------------------------------------- |
| `npm run build`        | Build every package in dependency order     |
| `npm test`             | Run the test suite                          |
| `npm run test:watch`   | Run tests in watch mode                     |
| `npm run test:coverage`| Run tests with a coverage report            |
| `npm run lint`         | ESLint every package                        |
| `npm run format`       | Prettier every package                      |

To work on a single package, use the scoped scripts — e.g. `npm run build:typegen`, `npm run lint:core`.

## Contributing

Issues and pull requests are welcome — open one at
[RedDuck-Software/near-typegen](https://github.com/RedDuck-Software/near-typegen/issues).
Please make sure `npm run build`, `npm run lint` and `npm test` pass before submitting.

## License
[MIT](LICENSE) © RedDuck Limited