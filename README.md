# Carbon Aware Scheduler
The Carbon Aware Scheduler is a GitHub Action that can be used to schedule GitHub workflows to run at low carbon intesity periods, making use of the Carbon Aware WebApi 

## Usage
The GitHub Action can be used in an initial setup workflow to schedule other workflows to run at the lowest carbon intense time in the next 24hrs. This makes use of a templating structure, where the workflows that are to be scheduled are added into a template folder, where they can be automatically scheduled with the output of the action.  

### Example usage

```yaml
  - uses: jhcoll/carbon-aware-schedule-action@v1
    with:
        # Region to check carbon intensity for - can be any azure region - however if using github hosted runners will be one of the following - 'eastus, eastus2, westus2, centralus, southcentralus'
        region: 'eastus'
        # path to template job to be scheduled
        template-paths: ['templates/template.yml'] 
        # Time to check until - In format YYYY-MM-DDThh:mm:ssZ
        end-time: '2023-11-16T11:00:00Z' # Optional - defaults to +24hr
        # Estimated job length in minutes
        estimated-job-length: '10' # Optional - defaults to 10
        # Output path for scheduled jobs
        output-path: '.github/workflows/' # Optional - defaults to ".github/workflows/"
```