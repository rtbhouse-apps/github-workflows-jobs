import { deleteAsync } from "del";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export async function withTmpDir<T>(body: (tmpDir: string) => Promise<T>): Promise<T> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "codeql-action-"));
  const realSubdir = path.join(tmpDir, "real");
  fs.mkdirSync(realSubdir);
  const symlinkSubdir = path.join(tmpDir, "symlink");
  fs.symlinkSync(realSubdir, symlinkSubdir, "dir");
  const result = await body(symlinkSubdir);
  await deleteAsync(tmpDir, { force: true });
  return result;
}
