const core = require('@actions/core');
const fs = require("fs");

const REGION = core.getInput('region') != '' ? core.getInput('region') : 'eastus';
const REPO_DIRECTORY = process.env.GITHUB_WORKSPACE != undefined ? process.env.GITHUB_WORKSPACE : '.';
const TEMPLATE_PATHS = core.getInput('template-paths') != '' ? core.getInput('template-paths').replace(" ", "").split(",") : [`templates/template.yml`];
const OUTPUT_PATH = core.getInput('output-path') != '' ? core.getInput('output-path') : [`.github/workflows/`];
const JOB_LENGTH = core.getInput('estimated-job-length') != '' ? core.getInput('estimated-job-length') : 10;

(async () => {
  try {
    endTime = core.getInput('end-time');
    startTime = new Date();

    if(endTime == '') {
      endTime = new Date()
      endTime.setDate(startTime.getDate() + 1);
    } else {
      endTime = new Date(endTime);
    }

    searchParams = new URLSearchParams({
      location: REGION,
      dateStartAt: startTime.toISOString().replace(/\.[0-9]{3}/, ''),
      dataEndAt: endTime.toISOString().replace(/\.[0-9]{3}/, ''),
      windowSize: JOB_LENGTH
    })

    core.debug('Search Params Used: ' + searchParams);

    core.info("Getting schedule time with: https://carbon-aware-api.azurewebsites.net/emissions/forecasts/current?" + searchParams);

    data = await fetch("https://carbon-aware-api.azurewebsites.net/emissions/forecasts/current?" + searchParams,
    {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    })
    .then(async (res) => {
      if(res.status !== 200) {
          core.warning("Failed to get data: ", await res.text());
        throw Error(res.statusText);
      }
      return res.json()
    });

    timestamp = new Date(data[0].optimalDataPoints[0].timestamp);
    core.debug('Workflow to be scheduled at: ' + timestamp);

    cron = dateToCron(timestamp);
    updatedFiles = await writeSchedule(cron);

    core.debug('Jobs to be scheduled: ' + updatedFiles);
    core.setOutput("schedules-workflows", updatedFiles);
    core.setOutput("scheduled-time", timestamp);

  } catch (error) {
    core.setFailed(error.message);
  }
})();

const dateToCron = (date) => {
  const minutes = date.getMinutes();
  const hours = date.getHours();
  const days = date.getDate();
  const months = date.getMonth() + 1;
  const dayOfWeek = date.getDay();

  return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
};

const writeSchedule = (cron) => {
  updatedFiles = [];
  for (filePath of TEMPLATE_PATHS) {
    try{
      const filename = filePath.split('/').pop();
      const data = fs.readFileSync(`${REPO_DIRECTORY}/${filePath}`, 'utf8');
      const result = data.replace(/\$schedule\$/g, cron);
      fs.writeFileSync(`${REPO_DIRECTORY}/${OUTPUT_PATH}/${filename}`, result, 'utf8');
      updatedFiles.push(`${OUTPUT_PATH}/${filename}`);
    } catch(err) {
      core.warning(`Could not schedule ${filePath}`);
      core.setFailed(err);
    }
  }
  return updatedFiles;
};
