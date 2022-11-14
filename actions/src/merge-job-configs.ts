import * as fs from "fs/promises";
import { globby } from "globby";
import * as path from "path";
import * as YAML from "yaml";

import { getJobsAlias } from "./chart-utils.js";

export async function mergeJobConfigs(jobConfigsGlobPath: string, targetChartPath: string) {
  const jobsAlias = await getJobsAlias(targetChartPath);
  const valuesFilePath = path.join(targetChartPath, "values.yaml");
  const valuesFileData = await fs.readFile(valuesFilePath, "utf-8");

  const document = YAML.parseDocument(valuesFileData);
  const jobsNode = document.get(jobsAlias);

  if (!YAML.isMap(jobsNode)) {
    throw new Error(`Invalid values file ${valuesFilePath}: expected '${jobsAlias}' node to be a map`);
  }

  const jobs = new YAML.YAMLSeq();
  const jobsConfigPaths = await globby(jobConfigsGlobPath);
  for (const jobsConfigPath of jobsConfigPaths) {
    const jobsConfigFileData = await fs.readFile(jobsConfigPath, "utf-8");
    const jobsConfigDocument = YAML.parseDocument(jobsConfigFileData);
    const possibleJobsToMerge = jobsConfigDocument.get("jobs");

    if (!YAML.isSeq(possibleJobsToMerge)) {
      throw new Error(`Invalid job config file ${jobsConfigPath}: expected 'jobs' node to be a sequence`);
    }
    const jobsToMerge = possibleJobsToMerge as YAML.YAMLSeq;

    for (const jobToMerge of jobsToMerge.items as YAML.YAMLMap[]) {
      if (!(jobToMerge.has("name") || jobToMerge.has("fullnameOverride"))) {
        if (jobsToMerge.items.length > 1) {
          throw new Error(
            `Invalid job config file ${jobsConfigPath}: expected 'name' or 'fullnameOverride' keys \
if more then one job is defined`,
          );
        } else {
          const jobName = path.basename(path.dirname(jobsConfigPath)).replace(/_/g, "-");
          jobToMerge.items.splice(0, 0, new YAML.Pair(new YAML.Scalar("name"), new YAML.Scalar(jobName)));
        }
      }

      jobToMerge.spaceBefore = true;
      jobs.items.push(jobToMerge);
    }
  }

  if (jobs.items.length > 0) {
    (jobs.items[0] as YAML.YAMLMap).spaceBefore = false;
  }

  jobsNode.set("jobs", jobs);
  document.set(jobsAlias, jobsNode);

  await fs.writeFile(valuesFilePath, document.toString());
}
