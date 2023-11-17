# Carbon Aware Scheduler
The Carbon Aware Scheduler is a GitHub Action that can be used to schedule GitHub workflows to run at low carbon intesity periods, making use of the Carbon Aware WebApi 

## Usage
The GitHub Action can be used in an initial setup workflow to schedule other workflows to run at the lowest carbon intense time in the next 24hrs. This makes use of a templating structure, where the workflows that are to be scheduled are added into a template folder, where they can be automatically scheduled with the output of the action.  

```yaml
  - uses: jhcoll/carbon-aware-schedule-action@v1
    with:
        # Region to check carbon intensity for - can be any azure region - however if using github hosted runners will be one of the following - 'eastus, eastus2, westus2, centralus, southcentralus'
        region: 'eastus'
        # path to template job to be scheduled
        template-paths: 'templates/template.yml'  # For multiple paths, seperate with ',' e.g. 'templates/template1.yml, templates/template2.yml'
        # Time to check until - In format YYYY-MM-DDThh:mm:ssZ
        end-time: '2023-11-16T11:00:00Z' # Optional - defaults to +24hr
        # Estimated job length in minutes
        estimated-job-length: '10' # Optional - defaults to 10
        # Output path for scheduled jobs
        output-path: '.github/workflows/' # Optional - defaults to ".github/workflows/"
```

### Example usage
This action can be used in a workflow as shown below, where an initial workflow is used to generate the scheduled job, then commit this job to the codebase.

```yaml
name: Schedule Job using Carbon Aware API

on: 
  pull_request:
    branches: 
     - 'main'
    types: 
     - 'closed'

jobs:
  schedule-job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: jhcoll/carbon-aware-schedule-action@v1
        with:
            region: 'eastus'
            template-paths: 'templates/template.yml'
      - name: Commit scheduled workflow
        run: | # A PAT will be required with workflow permissions to be able to create a new workflow, see the [Docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
           git config --global user.name 'Your Name'
           git config --global user.email 'your-username@users.noreply.github.com'
           git remote set-url origin https://x-access-token:${{ secrets.PAT }}@github.com/$GITHUB_REPOSITORY
           git checkout "${GITHUB_REF:11}"
           git add .github/workflows/template.yml
           git commit -m "scheduled workflow"
           git push
```