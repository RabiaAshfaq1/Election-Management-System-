"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormField } from "@/components/auth/form-field";
import { CandidateAvatar } from "@/components/creator/candidate-avatar";
import type { Candidate } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  candidateFormSchema,
  MAX_MANIFESTO,
  type CandidateFormInput,
  validatePhotoFile,
} from "@/lib/validations/candidate";

interface CandidateFormModalProps {
  open: boolean;
  electionId: string;
  candidate?: Candidate | null;
  onClose: () => void;
  onSaved: (candidate: Candidate) => void;
}

export function CandidateFormModal({
  open,
  electionId,
  candidate,
  onClose,
  onSaved,
}: CandidateFormModalProps) {
  const isEdit = !!candidate;
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CandidateFormInput>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      name: "",
      designation: "",
      manifesto: "",
    },
  });

  const manifesto = watch("manifesto") ?? "";

  useEffect(() => {
    if (!open) return;

    reset({
      name: candidate?.name ?? "",
      designation: candidate?.designation ?? "",
      manifesto: candidate?.manifesto ?? "",
    });
    setPhotoFile(null);
    setPreviewUrl(null);
    setRemovePhoto(false);
    setPhotoError(null);
  }, [open, candidate, reset]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    const err = validatePhotoFile(file);
    setPhotoError(err);

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file && !err) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRemovePhoto(false);
    } else if (!file) {
      setPhotoFile(null);
      setPreviewUrl(null);
    }
  };

  const displayPhotoUrl = removePhoto
    ? null
    : previewUrl ?? candidate?.photo_url ?? null;
  const displayName = watch("name") || candidate?.name || "Candidate";

  const onSubmit = async (data: CandidateFormInput) => {
    if (photoError) return;

    setSaving(true);

    const formData = new FormData();
    formData.append("name", data.name);
    if (data.designation) formData.append("designation", data.designation);
    if (data.manifesto) formData.append("manifesto", data.manifesto);
    if (photoFile) formData.append("photo", photoFile);
    if (isEdit && removePhoto) formData.append("remove_photo", "true");
    if (!isEdit) formData.append("election_id", electionId);

    try {
      const url = isEdit
        ? `/api/candidates/${candidate!.id}`
        : "/api/candidates";

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        const err =
          typeof json.error === "string"
            ? json.error
            : "Failed to save candidate";
        toast.error(err);
        setSaving(false);
        return;
      }

      toast.success(isEdit ? "Candidate updated" : "Candidate added");
      onSaved(json.candidate);
      onClose();
    } catch {
      toast.error("Something went wrong");
    }

    setSaving(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-white p-6 shadow-card"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:bg-paper"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-heading text-xl font-bold text-ink">
          {isEdit ? "Edit candidate" : "Add candidate"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="flex flex-col items-center gap-3">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Preview"
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover"
                unoptimized
              />
            ) : (
              <CandidateAvatar
                name={displayName}
                photoUrl={displayPhotoUrl}
                size={96}
              />
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:border-teal">
              <Upload className="h-4 w-4 text-teal" />
              Upload photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={handlePhotoChange}
              />
            </label>
            {photoError && (
              <p className="text-xs text-accent">{photoError}</p>
            )}
            {isEdit && (candidate?.photo_url || previewUrl) && !removePhoto && (
              <button
                type="button"
                onClick={() => {
                  setRemovePhoto(true);
                  setPhotoFile(null);
                  if (previewUrl?.startsWith("blob:")) {
                    URL.revokeObjectURL(previewUrl);
                  }
                  setPreviewUrl(null);
                }}
                className="text-xs font-medium text-accent hover:underline"
              >
                Remove photo
              </button>
            )}
          </div>

          <FormField
            label="Name"
            registration={register("name")}
            error={errors.name}
            placeholder="Full name"
          />
          <FormField
            label="Designation"
            registration={register("designation")}
            error={errors.designation}
            placeholder="e.g. Presidential candidate"
          />

          <div>
            <label
              htmlFor="manifesto"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Manifesto
            </label>
            <textarea
              id="manifesto"
              {...register("manifesto")}
              rows={4}
              maxLength={MAX_MANIFESTO}
              placeholder="Platform and goals..."
              className={cn(
                "w-full resize-none rounded-xl border border-border bg-paper px-4 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20",
                errors.manifesto && "border-accent"
              )}
            />
            <div className="mt-1 flex justify-between">
              {errors.manifesto ? (
                <p className="text-xs text-accent">{errors.manifesto.message}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-muted">
                {manifesto.length}/{MAX_MANIFESTO}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal py-3 text-sm font-semibold text-paper transition hover:bg-teal-light disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save candidate
          </button>
        </form>
      </div>
    </div>
  );
}
