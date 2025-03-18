# Requirements for step 2 of onboarding

- When the student lands on step 2, it must:
    - Load only the teachers that actually have available time slots
    - After fething the teachers, also fetch their available time slots
    - Fetch existing pending classes for the student
    - If there's a pending class, delete it, so the student can schedule a new one
    - Update the teacher availability to return the time slot as available
- When the student selects a teacher, it must:
    - Confirm the teacher has available time slots
    - If not, refreshes the available teachers list
    - If yes, let the student select the teacher
    - Show the available time slots already fetched
- When the student selects a date and time, it must:
     - Display the step 2 summary below with the selected teacher, and time slot
     - Allow the student to click the button next to move to step 3
- When the student clicks the button next, it must:
    - Create the class in the database as pending
    - Update the selected teacher availabilty by changing this time slot as unavailable
