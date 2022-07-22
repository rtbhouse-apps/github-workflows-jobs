import test from "ava";
import * as fs from "fs/promises";
import * as path from "path";

import { mergeJobConfigs } from "./merge-job-configs";
import * as utils from "./utils";

test("mergeJobConfigs", async (t) => {
  await utils.withTmpDir(async (tmpDir: string) => {
    await fs.copyFile(path.join(__dirname, "testdata/existing-chart/Chart.yaml"), path.join(tmpDir, "Chart.yaml"));
    await fs.copyFile(path.join(__dirname, "testdata/existing-chart/values.yaml"), path.join(tmpDir, "values.yaml"));

    await mergeJobConfigs(path.join(__dirname, "testdata/**/job.yaml"), tmpDir);

    const targeValuesFileData = await fs.readFile(path.join(tmpDir, "values.yaml"), "utf-8");
    const toCompareValuesFileData = await fs.readFile(
      path.join(__dirname, "testdata/expected-result/values.yaml"),
      "utf-8",
    );

    t.deepEqual(targeValuesFileData, toCompareValuesFileData);
  });
});

test("mergeInvalidJobConfigs", async (t) => {
  await utils.withTmpDir(async (tmpDir: string) => {
    await fs.copyFile(path.join(__dirname, "testdata/existing-chart/Chart.yaml"), path.join(tmpDir, "Chart.yaml"));
    await fs.copyFile(path.join(__dirname, "testdata/existing-chart/values.yaml"), path.join(tmpDir, "values.yaml"));

    await t.throwsAsync(mergeJobConfigs(path.join(__dirname, "testdata/**/invalid-job.yaml"), tmpDir), {
      message: new RegExp(
        "^Invalid job config file .+: expected 'name' or 'fullnameOverride' keys if more then one job is defined$",
      ),
    });
  });
});
