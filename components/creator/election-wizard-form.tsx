"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createElection,
  updateElection,
} from "@/app/dashboard/creator/actions";
import { FormField } from "@/components/auth/form-field";
import { StepIndicator } from "@/components/creator/step-indicator";
import { formatElectionDateTime } from "@/lib/election-utils";
import { cn } from "@/lib/utils";
import {
  ELECTION_CATEGORIES,
  electionFormSchema,
  type ElectionFormInput,
} from "@/lib/validations/election";

interface ElectionWizardFormProps {
  mode: "create" | "edit";
  electionId?: string;
  defaultValues?: Partial<ElectionFormInput>;
  readOnly?: boolean;
  currentStatus?: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
};

export function ElectionWizardForm({
  mode,
  electionId,
  defaultValues,
  readOnly = false,
  currentStatus,
}: ElectionWizardFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState<"draft" | "published" | null>(
    null
  );

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<ElectionFormInput>({
    resolver: zodResolver(electionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Student Body",
      start_time: "",
      end_time: "",
      registration_deadline: "",
      max_voters: 100,
      ...defaultValues,
    },
    mode: "onChange",
  });

  const values = watch();

  const validateStep = async (stepIndex: number) => {
    if (stepIndex === 0) {
      return trigger(["title", "description", "category"]);
    }
    if (stepIndex === 1) {
      return trigger([
        "start_time",
        "end_time",
        "registration_deadline",
        "max_voters",
      ]);
    }
    return true;
  };

  const goNext = async () => {
    const valid = await validateStep(step);
    if (!valid) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, 2));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const onSubmit = async (
    data: ElectionFormInput,
    status: "draft" | "published"
  ) => {
    if (readOnly) return;

    setSubmitting(status);

    const result =
      mode === "create"
        ? await createElection(data, status)
        : await updateElection(electionId!, data, status);

    setSubmitting(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(
      status === "draft"
        ? "Election saved as draft"
        : "Election published successfully"
    );
    router.push("/dashboard/creator");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl">
      {readOnly && (
        <div className="mb-6 flex gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-gold" />
          <div>
            <p className="text-sm font-semibold text-ink">
              This election is already {currentStatus}
            </p>
            <p className="mt-1 text-sm text-muted">
              Only draft elections can be edited. Published and active elections
              are locked.
            </p>
          </div>
        </div>
      )}

      <StepIndicator currentStep={step} />

      <form className="rounded-2xl border border-border bg-white p-8 shadow-card">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <StepHeader
                title="Basic information"
                description="Name and describe your election."
              />
              <FormField
                label="Election title"
                placeholder="e.g. Student Council 2026"
                registration={register("title")}
                error={errors.title}
                disabled={readOnly}
              />
              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  {...register("description")}
                  rows={4}
                  disabled={readOnly}
                  placeholder="What is this election about?"
                  className={cn(
                    "w-full rounded-xl border border-border bg-paper px-4 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20",
                    readOnly && "opacity-60"
                  )}
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Category
                </label>
                <select
                  id="category"
                  {...register("category")}
                  disabled={readOnly}
                  className={cn(
                    "w-full rounded-xl border border-border bg-paper px-4 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20",
                    errors.category && "border-accent",
                    readOnly && "opacity-60"
                  )}
                >
                  {ELECTION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1.5 text-xs text-accent">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <StepHeader
                title="Schedule & capacity"
                description="Set voting windows and voter limits."
              />
              <FormField
                label="Start date & time"
                type="datetime-local"
                registration={register("start_time")}
                error={errors.start_time}
                disabled={readOnly}
              />
              <FormField
                label="End date & time"
                type="datetime-local"
                registration={register("end_time")}
                error={errors.end_time}
                disabled={readOnly}
              />
              <FormField
                label="Registration deadline"
                type="datetime-local"
                registration={register("registration_deadline")}
                error={errors.registration_deadline}
                disabled={readOnly}
              />
              <FormField
                label="Maximum voters"
                type="number"
                min={1}
                registration={register("max_voters")}
                error={errors.max_voters}
                disabled={readOnly}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <StepHeader
                title="Review & publish"
                description="Confirm your details before saving."
              />
              <dl className="divide-y divide-border rounded-xl border border-border bg-paper/50">
                <ReviewRow label="Title" value={values.title} />
                <ReviewRow
                  label="Description"
                  value={values.description || "—"}
                />
                <ReviewRow label="Category" value={values.category} />
                <ReviewRow
                  label="Starts"
                  value={formatElectionDateTime(values.start_time)}
                />
                <ReviewRow
                  label="Ends"
                  value={formatElectionDateTime(values.end_time)}
                />
                <ReviewRow
                  label="Registration deadline"
                  value={formatElectionDateTime(values.registration_deadline)}
                />
                <ReviewRow
                  label="Max voters"
                  value={String(values.max_voters ?? "")}
                />
              </dl>
            </motion.div>
          )}
        </AnimatePresence>

        <WizardFooter
          step={step}
          readOnly={readOnly}
          submitting={submitting}
          onBack={goBack}
          onNext={goNext}
          onSaveDraft={handleSubmit((data) => onSubmit(data, "draft"))}
          onPublish={handleSubmit((data) => onSubmit(data, "published"))}
        />
      </form>
    </div>
  );
}

function StepHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="font-heading text-xl font-bold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:justify-between">
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="text-sm font-medium text-ink sm:text-right">{value}</dd>
    </div>
  );
}

function WizardFooter({
  step,
  readOnly,
  submitting,
  onBack,
  onNext,
  onSaveDraft,
  onPublish,
}: {
  step: number;
  readOnly: boolean;
  submitting: "draft" | "published" | null;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
      {step > 0 ? (
        <button
          type="button"
          onClick={onBack}
          disabled={!!submitting}
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-paper disabled:opacity-60"
        >
          Back
        </button>
      ) : (
        <div />
      )}

      {step < 2 ? (
        <button
          type="button"
          onClick={onNext}
          disabled={readOnly}
          className="rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-teal-light disabled:opacity-60"
        >
          Continue
        </button>
      ) : (
        !readOnly && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={!!submitting}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-paper disabled:opacity-60"
            >
              {submitting === "draft" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save as Draft
            </button>
            <button
              type="button"
              onClick={onPublish}
              disabled={!!submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-teal-light disabled:opacity-60"
            >
              {submitting === "published" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Publish
            </button>
          </div>
        )
      )}
    </div>
  );
}
