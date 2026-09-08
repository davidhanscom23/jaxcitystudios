"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  DEFAULT_SHOW,
  DELIVERABLE_PRESETS,
  STAGE_IDS,
  STAGE_META,
  computePlanner,
  stageMinutes,
  type ClipPackage,
  type EditDepth,
  type FormatId,
  type StageConfig,
  type StageId,
} from "@/lib/planner";
import { ENGINEERED, ROOMS, type RoomId } from "@/lib/rates";
import { useBooking } from "@/components/booking/BookingProvider";

export function PlannerPage() {
  const { openBooking } = useBooking();
  const [title, setTitle] = useState(DEFAULT_SHOW.title);
  const [episodeMinutes, setEpisodeMinutes] = useState(
    DEFAULT_SHOW.episodeMinutes,
  );
  const [clientType, setClientType] = useState<"first-time" | "returning">(
    DEFAULT_SHOW.clientType,
  );
  const [roomId, setRoomId] = useState<RoomId>(DEFAULT_SHOW.roomId);
  const [stages, setStages] = useState(DEFAULT_SHOW.stages);
  const [deliverables, setDeliverables] = useState<string[]>(
    DEFAULT_SHOW.deliverables,
  );
  const [customDeliverables, setCustomDeliverables] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [activeStage, setActiveStage] = useState<StageId | null>(null);

  const result = useMemo(
    () =>
      computePlanner({
        episodeMinutes,
        clientType,
        roomId,
        stages,
        deliverables,
        customDeliverables,
      }),
    [
      episodeMinutes,
      clientType,
      roomId,
      stages,
      deliverables,
      customDeliverables,
    ],
  );

  function updateStage(id: StageId, patch: Partial<StageConfig>) {
    setStages((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function addCustom(e: FormEvent) {
    e.preventDefault();
    const v = customInput.trim();
    if (!v) return;
    setCustomDeliverables((c) => [...c, v]);
    setCustomInput("");
  }

  function printSheet() {
    window.print();
  }

  return (
    <div className="wide-margin section-space">
      <p className="font-caps text-[0.7rem] text-muted no-print">Planner</p>
      <h1 className="font-display crop-type mt-4 max-w-[12ch] text-[clamp(2.8rem,8vw,5.5rem)] no-print">
        Build Your Show
      </h1>
      <p className="mt-6 max-w-xl text-paper-dim no-print">
        Five stages. Click one to configure. Totals use published engineered
        rates (${ENGINEERED.firstTimeHourly}/${ENGINEERED.returningHourly}) and
        the room you pick. Deliverable costs are labeled sample.
      </p>

      <div className="print-sheet mt-12">
        <div className="mb-8 border-b border-rule pb-6">
          <input
            className="input border-0 bg-transparent px-0 font-display text-3xl"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="mt-4 flex flex-wrap gap-4 no-print">
            <label className="text-sm">
              Episode length (min)
              <input
                type="number"
                min={15}
                max={180}
                className="input mt-1 w-28"
                value={episodeMinutes}
                onChange={(e) => setEpisodeMinutes(Number(e.target.value) || 60)}
              />
            </label>
            <label className="text-sm">
              Client
              <select
                className="select mt-1"
                value={clientType}
                onChange={(e) =>
                  setClientType(e.target.value as "first-time" | "returning")
                }
              >
                <option value="first-time">
                  First-time · ${ENGINEERED.firstTimeHourly}/hr
                </option>
                <option value="returning">
                  Returning · ${ENGINEERED.returningHourly}/hr
                </option>
              </select>
            </label>
            <label className="text-sm">
              Room
              <select
                className="select mt-1"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value as RoomId)}
              >
                {ROOMS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} · room-only ${r.hourly}/hr
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Timeline */}
        <ol className="relative border-l border-rule pl-6">
          {STAGE_IDS.map((id) => {
            const mins = stageMinutes(episodeMinutes, id);
            const cfg = stages[id];
            return (
              <li key={id} className="relative mb-10">
                <span className="absolute -left-[1.65rem] top-1 h-3 w-3 rounded-full border border-paper bg-ink" />
                <button
                  type="button"
                  className="w-full text-left no-print"
                  onClick={() => setActiveStage(id)}
                >
                  <p className="font-caps text-[0.65rem] text-muted">
                    {mins} min
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl">
                    {STAGE_META[id].title}
                  </h2>
                  <p className="mt-2 text-sm text-paper-dim">
                    In room: {STAGE_META[id].blurb}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Output:{" "}
                    {cfg.format} · {cfg.hosts}H/{cfg.guests}G · {cfg.cameras}{" "}
                    cam · {cfg.editDepth} · clips {cfg.clipPackage}
                  </p>
                </button>
                <div className="hidden print:block">
                  <p className="font-caps text-[0.65rem]">{mins} min</p>
                  <h2 className="text-xl font-bold">{STAGE_META[id].title}</h2>
                  <p className="text-sm">
                    {cfg.format} · {cfg.hosts}H/{cfg.guests}G · {cfg.cameras} cam
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Totals */}
        <section className="mt-8 grid gap-6 border-t border-rule pt-8 md:grid-cols-2">
          <div>
            <h3 className="font-caps text-[0.7rem] text-muted">Studio math</h3>
            <ul className="mt-4 space-y-2 text-paper-dim">
              <li>
                Booked studio hours:{" "}
                <strong className="text-paper">{result.bookedHours}h</strong>{" "}
                (2-hour minimum)
              </li>
              <li>
                Rate used: ${result.rateUsed}/hr engineered ({clientType})
              </li>
              <li>Studio cost: ${result.studioCost}</li>
              <li>
                Room: {result.room.name}
                {!result.fits && (
                  <span className="text-accent">
                    {" "}
                    — config exceeds this room. Suggested: {result.suggested.name}
                  </span>
                )}
                {result.fits && (
                  <span className="text-muted">
                    {" "}
                    (fits {result.people} people / {result.cameras} cameras)
                  </span>
                )}
              </li>
              <li>Edit turnaround: {result.turnaroundDays} business days</li>
            </ul>
          </div>
          <div>
            <h3 className="font-caps text-[0.7rem] text-muted">
              Running total
            </h3>
            <p className="font-display mt-4 text-5xl">${result.total}</p>
            <p className="mt-2 text-sm text-muted">
              Studio ${result.studioCost} + sample deliverables $
              {result.deliverableCost}
            </p>
            <p className="mt-3 text-xs text-accent">{result.note}</p>
          </div>
        </section>

        {/* Deliverables */}
        <section className="mt-10 border-t border-rule pt-8">
          <h3 className="font-caps text-[0.7rem] text-muted">Deliverables</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {DELIVERABLE_PRESETS.map((d) => {
              const on = deliverables.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`chip no-print ${on ? "border-paper" : ""}`}
                  onClick={() =>
                    setDeliverables((prev) =>
                      on ? prev.filter((x) => x !== d.id) : [...prev, d.id],
                    )
                  }
                >
                  {d.label}
                  {d.isSample ? " · sample $" + d.sampleCost : ""}
                </button>
              );
            })}
          </div>
          <form onSubmit={addCustom} className="mt-4 flex gap-2 no-print">
            <input
              className="input"
              placeholder="Type a custom deliverable"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
            />
            <button type="submit" className="btn">
              Add
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.deliverableLines.map((line, i) => (
              <span key={`${line.label}-${i}`} className="chip">
                {line.label}
                {line.cost ? ` · $${line.cost}` : ""}
                {customDeliverables.includes(line.label) && (
                  <button
                    type="button"
                    className="no-print ml-1"
                    onClick={() =>
                      setCustomDeliverables((c) =>
                        c.filter((x) => x !== line.label),
                      )
                    }
                  >
                    ×
                  </button>
                )}
                {deliverables.includes(
                  DELIVERABLE_PRESETS.find((d) => d.label === line.label)?.id ??
                    "",
                ) && (
                  <button
                    type="button"
                    className="no-print ml-1"
                    onClick={() => {
                      const id = DELIVERABLE_PRESETS.find(
                        (d) => d.label === line.label,
                      )?.id;
                      if (id)
                        setDeliverables((d) => d.filter((x) => x !== id));
                    }}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3 no-print">
        <button type="button" className="btn" onClick={printSheet}>
          Print session sheet
        </button>
        <button
          type="button"
          className="btn btn-solid"
          onClick={() =>
            openBooking({
              roomId: result.fits ? roomId : result.suggested.id,
              planner: {
                episodeMinutes,
                clientType,
                roomId: result.fits ? roomId : result.suggested.id,
                bookedHours: result.bookedHours,
                studioCost: result.studioCost,
                total: result.total,
                deliverables: [
                  ...deliverables,
                  ...customDeliverables,
                ],
                title,
              },
            })
          }
        >
          Book this show
        </button>
      </div>

      {activeStage && (
        <StagePicker
          stageId={activeStage}
          config={stages[activeStage]}
          onClose={() => setActiveStage(null)}
          onChange={(patch) => updateStage(activeStage, patch)}
        />
      )}
    </div>
  );
}

function StagePicker({
  stageId,
  config,
  onClose,
  onChange,
}: {
  stageId: StageId;
  config: StageConfig;
  onClose: () => void;
  onChange: (patch: Partial<StageConfig>) => void;
}) {
  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border border-rule bg-charcoal p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-caps text-[0.65rem] text-muted">Stage picker</p>
        <h3 className="font-display mt-2 text-3xl">
          {STAGE_META[stageId].title}
        </h3>
        <div className="mt-6 space-y-4">
          <Field label="Format">
            <select
              className="select"
              value={config.format}
              onChange={(e) =>
                onChange({ format: e.target.value as FormatId })
              }
            >
              <option value="audio">Audio</option>
              <option value="video">Video</option>
              <option value="hybrid">Hybrid / remote</option>
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Hosts">
              <input
                type="number"
                min={1}
                max={4}
                className="input"
                value={config.hosts}
                onChange={(e) =>
                  onChange({ hosts: Number(e.target.value) || 1 })
                }
              />
            </Field>
            <Field label="Guests">
              <input
                type="number"
                min={0}
                max={6}
                className="input"
                value={config.guests}
                onChange={(e) =>
                  onChange({ guests: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label="Cameras">
              <input
                type="number"
                min={0}
                max={4}
                className="input"
                value={config.cameras}
                onChange={(e) =>
                  onChange({ cameras: Number(e.target.value) || 0 })
                }
              />
            </Field>
          </div>
          <Field label="Edit depth">
            <select
              className="select"
              value={config.editDepth}
              onChange={(e) =>
                onChange({ editDepth: e.target.value as EditDepth })
              }
            >
              <option value="raw">Raw transfer</option>
              <option value="clean">Clean edit</option>
              <option value="full">Full production</option>
            </select>
          </Field>
          <Field label="Clip package">
            <select
              className="select"
              value={config.clipPackage}
              onChange={(e) =>
                onChange({ clipPackage: e.target.value as ClipPackage })
              }
            >
              <option value="none">None</option>
              <option value="three">Three clips</option>
              <option value="six">Six clips</option>
            </select>
          </Field>
        </div>
        <button type="button" className="btn btn-solid mt-8" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-caps text-[0.62rem] text-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
