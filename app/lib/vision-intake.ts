import { z } from 'zod';

export const CURRENT_FEELINGS = ['stuck', 'frustrated', 'overwhelmed', 'uncertain', 'restless', 'hopeful'] as const;
export const DESIRED_FEELINGS = ['clear', 'confident', 'relieved', 'in-control', 'energized', 'proud'] as const;
export const INTAKE_OFFERS = ['website-fix', 'managed-automation'] as const;

const optionalText = (max: number) => z.string().trim().max(max).optional().default('');

export const visionIntakeV1Schema = z.object({
  version: z.literal(1),
  situation: z.string().trim().min(10).max(1200),
  repeatedPattern: z.string().trim().min(5).max(800),
  pastContext: optionalText(800),
  priorStrategies: optionalText(1000),
  strategyPurpose: optionalText(800),
  preferences: optionalText(800),
  currentFeeling: z.enum(CURRENT_FEELINGS).optional(),
  currentFeelingOther: optionalText(80),
  desiredOutcome: z.string().trim().min(10).max(1200),
  possibility: optionalText(800),
  pream: optionalText(800),
  desiredFeeling: z.enum(DESIRED_FEELINGS).optional(),
  desiredFeelingOther: optionalText(80),
  sharedPurpose: z.string().trim().min(10).max(1200),
  offer: z.enum(INTAKE_OFFERS).nullable().optional(),
}).strict();

export type VisionIntakeV1 = z.infer<typeof visionIntakeV1Schema>;

export function parseVisionIntake(value: string): VisionIntakeV1 {
  let parsed: unknown;
  try { parsed = JSON.parse(value); } catch { throw new Error('Intake context must be valid JSON'); }
  const result = visionIntakeV1Schema.safeParse(parsed);
  if (!result.success) throw new Error('Intake context is invalid');
  return result.data;
}

export function visionIntakeMessage(context: VisionIntakeV1): string {
  const lines = [
    ['What is happening', context.situation], ['Repeated pattern', context.repeatedPattern],
    ['Past context', context.pastContext], ['What has been tried', context.priorStrategies],
    ['What those strategies were meant to accomplish', context.strategyPurpose],
    ['Preferences and frustrations', context.preferences],
    ['Current feeling', context.currentFeelingOther || context.currentFeeling],
    ['Desired outcome', context.desiredOutcome], ['Possibility unlocked', context.possibility],
    ['Future picture', context.pream], ['Desired feeling', context.desiredFeelingOther || context.desiredFeeling],
    ['Visitor-confirmed shared purpose', context.sharedPurpose],
    ['Selected starting point', context.offer || 'Not selected'],
  ].filter(([, value]) => value);
  return lines.map(([label, value]) => `${label}:\n${value}`).join('\n\n');
}
