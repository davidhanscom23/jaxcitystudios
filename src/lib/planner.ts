import {
  ENGINEERED,
  ROOMS,
  recommendRoom,
  type RoomId,
  engineeredTotal,
} from "@/lib/rates";

export const STAGE_IDS = [
  "setup",
  "intro",
  "main",
  "breaks",
  "outro",
] as const;

export type StageId = (typeof STAGE_IDS)[number];

export const STAGE_META: Record<
  StageId,
  { title: string; defaultShare: number; blurb: string }
> = {
  setup: {
    title: "Setup and levels",
    defaultShare: 0.12,
    blurb: "Gain, phones, seat order, camera frames.",
  },
  intro: {
    title: "Intro and hook",
    defaultShare: 0.1,
    blurb: "Cold open, title bed, why anyone stays.",
  },
  main: {
    title: "Main conversation",
    defaultShare: 0.55,
    blurb: "The meat of the episode.",
  },
  breaks: {
    title: "Breaks and ad reads",
    defaultShare: 0.13,
    blurb: "Midrolls, drinks, sponsor lines.",
  },
  outro: {
    title: "Outro and pickups",
    defaultShare: 0.1,
    blurb: "Credits, CTAs, punch-ins.",
  },
};

export type FormatId = "audio" | "video" | "hybrid";
export type EditDepth = "raw" | "clean" | "full";
export type ClipPackage = "none" | "three" | "six";

export type StageConfig = {
  format: FormatId;
  hosts: number;
  guests: number;
  cameras: number;
  editDepth: EditDepth;
  clipPackage: ClipPackage;
};

export type DeliverableId =
  | "edited-audio"
  | "video-master"
  | "three-clips"
  | "transcript"
  | "show-notes"
  | "audiogram"
  | "rss"
  | "youtube";

export const DELIVERABLE_PRESETS: {
  id: DeliverableId;
  label: string;
  /** Extra studio-adjacent or post minutes feeding totals (sample where noted). */
  extraHours: number;
  sampleCost: number;
  isSample: boolean;
}[] = [
  { id: "edited-audio", label: "Edited audio", extraHours: 0.5, sampleCost: 75, isSample: true },
  { id: "video-master", label: "Video master", extraHours: 1, sampleCost: 150, isSample: true },
  { id: "three-clips", label: "Three short clips", extraHours: 0.5, sampleCost: 95, isSample: true },
  { id: "transcript", label: "Transcript", extraHours: 0, sampleCost: 40, isSample: true },
  { id: "show-notes", label: "Show notes", extraHours: 0, sampleCost: 35, isSample: true },
  { id: "audiogram", label: "Audiogram", extraHours: 0.25, sampleCost: 45, isSample: true },
  { id: "rss", label: "RSS distribution", extraHours: 0, sampleCost: 25, isSample: true },
  { id: "youtube", label: "YouTube upload", extraHours: 0.25, sampleCost: 30, isSample: true },
];

export const DEFAULT_STAGE: StageConfig = {
  format: "video",
  hosts: 2,
  guests: 1,
  cameras: 2,
  editDepth: "clean",
  clipPackage: "three",
};

export const DEFAULT_SHOW = {
  title: "Default show — weeknight conversation",
  episodeMinutes: 60,
  clientType: "first-time" as const,
  roomId: "venus" as RoomId,
  stages: {
    setup: { ...DEFAULT_STAGE, format: "audio" as FormatId, cameras: 0, editDepth: "raw" as EditDepth, clipPackage: "none" as ClipPackage },
    intro: { ...DEFAULT_STAGE },
    main: { ...DEFAULT_STAGE },
    breaks: { ...DEFAULT_STAGE, guests: 0, cameras: 1 },
    outro: { ...DEFAULT_STAGE, guests: 0 },
  } satisfies Record<StageId, StageConfig>,
  deliverables: ["edited-audio", "three-clips", "show-notes"] as string[],
  customDeliverables: [] as string[],
};

export function stageMinutes(
  episodeMinutes: number,
  stageId: StageId,
): number {
  return Math.round(episodeMinutes * STAGE_META[stageId].defaultShare);
}

