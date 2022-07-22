import * as fs from "fs/promises";
import * as path from "path";
import * as YAML from "yaml";

interface Dependency {
  name: string;
  version: string;
  repository: string;
  alias?: string;
}

export async function getJobsAlias(chartPath: string): Promise<string> {
  const valuesFilePath = path.join(chartPath, "Chart.yaml");
  const chartFileData = await fs.readFile(valuesFilePath, "utf-8");
  const document = YAML.parse(chartFileData);
  if (document.dependencies === undefined) {
    throw new Error(`Invalid chart file ${valuesFilePath}: no 'dependencies' node`);
  }

  const jobsDependencyNodes = document.dependencies.filter(
    (dependency: Dependency) =>
      dependency.name === "jobs" && dependency.repository === "http://chartmuseum.apps.rtbhouse.net/",
  );

  if (jobsDependencyNodes.length === 0) {
    throw new Error(`Invalid chart file ${valuesFilePath}: no 'jobs' dependency`);
  } else if (jobsDependencyNodes.length > 1) {
    throw new Error(`Invalid chart file ${valuesFilePath}: multiple 'jobs' dependencies`);
  }

  return jobsDependencyNodes[0].alias || "jobs";
}
