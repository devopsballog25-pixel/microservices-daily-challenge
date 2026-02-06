# Restaurant Order Management System - Build & Test

## Your Mission

Build a complete Restaurant Order Management System from scratch based on the requirements in `PROBLEM.md`. 

Read the full requirements from PROBLEM.md first, then build, test, and validate everything until all success criteria pass.

## What You Need to Do

### 1. Read Requirements
- Read `PROBLEM.md` thoroughly
- Understand all 4 microservices
- Note the success criteria

### 2. Build the System
- Create all 4 microservices:
  - Order Intake Service
  - Queue Management Service  
  - Kitchen Display Service
  - Status Tracking Service
- Write `docker-compose.yml` for orchestration
- Use PostgreSQL + Redis as specified
- Choose appropriate tech stack (Node.js/Python/Go - your choice)

### 3. Test Everything
- Run `docker-compose up --build`
- Check all services start successfully
- Test the complete order flow:
  - Submit order via API
  - Verify it appears in queue
  - Check kitchen display shows it
  - Mark order as in-progress
  - Mark order as complete
  - Verify status tracking works
  - Test alert when >10 orders in queue
- Write and run automated tests
- Debug and fix any issues you encounter

### 4. Self-Heal & Iterate
- If services fail to start, debug and fix
- If tests fail, investigate and correct
- If APIs don't work, troubleshoot and resolve
- Keep iterating until ALL success criteria pass

### 5. Document Everything
- Create comprehensive README.md with:
  - Architecture diagram (ASCII art is fine)
  - Setup instructions
  - How to run the system
  - API documentation with examples
  - How to run tests
- Create RESULTS.md documenting:
  - What works
  - What failed (if anything)
  - Any architectural decisions you made
  - Performance observations

## Success Criteria (from PROBLEM.md)

You must achieve ALL of these:

- [ ] All 4 services start via `docker-compose up --build`
- [ ] Can submit order via Order Intake API
- [ ] Order appears in Queue Management Service
- [ ] Kitchen Display Service shows order with correct priority
- [ ] Can mark order as "in progress"
- [ ] Can mark order as "completed"
- [ ] Status Tracking Service shows correct state transitions
- [ ] Alert triggers when >10 orders in queue
- [ ] Automated tests exist and pass
- [ ] README.md is complete with all sections
- [ ] System handles example test flow from PROBLEM.md

## Important Notes

- Build from scratch - no boilerplate templates
- Actually RUN and TEST everything - don't just write code
- If something doesn't work, FIX IT before moving on
- Use the computer/bash tools to execute commands
- Read error messages and debug systematically
- The goal is a WORKING system, not just code

## Project Structure

Create this structure:
```
day-01-restaurant-orders/
├── services/
│   ├── order-intake/
│   ├── queue-manager/
│   ├── kitchen-display/
│   └── status-tracker/
├── docker-compose.yml
├── README.md
├── RESULTS.md
├── tests/
└── PROBLEM.md (already exists)
```

## Tech Stack Guidance

Choose what works best for speed and reliability:
- **Backend:** Node.js (Express) OR Python (FastAPI) OR Go (Gin)
- **Database:** PostgreSQL (preferred) or SQLite
- **Cache:** Redis
- **Testing:** Jest/Pytest/Go testing

Use lightweight frameworks. Prioritize working code over perfect code.

## Start Here

1. Read PROBLEM.md
2. Plan your approach
3. Create services one by one
4. Test as you go
5. Build docker-compose.yml
6. Run the complete system
7. Test all success criteria
8. Fix any issues
9. Document everything

**Don't stop until the system works!**

Good luck! 🚀