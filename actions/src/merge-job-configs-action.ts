import * as core from "@actions/core";

import { mergeJobConfigs } from "./merge-job-configs.js";

async function run() {
  const jobConfigsGlobPath = core.getInput("job-configs-glob-path", { required: true });
  const targetChartPath = core.getInput("target-chart-path", { required: true });
  await mergeJobConfigs(jobConfigsGlobPath, targetChartPath);
}

async function runWrapper() {
  try {
    await run();
  } catch (error) {
    core.setFailed(`merge-job-configs action failed: ${error}`);
    console.log(error); // eslint-disable-line no-console
  }
}

void runWrapper();
