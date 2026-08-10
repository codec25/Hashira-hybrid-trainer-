# HASHIRA Canonical Movement Schema

## Purpose
HASHIRA needs one reusable movement definition that can eventually power Smart Workout, the exercise library, coach programming, progression, Movement Lab, rep counting, computer vision, virtual tools, and live sessions.

This document defines the target shape. It is not yet an implementation contract.

## Identity
- `id`
- `name`
- `aliases`
- `version`
- `status`

## Classification
- `disciplines`
- `movement_family`
- `movement_patterns`
- `modality`
- `bilateral_unilateral`
- `open_closed_chain`

## Requirements
- `equipment`
- `minimum_space`
- `environment`
- `prerequisites`
- `mobility_requirements`
- `stability_requirements`
- `strength_requirements`

## Demand profile
Do not collapse difficulty into one score. A movement can be technically difficult but metabolically easy, or physically demanding but simple to coordinate.

Suggested dimensions:
- `strength_demand`
- `hypertrophy_value`
- `power_demand`
- `cardio_demand`
- `skill_complexity`
- `coordination_demand`
- `balance_demand`
- `mobility_demand`
- `stability_demand`

## Stress / recovery profile
- `local_fatigue`
- `systemic_fatigue`
- `joint_load`
- `impact`
- `spinal_load`
- `grip_load`
- `recovery_cost`

These are programming signals, not medical diagnoses.

## Programming metadata
- `suitable_goals`
- `suitable_levels`
- `rep_ranges`
- `duration_ranges`
- `set_ranges`
- `load_guidance`
- `tempo_options`
- `rest_guidance`
- `sequencing_priority`
- `frequency_guidance`
- `pairing_tags`
- `avoid_pairing_tags`

Not every discipline uses all fields. Pilates, mobility, and skill practice may use duration, breath cycles, quality targets, holds, or repetitions differently from gym training.

## Teaching model
- `purpose`
- `setup`
- `execution`
- `coaching_cues`
- `common_errors`
- `self_checks`
- `coach_observations`

Cues should be concise, actionable, and tied to what the athlete can change. Avoid presenting every anatomical imperfection as an error.

## Progression graph
- `regressions`
- `progressions`
- `prerequisites`
- `parallel_variations`
- `progression_criteria`
- `regression_triggers`

Progression is not always more reps. It may involve leverage, assistance, external load, range, tempo, stability, precision, coordination, breathing control, or complexity.

## Anatomy / biomechanics
- `major_muscles`
- `secondary_muscles`
- `joints`
- `planes_of_motion`
- `primary_joint_actions`
- `stabilization_demands`

This metadata supports education and programming. HASHIRA should avoid using anatomy metadata to imply medical diagnosis.

## Vision model
For movements that can be observed reliably by a normal camera:
- `camera_observable`
- `recommended_camera_angles`
- `important_landmarks`
- `movement_phases`
- `rep_start_state`
- `rep_end_state`
- `rep_conditions`
- `measurable_signals`
- `quality_signals`
- `confidence_requirements`
- `occlusion_risks`

A movement should not receive automated form feedback simply because some landmarks are visible. Vision feedback requires an explicit, tested model.

## Virtual tools
- `supported_objects`
- `overlay_behavior`
- `interaction_signals`
- `calibration_requirements`

Examples may later include virtual rope, agility ladder, targets, lines, landing zones, balance paths, or reaction gates.

## Safety metadata
- `contraindication_flags`
- `pain_response`
- `stop_conditions`
- `modification_notes`
- `spotter_or_supervision_notes`

Safety metadata should remain conservative and informational. It must not attempt diagnosis.

## Example conceptual record
A bodyweight squat might be represented as:

```yaml
id: bodyweight_squat
movement_patterns: [squat]
disciplines: [calisthenics, gym, mobility]
equipment: [none]
strength_demand: 2
skill_complexity: 2
balance_demand: 2
impact: 1
movement_phases: [standing, descent, bottom, ascent, standing]
important_landmarks: [hip, knee, ankle, shoulder]
camera_observable: true
```

These numbers are placeholders only; they are not validated ratings.

## Data-quality rule
Every canonical movement must have provenance. Future implementation should distinguish:
- verified core data
- discipline-specific expert data
- experimental vision metadata
- user/coach customization

The system must be able to evolve movement definitions without silently changing historical workout meaning.