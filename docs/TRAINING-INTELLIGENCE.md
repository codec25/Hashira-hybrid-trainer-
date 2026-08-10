# HASHIRA Training Intelligence

## Purpose
Smart Workout must be a programming system, not a random exercise picker. It should combine structured training knowledge with athlete context, discipline-specific rules, adaptation, and understandable explanations.

## Core engines

### Athlete Context Engine
Maintains the context required to make a useful decision. Future inputs may include:
- primary and secondary goals
- training disciplines and training mix
- experience level and training age
- available equipment
- available time
- available space and environment
- preferences and disliked movements
- recent sessions and movement exposure
- recent volume and intensity
- readiness and energy
- soreness and pain flags
- optional sleep/recovery inputs
- current progression states
- coach assignments and coach-authored constraints

V1 must work with incomplete data. Missing fields should reduce personalization gracefully, not make workout generation impossible.

### Movement Selector
Chooses movements that fit the athlete, session purpose, discipline, available resources, current progression state, and recent training.

### Prescription Engine
Determines the appropriate way to perform selected movements: sets, reps, duration, load guidance, tempo, rest, RPE/RIR where relevant, or discipline-specific alternatives.

### Sequencing Engine
Orders work intelligently. High-skill and high-coordination work often needs freshness; heavy primary work should not be accidentally pre-fatigued; accessory and conditioning work should respect the session's purpose.

### Recovery / Fatigue Engine
Tracks recent training exposure and estimated recovery cost. It should reason about local and systemic fatigue without pretending it can medically diagnose recovery status.

### Constraint Engine
Handles real-life constraints such as time, space, noise, equipment, environment, soreness, and user preferences.

### Discipline Engine
Applies the rules of the active discipline pack. Calisthenics, resistance training, Pilates, and mobility should not all use identical progression or prescription logic.

### Adaptation Engine
Modifies an existing training intention when circumstances change. It should preserve the session purpose wherever possible.

### Coach Wisdom Engine
Surfaces useful considerations such as excessive repetition of the same pattern, poor sequencing, unusually high fatigue concentration, or a missing prerequisite. It advises; a qualified coach can override.

### Explanation Engine
Produces athlete-friendly answers to questions such as:
- Why this workout?
- Why this exercise?
- Why did today's plan change?
- Why is this easier/harder than last time?

## Questions Smart Workout should answer
Before generating a session, HASHIRA should be able to reason about:
1. What is the athlete trying to improve?
2. What did they train recently?
3. What likely needs more recovery?
4. Which movement patterns are underrepresented?
5. Which skills should be practiced while fresh?
6. Which exercises match the athlete's current level?
7. What equipment, space, and time are available?
8. What is appropriate today rather than merely appropriate in general?
9. What should come first and what should come later?
10. How much work is reasonable?
11. What is the regression if needed?
12. What is the progression when ready?
13. What should be avoided or reduced today?
14. Why is each important movement included?

## Session phases
HASHIRA must not impose one universal workout template. Discipline packs may reorder, omit, or reinterpret phases. Common phases include:
- preparation / warm-up
- skill / high-coordination practice
- primary work
- secondary work
- accessory / support work
- conditioning
- core / stability
- mobility / cooldown

Only useful phases should appear.

## Adapt Today
Adapt Today is a first-class feature, not an afterthought. The athlete may report:
- I only have 15 minutes
- no equipment
- small room
- outside
- need a quiet workout
- low energy
- upper body sore
- lower body sore
- trained this yesterday
- make it easier
- make it harder

The engine should preserve training intent. If the original goal was lower-body power, a 15-minute adaptation should remain a lower-body-power session where safely possible rather than becoming unrelated upper-body work.

## Post-workout feedback loop
Future feedback should support:
- difficulty: too easy / good / hard / too hard
- energy afterward: 1–5
- exercise preference: keep / sometimes / avoid
- discomfort location: none / shoulder / elbow / back / hip / knee / other
- completion: full / partial / skipped movements
- performance: reps, load, duration, RPE/RIR where relevant
- coach notes where applicable

This information should influence future recommendations.

## Programming guardrails
- Never interpret one missed workout as failure.
- Avoid unnecessary novelty when repeat exposure is useful for learning and progression.
- Avoid excessive repetition when fatigue or overuse risk would increase.
- Prefer appropriate regressions over forcing an athlete through a movement they cannot yet own.
- Progress only when the relevant discipline criteria are met; progression is not always more reps or more load.
- Preserve specificity: train toward the stated goal.
- Keep recommendations explainable.

## Knowledge / AI boundary
The deterministic knowledge system owns canonical movement data, progression relationships, discipline rules, constraints, safety boundaries, and programming primitives. AI may translate natural-language goals into structured intent, explain choices, summarize history, and assist a coach, but should not silently invent unsupported training rules.