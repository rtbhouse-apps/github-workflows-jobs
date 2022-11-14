import test from "ava";
import * as path from "path";
import { fileURLToPath } from "url";

import { getJobsAlias } from "./chart-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("getJobsAlias", async (t) => {
  const appAlias = await getJobsAlias(path.join(__dirname, "testdata/charts/chart-valid-with-alias"));

  t.is(appAlias, "jobik");
});

test("getJobsAliasDefault", async (t) => {
  const appAlias = await getJobsAlias(path.join(__dirname, "testdata/charts/chart-valid-no-alias"));

  t.is(appAlias, "jobs");
});

test("getJobsAliasInvalidChart", async (t) => {
  await t.throwsAsync(getJobsAlias(path.join(__dirname, "testdata/charts/chart-invalid-no-dependencies")), {
    message: new RegExp("^Invalid chart file .+: no 'jobs' dependency$"),
  });
});
