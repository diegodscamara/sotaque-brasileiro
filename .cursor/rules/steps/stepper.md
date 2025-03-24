# Stepper requirements
- It must have 3 states for each step
    1. Current
    2. Completed
    3. Next
- It must account for:
    - The required data for each step to consider as completed
    - The current data in each step to be able to update the step state correclty
    - Step 2 can be reset because in the first mount, it checks for existing pending classes for the student, and if found, it cancells it, thus it resets the state of the step to current and not completed
    - A current step can't be completed because the user might make chances, so the step only becomes completed after providing the required data and click next
    - So click Back will reset the state to current and not completed
    - Basically since we have the checks to disable the Next button, we can rely on the navigation buttons to update the state of each step
    - If the user reloads or leaves the page, the current step must be stored
    - Actually, let's create a table in the prisma schema for the onboarding, since the data is saved to the db when the user finishes a step, we should also save the onboarding steps information in the db to make sure we keep track on the current and complete steps correclty, and the user can return to the site later, and come back to the same step, and the existing data will be fetched from the db, this way we get rid of complex url and localStorage stuff.
    - This will involve updating the prisma schema correctly, creating the actions to query prisma, and the context for fetching data from the actions, similarly to how we handle users.