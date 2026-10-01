'use client';

import React, { useState } from 'react';
import { Check, CheckCircle2, Copy, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ContactsFeedbackForm(): JSX.Element {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !question.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center space-y-3">
        <div className="size-12 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Murojaatingiz qabul qilindi
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Qabul komissiyasi yoki oʻquv boʻlimi mutaxassislari bir ish kuni davomida koʻrsatilgan aloqa vositasi orqali siz bilan bogʻlanadi.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSubmitted(false);
            setName('');
            setContact('');
            setQuestion('');
          }}
          className="mt-2 text-xs"
        >
          Boshqa murojaat yuborish
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="feedback-name" className="block text-xs font-semibold text-foreground mb-1">
          Ism va familiyangiz <span className="text-destructive">*</span>
        </label>
        <Input
          id="feedback-name"
          type="text"
          required
          placeholder="Karimov Sardor"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-xs"
        />
      </div>

      <div>
        <label htmlFor="feedback-contact" className="block text-xs font-semibold text-foreground mb-1">
          Telefon raqami yoki elektron pochta <span className="text-destructive">*</span>
        </label>
        <Input
          id="feedback-contact"
          type="text"
          required
          placeholder="+998 (90) 123-45-67 yoki email@domain.uz"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="text-xs"
        />
      </div>

      <div>
        <label htmlFor="feedback-text" className="block text-xs font-semibold text-foreground mb-1">
          Savol yoki murojaat matni <span className="text-destructive">*</span>
        </label>
        <textarea
          id="feedback-text"
          required
          rows={4}
          placeholder="Qiziqtirgan mutaxassislik yoki taʼlim yoʻnalishini koʻrsating..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <p className="text-[11px] text-muted-foreground">
        Tugmani bosish orqali siz Oʻzbekiston Respublikasining 547-sonli «Shaxsga doir maʼlumotlar toʻgʻrisida»gi Qonuniga muvofiq maʼlumotlaringiz qayta ishlanishiga rozilik bildirasiz.
      </p>

      <Button
        type="submit"
        disabled={loading}
        className="w-full text-xs font-semibold gap-1.5 shadow"
      >
        <Send className="size-3.5" aria-hidden="true" />
        <span>{loading ? 'Yuborilmoqda...' : 'Murojaatni yuborish'}</span>
      </Button>
    </form>
  );
}

export function CopyAddressButton({ address }: { address: string }): JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
      aria-label="Manzilni nusxalash"
    >
      {copied ? (
        <>
          <Check className="size-3 text-emerald-600" aria-hidden="true" />
          <span className="text-emerald-600 font-semibold">Manzil nusxalandi</span>
        </>
      ) : (
        <>
          <Copy className="size-3" aria-hidden="true" />
          <span>Manzilni nusxalash</span>
        </>
      )}
    </button>
  );
}
