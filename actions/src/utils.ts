import del from "del";
import * as fs from "fs";
import * as _glob from "glob";
import * as os from "os";
import * as path from "path";

export function glob(pattern: string, options?: _glob.IOptions): Promise<string[]> {
  return new Promise((resolve, reject) => {
    _glob.glob(pattern, options, (err, files) => (err === null ? resolve(files) : reject(err)));
  });
}

export async function withTmpDir<T>(body: (tmpDir: string) => Promise<T>): Promise<T> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "codeql-action-"));
  const realSubdir = path.join(tmpDir, "real");
  fs.mkdirSync(realSubdir);
  const symlinkSubdir = path.join(tmpDir, "symlink");
  fs.symlinkSync(realSubdir, symlinkSubdir, "dir");
  const result = await body(symlinkSubdir);
  await del(tmpDir, { force: true });
  return result;
}
