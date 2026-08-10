# HASHIRA V1

## Product definition
HASHIRA V1 is a focused intelligent movement training product. It should prove the core loop before expanding into many disciplines or experimental features.

## V1 pillars

### 1. Smart Workout
A structured workout composer driven by training knowledge, athlete context, discipline rules, progression state, recovery signals, practical constraints, and post-workout feedback.

### 2. Four deep discipline packs
Initial disciplines:
- Calisthenics
- Gym / Resistance Training
- Mobility / Flexibility
- Pilates / Core Control

V1 should not claim deep support for a discipline until its movement data and programming logic are genuinely useful.

### 3. Progression
Athletes need visible long-term development, not endless disconnected daily workouts. Progression should track relevant strength, skill, movement, and discipline pathways.

### 4. Movement Lab
A camera-assisted practice environment where HASHIRA can eventually observe selected movements, measure useful signals, teach, and interact with virtual training tools.

Movement Lab must begin with a very small number of well-supported movement models rather than pretending the camera understands every exercise.

### 5. One excellent virtual tool
Flagship: **Virtual Jump Rope**.

Long-term target experience:
1. Athlete places phone so the body is visible.
2. Athlete selects Virtual Jump Rope.
3. HASHIRA tracks enough body/hand rhythm to infer a believable skipping cycle.
4. A virtual rope is rendered around the athlete.
5. Movement cycles/cadence can be counted when confidence is sufficient.
6. Feedback remains teaching-oriented rather than punitive.

The first version does not need perfect physical rope simulation. It needs to feel coherent, responsive, and useful.

### 6. HASHIRA Live
A native live-training environment where a real coach and athletes can train together remotely.

The goal is not to copy Zoom's meeting UI. HASHIRA Live should understand that the call is a training session and eventually combine:
- coach/student roles
- camera and microphone
- shared session state
- synchronized timer
- current exercise
- coach commands
- participant training status
- Movement Lab capabilities where appropriate

Realtime media infrastructure should remain separate from the PHP/MySQL application backend.

### 7. Coach Experience
A coach should eventually be able to:
- manage athletes
- understand recent training
- create or modify programs
- assign sessions
- see progression
- host HASHIRA Live
- use the same movement knowledge as Smart Workout
- receive useful programming considerations without losing authority

## Core athlete loop
HASHIRA V1 should make this loop excellent:

```text
Understand athlete
      ↓
Choose today's training purpose
      ↓
Generate sensible session
      ↓
Explain why
      ↓
Athlete trains
      ↓
Capture performance + feedback
      ↓
Update progression/context
      ↓
Improve next recommendation
```

Movement Lab and human coaching plug into this same loop rather than creating separate products.

## What V1 is not
V1 is not:
- a giant social network
- a 10,000-exercise database
- a medical application
- a replacement for qualified coaches
- a generic video-call product
- an anime RPG with fitness attached
- dependent on proprietary hardware
- an LLM that improvises workouts

## Commercial architecture
Pricing is intentionally not fixed here. The intended product ladder is:

### Free
Useful basic training, basic exercise library, manual workout tools, solo mode, and enough value to understand HASHIRA.

### HASHIRA+
Smart Workout, adaptive programming, deep discipline packs, advanced progression, Movement Lab, and virtual training tools.

### HASHIRA Coach
Athlete roster, assignments, programming tools, coach intelligence, progression visibility, and HASHIRA Live hosting.

### HASHIRA Studio
Multi-coach organization, larger athlete base, shared programming/curriculum, analytics, organization controls, and group live training.

## Business principles
- Paid value should come primarily from intelligence, leverage, and scale rather than locking basic movement behind a paywall.
- Avoid requiring expensive proprietary hardware for the core subscription.
- Build coach/studio value early enough that HASHIRA is not dependent only on consumer app-store acquisition.
- A small number of coaches with active athletes can be a stronger early market than chasing mass consumer scale immediately.

## Data principle
HASHIRA may eventually learn from aggregated training outcomes, athlete feedback, coach corrections, and camera-derived metrics, but only with appropriate privacy, consent, minimization, and clear separation between transient realtime data and durable training records.

Do not store raw body-tracking frames simply because they are available.

## Expansion gate
Do not add another major discipline or virtual tool merely because it is exciting. Expand when:
1. the current athlete loop is useful,
2. the first discipline packs are deep,
3. Smart Workout is explainable,
4. training history actually affects future programming,
5. Movement Lab has at least one convincing use case,
6. live coaching fits the same athlete model.

## Category
HASHIRA V1 should establish one clear idea:

**HASHIRA is intelligent movement training — a system that knows how you train, helps decide what to train, can increasingly understand how you move, and lets a real coach enter the same intelligent environment.**