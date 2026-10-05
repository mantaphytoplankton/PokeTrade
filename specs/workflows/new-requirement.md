//define workflow: new-requirement

# Description:
- This workflow is used for adding new requirements to existing application
- Following the SDD framework and process


# Steps:
## Step 1: update brd (business requirement document)
- location of the brd document: ./specs/brd.md
- Use AskQuestion, prompt a input to allow users enter the name of the new requirement 
- Look up the new requirement from the brd document
- If it already exist, check if that requirement is actually implemented.Prompt to user if this is a "done" feature.
- If it is a new feature, move to the next step.
- Add the new requirement into brd.md

## Step 2: update the stories.md to add requirement details
- use skill /atdd to address the requirement details for the new feature, in the format of user stories and acceptance criteria
- add to ./specs/stories.md
- update the other stories/acceptance criterials if necessary

## Step 3: update user interface (prototype) and ask feedback from the user
- use skill /frontend-design to build static html version of the UI prototypes, put into ./specs/prototype
- Do not automatically move on, stop the process, prompt to the user, ask for feedback
- Based on the feedback, update the prototype and the documents
- Repeat until the user confirms

## Step 4: do technical design
- use skills: /fullstack-developer, /mcp-server-patterns, /rag-implementation, /agent-builder
- do the technical design for the components (MCP, RAG, Agent, WebApp), update:
    - ./specs/rag/rag-design.md
    - ./specs/app/app-design.md
    - ./specs/agent/agent-design.md
    - ./specs/mcp/mcp-design.md

## step 5: implementation 
- use skills: /fullstack-developer, /mcp-server-patterns, /rag-implementation, /agent-builder
- implement the new requirement