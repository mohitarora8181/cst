'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { api, errorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Board, CastingCall, Paginated } from '@/types';
import { BOARD_COLORS } from './add-to-board-modal';

export function BoardFormModal({ open, onClose, board, onSaved }: { open: boolean; onClose: () => void; board?: Board | null; onSaved: (b: Board) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(BOARD_COLORS[0]);
  const [castingCall, setCastingCall] = useState('');
  const [saving, setSaving] = useState(false);
  const { data: castings } = useSWR<Paginated<CastingCall>>(open ? '/castings?scope=all&limit=50' : null);

  useEffect(() => {
    if (!open) return;
    setName(board?.name ?? '');
    setDescription(board?.description ?? '');
    setColor(board?.color ?? BOARD_COLORS[Math.floor(Math.random() * BOARD_COLORS.length)]);
    setCastingCall(board?.castingCall?._id ?? '');
  }, [open, board]);

  const save = async () => {
    setSaving(true);
    try {
      const body = { name, description, color, castingCall: castingCall || null };
      const res = board ? await api.patch<{ board: Board }>(`/boards/${board._id}`, body) : await api.post<{ board: Board }>('/boards', body);
      toast.success(board ? 'Board updated' : 'Board created');
      onSaved(res.board);
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={board ? 'Edit board' : 'New shortlist board'}
      description="Group artists for a role, a look test or a client pitch."
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} loading={saving} disabled={name.trim().length < 2}>{board ? 'Save' : 'Create board'}</Button></>}
    >
      <div className="space-y-5">
        <Field label="Name" required>{(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} placeholder="Saanvi — look test shortlist" autoFocus />}</Field>
        <Field label="Description">{(id) => <Textarea id={id} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />}</Field>
        <Field label="Linked casting (optional)">
          {(id) => <Select id={id} value={castingCall} onChange={(e) => setCastingCall(e.target.value)} placeholder="None" options={(castings?.items ?? []).map((c) => ({ value: c._id, label: `${c.roleName} — ${c.projectName}` }))} />}
        </Field>
        <Field label="Colour">
          {() => (
            <div className="flex gap-2">
              {BOARD_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} className={cn('h-10 w-10 rounded-xl border-2 border-ink transition', color === c && 'scale-110 ring-4 ring-pink/40')} style={{ background: c }} aria-label={`Colour ${c}`} />
              ))}
            </div>
          )}
        </Field>
      </div>
    </Modal>
  );
}
