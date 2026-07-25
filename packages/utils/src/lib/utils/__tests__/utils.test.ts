import fs from 'fs';
import os from 'os';
import path from 'path';
import { getFilePathesByGlob, prettifyCode, readFile, writeFile } from '../index';

describe('utils', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'neargen-utils-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('writeFile / readFile', () => {
    it('writes a file and reads it back', () => {
      const filePath = path.join(tmpDir, 'sample.txt');
      writeFile(filePath, 'hello world');

      expect(fs.existsSync(filePath)).toBe(true);
      expect(readFile(filePath)).toBe('hello world');
    });

    it('creates missing nested directories', () => {
      const filePath = path.join(tmpDir, 'nested', 'deep', 'sample.txt');
      writeFile(filePath, 'data');

      expect(readFile(filePath)).toBe('data');
    });
  });

  describe('getFilePathesByGlob', () => {
    it('resolves files matching the glob pattern', async () => {
      writeFile(path.join(tmpDir, 'a.abi.json'), '{}');
      writeFile(path.join(tmpDir, 'b.abi.json'), '{}');
      writeFile(path.join(tmpDir, 'c.txt'), 'nope');

      const files = await getFilePathesByGlob(path.join(tmpDir, '**/*.abi.json'));

      expect(files.map((f) => path.basename(f)).sort()).toEqual(['a.abi.json', 'b.abi.json']);
    });

    it('resolves an empty array when nothing matches', async () => {
      const files = await getFilePathesByGlob(path.join(tmpDir, '**/*.nomatch'));
      expect(files).toEqual([]);
    });
  });

  describe('prettifyCode', () => {
    it('formats code with single quotes and no semicolons', () => {
      const result = prettifyCode('const   x="a";');
      expect(result).toBe("const x = 'a'\n");
    });
  });
});
