# Invincible paste-plan format

In V2, open **My Workspace → Paste plan**, paste the plan, then choose **Preview plan**. Review/edit the detected structure and create a new project or append to an existing one. Appending adds new steps and preserves existing project content. A project title can be supplied in the preview when creating; it is optional for an append.

Give your custom GPT these output instructions:

> Return only an Invincible plan. Start with `Project:` and an optional one-line `Description:`. Number the main steps starting at 1. Under each step, indent checkbox substeps by three spaces using `- [ ]`. Use `[x]` only for work already completed. Use one substep level. Add optional `Notes:` under the relevant step; for substep notes, indent `Notes:` three spaces farther than its checkbox. Indent continuation lines farther than their `Notes:` line. Do not use tables, extra explanation or deeper nesting.

```text
Project: Build LMV 3 model
Description: Complete and validate the final model.

1. Research
   Notes: Confirm dimensions before modelling.
   - [ ] Gather reference images
      Notes: Keep the source links with the measurements.
   - [ ] Verify measurements

2. Build the model
   - [ ] Create the base structure
   - [ ] Add details

3. Validate
   - [ ] Check dimensions
   - [ ] Run the final simulation
```

The parser accepts ordinary text and a surrounding text/Markdown code fence. It also accepts checkbox indentation flattened by copying from a rendered chat response, assigning those checkboxes to the preceding numbered step. It preserves notes and checkbox states, reports malformed lines instead of guessing, and supports up to 200 steps and 1,000 substeps per project (100,000 pasted characters). Parent completion reflects child checkboxes; a parent checkbox completes/reopens its children. New projects start in Backlog. Use Kanban to change their lane.

Pasting, previewing and editing drafts do not write to Firebase. The explicit Create/Add/Save action does. Drafts are kept on the current browser/device per account until saved or explicitly cleared. This importer does not generate a plan or interpret an unstructured prompt; your custom GPT supplies the structured text.