export function peopleFromStages(stages: Record<StageId, StageConfig>) {
  return Math.max(
    ...STAGE_IDS.map((id) => stages[id].hosts + stages[id].guests),
  );
}

export function camerasFromStages(stages: Record<StageId, StageConfig>) {
  return Math.max(...STAGE_IDS.map((id) => stages[id].cameras));
}

export function editTurnaroundDays(
  stages: Record<StageId, StageConfig>,
  deliverableIds: string[],
): number {
  const depths = STAGE_IDS.map((id) => stages[id].editDepth);
  let days = 3;
  if (depths.includes("full")) days = 7;
  else if (depths.includes("clean")) days = 5;
  if (deliverableIds.includes("video-master")) days += 2;
  if (deliverableIds.includes("three-clips") || stages.main.clipPackage !== "none")
    days += 1;
  return days;
}

export function computePlanner(input: {
  episodeMinutes: number;
  clientType: "first-time" | "returning";
  roomId: RoomId;
  stages: Record<StageId, StageConfig>;
  deliverables: string[];
  customDeliverables: string[];
}) {
  const people = peopleFromStages(input.stages);
  const cameras = camerasFromStages(input.stages);
  const suggested = recommendRoom(people, cameras);
  const room = ROOMS.find((r) => r.id === input.roomId) ?? suggested;
  const fits =
    room.maxPeople >= people && room.maxCameras >= cameras;

  const episodeHours = input.episodeMinutes / 60;
  // Studio time: episode length + setup buffer from setup stage share, rounded to 2hr min
  const rawHours = Math.max(episodeHours + 0.5, ENGINEERED.minimumHours);
  const bookedHours = Math.max(
    ENGINEERED.minimumHours,
    Math.ceil(rawHours * 2) / 2,
  );

  const studioCost = engineeredTotal(bookedHours, input.clientType);
  const rateUsed =
    input.clientType === "first-time"
      ? ENGINEERED.firstTimeHourly
      : ENGINEERED.returningHourly;

  let deliverableCost = 0;
  let deliverableHours = 0;
  const deliverableLines: {
    label: string;
    cost: number;
    hours: number;
    sample: boolean;
  }[] = [];

  for (const id of input.deliverables) {
    const preset = DELIVERABLE_PRESETS.find((d) => d.id === id);
    if (!preset) continue;
    deliverableCost += preset.sampleCost;
    deliverableHours += preset.extraHours;
    deliverableLines.push({
      label: preset.label,
      cost: preset.sampleCost,
      hours: preset.extraHours,
      sample: preset.isSample,
    });
  }

  for (const custom of input.customDeliverables) {
    deliverableLines.push({
      label: custom,
      cost: 0,
      hours: 0,
      sample: false,
    });
  }

  const stageBreakdown = STAGE_IDS.map((id) => {
    const mins = stageMinutes(input.episodeMinutes, id);
    const cfg = input.stages[id];
    return {
      id,
      title: STAGE_META[id].title,
      minutes: mins,
      inRoom: STAGE_META[id].blurb,
      output: describeStageOutput(cfg),
      config: cfg,
    };
  });

  return {
    people,
    cameras,
    room,
    suggested,
    fits,
    bookedHours,
    rateUsed,
    studioCost,
    deliverableCost,
    deliverableHours,
    deliverableLines,
    turnaroundDays: editTurnaroundDays(input.stages, input.deliverables),
    total: studioCost + deliverableCost,
    stageBreakdown,
    note:
      "Studio hours use published engineered rates (room included). Deliverable line items are sample estimates unless marked otherwise.",
  };
}

function describeStageOutput(cfg: StageConfig): string {
  const bits = [
    cfg.format === "audio"
      ? "Audio capture"
      : cfg.format === "video"
        ? "Video + audio"
        : "Hybrid / remote",
    `${cfg.hosts} host${cfg.hosts === 1 ? "" : "s"}`,
    `${cfg.guests} guest${cfg.guests === 1 ? "" : "s"}`,
    cfg.cameras ? `${cfg.cameras} camera${cfg.cameras === 1 ? "" : "s"}` : "no cameras",
    `edit: ${cfg.editDepth}`,
    cfg.clipPackage === "none" ? "no clip package" : `${cfg.clipPackage} clips`,
  ];
  return bits.join(" · ");
}
