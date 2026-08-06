'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field } from '@/components/shared/Field';
import { SiteDetail, UpdateSitePayload, ProjectStatus } from '@/types/site';
import { getAllowedNextProjectStatuses, isProjectStatusLocked, normProjectStatus } from '@/lib/utils/site-helpers';

interface UpdateSiteOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: SiteDetail | null;
  submitting: boolean;
  onSubmit: (payload: UpdateSitePayload) => Promise<void>;
}

export function UpdateSiteOverlay({
  open, onOpenChange, site, submitting, onSubmit,
}: UpdateSiteOverlayProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [projectStatus, setProjectStatus] = useState<string>(ProjectStatus.PLANNING);
  const [completionDate, setCompletionDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [tenderName, setTenderName] = useState('');
  const [inquiringEntity, setInquiringEntity] = useState('');

  useEffect(() => {
    if (!open || !site) return;
    setName(site.name ?? '');
    setLocation(site.location ?? '');
    setDescription(site.description ?? '');
    setProjectStatus(site.projectStatus || ProjectStatus.PLANNING);
    setCompletionDate(site.completionDate ?? '');
    setTagsInput((site.tags ?? []).join(', '));
    setTenderName(site.tendererName ?? '');
    setInquiringEntity(site.inquiringEntity ?? '');
  }, [open, site]);

  const currentStatus   = site ? normProjectStatus(site.projectStatus) : ProjectStatus.PLANNING;
  const allowedStatuses = getAllowedNextProjectStatuses(currentStatus);
  const locked           = isProjectStatusLocked(currentStatus);

  const handleClose = (next: boolean) => {
    if (submitting) return;
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    const payload: UpdateSitePayload = {
      name: name.trim() || undefined,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      projectStatus: projectStatus || undefined,
      completionDate: completionDate || undefined,
      tags: tagsInput
        ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
        : undefined,
      tenderName: tenderName.trim() || undefined,
      inquiringEntity: inquiringEntity.trim() || undefined,
    };
    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Site</DialogTitle>
          <DialogDescription>Edit this site&apos;s details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <Field label="Location">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>

          <Field label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </Field>

          <Field label="Project Status">
            {locked ? (
              <p className="text-sm px-3 py-2 rounded-md" style={{ background: 'var(--gv-glass-bg)', color: 'var(--gv-text-muted)' }}>
                {currentStatus} — this project is closed and its status can no longer change.
              </p>
            ) : (
              <Select value={projectStatus} onValueChange={setProjectStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Keep current status" />
                </SelectTrigger>
                <SelectContent>
                  {allowedStatuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>

          <Field label="Completion Date">
            <Input
              type="date"
              value={completionDate ?? ''}
              onChange={(e) => setCompletionDate(e.target.value)}
            />
          </Field>

          <Field label="Tags" hint="Comma-separated">
            <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
          </Field>

          <Field label="Tender Name">
            <Input value={tenderName} onChange={(e) => setTenderName(e.target.value)} />
          </Field>

          <Field label="Inquiring Entity">
            <Input value={inquiringEntity} onChange={(e) => setInquiringEntity(e.target.value)} />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || locked}>
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {submitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}